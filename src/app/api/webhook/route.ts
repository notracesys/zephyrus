
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Inicializa Firebase de forma segura para o ambiente de servidor
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  console.log('--- PROCESSANDO WEBHOOK PUSHINPAY ---');
  
  try {
    // 1. Lemos o corpo bruto como texto para evitar o erro "Unexpected token" do NextJS
    const rawText = await request.text();
    console.log('Dados Brutos Recebidos:', rawText);

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json({ success: true, message: 'Empty body' }, { status: 200 });
    }

    let body: any = {};

    // 2. Detectamos o formato: Se começar com { é JSON, caso contrário é Formulário (x-www-form-urlencoded)
    const looksLikeJson = rawText.trim().startsWith('{');

    if (looksLikeJson) {
      try {
        body = JSON.parse(rawText);
        console.log('Formato identificado: JSON');
      } catch (e) {
        console.log('Falha ao parsear JSON, tentando como Formulário...');
        const params = new URLSearchParams(rawText);
        body = Object.fromEntries(params.entries());
      }
    } else {
      console.log('Formato identificado: Formulário (URL Encoded)');
      const params = new URLSearchParams(rawText);
      body = Object.fromEntries(params.entries());
    }

    /**
     * 3. Extração Robusta do ID e Status
     * O PushinPay envia o ID da transação em 'transaction_id' ou 'id'
     */
    const transactionId = body.transaction_id || body.id || body.reference || (body.data && body.data.id);
    const rawStatus = body.status || (body.data && body.data.status) || '';
    const status = String(rawStatus).toLowerCase().trim();

    console.log(`Transação: ${transactionId} | Status: ${status}`);

    if (!transactionId) {
      console.warn('Nenhum ID de transação encontrado no corpo da requisição.');
      return NextResponse.json({ success: true, message: 'No ID found' }, { status: 200 });
    }

    // 4. Lista de status que liberam a entrega
    const approvedStatuses = ['paid', 'approved', 'succeeded', 'completed', 'pago', 'aprovado', 'paga'];

    if (approvedStatuses.includes(status)) {
      console.log(`PAGAMENTO APROVADO! Gravando liberação para o ID: ${transactionId}`);
      
      const purchaseRef = doc(db, 'purchases', String(transactionId));
      
      await setDoc(purchaseRef, {
        id: String(transactionId),
        status: status,
        email: body.email || body.customer?.email || 'N/A',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('Acesso liberado no Firestore com sucesso.');
    } else {
      console.log(`Status "${status}" não libera acesso.`);
    }

    // 5. SEMPRE retornamos 200 para o gateway parar de tentar reenviar
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('ERRO NO WEBHOOK:', error.message);
    // Retornamos 200 mesmo em erro para não "travar" a fila do gateway
    return NextResponse.json({ success: true, error: error.message }, { status: 200 });
  }
}
