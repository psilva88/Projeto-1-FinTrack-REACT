const typeDefs = `#graphql
  # ---------- Tipos das entidades ----------

  type Usuario {
    id: ID!
    nome: String!
    email: String!
    papel: String!
  }

  type Conta {
    id: ID!
    nome: String!
    tipo: String!
    saldoInicial: Float!
  }

  type Categoria {
    id: ID!
    nome: String!
    tipo: String!
  }

  type Transacao {
    id: ID!
    descricao: String!
    valor: Float!
    tipo: String!
    data: String!
    conta: Conta
    categoria: Categoria
  }

  # ---------- Tipos dos relatórios ----------

  type SaldoConta {
    conta: Conta!
    receitas: Float!
    despesas: Float!
    saldo: Float!
    totalTransacoes: Int!
  }

  type GastoCategoria {
    categoria: Categoria!
    total: Float!
    quantidade: Int!
    percentual: Float!
  }

  type ResumoMensal {
    mes: Int!
    ano: Int!
    totalReceitas: Float!
    totalDespesas: Float!
    saldo: Float!
    quantidadeTransacoes: Int!
    gastosPorCategoria: [GastoCategoria!]!
  }

  type Dashboard {
    saldoGeral: Float!
    saldoPorConta: [SaldoConta!]!
    gastosPorCategoria: [GastoCategoria!]!
    ultimasTransacoes: [Transacao!]!
  }

  # ---------- Consultas ----------

  type Query {
    "Dados do usuário autenticado"
    eu: Usuario!

    "Saldo consolidado de cada conta (saldo inicial + receitas - despesas)"
    saldoPorConta: [SaldoConta!]!

    "Total gasto agrupado por categoria em um período (datas no formato AAAA-MM-DD)"
    gastosPorCategoria(inicio: String, fim: String): [GastoCategoria!]!

    "Resumo fechado de um mês específico"
    resumoMensal(mes: Int!, ano: Int!): ResumoMensal!

    "Transações com seus relacionamentos já carregados"
    transacoesComRelacoes(
      inicio: String
      fim: String
      tipo: String
      conta: ID
      categoria: ID
      limite: Int
    ): [Transacao!]!

    "Tudo que a tela inicial precisa, em uma única requisição"
    dashboard(inicio: String, fim: String): Dashboard!
  }
`;

module.exports = typeDefs;
