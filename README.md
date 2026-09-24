<p align="center">
  <img src="https://github.com/user-attachments/assets/d0d0ebcf-1522-453f-a14c-3007b56995cf" alt="FinTrack Logo" width="600"/>
</p>

<p align="center">
  Seu controle de gastos pessoais. Registre receitas e despesas, organize por conta e categoria e saiba para onde vai o seu dinheiro.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Apollo-Client-311C87?style=flat-square&logo=apollographql" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/GraphQL-Apollo_Server-E10098?style=flat-square&logo=graphql" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/PWA-Offline-5A0FC8?style=flat-square&logo=pwa" />
</p>

## 👥 Integrantes do Grupo

- Arthur Pereira Silva
- Bernardo Ramos dos Santos
- Rodrigo Lira Rodrigues
- Luiz Gustavo Barbosa Machado

**Professora:** Sheila Maria Mendes Paiva

**Competência:** Integrar Interfaces e Serviços WEB - CESED/UNIFACISA - 2026-03

---

## 💡 Sobre o Projeto

O **FinTrack** resolve a dificuldade que as pessoas têm de acompanhar para onde vai o dinheiro ao longo do mês. O controle costuma ser feito de forma manual, em anotações soltas ou planilhas, e o usuário só percebe que gastou mais do que podia quando o mês já acabou — sem saber identificar qual categoria foi a responsável.

No FinTrack o usuário cadastra suas contas (carteira, banco, cartão) e suas categorias (alimentação, transporte, lazer), e a partir delas lança receitas e despesas. O sistema calcula o saldo de cada conta, mostra a divisão dos gastos por categoria e fecha o resultado de cada mês.

Cada pessoa enxerga apenas os próprios dados. A aplicação é instalável como um app (PWA) e continua abrindo mesmo sem conexão.

### As duas fases

| Fase | Entrega |
|---|---|
| **Fase 1** | Banco de dados e backend — validação, relacionamento entre entidades, segurança com JWT e as interfaces RESTful e GraphQL |
| **Fase 2** | Aplicação completa — frontend em React consumindo a API GraphQL, com autenticação, CRUD completo, relatórios, interface responsiva e PWA |

---

## 🏗️ Arquitetura

```
                    REACT + VITE
                      FRONTEND
                          │
                    Apollo Client
                          │
                    HTTP / GraphQL
                          │
                  NODE.JS + EXPRESS
                       BACKEND
                    │           │
              REST / API     GraphQL
                    │           │
                     MONGOOSE
                          │
                   MONGODB ATLAS

                         JWT
              Autenticação e autorização
```

O frontend em React consome a **API GraphQL** do backend, que concentra as consultas compostas, os relatórios e o CRUD de contas, categorias e transações. A **API RESTful** permanece disponível no backend, cobrindo o mesmo CRUD mais a autenticação, e é por ela que o login é feito. O acesso ao MongoDB é feito com Mongoose e o controle de acesso com JWT.

---

## 🛠️ Tecnologias Utilizadas

### Backend

| Tecnologia | Uso |
|---|---|
| **Node.js + Express** | Servidor e API REST |
| **MongoDB Atlas + Mongoose** | Banco de dados NoSQL e modelagem (ODM) |
| **Apollo Server** | Servidor GraphQL |
| **JWT (jsonwebtoken)** | Autenticação e autorização por token |
| **bcryptjs** | Criptografia das senhas |
| **cors** | Libera o consumo da API pelo frontend |
| **dotenv** | Variáveis de ambiente |

### Frontend

| Tecnologia | Uso |
|---|---|
| **React + Vite** | Interface e ambiente de desenvolvimento |
| **Apollo Client** | Consumo da API GraphQL e cache |
| **React Router DOM** | Navegação SPA com rotas privadas |
| **Context API** | Estado global de autenticação e avisos |
| **Bootstrap 5** | Layout responsivo e componentes |
| **Recharts** | Gráfico de gastos por categoria |
| **Service Worker + Manifest** | PWA instalável com funcionamento offline |

---

## 🗄️ Modelagem do Banco de Dados

Quatro entidades relacionadas: `Usuário`, `Conta`, `Categoria` e `Transação`.

| Entidade | Descrição |
|---|---|
| **Usuário** | Dados de acesso e o papel (usuario ou admin) |
| **Conta** | Onde o dinheiro está: carteira, conta bancária ou cartão |
| **Categoria** | Classificação do lançamento como receita ou despesa |
| **Transação** | O lançamento em si, ligando usuário, conta e categoria |

Todos os relacionamentos são do tipo **muitos para um**:

| Relacionamento | Descrição |
|---|---|
| Usuário 1:N Conta | Um usuário possui várias contas |
| Usuário 1:N Categoria | Um usuário possui várias categorias |
| Usuário 1:N Transação | Um usuário possui várias transações |
| Conta 1:N Transação | Uma conta recebe várias transações |
| Categoria 1:N Transação | Uma categoria classifica várias transações |

Cada documento guarda o `ObjectId` do usuário dono, garantindo o isolamento dos dados. Contas e categorias com transações vinculadas não podem ser excluídas, preservando a integridade dos relacionamentos.

> A modelagem completa, com todos os campos e validações, está no [README do backend](./fintrack-backend/README.md).

---

## 🖥️ Telas da Aplicação

### 🔐 Login e Cadastro
Entrada do sistema. O cadastro cria o usuário com a senha criptografada; o login devolve o token JWT, que fica salvo no navegador e é enviado em todas as requisições seguintes. A sessão é recuperada ao recarregar a página.

### 📊 Resumo (`/dashboard`)
Tela inicial. Reúne, em uma única requisição GraphQL:
- **Saldo disponível** somando todas as contas
- **Saldo por conta**, com saldo inicial mais receitas menos despesas
- **Gráfico de gastos por categoria**, em rosca, com valores e percentuais
- **Fechamento do mês**, com receitas, despesas, resultado e quantidade de lançamentos
- **Últimas transações** registradas

Um filtro de período no topo recalcula a divisão dos gastos.

### 💸 Transações (`/transacoes`)
Núcleo do sistema. Permite criar, editar e excluir lançamentos, com filtros por período, tipo, conta e categoria. O formulário só oferece categorias compatíveis com o tipo escolhido, e três indicadores mostram o total que entrou, o que saiu e o resultado do que está sendo exibido.

### 🏦 Contas (`/contas`)
CRUD das contas, mostrando saldo inicial, saldo atual e quantidade de transações de cada uma.

### 🏷️ Categorias (`/categorias`)
CRUD das categorias, com filtro por receita ou despesa.

---

## 📁 Estrutura do Repositório

```
Projeto-1-FinTrack-REACT/
│
├── README.md                          ← Este arquivo
│
├── fintrack-backend/                  ← API (Node.js + Express + MongoDB)
│   ├── README.md                      ← Documentação detalhada da API
│   ├── FinTrack.postman_collection.json
│   ├── src/
│   │   ├── server.js                  ← Ponto de entrada
│   │   ├── database.js                ← Conexão com o MongoDB Atlas
│   │   ├── models/                    ← Schemas do Mongoose
│   │   ├── controllers/               ← Regras das rotas REST
│   │   ├── routes/                    ← Endpoints REST
│   │   ├── middlewares/               ← Autenticação e autorização
│   │   └── graphql/                   ← Schema, resolvers e Apollo Server
│   ├── .env                           ← Variáveis (não versionado)
│   ├── .env.example
│   └── package.json
│
└── fintrack-frontend/                 ← Interface (React + Vite)
    ├── public/
    │   ├── manifest.json              ← Configuração do PWA
    │   ├── sw.js                      ← Service Worker (cache e offline)
    │   └── offline.html               ← Página exibida sem conexão
    ├── src/
    │   ├── main.jsx                   ← Providers e registro do PWA
    │   ├── App.jsx                    ← Rotas
    │   ├── contexts/
    │   │   ├── AuthContext.jsx        ← Sessão, login e logout
    │   │   └── ToastContext.jsx       ← Avisos da interface
    │   ├── services/
    │   │   ├── apollo.js              ← Cliente GraphQL com o token
    │   │   ├── authService.js         ← Chamadas de autenticação
    │   │   └── pwa.js                 ← Registro do Service Worker
    │   ├── graphql/
    │   │   ├── queries.js             ← Consultas
    │   │   └── mutations.js           ← Operações de escrita
    │   ├── components/                ← Navbar, gráfico, modal, avisos
    │   ├── pages/                     ← Login, Cadastro, Dashboard, CRUDs
    │   └── utils/                     ← Formatação e tratamento de erros
    ├── .env                           ← Endereço da API (não versionado)
    └── package.json
```

---

## 🚀 Como Rodar o Projeto

O projeto tem duas partes que rodam ao mesmo tempo. Você vai precisar de **dois terminais abertos**.

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado
- [VS Code](https://code.visualstudio.com/) instalado
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas)

### 📥 Passo 1 — Baixar o código
- Acesse o repositório no GitHub
- Clique no botão verde **`<> Code`** e em **Download ZIP**
- Extraia o arquivo

> Ou, pelo terminal:
> ```bash
> git clone https://github.com/psilva88/Projeto-1-FinTrack-REACT.git
> ```

### 🗄️ Passo 2 — Configurar o banco (MongoDB Atlas)
1. Crie uma conta no MongoDB Atlas e um cluster gratuito (M0)
2. Em **Database Access**, crie um usuário do banco e guarde a senha
3. Em **Network Access**, libere o acesso de rede (`0.0.0.0/0`)
4. Em **Connect → Drivers → Node.js**, copie a connection string

### 🖥️ Passo 3 — Rodar o backend (Terminal 1)

Dentro da pasta `fintrack-backend`, copie o `.env.example` para `.env` e preencha:

```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/fintrack?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=coloque_um_segredo_aqui
JWT_EXPIRES=7d
```

> Troque a senha pela real e mantenha o `/fintrack` antes do `?` para nomear o banco.
> O `.env` **não** vai para o GitHub — ele contém a senha do banco.

```bash
cd fintrack-backend
npm install          # apenas na primeira vez
npm run dev
```

Deve aparecer:

```
MongoDB conectado com sucesso!
Servidor rodando na porta 3000
REST:    http://localhost:3000
GraphQL: http://localhost:3000/graphql
```

### 💻 Passo 4 — Rodar o frontend (Terminal 2)

Abra um **segundo terminal**, deixando o backend rodando. A pasta já vem com o arquivo `.env` apontando para a API local:

```
VITE_API_URL=http://localhost:3000
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

```bash
cd fintrack-frontend
npm install          # apenas na primeira vez
npm run dev
```

A aplicação abre em [http://localhost:5173](http://localhost:5173).

### 🧪 Passo 5 — Usar o sistema
1. Clique em **Cadastre-se** e crie uma conta
2. Cadastre uma **conta** (carteira, banco ou cartão) e ao menos uma **categoria**
3. Lance uma **transação** e acompanhe o saldo e os gráficos no Resumo

> Para encerrar qualquer um dos servidores, pressione `Ctrl + C` no terminal.

---

## 📱 PWA — Instalação e modo offline

O FinTrack é um **Progressive Web App**: pode ser instalado como aplicativo e continua abrindo sem internet.

O Service Worker é registrado apenas na versão de produção, para não atrapalhar a atualização automática durante o desenvolvimento. Para testar:

```bash
cd fintrack-frontend
npm run build
npm run preview
```

Abra [http://localhost:4173](http://localhost:4173) em uma janela normal do navegador (o modo anônimo não registra Service Workers).

- **Instalar:** o navegador oferece a instalação na barra de endereço. O app abre em janela própria, sem barra de navegação.
- **Verificar:** `F12` → aba **Application** → **Service Workers** e **Manifest**.
- **Testar offline:** `F12` → aba **Network** → selecione **Offline** e recarregue. A interface continua carregando e um aviso informa que os dados podem estar desatualizados.

### Estratégias de cache

| Conteúdo | Estratégia | Motivo |
|---|---|---|
| Arquivos da aplicação | **Cache First** | Abrem instantaneamente e funcionam offline |
| Chamadas da API | **Network First** | Saldo e transações precisam vir atualizados |
| Página não disponível | **Fallback** | Exibe a tela de "sem conexão" |

---

## 🔌 APIs

A documentação completa — todos os endpoints REST, o schema GraphQL, os filtros e os exemplos — está no **[README do backend](./fintrack-backend/README.md)**.

Resumo:

| Interface | Responsabilidade |
|---|---|
| **RESTful** (Express) | Autenticação e CRUD completo das quatro entidades — 20 rotas |
| **GraphQL** (Apollo Server) | Consultas compostas, relatórios e CRUD de contas, categorias e transações |

O frontend consome o GraphQL em todas as telas internas e usa o REST apenas no login e no cadastro.

### 📮 Coleção do Postman

O arquivo `fintrack-backend/FinTrack.postman_collection.json` traz todas as rotas REST e as operações GraphQL prontas para uso.

No Postman: **Import** → selecione o arquivo. Ao executar **1. Auth → Login**, o token é salvo automaticamente e reutilizado nas demais requisições.

---

## ✅ Requisitos da Competência

| Requisito | Onde está |
|---|---|
| Validação de dados | Schemas do Mongoose: `required`, `enum`, `min`, `match` e índices compostos |
| Relacionamento entre entidades | Cinco relacionamentos muitos-para-um, com `populate` e bloqueio de exclusão |
| Segurança com JWT | Login, middleware de autenticação e autorização por papel |
| Interface RESTful | 20 rotas cobrindo autenticação e CRUD |
| Interface GraphQL | Consultas, relatórios e mutations no endpoint `/graphql` |
| Manipulação de formulários | Cadastro, login e formulários de conta, categoria e transação |
| Controle de sessão | Context API com token persistido e logout |
| Consumo de APIs | Apollo Client no frontend, com tratamento de erros |
| Interface responsiva | Bootstrap com layout mobile-first |
| PWA | Manifest, Service Worker e funcionamento offline |

---

<p align="center">© 2026 FinTrack</p>
