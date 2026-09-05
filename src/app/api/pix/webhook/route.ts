import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Webhook Sunize v2 envia id e status
    const hash = body.id || body.external_id;
    const status = String(body.status || '').toUpperCase();

    if (hash && status === 'AUTHORIZED') {
      const docRef = doc(db, 'purchases', String(hash));
      await updateDoc(docRef, {
        status: 'paid',
        paidAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no Webhook Sunize:', error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
