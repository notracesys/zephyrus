
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
      console.error('FF_API_KEY não configurada no ambiente.');
      return NextResponse.json({ error: 'Configuração do servidor pendente.' }, { status: 500 });
    }

    if (!uid) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório.' }, { status: 400 });
    }

    // Endpoint da API de terceiros conforme documentação
    const apiURL = `https://freefireapi.com.br/api/info_player?id=${uid}&key=${FF_API_KEY}&region=BR`;

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao conectar com o servidor de dados.' }, { status: response.status });
    }

    const data = await response.json();

    // Verificação de erro comum na estrutura dessa API
    if (data.status === 'error' || !data.nickname) {
      return NextResponse.json({ error: 'Jogador não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[FF_LOOKUP_ERROR]', error);
    return NextResponse.json({ error: 'Erro interno ao processar a consulta.' }, { status: 500 });
  }
}
