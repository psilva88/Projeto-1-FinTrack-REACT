---

# 6. GraphQL

Endpoint: `http://localhost:3000/graphql`
Header: `Authorization: Bearer {token}`

## 6.1 Saldo consolidado por conta

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

## 6.2 Gastos agrupados por categoria

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

## 6.3 Dashboard

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

## 6.4 Controle de acesso

A mesma query sem o header Authorization retorna erro `UNAUTHENTICATED`.

---

# Decisões técnicas

**Divisão REST / GraphQL**
REST para CRUD e autenticação. GraphQL para consultas compostas e relatórios. Definida no documento de escopo do projeto.

**Isolamento de dados**
Todas as consultas filtram por `usuario: req.usuario.id`, obtido do token e nunca do corpo da requisição. Um recurso de outro usuário retorna 404.

**Atribuição de perfil**
O cadastro sempre cria com papel `usuario`. A promoção a administrador é feita diretamente no banco.

**PUT com atualização parcial**
As rotas de atualização usam PUT aceitando campos parciais, por conveniência do consumo pelo frontend. Pelo padrão HTTP, PUT substitui o recurso inteiro e PATCH atualiza em partes.

**Modelagem**
Quatro entidades — Usuario, Conta, Categoria e Transacao — com cinco relacionamentos muitos-para-um. A Transacao referencia usuário, conta e categoria.

---

# Problemas comuns

| Sintoma | Causa e correção |
|---|---|
| `ERR_CONNECTION_REFUSED` | Servidor parado. Executar `npm run dev` |
| `Token inválido ou expirado` | Token truncado na cópia. Usar o botão Copy da resposta |
| Apollo Sandbox não carrega | Rede bloqueando o CDN. Enviar a query via `POST http://localhost:3000/graphql` |
| `querySrv ECONNREFUSED` | DNS bloqueando a resolução SRV. Trocar o DNS para 8.8.8.8 ou usar outra rede |
