# FinTrack — Fase 1

### 0. IDs

| O quê | ID |
|---|---|
| Usuário (arthur@email.com) | `6a89ed3723b5a5ba90d1d94c` |
| Conta Nubank | `6a89f4f9c3203df934c9b526` |
| Categoria Alimentação (despesa) | `6a89f5b8c3203df934c9b535` |
| Categoria Salário (receita) | `6a89f5d4c3203df934c9b537` |
| Categoria Transporte (despesa) | `6a94662bef5c4e000f2ffbb1` |
| Categoria Lazer (despesa) | `6a946631ef5c4e000f2ffbb3` |

---

### 1. Abertura

Sistema de controle de gastos pessoais. O usuário cadastra suas contas e categorias e lança receitas e despesas, e o sistema mostra o saldo de cada conta e para onde o dinheiro está indo.

Nessa fase: backend completo — banco, validação, relacionamento entre entidades, JWT e as duas interfaces, REST e GraphQL.

---

### 2. Cadastro

`POST http://localhost:3000/auth/register`

```json
{
  "nome": "Teste Apresentação",
  "email": "teste@email.com",
  "senha": "123456"
}
```

- **201** com os dados e o token já na resposta
- senha gravada com hash bcrypt, nunca em texto puro
- o papel não é aceito pelo body: se fosse, qualquer um se cadastraria como admin

Mesma requisição de novo → **409** (e-mail já cadastrado)

Com `"senha": "123"` → **400** (mínimo 6 caracteres)

---

### 3. Login

`POST http://localhost:3000/auth/login`

```json
{
  "email": "arthur@email.com",
  "senha": "123456"
}
```

- token com id e papel do usuário dentro
- com senha errada → **401**, e a mensagem é a mesma de e-mail inexistente, para não revelar quais e-mails existem

`GET http://localhost:3000/auth/perfil` com Bearer Token

- a senha não vem na resposta: `select: false` no model

> A partir daqui usar o token do **arthur@email.com**, que é quem tem as contas e transações cadastradas.

---

### 4. Sem token

`GET http://localhost:3000/contas` sem Authorization → **401**

- toda rota de recurso passa pelo middleware que valida o token

---

### 5. Transação

`POST http://localhost:3000/transacoes`

```json
{
  "descricao": "Padaria",
  "valor": 18.90,
  "tipo": "despesa",
  "data": "2026-08-20",
  "conta": "6a89f4f9c3203df934c9b526",
  "categoria": "6a89f5b8c3203df934c9b535"
}
```

- liga três entidades: usuário, conta e categoria
- conta e categoria voltam com o nome preenchido → `populate` do Mongoose
- antes de salvar, o sistema confere se a conta e a categoria são do usuário logado

Mesma requisição com `"valor": 0` → **400**

- validação no schema: required, enum, min, match no e-mail

`DELETE http://localhost:3000/contas/6a89f4f9c3203df934c9b526` → **409**

- não deixa excluir conta com transação vinculada, senão ficariam transações órfãs

---

### 6. Listagem

```
GET http://localhost:3000/transacoes
GET http://localhost:3000/transacoes?tipo=despesa
GET http://localhost:3000/transacoes?inicio=2026-08-01&fim=2026-08-31
GET http://localhost:3000/transacoes?limite=2
```

- paginação e filtro por tipo, categoria, conta e período
- no filtro de agosto a transação de julho fica de fora
- resposta traz total, pagina, totalPaginas

---

### 7. Admin

`GET http://localhost:3000/usuarios` com token de usuário comum → **403**

- rota restrita ao papel admin, validada por um segundo middleware

Com o token do admin → **200** com a lista

- nenhuma senha aparece na listagem

---

### 8. GraphQL

Abrir `http://localhost:3000/graphql`

Header: `Authorization` = `Bearer SEU_TOKEN`

```graphql
query {
  saldoPorConta {
    conta { nome tipo }
    receitas
    despesas
    saldo
  }
}
```

- agregação no MongoDB: saldo inicial + receitas − despesas

```graphql
query {
  gastosPorCategoria(inicio: "2026-08-01", fim: "2026-08-31") {
    categoria { nome }
    total
    percentual
  }
}
```

- agrupa despesas por categoria no período e calcula o percentual
- é o que vai alimentar o gráfico do dashboard na Fase 2

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

**Ponto principal:** para montar essa tela com REST seriam três requisições — contas, transações e categorias — e o frontend ainda teria que somar tudo na mão. Aqui é uma requisição só e o cliente pede exatamente os campos que quer.

Daí a divisão do escopo: REST para CRUD e autenticação, GraphQL para consultas compostas e relatórios.

Sem o header Authorization → `UNAUTHENTICATED`. Mesmo controle de acesso do REST.

---

### 9. Fechamento

Tudo no GitHub com README explicando modelagem, rotas e como rodar. Fase 2 entra o frontend em React consumindo essa API.

---
---

## Perguntas prováveis

**Por que GraphQL aqui e não em tudo?**
Para CRUD simples o REST resolve e é mais direto. GraphQL compensa quando a tela precisa de dados de várias entidades ao mesmo tempo, que é o caso do dashboard.

**Como garantem que um usuário não vê dados de outro?**
Todas as consultas filtram por `usuario: req.usuario.id`, e esse id vem do token, nunca do body. Mesmo sabendo o id de um recurso alheio, a resposta é 404.

**Por que PUT e não PATCH?**
PUT com atualização parcial por conveniência do frontend, que nem sempre envia todos os campos. Pelo padrão o PUT substitui o recurso inteiro e o PATCH atualiza em partes.

**Como alguém vira admin?**
O cadastro sempre cria com papel `usuario`. O papel nunca é aceito pelo body. A promoção é feita direto no banco.

**Onde está a validação?**
No schema do Mongoose: required, enum, min, match para o e-mail, e índices compostos que impedem nomes duplicados por usuário.

**Quantas entidades e como se relacionam?**
Quatro: Usuario, Conta, Categoria e Transacao. Cinco relacionamentos, todos muitos-para-um. A Transacao é a que liga tudo — guarda referência para usuário, conta e categoria.

**O que falta?**
O frontend em React: telas de login, dashboard com gráfico, lançamento e listagem de transações.

---

## Se travar

| Problema | Solução |
|---|---|
| ERR_CONNECTION_REFUSED | servidor caiu, `npm run dev` de novo |
| Token inválido ou expirado | token cortado no copiar, usar o botão Copy |
| Sandbox não abre | rede bloqueando o CDN, mandar a query pelo Postman em `POST http://localhost:3000/graphql` |
| Erro de conexão com o Mongo | conferir Network Access no Atlas ou usar roteador do celular |
