
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hash = body.transaction_hash || body.id || body.reference;
    const status = String(body.status || '').toLowerCase();

    const approvedStatuses = ['paid', 'approved', 'succeeded', 'pago', 'aprovado'];

    if (hash && approvedStatuses.includes(status)) {
      await updateDoc(doc(db, 'purchases', String(hash)), {
        status: 'paid',
        paidAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
