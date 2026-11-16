# Sprint 02 — Experiência do usuário e validação

**Data:** 16/11/2026  
**Base:** Sprint 01 homologada com ressalvas, motor financeiro 1.0.1.  
**Escopo:** experiência móvel, explicações, componentes reutilizáveis, feedback voluntário e preparação de eventos locais. Sem publicação.

## Revisão inicial e regras preservadas

Foram lidos README, PRD v0.2, relatório da Sprint 01 e sua homologação antes das modificações. A estrutura React + TypeScript + Vite foi mantida; não foram acrescentadas bibliotecas, backend, serviços externos, autenticação, pagamentos ou IA.

O arquivo `frontend/src/domain/pricing.ts` foi preservado integralmente. SHA-256 antes e depois: `18319FBD24B0EBD7127F890C23611F80E9C76E85A91275588702CA97A967CF5D`. A versão continua **1.0.1**, inclusive validações, limites, arredondamentos e bloqueio de prejuízo por arredondamento. Os modelos profissionais e o personalizado também foram preservados.

## Interface e decisões de experiência

- Identidade Preciva com marca tipográfica, verde escuro, superfícies claras, contraste e hierarquia de preço/composição. Fontes do sistema, sem downloads externos de fontes ou imagens.
- CSS começa pelo celular; amplia layout nos breakpoints 600, 980 e 1200 px. Em telas largas, o resultado fica ao lado do formulário. Em telas menores, há atalho para resultado e navegação entre grupos.
- Três grupos: **custos**, **trabalho** e **taxas/margem**. Mantivemos os campos visíveis, em vez de um wizard que escondesse erros de outras etapas. A navegação usa links nativos para seções focáveis.
- Rascunhos independentes por atividade na memória do React. Trocar de modelo preserva quantidades, valores e até entradas decimais ainda inválidas. Recarregar perde tudo. Não se trata de salvamento permanente.
- Reinício com confirmação explícita dentro da página, limitado ao modelo atual. Cancelar preserva o rascunho; os demais modelos não são afetados.
- Linhas numéricas usam chaves estáveis baseadas no ID do item: remover uma linha anterior não desloca o texto digitado para outro custo.
- Todos os campos têm ajuda: quantidade, valor unitário, modalidade de remuneração, horas/unidades, taxa percentual, valor fixo, base de incidência, margem, descrição e critério de rateio.
- Remuneração é sempre distinta de lucro; a diferença entre margem e markup tem exemplo de R$ 100 → R$ 125 para margem de 20%. Não há presunção tributária.
- Resultado destaca preço do trabalho/lote completo, composição rotulada, margem desejada e efetiva e memória de cálculo com premissas. Cores e símbolos complementam textos; não são o único sinal.
- Erros invalidam o resultado atual, permanecem junto dos campos e são relacionados no resultado com links que focam o campo correspondente.
- Adicionar item solicita foco na nova descrição; remover solicita foco no botão de adicionar correspondente. Conferir solicita foco no resultado. Funcionamento prático com teclado/leitor de tela ainda precisa de navegador.

## Componentes e organização

| Arquivo | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Página, seleção dos modelos, rascunhos, confirmação de reinício e permissão de contagem |
| `src/components/Fields.tsx` | Campo com rótulo/ajuda/erro e seção reutilizável |
| `src/components/Calculator.tsx` | Edição dos três grupos e conferência explícita |
| `src/components/ResultPanel.tsx` | Resultado, composição, erros e memória de cálculo |
| `src/components/FeedbackPanel.tsx` | Feedback voluntário e mensagens de saída |
| `src/experience.ts` | Estado do rascunho, parsing decimal e formatação da apresentação |
| `src/usage.ts` | Coletor local com esquema fechado e permissão revogável |
| `src/feedback.ts` | Validação/preparação de texto, mailto e adaptadores de saída |
| `src/App.css`, `src/index.css` | Layout mobile-first, identidade, contraste e foco |

As funções de apresentação não repetem a fórmula financeira: resultado e validações continuam vindo do motor existente. O parsing aceita vírgula ou ponto decimal, sem separador de milhar nem notação científica; a precisão e os limites continuam sendo validados pelo motor.

## Feedback sem cadastro

O destinatário **precivacontact@gmail.com** foi informado pelo responsável pelo produto durante esta sprint.

O usuário escolhe uma opção de clareza e pode escrever até 1.000 caracteres. O comentário é opcional. O formulário explica que não deve incluir dados pessoais/financeiros e que nenhum campo da calculadora será anexado.

- **Preparar e-mail:** abre um link `mailto:` com destinatário, assunto e texto codificados. O usuário precisa revisar e enviar no próprio aplicativo. A interface não afirma entrega/recebimento, apenas que solicitou abrir o aplicativo.
- **Copiar texto:** permite enviar pelo canal escolhido pelo usuário. Falhas do clipboard são tratadas com alternativa de download.
- **Baixar feedback:** prepara um `.txt` local. Isso não envia o feedback.

Nenhuma ação dispara requisição de rede pelo código do Preciva. O texto não é transmitido automaticamente. Mailto depende de um aplicativo de e-mail configurado e pode ter limites de tamanho; copiar/baixar permanecem disponíveis. Texto livre pode conter o que o usuário escrever voluntariamente; ele nunca é incluído nos eventos de utilização.

## Contrato dos eventos de utilização — schema 1

A contagem é **opcional, desativada por padrão e somente em memória nesta página**. O usuário pode ativá-la na seção de privacidade. Revogar apaga eventos e controle de jornadas. Recarregar também apaga tudo. Nenhuma ação anterior à permissão é recuperada.

Esquema único, sem metadados adicionais:

```json
{"schemaVersion":1,"name":"calculation_started","segment":"design"}
```

Segmentos permitidos: `music`, `design`, `beauty`, `food`, `professional`, `technical`, `custom`.

| Evento | Gatilho | Regra |
| --- | --- | --- |
| `template_selected` | Troca explícita de atividade | Não dispara ao montar a página nem clicar no modelo já selecionado |
| `calculation_started` | Primeira edição de um campo, inclusão ou remoção de item após a permissão | Uma vez por modelo/ciclo |
| `calculation_completed` | Botão **Conferir meu preço**, motor válido e preço maior que zero | Exige início registrado; uma vez por modelo/ciclo; não dispara a cada tecla |
| `calculation_invalid` | Conferência com resultado inválido ou preço zero | Registra a tentativa; não anexa mensagem, campo ou valor; não conta conclusão |
| `calculation_reset` | Confirmação do reinício | Limpa o controle de início/conclusão daquele modelo e permite novo ciclo |
| `feedback_prepared` | Feedback passou na validação para e-mail/cópia/download | Conta preparação, não entrega |
| `feedback_email_requested` | Usuário pediu a abertura do e-mail | Conta solicitação, não envio confirmado nem recebimento |

Um ciclo dura até o reinício do modelo ou a revogação/perda da permissão. Voltar a um rascunho não cria outra conclusão. Se a permissão for dada depois de uma edição, é necessária uma nova edição para contar o início; uma conferência isolada não gera conclusão sem início.

O coletor aceita apenas nomes e segmentos enumerados e cria o objeto de evento do zero. **Não recebe nem inclui preço, custo, taxa, margem, quantidade, descrição de item, erro livre, comentário, e-mail do usuário, identidade, ID de sessão, timestamp ou URL.** O destinatário do feedback também não é um atributo dos eventos.

Buffer limitado aos **200 eventos mais recentes**, com snapshots copiados. Essa contagem limitada é um mecanismo local para validar o contrato; não constitui relatório histórico, análise de abandono, taxa global de conversão ou medição remota de usuários reais. Se o buffer descartar um início antigo, não se deve inferir funil completo a partir dele.

Não há SDK, envio, cookies, localStorage, sessionStorage, beacon ou integração de analytics. Qualquer futuro transporte deve manter a lista explícita de atributos e depender de autorização, política de privacidade e revisão próprias. Não foi preparado endpoint fictício nem criado um backend para esta finalidade.

## Testes e verificação

**54 testes aprovados**: os 37 anteriores mais 17 da Sprint 02 (4 experiência/rascunhos, 5 eventos, 7 feedback, 1 renderização de componentes com múltiplas asserções).

Testes de renderização usam o Vite já instalado para carregar TSX e `react-dom/server`. Não houve instalação de biblioteca. Eles verificam marcação, controles, rótulos, opção de permissão inicialmente desligada, composição financeira e ausência de preço quando inválido. **Não simulam cliques, navegador, layout ou leitor de tela.**

`npm.cmd run lint` e `npm.cmd run build` aprovados. O servidor local respondeu HTTP 200. Evidências, limitações e roteiro visual em `docs/HOMOLOGACAO-SPRINT-02.md`.

Durante a implementação, um teste identificou import sem extensão incompatível com a execução nativa de TypeScript do Node. O import foi corrigido em `experience.ts`; não se alterou o motor nem se adicionou loader.

## Arquivos criados/alterados

- Alterados: `frontend/src/App.tsx`, `frontend/src/App.css`, `frontend/src/index.css`, `README.md`.
- Criados: os quatro componentes em `frontend/src/components/`, `frontend/src/experience.ts`, `frontend/src/usage.ts`, `frontend/src/feedback.ts`.
- Criados: `frontend/tests/experience.test.mjs`, `usage.test.mjs`, `feedback.test.mjs`, `components.test.mjs`.
- Criados: `docs/SPRINT-02.md` e `docs/HOMOLOGACAO-SPRINT-02.md`.
- Preservados: PRD, relatórios da Sprint 01, motor/modelos financeiros, testes anteriores, dependências e arquivos de configuração.

## Limitações

O serviço de navegador retornou indisponibilidade. Não há aprovação visual em desktop, tablet ou celular, nem teste interativo real de teclado/leitor de tela ou dos aplicativos de e-mail/clipboard/download. Rascunhos, feedback em edição e contagem local são perdidos ao recarregar. A preparação para validação está implementada; a validação com usuários reais ainda precisa ser realizada. Nenhum deploy ou publicação foi feito.
