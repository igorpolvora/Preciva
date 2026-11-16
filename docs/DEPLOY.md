# Publicação no GitHub e Vercel

## Estado da preparação

A publicação foi autorizada pelo usuário em 16/11/2026. A configuração está preparada em `frontend/vercel.json`; nenhum deploy deve ser considerado realizado sem confirmação remota e URL nesta seção.

**GitHub:** conexão disponível para a conta `igorpolvora`, mas a pasta fornecida não tinha `.git` nem remoto. O usuário informou https://github.com/igorpolvora/Preciva.git e a conexão confirmou o repositório público, branch main e permissão de escrita. O envio será feito para esse destino.

**Vercel:** integração encontrada, ainda não instalada/conectada na verificação inicial. Sem CLI autenticada ou credencial de deploy disponível. É necessária a conexão da conta antes de publicar. Nenhum token deve ser enviado em mensagens ou versionado.

## Configuração do projeto Vercel

- Root Directory: **frontend**.
- Framework: **Vite**.
- Install Command: `npm ci`.
- Build Command: `npm test && npm run lint && npm run build`.
- Output Directory: `dist`.
- Node.js: **26.x**, alinhado ao ambiente validado. A faixa >=24.12.0 do package.json seleciona a maior versão compatível disponível na Vercel (atualmente 26.x), conforme a documentação oficial consultada.
- Variáveis de ambiente: nenhuma necessária para esta calculadora.

As configurações ficam relativas ao diretório `frontend`, não à raiz do repositório. O build exige testes e lint aprovados. Não é necessário criar API, backend ou persistência.

Referências oficiais: [configuração de build](https://vercel.com/docs/project-configuration/vercel-json) e [versões de Node.js](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Verificação antes/depois da publicação

Antes: executar a suíte, lint e build com os arquivos atuais. Não versionar `node_modules`, `dist`, `.vercel` ou arquivos `.env`.

Depois: registrar URL do repositório, SHA remoto, projeto/ambiente Vercel, deployment e URL retornada; verificar estado terminal do deploy e resposta HTTP da aplicação/assets. As pendências de revisão visual em 320, 390, 768 e 1440 px dos relatórios anteriores permanecem independentes da publicação.

## Resultado remoto

**Destino GitHub confirmado. Envio e deploy Vercel ainda não confirmados.**

