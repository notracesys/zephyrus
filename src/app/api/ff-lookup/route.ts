import { NextResponse } from 'next/server';

/**
 * API Route para consultar dados do Free Fire via backend.
 * Utiliza a API gratuita solicitada pelo usuário.
 */
export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório.' }, { status: 400 });
    }

    // Endpoint da API gratuita (Principal)
    const apiURL = `https://glob-info2.vercel.app/info?uid=${uid}`;

    console.log(`[FF_LOOKUP]: Consultando UID ${uid} na API gratuita...`);

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://glob-info2.vercel.app',
        'Referer': 'https://glob-info2.vercel.app/'
      },
      cache: 'no-store'
    });

    // Se o status for 404 ou 400, provavelmente o UID é inválido
    if (response.status === 404 || response.status === 400) {
      return NextResponse.json({ 
        error: 'Não foi possível encontrar essa conta. Verifique o ID informado.' 
      }, { status: 404 });
    }

    if (!response.ok) {
        console.error(`[FF_LOOKUP_API_ERROR]: Status ${response.status} retornado pela API externa.`);
        return NextResponse.json({ 
          error: 'O servidor de dados está instável no momento. Tente novamente em instantes.' 
        }, { status: response.status });
    }

    const data = await response.json();

    // A API glob-info2 costuma retornar os dados dentro de basicInfo
    // Se basicInfo não existir, pode ser que o UID seja inválido ou a conta não exista
    if (!data || (!data.basicInfo && !data.nickname)) {
      return NextResponse.json({ 
        error: 'Não foi possível encontrar essa conta. Verifique o ID informado.' 
      }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[FF_LOOKUP_CRITICAL_ERROR]:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a consulta.' }, { status: 500 });
  }
}
