# Barbearia V2 — Agendamento.pt

Plataforma de agendamento online para barbearias. HTML + CSS + JS puro, sem dependências de build.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `landing.html` | Landing page de marketing |
| `index.html` | Página de planos e checkout Stripe |
| `cliente.html` | App de agendamento para clientes (PWA) |
| `painel.html` | Painel de administração para barbearias |
| `cartaz.html` | Gerador de cartaz com QR code |
| `config.js` | Configuração centralizada (Supabase URL/Key, APP_URL) |
| `shared.css` | CSS compartilhado entre todas as páginas |
| `shared.js` | Utilitários JS (toast, formatação, escape HTML, validação, Supabase) |
| `sw.js` | Service Worker para suporte offline (PWA) |
| `manifest.json` | Manifesto PWA |

## Melhorias aplicadas

- ✅ Configs centralizadas no `config.js`
- ✅ CSS e JS utilitários partilhados
- ✅ Proteção XSS (`esc()` em todos os dados do DB)
- ✅ Service Worker com cache offline
- ✅ Banner de offline visível
- ✅ Validação de email e telefone
- ✅ Tratamento de erros com try/catch em todas as operações
- ✅ `localStorage` seguro com fallback
- ✅ Sem código duplicado
- ✅ Sem código morto
- ✅ Sem chaves hardcoded nos HTMLs

## Uso

Abre qualquer `.html` no browser ou faz deploy no GitHub Pages.
