import { NextResponse } from 'next/server';

/**
 * API Route para consultar dados do Free Fire via backend.
 * Conectada à API: https://freefireinfo-zy9l.onrender.com
 */
export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório.' }, { status: 400 });
    }

    // Endpoint da API solicitada
    const apiURL = `https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=${uid}&server=BR`;

    console.log(`[FF_LOOKUP]: Consultando UID ${uid} na API Render...`);

    // Implementando um AbortController para timeout de 15 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      // Tratamento de erros específicos da API
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Não foi possível encontrar essa conta. Verifique o ID informado.' 
        }, { status: 404 });
      }

      if (!response.ok) {
        return NextResponse.json({ 
          error: 'O servidor de dados está instável no momento. Tente novamente em instantes.' 
        }, { status: response.status });
      }

      const data = await response.json();

      // Verifica se a API retornou um erro estruturado no JSON
      if (data.error || data.message?.includes('not found') || data.status === 'error') {
        return NextResponse.json({ 
          error: 'Não foi possível encontrar essa conta. Verifique o ID informado.' 
        }, { status: 404 });
      }

      return NextResponse.json(data);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return NextResponse.json({ error: 'O servidor demorou muito para responder. Tente novamente.' }, { status: 504 });
      }
      throw e;
    }
  } catch (error: any) {
    console.error('[FF_LOOKUP_CRITICAL_ERROR]:', error);
    return NextResponse.json({ error: 'Não foi possível verificar a conta agora. Tente novamente.' }, { status: 500 });
  }
}
