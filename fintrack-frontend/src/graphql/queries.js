import { gql } from "@apollo/client";


export const GET_DASHBOARD = gql`
  query GetDashboard($inicio: String, $fim: String) {
    dashboard(inicio: $inicio, fim: $fim) {
      saldoGeral

      saldoPorConta {
        conta {
          id
          nome
          tipo
        }
        receitas
        despesas
        saldo
      }

      gastosPorCategoria {
        categoria {
          id
          nome
        }
        total
        percentual
      }

      ultimasTransacoes {
        id
        descricao
        valor
        tipo
        data
        categoria {
          nome
        }
      }
    }
  }
`;


export const GET_CONTAS = gql`
  query GetContas {
    saldoPorConta {
      conta {
        id
        nome
        tipo
        saldoInicial
      }
      receitas
      despesas
      saldo
      totalTransacoes
    }
  }
`;


export const GET_CATEGORIAS = gql`
  query GetCategorias($tipo: String) {
    categorias(tipo: $tipo) {
      id
      nome
      tipo
    }
  }
`;


export const GET_CONTAS_SIMPLES = gql`
  query GetContasSimples {
    contas {
      id
      nome
      tipo
    }
  }
`;

export const GET_TRANSACOES = gql`
  query GetTransacoes(
    $inicio: String
    $fim: String
    $tipo: String
    $conta: ID
    $categoria: ID
    $limite: Int
  ) {
    transacoesComRelacoes(
      inicio: $inicio
      fim: $fim
      tipo: $tipo
      conta: $conta
      categoria: $categoria
      limite: $limite
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

export const GET_RESUMO_MENSAL = gql`
  query GetResumoMensal($mes: Int!, $ano: Int!) {
    resumoMensal(mes: $mes, ano: $ano) {
      mes
      ano
      totalReceitas
      totalDespesas
      saldo
      quantidadeTransacoes

      gastosPorCategoria {
        categoria {
          id
          nome
        }
        total
        percentual
      }
    }
  }
`;
