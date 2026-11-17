# Frontend Preciva

Aplicação React + TypeScript + Vite da Sprint 01. Consulte o [README principal](../README.md) para regras financeiras, estrutura, validações e limitações.

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
```

Requer Node.js 24.12 ou superior. No PowerShell com execução de scripts bloqueada, use `npm.cmd`.

## Componentes de interface

Os componentes da aplicação ficam em `src/components`. Os componentes reutilizáveis compatíveis com shadcn/ui ficam em `src/components/ui`. O arquivo `components.json` aponta o CLI para essa pasta, e o alias `@/` aponta para `src/` no Vite e no TypeScript. Essa estrutura permite compartilhar os componentes sem misturá-los com a lógica da calculadora.

Os estilos globais e os tokens de Tailwind ficam em `src/index.css`. Os estilos da tela ficam em `src/App.css`. O Tailwind é compilado pelo plugin do Vite. A aplicação usa seus próprios estilos base e carrega apenas o tema e as classes utilitárias do Tailwind.

O botão `InteractiveHoverButton` recebe `text`, `className`, `ref` e as propriedades nativas do botão. Não usa estado, provider nem imagens. O ícone vem de `lucide-react`. Na calculadora ele ocupa a largura disponível e usa `type="submit"`. Fora de um formulário, o tipo padrão é `button`. O arquivo `src/components/ui/interactive-hover-button.demo.tsx` mostra o uso básico.

### Instalação e CLI

Neste repositório, execute `npm ci` em `frontend/`. O TypeScript já faz parte das dependências e o shadcn já tem seu arquivo de configuração. Para adicionar um componente do catálogo, use `npx shadcn@latest add` seguido do nome.

Em outro projeto React/Vite sem essa estrutura, instale as dependências abaixo, configure `@/*` nos arquivos do TypeScript e `@` no Vite, registre o plugin `@tailwindcss/vite` e importe o Tailwind no CSS global.

```bash
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/vite
npm install lucide-react clsx tailwind-merge
npx shadcn@latest init
```

Para começar um projeto novo, use `npx shadcn@latest init -t vite`. Se copiar o botão manualmente, coloque-o sob `src/components/ui` e mantenha `aliases.ui` apontando para essa pasta. O exemplo pressupõe o alias `@/` e os tokens `background`, `foreground`, `border`, `primary` e `primary-foreground`.

[Configuração shadcn para Vite](https://ui.shadcn.com/docs/installation/vite) · [Aliases em components.json](https://ui.shadcn.com/docs/components-json) · [Tailwind com Vite](https://tailwindcss.com/docs/installation/using-vite)
