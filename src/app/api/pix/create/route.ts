
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const IRONPAY_TOKEN = process.env.IRONPAY_API_TOKEN;
const IRONPAY_URL = 'https://api.ironpayapp.com.br/api/public/v1/transactions';

export async function POST(request: Request) {
  try {
    const { amount, customerEmail, customerName, customerCpf, siteId } = await request.json();

    if (!IRONPAY_TOKEN) {
      return NextResponse.json({ error: 'Token da API não configurado' }, { status: 500 });
    }

    // Criar transação na IronPay
    const ironPayResponse = await fetch(`${IRONPAY_URL}?api_token=${IRONPAY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount || 1990, // Padrão 19.90
        payment_method: 'pix',
        customer: {
          name: customerName || 'Cliente FF',
          email: customerEmail || 'contato@zephyrus.com',
          cpf: customerCpf || '00000000000',
        },
        items: [
          {
            title: 'Unban Strategy - Recuperação de Conta',
            unit_price: amount || 1990,
            quantity: 1,
          }
        ]
      }),
    });

    const data = await ironPayResponse.json();

    if (!ironPayResponse.ok) {
      console.error('Erro IronPay:', data);
      return NextResponse.json({ error: 'Erro ao gerar Pix na IronPay' }, { status: 500 });
    }

    // Identificar os campos de Pix retornados
    const hash = data.transaction_hash || data.id || data.hash;
    const pixCode = data.pix_code || data.pixCode || data.pix_copy_paste || data.copy_paste || data.brcode || data.qrcode_string;
    const qrCodeImage = data.qr_code || data.qrCode || data.qr_code_base64;

    // Salvar no Firebase como pendente
    if (hash) {
      await setDoc(doc(db, 'purchases', String(hash)), {
        id: String(hash),
        status: 'pending',
        amount: amount || 1990,
        email: customerEmail || 'N/A',
        timestamp: serverTimestamp(),
        siteId: siteId || 'global',
        accessed: false
      });
    }

    return NextResponse.json({
      success: true,
      hash,
      pixCode,
      qrCodeImage,
      amount: amount || 1990
    });

  } catch (error: any) {
    console.error('API Pix Create Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
