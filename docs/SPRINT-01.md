# Relatório — Sprint 01

Implementada a calculadora local de precificação conforme o recorte da Sprint 01 do PRD v0.2. A aplicação Vite existente foi mantida em `frontend/`; o PRD e os assets originais não foram alterados.

## Arquivos criados ou alterados

| Arquivo | Alteração |
| --- | --- |
| `.gitignore` | Ignorar dependências, logs e build |
| `README.md` | Instalação, arquitetura, exemplos, regras e limitações |
| `frontend/README.md` | Instruções do frontend |
| `frontend/package.json` | Script de testes e requisito de Node |
| `frontend/package-lock.json` | Sincronização do requisito de Node; sem novas dependências |
| `frontend/tsconfig.app.json` | TypeScript em modo estrito |
| `frontend/index.html` | Idioma pt-BR, título e metadados |
| `frontend/public/favicon.svg` | Identidade Preciva |
| `frontend/src/domain/pricing.ts` | Motor puro, validações, cálculo inteiro e versão das regras |
| `frontend/src/domain/templates.ts` | Sete modelos configuráveis e independentes |
| `frontend/src/App.tsx` | Edição de custos, remuneração, taxas, margem e resultado detalhado |
| `frontend/src/App.css` | Interface responsiva para desktop e celular |
| `frontend/src/index.css` | Estilos globais e estados de foco/erro |
| `frontend/tests/pricing.test.mjs` | Testes automatizados das regras e dos modelos |
| `docs/SPRINT-01.md` | Este relatório |

A pasta disponibilizada não possui metadados Git; a relação acima foi registrada a partir das alterações realizadas na sessão.

## Verificação

Executado em Node.js 26.13.1, dentro de `frontend/`:

- `npm.cmd test`: 30 testes aprovados, zero falhas.
- `npm.cmd run build`: TypeScript estrito e bundle de produção aprovados.
- `npm.cmd run lint`: aprovado sem erros.

Os testes cobrem margem sobre receita, remuneração nas três modalidades, taxas fixas e proporcionais em bases distintas, indiretos, arredondamento, quantidades fracionárias, custo zero, entradas negativas/não finitas, precisão excessiva, denominador impossível, limites, isolamento dos sete modelos, determinismo e conservação da composição financeira em centavos em 100 cenários.

## Limitações e pendências

- A verificação visual/interativa em navegador não foi concluída: o serviço de acesso ao navegador retornou indisponibilidade. A responsividade está implementada por media queries, mas requer validação visual em dispositivos reais. Não há testes automatizados de interface nesta sprint.
- Uma tentativa de obter ferramentas adicionais de teste de interface foi interrompida após falhas de acesso de rede (`EACCES` ao registro npm). Nenhuma dependência foi adicionada. Os testes entregues usam apenas o executor nativo do Node.
- Campos e cenários existem somente na memória; trocar o modelo, reiniciar ou recarregar perde os dados. Sem telemetria.
- Rateio indireto é informado como parcela e critério; não há distribuição mensal automática. Alimentação calcula o lote completo.
- Taxas não incidem em cascata; não se calculam regras tributárias específicas, descontos, juros ou parcelamento. Pequenas diferenças na margem efetiva podem ocorrer por arredondamento por linha e são explicadas na memória de cálculo.
- Sem login, pagamentos, IA, backend ou deploy, conforme solicitado.
