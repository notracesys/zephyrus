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
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
        // Se a primeira API falhar, poderíamos adicionar um fallback aqui no futuro
        return NextResponse.json({ error: 'Erro na resposta do servidor de dados.' }, { status: response.status });
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
