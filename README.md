<p align="center">
  <img src="COLE_AQUI_O_LINK_DA_LOGO" alt="FinTrack Logo" width="400"/>
</p>
<p align="center">
  Seu controle de gastos pessoais. Registre receitas e despesas, organize por conta e categoria e saiba para onde vai o seu dinheiro.
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/GraphQL-Apollo_Server-E10098?style=flat-square&logo=graphql" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens" />
</p>

## 👥 Integrantes do Grupo

- Arthur Pereira Silva
- Bernardo Ramos dos Santos
- Rodrigo Lira Rodrigues
- Luiz Gustavo Barbosa Machado

**Professora:** Sheila Maria Mendes Paiva

**Competência:** Integrar Interfaces e Serviços WEB - CESED/UNIFACISA - 2026-03

---

## 💡 Descrição da Aplicação

O **FinTrack** resolve a dificuldade que as pessoas têm de acompanhar para onde vai o dinheiro ao longo do mês. O sistema evita que o usuário dependa de anotações soltas, planilhas manuais ou da própria memória, centralizando todas as receitas e despesas em um único lugar, organizadas por conta e por categoria.

Esta é a **Fase 1** do projeto, na qual foi desenvolvido o **backend completo** da aplicação: banco de dados, validação de dados, relacionamento entre entidades, segurança com JWT e as duas interfaces de serviços WEB exigidas — **RESTful** e **GraphQL**.

Cada usuário cadastra suas próprias contas (carteira, banco, cartão) e categorias (alimentação, transporte, lazer), e a partir delas lança suas transações. Cada pessoa enxerga apenas os próprios dados, enquanto o administrador tem acesso à gestão de usuários.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| **Node.js + Express** | Servidor e API REST |
| **MongoDB Atlas + Mongoose** | Banco de dados NoSQL e modelagem (ODM) |
| **Apollo Server** | Servidor GraphQL para as consultas compostas |
| **GraphQL** | Linguagem de consulta dos relatórios |
| **JWT (jsonwebtoken)** | Autenticação e autorização por token |
| **bcryptjs** | Criptografia das senhas |
| **dotenv** | Variáveis de ambiente |
| **nodemon** | Reinício automático em desenvolvimento |

---

## 🗄️ Modelagem do Banco de Dados

O sistema possui **quatro entidades relacionadas**: `Usuário`, `Conta`, `Categoria` e `Transação`.

### Entidade: Usuário
| Campo | Tipo | Detalhe |
|---|---|---|
| nome | String | Obrigatório |
| email | String | Obrigatório, único, com validação de formato |
| senha | String | Obrigatória, mínimo 6 caracteres (hash bcrypt, nunca retornada nas consultas) |
| papel | String | `usuario` ou `admin` (padrão: usuario) |

### Entidade: Conta
| Campo | Tipo | Detalhe |
|---|---|---|
| nome | String | Obrigatório |
| tipo | String | `carteira`, `banco` ou `cartao` |
| saldoInicial | Number | Padrão: 0 |
| **usuario** | ObjectId | **Referência ao Usuário dono** |

### Entidade: Categoria
| Campo | Tipo | Detalhe |
|---|---|---|
| nome | String | Obrigatório |
| tipo | String | `receita` ou `despesa` |
| **usuario** | ObjectId | **Referência ao Usuário dono** |

### Entidade: Transação
| Campo | Tipo | Detalhe |
|---|---|---|
| descricao | String | Obrigatória |
| valor | Number | Obrigatório, maior que zero |
| tipo | String | `receita` ou `despesa` |
| data | Date | Obrigatória (padrão: data atual) |
| **conta** | ObjectId | **Referência à Conta** |
| **categoria** | ObjectId | **Referência à Categoria** |
| **usuario** | ObjectId | **Referência ao Usuário dono** |

### Relacionamentos

Todos os relacionamentos do sistema são do tipo **muitos para um**:

| Relacionamento | Descrição |
|---|---|
| Usuário 1:N Conta | Um usuário possui várias contas |
| Usuário 1:N Categoria | Um usuário possui várias categorias |
| Usuário 1:N Transação | Um usuário possui várias transações |
| Conta 1:N Transação | Uma conta recebe várias transações |
| Categoria 1:N Transação | Uma categoria classifica várias transações |

Cada documento guarda o `ObjectId` do usuário dono, garantindo que cada pessoa acesse apenas os próprios dados. Contas e categorias com transações vinculadas **não podem ser excluídas**, preservando a integridade dos relacionamentos.

---

## 🔌 Endpoints da API REST

### 🔑 Autenticação — `/auth`
| Método | Rota | Descrição | Protegida |
|---|---|---|---|
| POST | `/auth/register` | Cria um usuário e retorna o token | ❌ |
| POST | `/auth/login` | Faz login e retorna o token | ❌ |
| GET | `/auth/perfil` | Retorna os dados do usuário logado | ✅ |

### 👤 Usuários — `/usuarios`
| Método | Rota | Descrição | Protegida |
|---|---|---|---|
| GET | `/usuarios` | Lista todos os usuários | ✅ (apenas admin) |
| GET | `/usuarios/:id` | Busca um usuário por ID | ✅ (o próprio ou admin) |
| PUT | `/usuarios/:id` | Atualiza um usuário | ✅ (o próprio ou admin) |
| DELETE | `/usuarios/:id` | Remove um usuário | ✅ (apenas admin) |

### 🏦 Contas — `/contas`
| Método | Rota | Descrição | Protegida |
|---|---|---|---|
| POST | `/contas` | Cria uma conta | ✅ |
| GET | `/contas` | Lista as contas do usuário logado | ✅ |
| GET | `/contas/:id` | Busca uma conta por ID | ✅ |
| PUT | `/contas/:id` | Atualiza uma conta | ✅ |
| DELETE | `/contas/:id` | Remove uma conta (bloqueia se houver transações) | ✅ |

### 🏷️ Categorias — `/categorias`
| Método | Rota | Descrição | Protegida |
|---|---|---|---|
| POST | `/categorias` | Cria uma categoria | ✅ |
| GET | `/categorias` | Lista as categorias (filtro opcional `?tipo=`) | ✅ |
| GET | `/categorias/:id` | Busca uma categoria por ID | ✅ |
| PUT | `/categorias/:id` | Atualiza uma categoria | ✅ |
| DELETE | `/categorias/:id` | Remove uma categoria (bloqueia se houver transações) | ✅ |

### 💸 Transações — `/transacoes`
| Método | Rota | Descrição | Protegida |
|---|---|---|---|
| POST | `/transacoes` | Cria uma transação | ✅ |
| GET | `/transacoes` | Lista com paginação e filtros | ✅ |
| GET | `/transacoes/:id` | Busca uma transação por ID | ✅ |
| PUT | `/transacoes/:id` | Atualiza uma transação | ✅ |
| DELETE | `/transacoes/:id` | Remove uma transação | ✅ |

> As rotas protegidas exigem o header: `Authorization: Bearer {token}`

### Filtros da listagem de transações

```
GET /transacoes?pagina=1&limite=10&tipo=despesa&categoria={id}&conta={id}&inicio=2026-08-01&fim=2026-08-31
```

| Parâmetro | Descrição |
|---|---|
| `pagina` | Página desejada (padrão: 1) |
| `limite` | Itens por página (padrão: 10, máximo: 100) |
| `tipo` | `receita` ou `despesa` |
| `categoria` | ID da categoria |
| `conta` | ID da conta |
| `inicio` / `fim` | Período no formato `AAAA-MM-DD` |

---

## 🔮 API GraphQL

Disponível em `http://localhost:3000/graphql` com a interface do **Apollo Sandbox**.

Enquanto o REST cuida do CRUD e da autenticação, o **GraphQL é responsável pelas consultas compostas e pelos relatórios**, evitando várias requisições para montar uma única tela.

| Query | Descrição |
|---|---|
| `eu` | Dados do usuário autenticado |
| `saldoPorConta` | Saldo consolidado de cada conta (saldo inicial + receitas − despesas) |
| `gastosPorCategoria(inicio, fim)` | Total gasto agrupado por categoria, com percentual |
| `resumoMensal(mes, ano)` | Resumo fechado de um mês específico |
| `transacoesComRelacoes(...)` | Transações com conta e categoria já carregadas |
| `dashboard(inicio, fim)` | Tudo que a tela inicial precisa em uma única requisição |

### Exemplo — Dashboard

```graphql
query {
  dashboard {
    saldoGeral
    saldoPorConta { conta { nome } saldo }
    gastosPorCategoria { categoria { nome } total percentual }
    ultimasTransacoes { descricao valor data categoria { nome } }
  }
}
```

### Exemplo — Resumo mensal

```graphql
query {
  resumoMensal(mes: 8, ano: 2026) {
    totalReceitas
    totalDespesas
    saldo
    quantidadeTransacoes
    gastosPorCategoria { categoria { nome } total percentual }
  }
}
```

> No Apollo Sandbox, o token vai na aba **Headers**: chave `Authorization`, valor `Bearer {token}`.

---

## 📁 Estrutura do Projeto

```
Projeto-1-FinTrack-REACT/
│
└── fintrack-backend/                  ← API (Node.js + Express + MongoDB)
    ├── src/
    │   ├── server.js                  ← Ponto de entrada (rotas + middlewares)
    │   ├── database.js                ← Conexão com o MongoDB Atlas
    │   │
    │   ├── models/
    │   │   ├── Usuario.js             ← Entidade Usuário (papel + senha hash)
    │   │   ├── Conta.js               ← Entidade Conta
    │   │   ├── Categoria.js           ← Entidade Categoria
    │   │   └── Transacao.js           ← Entidade Transação (3 relacionamentos)
    │   │
    │   ├── controllers/
    │   │   ├── authController.js      ← Register + Login (JWT)
    │   │   ├── usuarioController.js   ← CRUD de usuários
    │   │   ├── contaController.js     ← CRUD de contas
    │   │   ├── categoriaController.js ← CRUD de categorias
    │   │   └── transacaoController.js ← CRUD + paginação e filtros
    │   │
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── usuarioRoutes.js
    │   │   ├── contaRoutes.js
    │   │   ├── categoriaRoutes.js
    │   │   └── transacaoRoutes.js
    │   │
    │   ├── middlewares/
    │   │   ├── auth.js                ← Valida o token JWT
    │   │   └── admin.js               ← Autorização por perfil
    │   │
    │   └── graphql/
    │       ├── typeDefs.js            ← Schema (tipos e queries)
    │       ├── resolvers.js           ← Agregações e relatórios
    │       └── index.js               ← Configuração do Apollo Server
    │
    ├── .env                           ← Variáveis (não versionado)
    ├── .env.example                   ← Modelo do .env
    ├── .gitignore
    └── package.json
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado
- [VS Code](https://code.visualstudio.com/) instalado
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Postman](https://www.postman.com/downloads/) ou Thunder Client (para testar as rotas REST)

### 📥 Passo 1 — Baixar o código pelo GitHub
- Acesse o repositório no GitHub
- Clique no botão verde **`<> Code`**
- Clique em **Download ZIP**
- Extraia o arquivo ZIP baixado

> Ou, se preferir usar o **Git** pelo terminal:
> ```bash
> git clone https://github.com/psilva88/Projeto-1-FinTrack-REACT.git
> ```

### 💻 Passo 2 — Abrir no VS Code
- Abra o VS Code
- Vá em **File → Open Folder**
- Selecione a pasta `fintrack-backend`

### 🗄️ Passo 3 — Configurar o Banco (MongoDB Atlas)
1. Crie uma conta no MongoDB Atlas e um cluster gratuito (M0)
2. Em **Database Access**, crie um usuário do banco e guarde a senha
3. Em **Network Access**, libere o acesso de rede (`0.0.0.0/0`)
4. Em **Connect → Drivers → Node.js**, copie a connection string

### ⚙️ Passo 4 — Criar o arquivo .env
Copie o arquivo `.env.example` para `.env` e preencha:

```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/fintrack?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=coloque_um_segredo_aqui
JWT_EXPIRES=7d
```

> ⚠️ Troque `<password>` pela senha real e acrescente `/fintrack` antes do `?` para nomear o banco.
> O `.env` **não** vai para o GitHub — ele contém a senha do banco.

### 🖥️ Passo 5 — Instalar e rodar
No VS Code, abra o terminal (`Ctrl + '`) e digite:

```bash
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

### 🧪 Passo 6 — Testar
1. **Cadastre um usuário** — `POST http://localhost:3000/auth/register`
   ```json
   {
     "nome": "Arthur",
     "email": "arthur@email.com",
     "senha": "123456"
   }
   ```
2. **Copie o token** retornado na resposta
3. **Use o token** nas demais rotas: aba `Authorization` → tipo `Bearer Token`
4. **Crie uma conta e uma categoria**, copie os IDs e lance uma transação
5. **Acesse o GraphQL** em `http://localhost:3000/graphql` e rode as queries de relatório

> Para encerrar o servidor, pressione `Ctrl + C` no terminal.

### 🔐 Criando um administrador
O cadastro sempre cria usuários com papel `usuario` — por segurança, o papel nunca é aceito pelo corpo da requisição. Para tornar alguém administrador, edite o campo `papel` para `admin` diretamente no MongoDB Atlas (**Browse Collections → usuarios**) e faça login novamente para gerar um token atualizado.

---

<p align="center">© 2026 FinTrack</p>
