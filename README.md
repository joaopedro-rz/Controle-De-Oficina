# Projeto de Extensão ELLP — Controle de Voluntários

## 📌 Objetivo
O sistema tem como finalidade **gerenciar voluntários do projeto ELLP**, permitindo:
- Cadastro e controle de voluntários (entrada, saída, dados pessoais);
- Registro de participação em oficinas;
- Geração de termos de voluntariado em PDF;
- Relatórios simples de voluntários ativos e por oficina.

O acesso ao sistema será restrito a um **usuário administrador (super user)**, responsável por gerir todas as informações.

---

## ✅ Requisitos Funcionais
| ID  | Requisito | Critério de Aceitação | Prioridade |
|-----|-----------|------------------------|-------------|
| F1  | Autenticação do administrador | Login com e-mail e senha, retorno de JWT | Alta |
| F2  | CRUD de voluntários | Criar, listar, editar, marcar saída | Alta |
| F3  | CRUD de oficinas | Criar e listar oficinas ativas | Alta |
| F4  | Registro de participações | Histórico por voluntário | Alta |
| F5  | Geração de termo em PDF | Botão “Gerar termo” retorna PDF baixável | Alta |
| F6  | Busca, filtros e export CSV | Pesquisa por nome, oficina, status | Média |
| F7  | Relatórios simples | Nº de voluntários ativos / por oficina | Média |

---

## ⚙️ Arquitetura em Alto Nível
- **Front-end**: React + TypeScript (SPA)  
- **Back-end**: Node.js + TypeScript (NestJS/Express)  
- **Banco de dados**: PostgreSQL  
- **Armazenamento**: S3 ou pasta local (em dev) para termos/documentos  
- **Serviços auxiliares**: SendGrid/Nodemailer (e-mails)  
- **CI/CD**: GitHub Actions + deploy em Vercel (front) e Render/Heroku (back)

### Diagrama Simplificado
[Browser] <---> [Frontend React + TS] <--REST--> [API Node.js + TS]
|--> PostgreSQL
|--> Storage (S3/local)
|--> Email Provider

---

---

## 🧪 Estratégia de Testes Automatizados
- **Back-end**
  - Unit tests com **Jest** (services e controllers)
  - Integration tests com **Supertest** (endpoints + DB de teste)
- **Front-end**
  - Unit e component tests com **Jest + React Testing Library**
  - Integration tests com **Mock Service Worker (msw)**
- **E2E (opcional)**
  - Fluxos principais com **Cypress** (login, cadastro de voluntário, geração de termo)

Todos os testes serão executados em **CI com GitHub Actions**, garantindo cobertura mínima (70–80%).

---

## 🔧 Configuração do Ambiente
### Requisitos
- Node.js 20+
- PostgreSQL (local ou via Docker)
- npm ou yarn

### Scripts (monorepo com `api` e `web`)
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/ellp-controle-voluntarios.git
cd ellp-controle-voluntarios

# Instalar dependências (raiz, backend e frontend)
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar containers (DB, etc.)
docker-compose up -d

# Rodar API em dev
cd api
npm run dev

# Rodar Frontend em dev
cd ../web
npm run dev

# Rodar testes
npm test
