# FinTrack — Fase 1

Roteiro de testes da API. Servidor em `http://localhost:3000`.

Todas as rotas estão disponíveis na coleção do Postman (`FinTrack.postman_collection.json`),
incluindo as que não aparecem neste roteiro. Ao importar e executar o Login, o token é salvo
automaticamente e reutilizado nas demais requisições.

## Identificadores

| Registro | ID |
|---|---|
| Usuário arthur@email.com | `6a89ed3723b5a5ba90d1d94c` |
| Conta Nubank | `6a89f4f9c3203df934c9b526` |
| Categoria Alimentação (despesa) | `6a89f5b8c3203df934c9b535` |
| Categoria Salário (receita) | `6a89f5d4c3203df934c9b537` |
| Categoria Transporte (despesa) | `6a94662bef5c4e000f2ffbb1` |
| Categoria Lazer (despesa) | `6a946631ef5c4e000f2ffbb3` |

---

# 1. Autenticação

## *1.1 Cadastro de usuário

`POST http://localhost:3000/auth/register`

```json
{
  "nome": "Teste5 Apresentação",
  "email": "teste5@email.com",
  "senha": "123456"
}
```

**201 Created** — retorna a mensagem de confirmação e os dados do usuário.
O token **não** é gerado nesta rota: o cadastro apenas cria o usuário, e a autenticação acontece no login.
A senha é gravada com hash bcrypt. O campo `papel` não é lido do corpo da requisição.

**Variações:**

| Requisição | Resposta |
|---|---|
| E-mail já cadastrado | 409 — "Este e-mail já está cadastrado" |
| `"senha": "123"` | 400 — mínimo de 6 caracteres |

## *1.2 Login

`POST http://localhost:3000/auth/login`

```json
{
  "email": "arthur@email.com",
  "senha": "123456"
}
```

**200 OK** — retorna o token, que carrega o id e o papel do usuário.

Com senha incorreta: **401** — mensagem idêntica à de e-mail inexistente.

## 1.3 Perfil do usuário autenticado

`GET http://localhost:3000/auth/perfil`
Header: `Authorization: Bearer {token}`

**200 OK** — o campo `senha` não é retornado (`select: false` no model).

---

# 2. Controle de acesso

`GET http://localhost:3000/contas` sem o header Authorization

**401 Unauthorized** — todas as rotas de recurso passam pelo middleware de autenticação.

---

# *3. Cadastro de recursos

## *3.1 Criar conta

`POST http://localhost:3000/contas`

```json
{
  "nome": "Carteira",
  "tipo": "carteira",
  "saldoInicial": 150
}
```

**201 Created** — retorna a conta com o `_id` gerado.

| Requisição | Resposta |
|---|---|
| `"tipo": "poupanca"` | 400 — valor fora do enum (carteira, banco, cartao) |
| Nome repetido para o mesmo usuário | 409 — índice composto bloqueia |

## *3.2 Criar categoria

`POST http://localhost:3000/categorias`

```json
{
  "nome": "Contas Fixas",
  "tipo": "despesa"
}
```

**201 Created** — retorna a categoria com o `_id` gerado.

Filtro na listagem: `GET http://localhost:3000/categorias?tipo=receita`

## *3.3 Criar transação

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

**201 Created** — os campos `conta` e `categoria` retornam com os dados completos via `populate`.
Antes de gravar, o sistema verifica se a conta e a categoria pertencem ao usuário autenticado.

## 3.4 Validação

`POST http://localhost:3000/transacoes` com `"valor": 0`

**400 Bad Request** — regras definidas no schema do Mongoose: `required`, `enum`, `min` e `match`.

## *3.5 Integridade dos relacionamentos

`DELETE http://localhost:3000/contas/6a89f4f9c3203df934c9b526`

**409 Conflict** — a exclusão é bloqueada enquanto houver transações vinculadas à conta.

---

# *4. Listagem e filtros

```
GET http://localhost:3000/transacoes
GET http://localhost:3000/transacoes?tipo=despesa
GET http://localhost:3000/transacoes?inicio=2026-08-01&fim=2026-08-31
GET http://localhost:3000/transacoes?limite=2
```

A resposta contém `total`, `pagina`, `limite`, `totalPaginas` e o array `transacoes`.

| Parâmetro | Função |
|---|---|
| `pagina` / `limite` | Paginação |
| `tipo` | receita ou despesa |
| `conta` / `categoria` | Filtro por ID |
| `inicio` / `fim` | Período (AAAA-MM-DD) |

---

# *5. Autorização por perfil

`GET http://localhost:3000/usuarios`

| Token | Resposta |
|---|---|
| Usuário comum | 403 — rota restrita a administradores |
| Administrador | 200 — lista de usuários, sem o campo senha |

---

# *6. GraphQL

Endpoint: `http://localhost:3000/graphql`
Header: `Authorization: Bearer {token}`

## *6.1 Saldo consolidado por conta

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

Calculado por agregação no MongoDB: saldo inicial + receitas − despesas.

## *6.2 Gastos agrupados por categoria

```graphql
query {
  gastosPorCategoria(inicio: "2026-08-01", fim: "2026-08-31") {
    categoria { nome }
    total
    percentual
  }
}
```

Agrupa as despesas do período por categoria e calcula o percentual de cada uma.

## *6.3 Dashboard

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

Retorna em uma única requisição os dados que, via REST, exigiriam três chamadas separadas (contas, transações e categorias) com o processamento feito no cliente.

## *6.4 Mutations

As operações de escrita seguem as mesmas regras das rotas REST: exigem token e validam se a conta e a categoria pertencem ao usuário autenticado.

**Criar transação**

```graphql
mutation {
  criarTransacao(
    descricao: "Lançamento via GraphQL"
    valor: 42.50
    tipo: "despesa"
    data: "2026-08-25"
    conta: "6a89f4f9c3203df934c9b526"
    categoria: "6a89f5b8c3203df934c9b535"
  ) {
    id
    descricao
    valor
    conta { nome }
    categoria { nome }
  }
}
```

Retorna a transação criada, já com conta e categoria populadas.

**Atualizar transação**

```graphql
mutation {
  atualizarTransacao(
    id: "COLE_O_ID_DA_TRANSACAO"
    descricao: "Descrição atualizada"
    valor: 55.00
  ) {
    id
    descricao
    valor
  }
}
```

Aplica apenas os campos informados na mutation.

**Excluir transação**

```graphql
mutation {
  excluirTransacao(id: "COLE_O_ID_DA_TRANSACAO")
}
```

Retorna a mensagem de confirmação. Uma transação de outro usuário resulta em `NOT_FOUND`.

## *6.5 Controle de acesso

Qualquer query ou mutation sem o header Authorization retorna erro `UNAUTHENTICATED`.

---

# Decisões técnicas

**Divisão REST / GraphQL**
REST para CRUD e autenticação. GraphQL para consultas compostas, relatórios e as mutations de transação. Uma transação criada por qualquer uma das duas interfaces é gravada na mesma coleção e aparece nas consultas da outra.

**Isolamento de dados**
Todas as consultas filtram por `usuario: req.usuario.id`, obtido do token e nunca do corpo da requisição. Um recurso de outro usuário retorna 404.

**Cadastro sem token**
A rota de cadastro apenas cria o usuário. O token é emitido exclusivamente no login, mantendo separadas as responsabilidades de registro e autenticação.

**Atribuição de perfil**
O cadastro sempre cria com papel `usuario`. A promoção a administrador é feita diretamente no banco.

**PUT com atualização parcial**
As rotas de atualização usam PUT aceitando campos parciais, por conveniência do consumo pelo frontend. Pelo padrão HTTP, PUT substitui o recurso inteiro e PATCH atualiza em partes.

**Modelagem**
Quatro entidades — Usuario, Conta, Categoria e Transacao — com cinco relacionamentos muitos-para-um. A Transacao referencia usuário, conta e categoria.

---

# Ajustes realizados após a apresentação

| Ajuste | O que mudou |
|---|---|
| Token no cadastro | `POST /auth/register` deixou de retornar o token. A emissão passou a ocorrer apenas no login. |
| Mutations no GraphQL | Adicionadas `criarTransacao`, `atualizarTransacao` e `excluirTransacao`, com o mesmo controle de acesso das queries. |
| Coleção de endpoints | Criado o arquivo `FinTrack.postman_collection.json` com as 20 rotas REST e as operações GraphQL, com token e IDs salvos automaticamente em variáveis. |
| Versionamento | Adicionado o `.gitignore` para excluir `node_modules` e `.env` do repositório. |

---

# Problemas comuns

| Sintoma | Causa e correção |
|---|---|
| `ERR_CONNECTION_REFUSED` | Servidor parado. Executar `npm run dev` |
| `Token inválido ou expirado` | Token truncado na cópia. Usar o botão Copy da resposta |
| Apollo Sandbox não carrega | Rede bloqueando o CDN. Enviar a query via `POST http://localhost:3000/graphql` |
| `querySrv ECONNREFUSED` | DNS bloqueando a resolução SRV. Trocar o DNS para 8.8.8.8 ou usar outra rede |
