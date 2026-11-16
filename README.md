# Preciva — Calculadora multissetorial

Calculadora de precificação para autônomos brasileiros, em React + TypeScript + Vite. A estrutura original foi preservada: aplicação em `frontend/` e especificação em `docs/PRD v0.2.md`.

## Executar

Requer Node.js **24.12 ou superior** e npm. Os testes usam o suporte nativo a TypeScript do Node, sem compilação prévia. Validação nesta sprint: Node 26.13.1.

```sh
cd frontend
npm ci
npm run dev
```

Abra o endereço local informado pelo Vite. No Windows com bloqueio de `npm.ps1`, use `npm.cmd` no lugar de `npm`.

```sh
npm test          # Motor, modelos, experiência, eventos, feedback e renderização
npm run lint     # ESLint
npm run build    # TypeScript e bundle de produção
npm run preview  # Visualizar o build localmente
```

## Funcionalidades

- Sete modelos: música/eventos, design/criação, beleza/estética, alimentação, profissionais liberais, serviços técnicos e personalizado.
- Todos começam com custos zerados e margem ilustrativa de 20%, editável. Não são referências de preços de mercado. Os rascunhos são preservados separadamente ao trocar de atividade durante a página aberta. Reiniciar exige confirmação e afeta somente o modelo atual; recarregar descarta tudo.
- Inclusão, edição, renomeação e remoção de custos diretos, despesas indiretas e taxas. Indiretos incluem um critério de rateio editável; o valor da parcela é informado pelo usuário.
- Remuneração por hora, quantidade ou valor fixo. Para alimentos, o resultado é o preço do lote completo, não o preço unitário.
- Taxas fixas por trabalho e percentuais com base explícita: venda, diretos, remuneração ou subtotal. Nenhum regime tributário é escolhido automaticamente.
- Resultado atualizado durante a edição: preço, custos, remuneração, taxas, lucro, margem efetiva e memória detalhada.
- Interface em pt-BR, valores em BRL, vírgula ou ponto decimal, layout responsivo, rótulos, foco visível, navegação por teclado e erros acessíveis.

## Regras determinísticas — versão 1.0.1

O motor é uma função pura em `frontend/src/domain/pricing.ts`. Não usa rede, relógio, armazenamento ou números aleatórios. IDs aleatórios existem apenas na interface para identificar linhas editáveis.

1. Cada custo = quantidade × valor unitário. Some diretos, indiretos e remuneração para obter **B**.
2. Remuneração = horas/unidades × valor; no modo fixo, considera apenas o valor informado.
3. **A** = soma das taxas percentuais sobre bases diferentes da venda. Cada base é calculada antes de taxas e lucro: diretos, remuneração ou B. Não há incidência em cascata.
4. **C** = B + taxas fixas + A.
5. **Preço = C / (1 − margem/100 − taxas sobre venda/100)**.
6. Taxas sobre venda incidem no preço calculado; taxas fixas são por trabalho, independentemente da base selecionada.
7. **Lucro = preço − B − todas as taxas**. Margem efetiva = lucro / preço. Se preço for zero, exibimos 0%.

Exemplo: R$ 100 de materiais + 2 horas a R$ 50 + taxa fixa de R$ 10, taxa de venda de 5% e margem de 20%: preço = 210 / 0,75 = **R$ 280**; taxas = R$ 24; remuneração = R$ 100; lucro = R$ 56.

Margem sobre receita difere de markup: custo de R$ 100 com margem de 20% resulta em R$ 125, não R$ 120.

### Precisão e validação

- Operações monetárias com `BigInt` em centavos; percentuais em centésimos de ponto percentual e quantidades em milésimos.
- Arredondamento de meio centavo para cima por item e por taxa; preço arredondado para cima ao centavo. A soma exibida fecha em centavos. Arredondamentos individuais de várias taxas podem gerar pequena diferença entre margem desejada e efetiva; ambas são explicitadas.
- Valores monetários: 0 a R$ 10 milhões, até 2 casas; quantidades: 0 a 1 milhão, até 3 casas; percentuais: 0 a 100, até 2 casas. Total máximo: R$ 10 bilhões.
- Bloqueia campos vazios, negativos, não finitos, precisão excessiva, descrições ausentes e margem + taxas sobre a venda maior ou igual a 100%. Separadores de milhar não são aceitos; digite `1250,50` ou `1250.50`.
- Na homologação, a versão 1.0.1 acrescentou uma validação: se o arredondamento individual das taxas gerar lucro negativo, o resultado é bloqueado com explicação. Exemplo: custo de R$ 0,01, margem zero e duas taxas de venda de 25% produzem preço algébrico de R$ 0,02, taxas arredondadas de R$ 0,02 e prejuízo de R$ 0,01. A fórmula e o arredondamento por linha foram preservados; o motor não busca um preço alternativo nesse caso.
- Zero é válido para simular trabalhos sem determinado custo. Quantidade armazenada é ignorada no modo de remuneração fixa.
- O contrato do motor recebe um `PricingInput` tipado; não é uma API pública que valida estruturas JSON arbitrárias. Uma futura API deve validar também o formato do objeto recebido.

## Organização

```text
frontend/
  src/domain/pricing.ts      Tipos, validações e motor independente do React
  src/domain/templates.ts    Configurações e criação isolada dos sete modelos
  src/form.ts               Identificação dos campos nas mensagens de erro
  src/App.tsx                Página, rascunhos por modelo e permissão de uso
  src/components/            Campos, seções, calculadora, resultado e feedback
  src/experience.ts          Rascunhos, parsing de entrada e formatação
  src/usage.ts               Eventos opcionais somente em memória
  src/feedback.ts            Preparação de feedback e adaptadores de saída
  src/App.css                Layout e responsividade
  src/index.css              Estilos globais
  tests/pricing.test.mjs     Fórmulas, erros, extremos e modelos
  tests/homologation.test.mjs Cenários de cantor, designer e confeiteiro
  tests/form.test.mjs        Identificação contextual dos erros
  public/favicon.svg        Identidade da calculadora
```

## Privacidade e limites da sprint

Tudo é calculado no navegador. Sem envio dos campos, cookies de rastreamento, serviço externo de analytics ou persistência. Recarregar a página perde os dados. A contagem opcional de eventos é local, desativada por padrão e apagada ao revogar a permissão. O feedback voluntário prepara um e-mail para precivacontact@gmail.com, sem anexar dados da calculadora; o usuário confirma o envio no próprio aplicativo. Copiar e baixar são alternativas. Não há login, pagamentos, IA, backend ou deploy.

Os modelos adaptam categorias e modalidade inicial de remuneração; não implementam contabilidade, regras tributárias por profissão, pisos profissionais, parcelamento, descontos, juros, rendimento/perdas de receitas ou cálculo automático de rateio mensal. São premissas informadas pelo usuário, que deve conferir as regras aplicáveis à sua atividade.

O PRD permanece como referência de produto. A Sprint 02 prepara eventos locais para avaliação de uso; coleta remota e os módulos posteriores permanecem fora do escopo. Não houve alteração do PRD. A pasta foi recebida sem metadados Git; o versionamento local foi inicializado na preparação da publicação. Consulte docs/DEPLOY.md para o estado remoto.

## Homologação da Sprint 01

Consulte [o relatório de homologação](docs/HOMOLOGACAO-SPRINT-01.md) para resultados, correções e pendências. Testes de motor e validações não substituem a revisão visual e de acessibilidade em navegador, ainda pendente.


## Sprint 02 — Experiência e validação

A interface prioriza celular, reúne o formulário em três grupos com atalhos por teclado, mantém todos os campos visíveis e destaca o resultado com sua composição. Trocar de atividade preserva os rascunhos, inclusive o texto decimal ainda inválido, apenas enquanto a página estiver aberta.

O feedback é voluntário e destinado a **precivacontact@gmail.com**. O botão prepara o aplicativo de e-mail; não há envio automático nem confirmação de recebimento. Sem aplicativo configurado, use copiar ou baixar.

Consulte [SPRINT-02](docs/SPRINT-02.md) para decisões, arquivos e contrato dos eventos, e [HOMOLOGACAO-SPRINT-02](docs/HOMOLOGACAO-SPRINT-02.md) para resultados e pendências. A versão financeira continua **1.0.1**, sem alterações no motor. A conferência visual em navegador permanece pendente; testes de renderização no servidor não homologam responsividade ou interação real.


## Refinamento UX pós-Sprint 02

O início da calculadora agora orienta o preenchimento sem apresentar preço zero como resultado pronto. Zero matematicamente válido continua disponível mediante confirmação explícita. A navegação distingue etapa atual e etapas concluídas por revisão; os cartões de custos foram compactados mantendo os campos e erros visíveis. O fluxo de feedback permanece igual.

Consulte [REFINAMENTO-UX-SPRINT-02](docs/REFINAMENTO-UX-SPRINT-02.md) para critérios, testes e pendências. A conferência visual dos novos ajustes nas larguras 320, 390, 768 e 1440 px permanece pendente por indisponibilidade do navegador.

## Publicação

A configuração da Vercel fica em frontend/vercel.json. Use Root Directory frontend e saída dist após testes, lint e build. Consulte [DEPLOY](docs/DEPLOY.md) para o estado remoto; configuração local não significa deploy concluído.

