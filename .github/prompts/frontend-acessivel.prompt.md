---
description: Revisa ou implementa componentes do frontend seguindo boas práticas de acessibilidade (WCAG).
name: frontend-acessivel
argument-hint: caminho do componente (ex. frontend/src/components/UploadComponent.jsx)
agent: agent
---

# Design de frontend acessível

Analise e, quando necessário, ajuste o componente `${input:componente:caminho do componente}` para seguir boas práticas de acessibilidade, mantendo as convenções do projeto (componentes funcionais com React Hooks).

Requisitos de acessibilidade a verificar/aplicar:

- Use elementos HTML semânticos antes de recorrer a `div`/`span` com ARIA.
- Garanta que todo elemento interativo (botões, links, inputs) seja acessível via teclado, com estado de foco visível.
- Associe `label` a cada campo de formulário (via `htmlFor`/`id` ou `aria-label`).
- Forneça texto alternativo (`alt`) descritivo para imagens e ícones informativos; use `alt=""` ou `aria-hidden` para elementos puramente decorativos.
- Comunique estados dinâmicos (carregamento, erro, sucesso) via `aria-live` ou `role="status"`/`role="alert"`, já que mensagens ao usuário são em português.
- Verifique contraste de cor adequado (mínimo 4.5:1 para texto normal) e não use cor como único indicador de informação.
- Garanta que a ordem de tabulação (tab order) siga a ordem visual/lógica do conteúdo.
- Para listas e tabelas de documentos, use marcação semântica (`ul`/`li`, `table`/`th`) em vez de divs estilizadas.

Ao final, resuma em português as mudanças aplicadas e quaisquer riscos de acessibilidade que ainda precisem de atenção manual (ex.: revisão de contraste com ferramenta visual).
