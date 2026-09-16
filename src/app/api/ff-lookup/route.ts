import { NextResponse } from 'next/server';

/**
 * API Route para consultar dados do Free Fire via backend.
 * Conectada à API baseada no repositório PRINCE-LKTEAM/Free-Fire-API
 */
export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório.' }, { status: 400 });
    }

    // Endpoint da API (Render)
    const apiURL = `https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=${uid}&server=BR`;

    console.log(`[FF_LOOKUP]: Consultando UID ${uid} na API LK TEAM...`);

    // AbortController para timeout de 20 segundos (Render pode ser lento para acordar)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Conta não encontrada. Verifique o ID e tente novamente.' 
        }, { status: 404 });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FF_LOOKUP_API_ERROR]: Status ${response.status}`, errorText);
        return NextResponse.json({ 
          error: 'O servidor de dados não respondeu corretamente. Tente novamente em instantes.' 
        }, { status: response.status });
      }

      const data = await response.json();

      // Verifica se a API retornou erro no corpo do JSON (padrão LK API)
      if (data.error || data.status === 'error' || !data.basicinfo) {
        return NextResponse.json({ 
          error: data.message || data.error || 'Não foi possível encontrar essa conta. Verifique o ID informado.' 
        }, { status: 404 });
      }

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
