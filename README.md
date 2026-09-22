
# UNBAN STRATEGY - Firebase Studio

Este projeto foi configurado para rodar no **Next.js 15** com suporte ao **Cloudflare Workers** via OpenNext.

## Como salvar e enviar alterações (Git)

Se você tentar dar `git push` e aparecer "Everything up-to-date", significa que você ainda não registrou suas mudanças localmente. Siga esta sequência no terminal:

1. **Preparar os arquivos:**
   ```bash
   git add .
   ```

2. **Criar um ponto de salvamento (commit):**
   ```bash
   git commit -m "descrição das suas mudanças"
   ```

3. **Enviar para o servidor:**
   ```bash
   git push
   ```

## Como fazer o Deploy no Cloudflare

O deploy é gerenciado pelo OpenNext. Para disparar manualmente:

```bash
npm run deploy
```

O comando de build (`npm run build`) agora gera automaticamente a pasta `.open-next` necessária para o Cloudflare.

## Estrutura do Projeto
- `/src/app`: Páginas, rotas e lógica de navegação.
- `/src/components`: Componentes de interface (ShadCN + Custom).
- `/src/lib`: Traduções (i18n), utilitários e constantes.

---
Desenvolvido no Firebase Studio.🚀🎯
