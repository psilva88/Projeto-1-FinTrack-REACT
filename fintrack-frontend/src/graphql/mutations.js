import { gql } from "@apollo/client";


// ---------- Contas ----------

export const CRIAR_CONTA = gql`
  mutation CriarConta(
    $nome: String!
    $tipo: String!
    $saldoInicial: Float
  ) {
    criarConta(nome: $nome, tipo: $tipo, saldoInicial: $saldoInicial) {
      id
      nome
      tipo
      saldoInicial
    }
  }
`;


export const ATUALIZAR_CONTA = gql`
  mutation AtualizarConta(
    $id: ID!
    $nome: String
    $tipo: String
    $saldoInicial: Float
  ) {
    atualizarConta(
      id: $id
      nome: $nome
      tipo: $tipo
      saldoInicial: $saldoInicial
    ) {
      id
      nome
      tipo
      saldoInicial
    }
  }
`;


export const EXCLUIR_CONTA = gql`
  mutation ExcluirConta($id: ID!) {
    excluirConta(id: $id)
  }
`;


// ---------- Categorias ----------

export const CRIAR_CATEGORIA = gql`
  mutation CriarCategoria($nome: String!, $tipo: String!) {
    criarCategoria(nome: $nome, tipo: $tipo) {
      id
      nome
      tipo
    }
  }
`;


export const ATUALIZAR_CATEGORIA = gql`
  mutation AtualizarCategoria($id: ID!, $nome: String, $tipo: String) {
    atualizarCategoria(id: $id, nome: $nome, tipo: $tipo) {
      id
      nome
      tipo
    }
  }
`;


export const EXCLUIR_CATEGORIA = gql`
  mutation ExcluirCategoria($id: ID!) {
    excluirCategoria(id: $id)
  }
`;


// ---------- Transações ----------

export const CRIAR_TRANSACAO = gql`
  mutation CriarTransacao(
    $descricao: String!
    $valor: Float!
    $tipo: String!
    $data: String
    $conta: ID!
    $categoria: ID!
  ) {
    criarTransacao(
      descricao: $descricao
      valor: $valor
      tipo: $tipo
      data: $data
      conta: $conta
      categoria: $categoria
    ) {
      id
      descricao
      valor
      tipo
      data
      conta {
        id
        nome
      }
      categoria {
        id
        nome
      }
    }
  }
`;


export const ATUALIZAR_TRANSACAO = gql`
  mutation AtualizarTransacao(
    $id: ID!
    $descricao: String
    $valor: Float
    $tipo: String
    $data: String
    $conta: ID
    $categoria: ID
  ) {
    atualizarTransacao(
      id: $id
      descricao: $descricao
      valor: $valor
      tipo: $tipo
      data: $data
      conta: $conta
      categoria: $categoria
    ) {
      id
      descricao
      valor
      tipo
      data
      conta {
        id
        nome
      }
      categoria {
        id
        nome
      }
    }
  }
`;


export const EXCLUIR_TRANSACAO = gql`
  mutation ExcluirTransacao($id: ID!) {
    excluirTransacao(id: $id)
  }
`;
