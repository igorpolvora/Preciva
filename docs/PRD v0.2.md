# PRD v0.2 — Plataforma Multissetorial de Precificação e Gestão

**Data:** 16/11/2026  
**Status:** Especificação inicial para validação  
**Nome comercial:** A definir  
**Categoria:** SaaS B2B/B2C profissional  
**Modelo:** Freemium, com futura assinatura premium

---

## 1. Visão e problema

Profissionais autônomos frequentemente precisam definir preços sem conhecer plenamente seus custos, o valor do próprio trabalho, as despesas indiretas e a margem financeira obtida.

Além da precificação, alguns enfrentam dificuldades para registrar serviços, organizar clientes, acompanhar recebimentos e descobrir quais trabalhos são financeiramente vantajosos.

Nossa plataforma pretende centralizar essas atividades com uma experiência simples, acessível pelo celular e adaptável a diferentes profissões.

**Proposta de valor:** calcular melhor, cobrar com mais clareza e compreender o resultado de cada trabalho.

## 2. Público-alvo

O produto será horizontal, com configurações especializadas inicialmente para:

1. **Artistas e eventos:** cantores, músicos, fotógrafos e produtores.
2. **Serviços criativos:** designers, ilustradores, editores e freelancers.
3. **Beleza e estética:** maquiadores, cabeleireiros e manicures.
4. **Alimentação:** confeiteiros, cozinheiros e produtores sob encomenda.
5. **Profissionais liberais:** consultores e outros profissionais autônomos, observadas regras específicas de cada atividade.
6. **Serviços técnicos:** eletricistas, técnicos de manutenção e instaladores.
7. **Outros:** usuários que desejam criar modelos personalizados.

Essas categorias são hipóteses iniciais de segmentação. A prioridade comercial poderá mudar conforme os dados reais de utilização.

## 3. Objetivos do MVP

- Permitir cálculos de preço transparentes e matematicamente corretos.
- Adaptar nomes e categorias de custos conforme a atividade.
- Permitir a criação de categorias personalizadas.
- Funcionar inicialmente sem obrigar o visitante a se cadastrar.
- Oferecer memória de cálculo compreensível.
- Ser utilizável em dispositivos móveis.
- Medir utilização e identificar necessidades recorrentes.
- Criar uma base técnica para os futuros módulos de gestão.

## 4. Requisitos funcionais — MVP público

**RF-001 — Seleção de segmento:** o visitante poderá selecionar sua atividade profissional ou o modo personalizado.

**RF-002 — Modelo de custos:** o sistema apresentará categorias adequadas ao segmento, permitindo adicionar, editar e remover custos.

**RF-003 — Materiais e insumos:** o visitante poderá informar custos de materiais, ingredientes, equipamentos consumíveis e outros recursos.

**RF-004 — Trabalho:** o sistema permitirá calcular remuneração por hora, por quantidade ou por valor fixo.

**RF-005 — Despesas indiretas:** o visitante poderá incluir valores atribuídos à prestação do serviço, com explicação de como foram calculados.

**RF-006 — Taxas e tributos:** o visitante poderá incluir taxas percentuais sobre a venda e valores fixos adicionais. O sistema não presumirá automaticamente o regime tributário do usuário.

**RF-007 — Margem desejada:** o sistema permitirá informar uma margem de lucro desejada sobre a receita, distinguindo-a de markup.

**RF-008 — Resultado:** o sistema exibirá preço calculado, custos, remuneração do trabalho, taxas estimadas e lucro projetado, conforme as premissas preenchidas.

**RF-009 — Transparência:** o visitante poderá visualizar a memória detalhada do cálculo e as premissas utilizadas.

**RF-010 — Validação:** o sistema bloqueará entradas inválidas, resultados indefinidos e condições matematicamente impossíveis.

**RF-011 — Uso gratuito:** a calculadora inicial funcionará sem cadastro e sem exigência de pagamento.

**RF-012 — Responsividade:** todos os fluxos essenciais deverão funcionar em celular e computador.

**RF-013 — Personalização:** o usuário poderá renomear categorias e incluir itens não previstos no modelo padrão.

## 5. Funcionalidades posteriores ao MVP

- Cadastro e autenticação.
- Salvamento e edição de cálculos.
- Cadastro de clientes e serviços.
- Organização de trabalhos e eventos.
- Geração de propostas profissionais.
- Acompanhamento de cobranças e pagamentos.
- Registro de despesas efetivamente realizadas.
- Comparação de custos planejados e reais.
- Relatórios de lucratividade.
- Gestão de assinaturas.
- Recursos de IA para assistência, interpretação e recomendações verificáveis.

Essas funcionalidades serão priorizadas conforme evidências de uso e disposição para pagar.

## 6. Regras de precificação

O motor de cálculo deverá distinguir:

- **Custos diretos:** materiais, insumos, deslocamento e outras despesas diretamente relacionadas ao trabalho.
- **Remuneração do profissional:** valor atribuído ao próprio trabalho.
- **Custos indiretos atribuídos:** parcela de despesas fixas ou administrativas distribuída segundo critério informado.
- **Taxas e tributos:** valores fixos ou percentuais, conforme incidência.
- **Lucro:** resultado excedente aos custos e à remuneração já considerados.

Para o modelo simplificado com custos fixos por trabalho já somados em C, margem desejada m e taxas proporcionais t, ambos sobre o preço de venda:

**Preço = C / (1 − m − t)**

Condição: m + t deve ser menor que 1.

O motor também deverá suportar cenários em que custos adicionais não tenham a mesma base de incidência. Não será permitido apresentar um resultado como universalmente correto sem explicitar as hipóteses.

## 7. Experiência do usuário

Jornada principal:

1. Acessar a calculadora.
2. Selecionar a profissão ou o modo personalizado.
3. Escolher um modelo de cálculo.
4. Preencher custos e parâmetros.
5. Visualizar o preço e sua composição.
6. Ajustar os parâmetros para comparar cenários.
7. Consultar a memória do cálculo.
8. Opcionalmente demonstrar interesse em recursos de salvamento e gestão.

A interface deverá usar português brasileiro, linguagem simples, exemplos úteis e explicações contextuais dos termos financeiros.

## 8. Requisitos não funcionais

**RNF-001 — Segurança:** validação de entradas, dependências atualizadas e ausência de exposição de segredos no navegador.

**RNF-002 — Privacidade:** coleta mínima de dados, informações claras sobre cookies e tratamento de dados pessoais conforme aplicável.

**RNF-003 — Desempenho:** cálculo responsivo, sem dependência de requisições externas para operações aritméticas simples.

**RNF-004 — Acessibilidade:** navegação por teclado, rótulos claros, contraste adequado, mensagens compreensíveis e atenção às WCAG.

**RNF-005 — Manutenibilidade:** separação entre apresentação, modelos por profissão e motor matemático.

**RNF-006 — Testabilidade:** testes automatizados para fórmulas, entradas inválidas e cenários extremos.

**RNF-007 — Rastreabilidade:** identificação da versão das regras utilizadas para calcular cada resultado que venha a ser salvo.

**RNF-008 — Escalabilidade:** arquitetura preparada para contas e dados isolados por cliente, quando funcionalidades autenticadas forem introduzidas.

## 9. Arquitetura preliminar

- React e TypeScript para a aplicação web.
- Biblioteca de validação de dados e cálculos com funções puras.
- Configurações por segmento independentes dos componentes visuais.
- Python e FastAPI para futuras APIs de autenticação e gestão.
- PostgreSQL para persistência de usuários, cálculos e operações financeiras.
- Integração com provedor de pagamentos após validação da oferta premium.

A primeira versão pública da calculadora poderá funcionar predominantemente no navegador, reduzindo a necessidade de infraestrutura de back-end.

## 10. Estratégia orgânica

Criar páginas especializadas que apresentem ferramentas reais para diferentes atividades, evitando conteúdo duplicado.

Canais iniciais:

- Busca orgânica no Google.
- Conteúdo educativo sobre formação de preços.
- Vídeos demonstrativos curtos.
- Compartilhamento voluntário da ferramenta.
- Indicações de usuários satisfeitos.

Acompanharemos acessos, utilização da ferramenta, conclusão dos cálculos, retorno dos usuários e interesse em recursos pagos.

## 11. Monetização

**Gratuito:** cálculo, personalização básica e memória de cálculo.

**Premium (hipótese de R$ 29/mês):** salvamento, histórico, clientes, propostas e funcionalidades de gestão selecionadas.

Não cobraremos pela simples visualização dos resultados na versão gratuita.

Preço, limites e funcionalidades premium dependerão de validação comercial e cálculo de custos.

## 12. Fora do escopo inicial

- Contabilidade completa.
- Emissão de notas fiscais.
- Declaração ou recolhimento de tributos.
- Integração bancária.
- Processamento automático de contratos jurídicos.
- Gestão integral de escritório de advocacia.
- CRM complexo.
- Integração WhatsApp.
- Aplicativos nativos Android e iOS.
- Recomendações de preços com IA sem fundamentos auditáveis.

## 13. Critérios de aceitação do primeiro lançamento

O MVP será considerado tecnicamente pronto quando:

- Os modelos iniciais executarem cálculos corretos.
- Os usuários puderem criar categorias personalizadas.
- Os resultados exibirem a composição financeira de maneira clara.
- Os cenários inválidos forem tratados corretamente.
- O fluxo principal funcionar em telas móveis.
- Testes automatizados cobrirem o motor de precificação.
- A página pública incluir orientações de privacidade e limitações do cálculo.
- Eventos básicos de utilização puderem ser medidos sem coleta excessiva de dados.

A prontidão comercial exigirá validação separada de utilidade, interesse e disposição para pagar.

## 14. Riscos principais

- Abrangência excessiva do produto.
- Regras financeiras incorretas para determinados segmentos.
- Baixa conversão de usuários gratuitos em assinantes.
- Dificuldade de obter tráfego orgânico.
- Pouca frequência de utilização.
- Concorrência com planilhas e ferramentas gratuitas.
- Complexidade de módulos específicos por profissão.

## 15. Indicadores de sucesso

- Visitantes qualificados.
- Percentual que inicia um cálculo.
- Percentual que conclui um cálculo.
- Utilização por segmento profissional.
- Feedback sobre clareza e utilidade.
- Retorno dos usuários.
- Interesse em salvamento e acompanhamento.
- Conversões reais para funcionalidades pagas, quando disponíveis.

**Princípio de desenvolvimento:** construir uma única plataforma flexível, validando seu valor em vários segmentos sem multiplicar prematuramente a complexidade técnica.