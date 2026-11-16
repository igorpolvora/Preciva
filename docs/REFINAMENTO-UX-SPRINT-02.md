# Refinamento UX pós-Sprint 02

**Data:** 16/11/2026 (America/Sao_Paulo).  
**Escopo:** ajustes pontuais de apresentação, compactação e navegação. Motor financeiro v1.0.1 preservado.

## Contexto e decisões

O código atual, os testes e os estilos foram inspecionados. O usuário informou aprovação visual das capturas mobile com ressalvas. Essas capturas não estavam anexadas nesta execução; não foram usadas como evidência de inspeção visual própria dos novos ajustes.

As duas instruções foram conciliadas: foi mantido integralmente o fluxo de feedback existente e sua hierarquia recebeu apenas redução de título/espaçamento no CSS. Não há envio remoto novo, persistência, autenticação, pagamentos, IA, bibliotecas novas ou deploy.

## Alterações

### Resultado inicial e zero intencional

Foi confirmado no código que a tela inicial apresentava R$ 0,00 como preço calculado: os modelos começam com valores zero e o motor aceita legitimamente esse cenário.

A correção é exclusivamente de apresentação:

- **Inicial:** cálculo válido com preço zero, sem confirmação explícita. Mostra “Seu preço começa aqui”, orientação para preencher custos/remuneração e explicação sobre simulação gratuita. Não mostra preço, composição ou margens como resultado já definido.
- **Pronto:** preço positivo, preservando a atualização automática existente; ou preço zero confirmado explicitamente pelo usuário.
- **Inválido:** erros continuam bloqueando o preço, inclusive se houver confirmação anterior de zero. As mensagens e links para os campos foram mantidos.

A opção **“Quero simular um trabalho com preço zero”** fica junto da ação de conferência e só aparece quando o motor retorna zero válido. A opção não altera valores nem o motor. “Conferir meu preço” sozinho não transforma o estado inicial em zero intencional. Confirmado o zero, a composição e memória ficam disponíveis normalmente, com indicação de simulação confirmada.

Qualquer edição financeira ou descritiva desmarca a confirmação de zero, exigindo nova confirmação para o cenário alterado. Trocar de modelo preserva esse estado no rascunho do modelo; reiniciar limpa tudo daquele modelo.

O evento local `calculation_completed` agora também admite zero **explicitamente confirmado e válido**, além de preço positivo, após a ação de conferência. O opt-in anterior, a exigência de início registrado e o controle de duplicação permanecem. Selecionar a opção conta como interação de início; nenhum atributo novo foi acrescentado ao evento. Esta atualização substitui apenas a condição “preço maior que zero” descrita no contrato histórico da Sprint 02.

### Compactação dos custos

| Regra de CSS | Antes | Depois |
| --- | --- | --- |
| Margem vertical dos cartões de custo | 18 px | 10 px |
| Padding vertical inicial do cartão, mobile | 14 px no topo | 10 px no topo |
| Margem inferior dos campos dentro da linha | 16 px | 0 px; separação feita pelo grid |
| Espaço entre linhas do grid de custos | 14 px | 10 px |
| Gap rótulo/input/ajuda em custos | 7 px | 4 px |
| Espaço abaixo do cabeçalho de custos | 24 px | 16 px |
| Separação entre grupos direto/indireto | margem 30 / padding 24 px | margem 24 / padding 18 px |

As regras foram limitadas à seção de custos. Inputs continuam com pelo menos 48 px e botões com pelo menos 44 px; ajuda, rótulos e mensagens de erro permanecem visíveis. Não se reduziu o tamanho dos textos dos campos.

Foi considerada a opção de resumo recolhível, mas optou-se por manter os itens abertos nesta rodada. Isso evita ocultar erros ou acrescentar uma interação para editar. A compactação é obtida removendo espaços duplicados do grid, campos e cartões. Não há colapso automático após digitação.

### Etapa ativa e etapas concluídas

A navegação passou a exibir:

- **Atual:** texto explícito, borda mais forte, fundo destacado e `aria-current="step"` em um único link.
- **Concluída:** texto explícito e símbolo de confirmação, além do estilo visual. Pode coexistir com “Atual”.
- **A revisar:** etapa não ativa e ainda não concluída.

A etapa ativa acompanha o foco nos campos, a seleção dos atalhos e a rolagem/redimensionamento, considerando o início das seções em relação à navegação. Os eventos de scroll são passivos e a atualização é limitada por `requestAnimationFrame`; os listeners são removidos ao desmontar o componente.

Concluir é uma ação explícita **“Marcar etapa como revisada”**, disponível ao final de cada seção. O critério é objetivo: não haver erro correspondente e os dados atuais coincidirem com os dados confirmados pelo usuário. Valores padrão válidos **não** marcam etapas automaticamente.

- Custos: validação de todos os diretos e indiretos, incluindo descrição e critério de rateio.
- Trabalho: validação da modalidade e remuneração pelo motor existente.
- Taxas/margem: validação das taxas, da margem e do denominador.
- Erro global de total/arredondamento impede conclusão das etapas até ser resolvido.

Alterar os dados de uma etapa tira sua conclusão enquanto forem diferentes dos dados revisados; as outras etapas permanecem concluídas se continuarem válidas. Retornar exatamente às premissas já revisadas pode restaurar a indicação. Revisões ficam apenas no rascunho em memória, sem transmissão, e são apagadas ao reiniciar/recarregar.

Os indicadores são auxiliares: não bloqueiam edição, navegação ou cálculo automático. Não foram adicionados atributos aos eventos de utilização.

### Feedback e navegação mobile

O fluxo de feedback, seus componentes de lógica, destinatário `precivacontact@gmail.com`, preparo de e-mail, cópia, download e mensagens de privacidade/estado permanecem inalterados. Apenas o título foi reduzido para 24/26 px e o espaçamento da seção/colunas foi suavizado. Nenhum feedback foi enviado durante esta execução.

Mantidos links e botões nativos, foco visível, ajudas/erros associados, números legíveis, grades com `minmax(0,1fr)` e quebra dos rótulos do progresso em espaços estreitos. As indicações de etapa não dependem exclusivamente de cor.

## Testes e evidências

- **63 testes aprovados**, zero falhas ou ignorados: 54 anteriores mais 9 casos de refinamento.
- O teste de renderização já existente recebeu asserções adicionais para estado inicial sem preço, zero confirmado e sem confirmação, etapa atual única e conclusão explícita.
- Testes novos cobrem os três estados do resultado, zero sem contornar erros, atualização automática positiva, edição retirando confirmação de zero, critérios de conclusão, alterações por etapa, reinício e limites do cálculo de etapa visível.
- **Lint aprovado** (`npm.cmd run lint`).
- **Build aprovado** (`npm.cmd run build`, TypeScript estrito + Vite).
- Motor `frontend/src/domain/pricing.ts` com SHA-256 idêntico antes/depois: `18319FBD24B0EBD7127F890C23611F80E9C76E85A91275588702CA97A967CF5D`. Continua versão **1.0.1**.

Os testes de renderização são executados no servidor com Vite/React já instalados. Não executam layout, scroll, foco real, teclado ou leitor de tela. As fórmulas e os cenários financeiros de cantor, designer e confeiteiro continuam cobertos pela suíte anterior.

## Verificações visuais realmente executadas

**Nenhuma verificação em navegador foi executada nesta rodada.** A consulta de superfícies retornou `browsers: []` e `The browser access host is unavailable`. Foram feitas inspeção estática de JSX/CSS, testes de funções e renderização no servidor. Não foram geradas screenshots nem medidos cartões renderizados.

| Largura solicitada | Revisão do código/CSS | Navegador e aprovação visual dos novos ajustes |
| --- | --- | --- |
| 320 px | Regras mobile, quebra dos rótulos e colunas mínimas revisadas | Pendente |
| 390 px | Regras mobile e alvos mínimos mantidos | Pendente |
| 768 px | Regras a partir de 600 px preservadas; compactação dos custos aplicada | Pendente |
| 1440 px | Colunas do formulário/painel e hierarquia do feedback revisadas | Pendente |

A aprovação visual mobile com ressalvas informada pelo usuário se refere à inspeção anterior. Ela não foi convertida em aprovação visual dos ajustes deste relatório.

### Roteiro ainda pendente

1. Abrir as quatro larguras e conferir redução efetiva da altura dos custos, legibilidade, alvos de toque e ausência de rolagem horizontal.
2. Conferir o início sem preço; preço positivo automático; zero intencional; revogação da confirmação após edição e preservação por modelo.
3. Testar indicação ativa ao rolar, clicar nos atalhos e navegar por Tab/Shift+Tab, inclusive após erros e em zoom 200%/400%.
4. Revisar etapas, alterar seus dados, introduzir erros e reiniciar; conferir estados com leitor de tela. Valores padrão não devem aparecer concluídos antes da revisão.
5. Conferir feedback com a hierarquia mais simples, preservando os três meios de saída e sem envio automático.

## Arquivos alterados

- `frontend/src/components/Calculator.tsx`: revisão de etapas, estado de zero intencional e integração da navegação.
- `frontend/src/components/ResultPanel.tsx`: apresentação inicial/pronta/inválida e preservação de zero explícito.
- `frontend/src/components/StepNavigation.tsx`: novo componente de navegação com estados e acompanhamento da rolagem.
- `frontend/src/experience.ts`: metadados transitórios do rascunho; edição limpa confirmação de zero.
- `frontend/src/ux.ts`: regras puras de apresentação, revisão das etapas e seleção da etapa visível.
- `frontend/src/App.css`: compactação, estados da navegação e ajuste leve do feedback.
- `frontend/tests/ux-refinement.test.mjs`: nove testes novos.
- `frontend/tests/components.test.mjs`: asserções de renderização adicionais.
- `README.md`: referência e esclarecimento dos novos estados de apresentação.
- `docs/REFINAMENTO-UX-SPRINT-02.md`: este relatório.

PRD, documentos históricos, motor, modelos, dependências, fluxo de feedback e limites de escopo preservados. Nenhuma persistência, integração ou publicação foi feita.
