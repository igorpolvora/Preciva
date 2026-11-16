# Publicação no GitHub e Vercel

## Estado da preparação

A publicação foi autorizada pelo usuário em 16/11/2026. A configuração está preparada em `frontend/vercel.json`; nenhum deploy deve ser considerado realizado sem confirmação remota e URL nesta seção.

**GitHub:** conexão disponível para a conta `igorpolvora`, mas a pasta fornecida não tinha `.git` nem remoto. O usuário informou https://github.com/igorpolvora/Preciva.git e a conexão confirmou o repositório público, branch main e permissão de escrita. Os arquivos foram publicados para esse destino pela conexão GitHub autorizada.

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

**GitHub publicado:** https://github.com/igorpolvora/Preciva, branch `main`. Commit da aplicação: `7d676824a56274da32dc9141d71daaa4c82d1879`.

**Vercel pendente:** integração ainda não instalada/conectada; não foi criado deployment nem retornada URL de produção. Instalar/conectar a Vercel é a ação necessária para continuar. O código e a configuração estão preparados; não há confirmação de deploy.

**Verificações desta publicação:** 63 testes aprovados, lint e build aprovados. O Git local foi alinhado ao remoto após confirmar árvores idênticas, sem alterar a aplicação. O push via Git local não tinha credenciais; o envio foi concluído pela conexão GitHub. As pendências visuais anteriores continuam registradas.

