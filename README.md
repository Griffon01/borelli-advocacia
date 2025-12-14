# Borelli Advocacia

Sistema de Gestão Jurídica para escritórios de advocacia.

## Funcionalidades

- 📅 Agenda com visualização semanal
- 👥 Gestão de equipe com níveis de acesso
- 📋 Controle de diligências
- 💬 Sistema de comentários
- 🔄 Sincronização com Google Calendar
- 📊 Dashboard com métricas

## Tecnologias

- React 18
- Vite
- Lucide React (ícones)
- n8n (backend/webhooks)
- Supabase (banco de dados)

## Instalação Local

```bash
npm install
npm run dev
```

## Deploy

Este projeto está configurado para deploy na Vercel.

## Configuração

A URL da API está configurada em `src/App.jsx`:

```javascript
const API_BASE_URL = 'https://matheuscarneiro12.app.n8n.cloud/webhook';
```

---

Desenvolvido para Borelli & Cruz Advocacia
