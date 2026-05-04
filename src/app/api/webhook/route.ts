
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Inicializa Firebase de forma segura para o ambiente de servidor
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  console.log('--- INÍCIO DO PROCESSAMENTO DE WEBHOOK ---');
  
  try {
    // 1. Lemos o corpo bruto como texto para evitar erro de parsing automático do NextJS
    const rawText = await request.text();
    console.log('Corpo bruto recebido:', rawText);

    if (!rawText || rawText.trim() === '') {
      console.log('Webhook ignorado: Corpo vazio.');
      return NextResponse.json({ success: true, message: 'Empty body' }, { status: 200 });
    }

    let body: any = {};

    // 2. Decidimos se é JSON ou Form Data de forma manual e segura
    const looksLikeJson = rawText.trim().startsWith('{') || rawText.trim().startsWith('[');

    if (looksLikeJson) {
      try {
        body = JSON.parse(rawText);
        console.log('Processado como JSON');
      } catch (e) {
        console.log('Falha ao processar como JSON, tentando como Formulário...');
        const params = new URLSearchParams(rawText);
        body = Object.fromEntries(params.entries());
      }
    } else {
      console.log('Processado como Formulário (URL Encoded)');
      const params = new URLSearchParams(rawText);
      body = Object.fromEntries(params.entries());
    }

    /**
     * 3. Extração Robusta de Dados
     * O PushinPay pode enviar o ID em diferentes campos dependendo da versão ou configuração.
     */
    const transactionId = body.transaction_id || body.id || body.reference || body.tid || (body.data && body.data.id);
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    console.log(`Transação ID: ${transactionId} | Status: ${status}`);

    if (!transactionId) {
      console.warn('Webhook ignorado: Nenhum ID de transação identificado.');
      return NextResponse.json({ success: true, message: 'Received but no ID found' }, { status: 200 });
    }

    // 4. Mapeamento de status de aprovação
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado', 'paga'];

    if (approvedStatuses.includes(status)) {
      console.log(`LIBERANDO ACESSO: Gravando transação ${transactionId} no Firestore.`);
      
      const purchaseRef = doc(db, 'purchases', String(transactionId));
      
      const purchaseData = {
        id: String(transactionId),
        status: status,
        email: body.email || body.customer?.email || 'N/A',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        raw_payload_debug: rawText // Guardamos o original para auditoria se necessário
      };

      await setDoc(purchaseRef, purchaseData, { merge: true });
      console.log('Gravação no Firestore concluída com sucesso.');
    } else {
      console.log(`Status "${status}" não requer liberação de acesso.`);
    }

    // 5. SEMPRE retornamos 200 para o gateway parar de tentar reenviar
    return NextResponse.json({ success: true, message: 'Processed' }, { status: 200 });

  } catch (error: any) {
    console.error('ERRO CRÍTICO NO WEBHOOK:', error.message);
    
    // Retornamos 200 mesmo em erro fatal para não "travar" a fila do gateway do cliente
    return NextResponse.json({ 
      success: false,
      error: 'Processing Internal Error', 
      details: error.message 
    }, { status: 200 });
  }
}
