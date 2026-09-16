import { NextResponse } from 'next/server';

/**
 * API Route para consultar dados do Free Fire via backend.
 * Atua como proxy para a Free Fire API (freefireapi.me) evitando erros de CORS.
 */
export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório.' }, { status: 400 });
    }

    // Endpoint da Free Fire API conforme documentação
    const apiURL = `https://www.freefireapi.me/info?uid=${encodeURIComponent(uid)}&details=true`;

    console.log(`[FF_LOOKUP]: Consultando UID ${uid} na Free Fire API...`);

    // AbortController para timeout de 20 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Conta não encontrada. Verifique o ID e tente novamente.' 
        }, { status: 404 });
      }

      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Muitas verificações foram feitas. Tente novamente em instantes.' 
        }, { status: 429 });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FF_LOOKUP_API_ERROR]: Status ${response.status} - ${errorText}`);
        return NextResponse.json({ 
          error: 'O servidor de dados não respondeu corretamente. Tente novamente.' 
        }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return NextResponse.json({ error: 'A consulta demorou muito. Tente novamente.' }, { status: 504 });
      }
      throw e;
    }
  } catch (error: any) {
    console.error('[FF_LOOKUP_CRITICAL_ERROR]:', error);
    return NextResponse.json({ error: 'Falha técnica na verificação. Tente novamente.' }, { status: 500 });
  }
}
