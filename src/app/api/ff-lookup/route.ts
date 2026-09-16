import { NextResponse } from 'next/server';

/**
 * API Route para consultar dados do Free Fire via backend.
 * Atua como proxy para a Free Fire API (freefireapi.me) evitando erros de CORS.
 */
export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid || uid.trim() === '') {
      return NextResponse.json({ error: 'Digite um ID válido.' }, { status: 400 });
    }

    // Endpoint oficial da Free Fire API conforme documentação fornecida
    const apiURL = `https://www.freefireapi.me/info?uid=${encodeURIComponent(uid.trim())}&details=true`;

    console.log(`[FF_LOOKUP]: Consultando UID ${uid} na Free Fire API...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Conta não encontrada. Verifique o ID informado.' 
        }, { status: 404 });
      }

      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Muitas verificações foram feitas. Tente novamente em alguns instantes.' 
        }, { status: 429 });
      }

      if (!response.ok) {
        return NextResponse.json({ 
          error: 'Não foi possível verificar a conta agora. Tente novamente.' 
        }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return NextResponse.json({ error: 'Não foi possível verificar a conta agora. Tente novamente.' }, { status: 504 });
      }
      throw e;
    }
  } catch (error: any) {
    console.error('[FF_LOOKUP_CRITICAL_ERROR]:', error);
    return NextResponse.json({ error: 'Não foi possível verificar a conta agora. Tente novamente.' }, { status: 500 });
  }
}
