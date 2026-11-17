# Refinamento do design system do Preciva

## Auditoria anterior à implementação

Inspeção do código React e do CSS da interface existente em 17/11/2026.

| Área | Problema observado | Direção de correção |
| --- | --- | --- |
| Tema | O controle fechado tem ícone e contorno próprios, mas a lista aberta é desenhada pelo navegador. | Criar um único seletor com opções, indicação de seleção, foco e fechamento previsíveis. |
| Etapas | Os três links parecem cartões independentes. O ativo depende de uma borda duplicada e o texto de estado tem apenas 10 px. | Agrupar as etapas, reforçar a indicação atual e usar símbolo e texto para a conclusão. |
| Formulários | Rótulos, descrições e erros são montados separadamente na calculadora e no feedback. As setas dos selects seguem o estilo da plataforma. | Compartilhar campos e sua apresentação, mantendo semântica e teclado nativos nos controles de dados. |
| Ações | O botão de adicionar tem praticamente o mesmo fundo e contorno no repouso e no hover. O cursor de espera genérico também aparece em botões indisponíveis por validação. | Distinguir ação principal, secundária e destrutiva. Padronizar hover, pressão, foco e indisponibilidade. |
| Cartões e texto | As seções de formulário, feedback e resultado repetem bordas e paddings, com raios diferentes de 13, 14 e 15 px. Há tamanhos tipográficos e pesos declarados por seção. | Usar escalas comuns com adaptações para a densidade de cada área. |
| Marca e estados | A base Graphite Mono oferece superfícies neutras, mas seleção, foco e conclusão não usam o verde do Preciva. Setas e marcas de ação misturam glifos de texto e ícones Lucide. | Preservar o grafite e usar verde para ação e seleção, com texto e ícones como pistas adicionais. |
| Movimento | O CTA tem transição própria de 300 ms. Os demais controles não compartilham duração nem tratamento de movimento reduzido. | Centralizar duração e redução de movimento. |
