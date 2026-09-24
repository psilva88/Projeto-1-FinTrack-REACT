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

    "Lista as contas do usuário autenticado"
    contas: [Conta!]!

    "Lista as categorias do usuário, com filtro opcional por tipo"
    categorias(tipo: String): [Categoria!]!

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

  # ---------- Operações de escrita ----------

  type Mutation {
    "Cria uma conta para o usuário autenticado"
    criarConta(
      nome: String!
      tipo: String!
      saldoInicial: Float
    ): Conta!

    "Atualiza os campos informados de uma conta"
    atualizarConta(
      id: ID!
      nome: String
      tipo: String
      saldoInicial: Float
    ): Conta!

    "Remove uma conta que não tenha transações vinculadas"
    excluirConta(id: ID!): String!

    "Cria uma categoria para o usuário autenticado"
    criarCategoria(
      nome: String!
      tipo: String!
    ): Categoria!

    "Atualiza os campos informados de uma categoria"
    atualizarCategoria(
      id: ID!
      nome: String
      tipo: String
    ): Categoria!

    "Remove uma categoria que não tenha transações vinculadas"
    excluirCategoria(id: ID!): String!

    "Cria uma transação para o usuário autenticado"
    criarTransacao(
      descricao: String!
      valor: Float!
      tipo: String!
      data: String
      conta: ID!
      categoria: ID!
    ): Transacao!

    "Atualiza os campos informados de uma transação"
    atualizarTransacao(
      id: ID!
      descricao: String
      valor: Float
      tipo: String
      data: String
      conta: ID
      categoria: ID
    ): Transacao!

    "Remove uma transação do usuário autenticado"
    excluirTransacao(id: ID!): String!
  }
`;

module.exports = typeDefs;
