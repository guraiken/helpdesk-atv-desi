# Helpdesk — Sistema de Chamados

Atividade Prática — Turma **DESI 2025/1 N1**  
Data de Entrega / Avaliação: 10/11/2026  

Sistema web completo de Helpdesk para centralização do registro, acompanhamento e atendimento de chamados técnicos de suporte em TI, desenvolvido em conformidade com as especificações da atividade prática do SENAI.

---

## 📑 Documentação Completa do Projeto

A documentação analítica e formal completa do projeto está disponível em:
👉 [**docs/DOCUMENTACAO_HELPDESK.md**](docs/DOCUMENTACAO_HELPDESK.md)

Nela estão detalhados:
1. Contextualização e Visão Geral
2. Arquitetura da Aplicação e Tecnologias (Node.js, Express, React, Vite, MySQL, Tailwind)
3. Lista Completa de Requisitos Funcionais (RF) e Não Funcionais (RNF)
4. Regras de Negócio e Permissões (Solicitante vs. Técnico)
5. Modelagem de Dados, Dicionário de Atributos e Diagrama Entidade-Relacionamento (DER em Mermaid)
6. Detalhamento e Fluxos das Telas (Login, Dashboard, Chamados, Atendimento)
7. Especificação de Rotas e Endpoints da API REST
8. Guia de Instalação, Configuração e Credenciais de Teste
9. **Casos de Teste de Software [Espaço Reservado para Imagem / Evidências]**

---

## 🚀 Como Executar o Projeto

### 1. Banco de Dados
Importe o script SQL no seu servidor MySQL/MariaDB:
```bash
mysql -u root -p < backend/database/helpdesk_db.sql
```

### 2. Backend (API REST)
```bash
cd backend
npm install
# Crie o arquivo .env baseado no .env.example
npm run dev
```
Servidor padrão: `http://localhost:3000`

### 3. Frontend (Interface Web)
```bash
cd frontend
npm install
npm run dev
```
Interface web acessível no navegador em: `http://localhost:5173`

---

## 👥 Credenciais Pré-configuradas (Senha padrão: `123456`)

- **Solicitantes:**
  - `ana.souza@helpdesk.com`
  - `bruno.lima@helpdesk.com`
  - `carla.mendes@helpdesk.com`
- **Técnicos:**
  - `diego.ramos@helpdesk.com`
  - `elisa.prado@helpdesk.com`
  - `fabio.costa@helpdesk.com`
