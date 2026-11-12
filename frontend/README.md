# Helpdesk — Frontend

Frontend em React + Vite + Tailwind CSS para o protótipo do sistema de Helpdesk, integrado à API REST do backend.

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ (recomendado Node 20+)
- Backend em execução na porta `3000`

### Instalação
```bash
cd frontend
npm install
```

### Modo de Desenvolvimento
```bash
npm run dev
```
A aplicação iniciará em `http://localhost:5173`. As chamadas à `/api` são automaticamente encaminhadas via proxy para `http://localhost:3000`.

### Verificação de Linting
```bash
npm run lint
```

### Build de Produção
```bash
npm run build
npm run preview
```

---

## 👥 Contas de Teste (Base Seed)

| Perfil | E-mail | Senha |
|---|---|---|
| **Solicitante** | `ana.souza@helpdesk.com` | `123456` |
| **Solicitante** | `bruno.lima@helpdesk.com` | `123456` |
| **Técnico** | `diego.ramos@helpdesk.com` | `123456` |
| **Técnico** | `elisa.prado@helpdesk.com` | `123456` |

---

## 📁 Estrutura de Diretórios

```
frontend/
├── src/
│   ├── assets/             # Imagens e ícones estáticos
│   ├── components/         # Componentes compartilhados (Navbar, FormLogin, StatusBadge, ProtectedRoute)
│   ├── contexts/           # Contextos React (AuthContext, ToastContext)
│   ├── hooks/              # Custom hooks (useAuth, useToast)
│   ├── pages/              # Páginas (LoginPage, DashboardPage, TicketsPage, SupportPage)
│   ├── services/           # Cliente de API centralizado (fetch com tratamento de token e erros)
│   ├── utils/              # Funções utilitárias (sorting com Merge Sort, formatação/validação de datas)
│   ├── App.jsx             # Definição das rotas e layouts
│   ├── index.css           # Estilos globais e Tailwind v4
│   └── main.jsx            # Ponto de entrada React
├── vite.config.js          # Configuração do Vite com proxy para /api
├── eslint.config.js        # Configuração ESLint
└── package.json
```
