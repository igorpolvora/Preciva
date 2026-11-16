# Homologação — Sprint 01

**Data:** 16/11/2026 (America/Sao_Paulo)  
**Parecer:** **aprovada com ressalvas para continuidade do desenvolvimento**. A homologação visual e a aceitação integral do MVP público permanecem pendentes.

## 1. Resumo da revisão

Foram lidos `docs/SPRINT-01.md`, `README.md` e `docs/PRD v0.2.md`, inspecionados os componentes, estilos, configurações, modelos, motor e testes. Não foram encontrados arquivos `AGENTS.md` aplicáveis nas pastas verificadas.

A arquitetura React + TypeScript + Vite e a separação entre motor puro, modelos e apresentação foram preservadas. Os sete modelos são configurações iniciais editáveis, sem preços de mercado ou tributos presumidos. A estrutura existente, incluindo as pastas de backend e testes na raiz, foi mantida.

A revisão financeira confirmou a distinção entre remuneração e lucro, margem e markup, despesas indiretas atribuídas e taxas em bases diferentes. Foi reproduzido e corrigido um resultado com prejuízo devido ao arredondamento de múltiplas taxas. Foram corrigidos problemas de identificação dos erros, associação acessível, transparência da memória, contraste e riscos de overflow identificados por inspeção estática.

Não foram implementados recursos da Sprint 02, autenticação, pagamentos, IA, integrações externas, analytics ou deploy.

## 2. Evidências de execução

Ambiente: Windows/PowerShell, Node.js 26.13.1, dependências já instaladas. Comandos executados dentro de `frontend/`:

| Verificação | Antes das correções | Resultado final |
| --- | --- | --- |
| `npm.cmd test` | 30 testes aprovados | **37 testes aprovados; zero falhas ou ignorados** |
| `npm.cmd run lint` | Aprovado | **Aprovado, sem erros** |
| `npm.cmd run build` | Aprovado | **Aprovado: TypeScript estrito + bundle Vite** |
| Servidor local | Iniciado com `npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort` | Vite iniciou; requisição HTTP retornou **200**, HTML em pt-BR e título Preciva |
| Navegador desktop | Tentativa realizada | **Bloqueado; não aprovado** |
| Viewports móveis e tablet | Sem acesso a uma sessão de navegador utilizável | **Não executados; não aprovados** |

O novo teste de arredondamento falhou antes da correção (34/35 aprovados) e passou depois. A suíte final inclui os 30 casos originais, três cenários profissionais, distinção explícita de markup, regressão de prejuízo por arredondamento e dois testes de identificação dos campos com erro. O teste original de conservação de centavos também exercita 100 cenários determinísticos.

O HTTP 200 comprova apenas que o servidor entrega a aplicação; não comprova execução do React, navegação ou layout no navegador. Build e lint também não equivalem a teste visual.

## 3. Validação das regras financeiras

### Fórmula e hipóteses preservadas

- **B** = custos diretos + indiretos atribuídos + remuneração.
- **A** = taxas percentuais sobre diretos, remuneração ou B, arredondadas individualmente.
- **C** = B + taxas fixas por trabalho + A.
- **P** = C / (1 − m − t), com margem **m** e soma das taxas de venda **t** em frações da receita; exige m + t < 1.
- **Lucro** = P − B − todas as taxas.
- Remuneração por hora/unidade é quantidade × valor; no modo fixo, a quantidade é ignorada.
- Percentuais sobre bases distintas não são somados ao denominador. Taxas não incidem umas sobre as outras. Valores fixos entram uma vez por linha de taxa, independentemente da base percentual.
- Indiretos são a parcela por trabalho informada pelo usuário; o texto de rateio documenta sua origem e não calcula automaticamente uma divisão mensal.

Valores monetários são processados com BigInt em centavos; quantidades usam milésimos e percentuais centésimos de ponto percentual. Itens e taxas usam meio centavo para cima. O preço é arredondado para cima ao centavo. A margem efetiva usa os valores monetários arredondados e pode diferir da desejada.

**Não houve alteração da fórmula nem da política de arredondamento.** A regra passou de **1.0.0 para 1.0.1** por uma validação adicional descrita abaixo. Não foi implementado markup como modo de cálculo: sua diferença para margem é explicada na interface e testada.

### Cenários executados no motor

Dados fictícios para conferência aritmética, sem caráter de recomendação de preço ou alíquota. Os resultados esperados foram definidos explicitamente nos testes, e não obtidos chamando o motor para gerar as expectativas. Esses cenários **não foram executados pela interface no navegador**.

| Cenário | Diretos | Indiretos | Remuneração | Taxas fixas | Taxas sobre receita | Margem desejada | Preço esperado e obtido | Taxas totais | Lucro |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cantor de eventos | R$ 700,00 | R$ 100,00 | 6 h × R$ 100 = R$ 600,00 | R$ 25,00 | 10% + 5% | 20% | **R$ 2.192,31** | R$ 353,85 | R$ 438,46 |
| Designer | R$ 100,00 | R$ 120,00 | 12 h × R$ 80 = R$ 960,00 | R$ 10,00 | 6% | 30% | **R$ 1.859,38** | R$ 121,56 | R$ 557,82 |
| Confeiteiro, lote de 20 unidades | R$ 140,00 | R$ 25,00 | 4 h × R$ 35 = R$ 140,00 | R$ 2,00 | 5% | 25% | **R$ 438,58 pelo lote** | R$ 23,93 | R$ 109,65 |

Memória independente dos cenários:

1. **Cantor:** transporte 150 + equipamento 300 + equipe 250 = 700; manutenção de 100 (1.000/mês ÷ 10 eventos); B = 1.400. P = 1.425 ÷ 0,65, arredondado para 2.192,31. Comissão 219,23 + taxa de receita 109,62 + fixa 25 = 353,85. Lucro = 2.192,31 − 1.400 − 353,85 = 438,46.
2. **Designer:** imagens 60 + impressão 40; estrutura de 120 (600/mês ÷ 5 projetos); B = 1.180. P = 1.190 ÷ 0,64 = 1.859,375, arredondado para 1.859,38. Taxas 111,56 + 10 = 121,56. Lucro = 557,82.
3. **Confeiteiro:** ingrediente 2 kg × 40 = 80; chocolate 1,5 kg × 30 = 45; 20 embalagens × 0,75 = 15. Diretos = 140; gás/energia atribuídos = 25; B = 305. P = 307 ÷ 0,70, arredondado para 438,58. Taxas 21,93 + 2 = 23,93. Lucro = 109,65. O motor não divide o preço por 20; a interface informa que o resultado é do lote completo.

Nos três cenários, a diferença entre margem efetiva e desejada é inferior a 0,01 ponto percentual, conforme asserção automatizada.

Outras verificações:

| Caso | Resultado esperado e obtido |
| --- | --- |
| Custo 100, margem 20%, sem taxas | Preço 125, lucro 25. Markup de 20% produziria 120 e não atende essa margem. |
| Diretos 100, indiretos 50, trabalho 100, taxas de 10% dos diretos, 5% do trabalho, 2% do subtotal e três fixas de 1; margem 20% | B = 250; taxas em outras bases = 20; fixas = 3; P = 341,25; lucro = 68,25. Sem incidência em cascata. |
| Margem + taxas de venda igual ou superior a 100% | Resultado bloqueado com mensagem explicativa. |
| Custos zero, margem válida e sem taxas | Preço zero, lucro zero, margem efetiva zero; orientação para preencher custos/remuneração. |
| Valor negativo, NaN, infinito, precisão excessiva ou total acima do limite | Resultado bloqueado. |
| Custo 0,01; margem zero; duas taxas de venda de 25% | Antes: preço 0,02, taxas 0,02, prejuízo 0,01. Depois: **resultado bloqueado por arredondamento**, sem recomendar esse preço. |

## 4. Problemas e correções

| Problema identificado | Correção aplicada | Evidência e limite |
| --- | --- | --- |
| Prejuízo por arredondamento independente de várias taxas, apesar de margem não negativa | Bloqueio de lucro negativo após calcular taxas e antes de devolver sucesso; mensagem explica a causa. Versão 1.0.1 | Teste de regressão reproduziu falha e passou com correção. O motor não procura outro preço nesse cenário extremo. |
| Erros genéricos e repetidos sem identificar linha/campo | Resumo agora informa grupo, posição, descrição e nome do campo; links focam explicitamente o input | Dois testes automatizados dos rótulos; comportamento de foco depende de teste no navegador. |
| Erros de descrição/rateio sem associação acessível local | Componente TextField com erro junto ao campo, `aria-invalid` e `aria-describedby`; instruções numéricas sempre associadas | Inspeção de código; leitor de tela ainda pendente. |
| Link de erro de total apontava para elemento inexistente | Erros globais são texto, sem âncora inválida | Inspeção de código. |
| Memória não repetia quantidades, valores unitários, remuneração e critérios de rateio | Memória inclui essas premissas e margem desejada, mantendo base e taxas detalhadas | Inspeção de código; conferência visual pendente. |
| Margem efetiva com duas casas ocultava pequenas diferenças do arredondamento | Exibição com até quatro casas decimais | Inspeção de código; valores do motor preservados. |
| Borda de input com baixo contraste sobre branco | Borda alterada de #c7d2ca para #7d9182 | Contraste calculado: **1,56:1 → 3,36:1**. Não é auditoria integral de acessibilidade. |
| Foco laranja com contraste inferior a 3:1 sobre cartão escuro | Cor alterada de #b26c20 para #b97728 | Contraste calculado no fundo escuro: **2,82:1 → 3,19:1**; no fundo claro: **3,43:1** após correção. |
| Botão remover com apenas 30 px de largura | Coluna ampliada para 44 px; altura já era 44 px. Resumo da memória e botão reiniciar com mínimo de 44 px de altura | Correção estática; conferir toque e layout no navegador. |
| Risco de overflow para valores altos e colunas estreitas | Colunas numéricas móveis com `minmax(0,1fr)`, resultado com `min-width:0` e valores do detalhamento podendo quebrar linha | Risco identificado no CSS, sem alegar reprodução visual. |
| Destino do atalho de navegação sem foco programático | Calculadora com `tabIndex=-1` | Inspeção de código; navegação real por teclado pendente. |

## 5. Requisitos atendidos e não atendidos

“Atendido por código/testes” não significa homologação do fluxo visual.

| Requisito do PRD | Situação nesta revisão |
| --- | --- |
| RF-001 — Seleção de segmento | Atendido por código; sete modelos testados. Interação no navegador pendente. |
| RF-002 — Modelo com adicionar/editar/remover | Atendido por código; interação no navegador pendente. |
| RF-003 — Materiais/insumos | Atendido; cenários com quantidades e valores fracionados testados. |
| RF-004 — Remuneração por hora/quantidade/fixo | Atendido no motor e interface; três modalidades testadas no motor. |
| RF-005 — Indiretos e critério de atribuição | Atendido; parcela e explicação editáveis, agora também na memória. |
| RF-006 — Taxas/tributos percentuais e fixos | Atendido; bases explícitas e sem regime presumido. |
| RF-007 — Margem distinta de markup | Atendido; fórmula, explicação e teste específico. |
| RF-008 — Composição do resultado | Atendido por código e testes financeiros. Clareza visual pendente. |
| RF-009 — Memória/premissas | Atendido por código após correção; leitura no navegador pendente. |
| RF-010 — Bloqueio de inválidos | Atendido pelos testes, incluindo denominador, limites e prejuízo por arredondamento. |
| RF-011 — Sem cadastro/pagamento | Atendido por inspeção; nenhuma dependência desses recursos. |
| RF-012 — Responsividade | **Implementado, mas não homologado**: nenhum viewport foi efetivamente testado. |
| RF-013 — Personalização | Atendido por código; nomes e itens editáveis. Interação no navegador pendente. |
| RNF-001 — Segurança/dependências | Validação e ausência de segredos/chamadas externas no código da calculadora revisadas. **Auditoria de vulnerabilidades e atualização de dependências não executadas**; não declarar conformidade integral. |
| RNF-002 — Privacidade | Atendido no recorte: sem coleta, armazenamento persistente ou rastreamento; aviso presente. |
| RNF-003 — Cálculo local/desempenho | Atendido pelo motor local; HTTP local e build verificados. Sem benchmark em dispositivo móvel. |
| RNF-004 — Acessibilidade | **Parcial**: semântica, rótulos, contraste amostral e correções revisados; teclado, leitor de tela, zoom e reflow não homologados. |
| RNF-005 — Manutenibilidade | Atendido; domínio e modelos independentes da apresentação. Sem nova biblioteca. |
| RNF-006 — Testabilidade | Atendido; 37 testes, incluindo casos extremos e cenários profissionais. Sem testes de interface. |
| RNF-007 — Versão das regras | Identificação 1.0.1 no resultado e memória; persistência não existe nesta sprint. |
| RNF-008 — Futuras contas/dados isolados | Não validável nesta sprint sem backend/contas; mantido como requisito futuro, sem implementação antecipada. |
| Critério do primeiro lançamento: eventos básicos de utilização | **Não atendido**: não há métricas/eventos de uso. Foi excluído do recorte da Sprint 01, mas continua requisito do PRD para o lançamento. Não foi acrescentada telemetria nesta revisão. |

## 6. Pendências técnicas e visuais

### Bloqueio de navegador

A consulta de superfícies retornou `browsers: []` e `The browser access host is unavailable`. Havia uma janela Brave disponível. A tentativa de acessá-la pela ferramenta nativa foi interrompida com a mensagem de que não foi possível determinar a URL atual com confiança suficiente para aplicar a política. Não houve novas ações de interface após essa interrupção.

Consequentemente, **não há screenshots de homologação, testes visuais aprovados, cenários preenchidos na interface ou comprovação de responsividade em desktop/mobile**. Não se tentou contornar o bloqueio por outra automação.

### Roteiro obrigatório para concluir a homologação visual

1. Abrir a aplicação em desktop 1440×900, tablet 768×1024 e viewports móveis 390×844 e 320×568; registrar navegador e capturas. São tamanhos planejados, **não executados**.
2. Executar pela interface os três cenários financeiros da seção 3, conferir os resultados e abrir a memória.
3. Trocar todos os sete modelos; adicionar, editar, renomear e remover custos, indiretos e taxas; alternar as três modalidades de remuneração; reiniciar campos e verificar o aviso de perda de dados.
4. Testar campo vazio, descrição ausente, decimal com vírgula/ponto, negativo, precisão excessiva, margem + taxas igual a 100%, total excessivo e caso de arredondamento com prejuízo. Confirmar que não fica resultado anterior válido visível como atual.
5. Conferir links de erro e foco, atalho para a calculadora, ordem de Tab/Shift+Tab, operação do select e details por teclado e anúncios de erro/resultado em leitor de tela.
6. Testar zoom 200%/400%, ausência de rolagem horizontal, valores monetários grandes, descrições longas, memória expandida, alvos de toque e teclado virtual em dispositivo real.

Pendências adicionais: não há testes automatizados de interação/DOM; não foi realizada auditoria completa WCAG, auditoria de dependências ou benchmark móvel. O requisito de métricas do lançamento deve ser conciliado com o escopo e a política de privacidade antes da publicação futura. Dados continuam somente em memória, sem persistência — comportamento documentado, não defeito desta sprint.

## 7. Arquivos alterados nesta homologação

- `frontend/src/domain/pricing.ts`: regra 1.0.1 e bloqueio do prejuízo por arredondamento.
- `frontend/src/form.ts`: identificação contextual dos campos com erro.
- `frontend/src/App.tsx`: mensagens, foco, associação acessível, memória completa e precisão da margem exibida.
- `frontend/src/App.css` e `frontend/src/index.css`: contraste, alvos de toque e contenção de valores/colunas.
- `frontend/tests/homologation.test.mjs` e `frontend/tests/form.test.mjs`: sete testes adicionais.
- `README.md`: versão, validação nova, organização dos testes e referência a este relatório.
- `docs/HOMOLOGACAO-SPRINT-01.md`: evidências, parecer e pendências.

O PRD, o relatório histórico da Sprint 01, a arquitetura, as dependências e os módulos futuros foram preservados. A pasta não tem metadados Git disponíveis; esta relação descreve as alterações realizadas na revisão.

## 8. Parecer final e prontidão para a Sprint 02

**Aprovada com ressalvas para iniciar o planejamento e desenvolvimento local da Sprint 02.** A base matemática e técnica passou nos testes disponíveis, e as correções encontradas dentro do escopo foram aplicadas. Não há falha automatizada aberta nesta entrega.

A aplicação **não está integralmente homologada para lançamento**. RF-012 e a parte prática de RNF-004 precisam ser validados no navegador, e o critério de métricas do PRD permanece sem implementação. A continuidade técnica da Sprint 02 pode ocorrer com essas pendências rastreadas; não se deve encerrar a homologação visual nem aprovar publicação até executar o roteiro e resolver eventuais defeitos encontrados.

