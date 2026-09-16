import { NextResponse } from 'next/server';

/**
 * API Route para consultar dados do Free Fire via backend.
 * Mantém a API Key segura e processa a resposta da FreeFireApi.
 */
export async function POST(request: Request) {
  try {
    const { uid } = await request.json();
    const FF_API_KEY = process.env.FF_API_KEY;

    if (!FF_API_KEY) {
      console.error('[FF_LOOKUP_ERROR]: FF_API_KEY não encontrada no arquivo .env');
      return NextResponse.json({ 
        error: 'Chave de API não configurada no servidor. Adicione FF_API_KEY ao .env' 
      }, { status: 500 });
    }

    if (!uid) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório.' }, { status: 400 });
    }

    // Endpoint da API
    const apiURL = `https://freefireapi.com.br/api/info_player?id=${uid}&key=${FF_API_KEY}&region=BR`;

    console.log(`[FF_LOOKUP]: Consultando UID ${uid}...`);

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    const rawData = await response.text();
    let data;

    try {
      data = JSON.parse(rawData);
    } catch (e) {
      console.error('[FF_LOOKUP_ERROR]: Resposta da API não é um JSON válido', rawData);
      return NextResponse.json({ error: 'Erro na resposta do servidor de dados.' }, { status: 502 });
    }

    console.log(`[FF_LOOKUP_RESPONSE]:`, data);

    // Verificação de erro na estrutura da API (algumas retornam status: 'error')
    if (data.status === 'error' || data.error || !data.nickname) {
      return NextResponse.json({ 
        error: data.message || 'Jogador não encontrado. Verifique o ID e tente novamente.' 
      }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[FF_LOOKUP_CRITICAL_ERROR]:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a consulta.' }, { status: 500 });
  }
}
