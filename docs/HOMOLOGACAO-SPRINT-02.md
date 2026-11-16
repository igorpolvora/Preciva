# Homologação — Sprint 02

**Data:** 16/11/2026 (America/Sao_Paulo)  
**Parecer:** **aprovada com ressalvas técnicas e visuais**, para continuidade local e preparação dos testes com usuários. Não equivale a autorização de publicação.

## Resumo

A interface foi reorganizada com foco no celular, explicações junto dos campos, três grupos navegáveis, rascunhos por modelo, confirmação de reinício, resultado destacado e componentes reutilizáveis. Mantidas inclusão/edição/remoção de itens, despesas indiretas com critério, três modalidades de remuneração, taxas com bases explícitas, margem, modo personalizado e memória detalhada.

Foi acrescentado feedback voluntário para **precivacontact@gmail.com**, informado pelo usuário: preparação de e-mail, cópia ou arquivo de texto. Não há envio automático, cadastro, backend ou confirmação fictícia de recebimento.

Os eventos de utilização são opcionais, em memória, sem valores financeiros ou texto livre, com enumeração de atributos e limite de 200 registros. Nenhum serviço externo foi integrado.

## Resultados executados

Ambiente: Node.js 26.13.1, Windows/PowerShell, dependências existentes. Dentro de `frontend/`:

| Verificação | Resultado |
| --- | --- |
| `npm.cmd test` | **54 aprovados, zero falhas, zero ignorados** |
| `npm.cmd run lint` | **Aprovado, sem erros** |
| `npm.cmd run build` | **Aprovado**, TypeScript estrito e bundle Vite |
| HTTP local em `127.0.0.1:5173` | **200**, título Preciva e `lang="pt-BR"` |
| Motor financeiro | **Arquivo inalterado**, versão 1.0.1 e hash idêntico antes/depois |
| Renderização de componentes no servidor | **Aprovada**, incluída na suíte; não é navegador |
| Revisão visual desktop/tablet/mobile | **Não executada; não aprovada** |
| Teclado/leitor de tela, clipboard/download e aplicativo de e-mail reais | **Pendentes** |

SHA-256 do motor: `18319FBD24B0EBD7127F890C23611F80E9C76E85A91275588702CA97A967CF5D`.

### Cobertura acrescentada

- Parsing decimal com vírgula/ponto e rejeição de notação científica, milhar, vazio e entradas incompletas; precisão financeira continua sob validação do motor.
- Isolamento de rascunhos por atividade, preservação do texto inválido, reinício de um único modelo e estabilidade do texto ao remover linha anterior.
- Coletor desligado por padrão; ausência de coleta retroativa; início/conclusão únicos por ciclo; reinício; limpeza na revogação; schema fechado sem campos financeiros; buffer e snapshots isolados.
- Clareza obrigatória no feedback, comentário opcional com limite, exclusão de metadados da calculadora, encoding do mailto para destinatário autorizado, roteamento para uma única ação e falhas de saída sem afirmação de envio.
- Marcação inicial com sete modelos, seleção única, etapas, campos rotulados, feedback e permissão desligada; renderização do resultado com R$ 125 para custo R$ 100/margem 20%; erro de margem bloqueando a exibição do preço.

Uma falha inicial de resolução de import TypeScript no teste de experiência foi corrigida por extensão explícita `.ts`. A suíte foi reexecutada após a correção.

### Regressões financeiras

Os testes anteriores continuam aprovados, incluindo:

| Cenário | Preço | Taxas totais | Lucro |
| --- | --- | --- | --- |
| Cantor de eventos | R$ 2.192,31 | R$ 353,85 | R$ 438,46 |
| Designer | R$ 1.859,38 | R$ 121,56 | R$ 557,82 |
| Confeiteiro — lote completo de 20 unidades | R$ 438,58 | R$ 23,93 | R$ 109,65 |

As premissas estão no relatório de homologação da Sprint 01 e no teste `homologation.test.mjs`. Nenhuma fórmula, arredondamento, limite, remuneração ou regra tributária foi modificada nesta sprint. Esses cenários foram executados no motor, não preenchidos em um navegador.

## Acessibilidade e responsividade

A revisão estática verificou rótulos associados, ajudas e erros com `aria-describedby`, grupos de itens com `fieldset/legend`, botões nativos, seleção com `aria-pressed`, navegação por âncoras, seções focáveis, região de status para preço/feedback, contagem opcional via checkbox e textos além de cores/símbolos.

O código solicita foco após adicionar/remover itens, ao conferir resultado e ao fechar confirmação de reinício. Inputs usam 16 px e `inputMode=decimal`; alvos de botões têm ao menos 44 px de altura. O layout usa colunas com `minmax(0,1fr)`, quebras de valores longos e breakpoints de 600/980/1200 px. Essa inspeção **não prova o layout ou a navegação real**.

Contrastes calculados a partir das cores CSS, como evidência amostral:

| Par | Razão |
| --- | --- |
| Texto secundário / fundo da página | 5,62:1 |
| Ajuda / fundo do item | 5,88:1 |
| Borda de campo / branco | 3,36:1 |
| Borda do botão adicionar / fundo do botão | 3,50:1 |
| Texto do botão principal / fundo verde | 9,42:1 |
| Preço / fundo do resultado | 9,65:1 |
| Erro / branco | 7,12:1 |
| Indicador de foco / fundo escuro | 3,19:1 |

Não constitui auditoria WCAG completa nem aprovação de estados nativos/hover, zoom ou tecnologias assistivas.

### Limitação do navegador

A consulta às superfícies retornou `browsers: []` e **`The browser access host is unavailable`**. A sessão utilizável de navegador não estava disponível. Não foram feitos testes de viewport, screenshots, preenchimento interativo ou envio de feedback, e não se considerou o HTTP 200 ou o teste de renderização como aprovação visual.

## Requisitos e situação

| Item da Sprint 02 | Situação |
| --- | --- |
| Identidade visual e layout mobile-first | Implementados; homologação visual pendente |
| Componentes reutilizáveis e explicações | Implementados; marcação/renderização verificadas |
| Sete modelos, personalizado e funcionalidades anteriores | Preservados; navegação com rascunhos separados implementada |
| Remuneração separada de lucro, margem distinta de markup | Preservados e cobertos pelos testes financeiros |
| Nenhuma regra tributária automática | Atendido |
| Teclado, foco, contraste e erros | Implementados e inspecionados; testes práticos pendentes |
| Feedback voluntário sem cadastro | Implementado com destinatário informado; abertura/envio real não testados |
| Preparação de eventos sem valores financeiros | Implementada, opcional e local; contrato e privacidade testados |
| Serviços de analytics externos | Não integrados |
| Preservação do motor | Confirmada por hash e testes |
| Login, pagamentos, IA, backend, bibliotecas novas e deploy | Não implementados/adicionados |
| Documentação da sprint e homologação | Entregue |

O critério de métricas do PRD agora tem um contrato e coletor local, mas **não há analytics de produção ou medição remota de usuários reais**. Não se deve interpretar o buffer local como atendimento integral da medição comercial do lançamento.

## Problemas tratados

1. Trocar de modelo descartava o trabalho sem oportunidade de comparação: agora mantém rascunhos independentes na página aberta.
2. Reinício apagava imediatamente os campos: agora pede confirmação e preserva os demais modelos.
3. Formulário longo e explicações pouco próximas dos campos: agrupamento em três partes, atalhos e ajuda por campo.
4. Estado de input dependia do ciclo de vida do componente: texto decimal é controlado no rascunho com chave de item estável.
5. Resultado e termos financeiros precisavam de maior destaque: hierarquia, composição rotulada e comparação de margens.
6. Não havia caminho de feedback: formulário voluntário com mailto/cópia/download e mensagens que distinguem preparação de entrega.
7. Não havia contrato de uso medido: eventos locais mínimos, opt-in, revogação e testes de privacidade.
8. Inclusão/remoção podia perder o foco útil: solicitações explícitas de foco adicionadas; validação real ainda pendente.

## Pendências para validação com usuários

- Abrir em desktop 1440×900, tablet 768×1024 e celulares 390×844 e 320×568, além de conferir os limites dos breakpoints e zoom 200%/400%. **Tamanhos planejados, não executados.**
- Conferir três cenários financeiros pela interface, valores grandes, descrições longas, memória expandida, erros e ausência de rolagem horizontal.
- Testar Tab/Shift+Tab, seleção de modelos, atalhos, inserção/remoção, confirmação/cancelamento de reinício e anúncios em leitor de tela.
- Confirmar preservação dos rascunhos, inclusive texto inválido, em trocas sucessivas e perda documentada ao recarregar.
- Testar mailto no computador e celular com/sem cliente configurado; revisar destinatário/corpo; testar clipboard negado e download. Nenhum feedback foi enviado durante o desenvolvimento.
- Conferir que nenhum evento é criado antes da permissão, que valores e comentários não aparecem nos eventos e que a revogação apaga a contagem. Validar compreensão do aviso com usuários reais.
- Realizar sessões de validação com autônomos dos segmentos escolhidos. Ainda não há evidência de usabilidade com usuários reais ou taxa de conclusão remota.
- Auditoria completa de acessibilidade, auditoria de dependências e benchmark móvel permanecem fora das evidências desta entrega.

## Arquivos e parecer final

A relação de arquivos e as decisões técnicas estão em `docs/SPRINT-02.md`. PRD, documentos históricos, motor, modelos, testes anteriores e dependências foram preservados.

**Aprovada com ressalvas para revisão local e preparação da validação com usuários.** Os testes disponíveis, lint e build passaram. A interface não está visualmente homologada, e o feedback/eventos não foram validados em interação real. Antes de considerar o produto pronto para validação externa, execute o roteiro em navegador e resolva eventuais defeitos. Não houve deploy, publicação ou envio de mensagens.
