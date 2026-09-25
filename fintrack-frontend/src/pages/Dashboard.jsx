import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";

import { GET_DASHBOARD } from "../graphql/queries";
import { formatarMoeda, formatarData } from "../utils/formatar";
import { mensagemDeErro } from "../utils/erros";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import GraficoCategorias from "../components/GraficoCategorias";
import ResumoMensal from "../components/ResumoMensal";


function Dashboard() {
  const [periodo, setPeriodo] = useState({ inicio: "", fim: "" });


  // Uma única requisição traz saldo, gastos por categoria e últimas transações
  const { loading, error, data } = useQuery(GET_DASHBOARD, {
    variables: {
      inicio: periodo.inicio || null,
      fim: periodo.fim || null,
    },
    fetchPolicy: "network-only",
  });


  function atualizarPeriodo(campo, valor) {
    setPeriodo({ ...periodo, [campo]: valor });
  }


  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container py-4">
        <ErrorMessage message={mensagemDeErro(error)} />
      </div>
    );
  }


  const dashboard = data.dashboard;

  const semDados =
    dashboard.saldoPorConta.length === 0 &&
    dashboard.ultimasTransacoes.length === 0;


  return (
    <div className="container py-4">


      <h1 className="h3 mb-4">Dashboard</h1>


      {semDados && (
        <div className="vazio mb-4">

          <h2 className="mb-2">Comece pelo começo</h2>

          <p>
            Cadastre uma conta e uma categoria. A partir daí você lança as
            receitas e despesas e acompanha o saldo por aqui.
          </p>

          <Link to="/contas" className="btn btn-primary">
            Cadastrar conta
          </Link>

        </div>
      )}


      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <div className="row g-3 align-items-end">

            <div className="col-6 col-md-3">
              <label className="form-label small" htmlFor="dash-inicio">
                De
              </label>

              <input
                id="dash-inicio"
                type="date"
                className="form-control"
                value={periodo.inicio}
                onChange={(event) =>
                  atualizarPeriodo("inicio", event.target.value)
                }
              />
            </div>


            <div className="col-6 col-md-3">
              <label className="form-label small" htmlFor="dash-fim">
                Até
              </label>

              <input
                id="dash-fim"
                type="date"
                className="form-control"
                value={periodo.fim}
                onChange={(event) =>
                  atualizarPeriodo("fim", event.target.value)
                }
              />
            </div>


            <div className="col-12 col-md-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setPeriodo({ inicio: "", fim: "" })}
              >
                Limpar período
              </button>
            </div>

          </div>

          <p className="form-text mb-0 mt-2">
            O período filtra a divisão dos gastos. O saldo considera todo o
            histórico.
          </p>

        </div>
      </div>


      <div className="painel-saldo mb-4">
        <p className="rotulo mb-0">Saldo disponível</p>

        <p className="numero">{formatarMoeda(dashboard.saldoGeral)}</p>
      </div>


      <div className="row g-4">


        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">

              <div className="painel-titulo">
                <h2>Saldo por conta</h2>

                <Link to="/contas" className="btn btn-sm btn-outline-primary">
                  Gerenciar
                </Link>
              </div>

              {dashboard.saldoPorConta.length === 0 ? (
                <p className="text-muted mb-0">
                  Nenhuma conta cadastrada ainda.
                </p>
              ) : (
                <ul className="list-group list-group-flush">
                  {dashboard.saldoPorConta.map((item) => (
                    <li
                      key={item.conta.id}
                      className="list-group-item d-flex justify-content-between px-0"
                    >
                      <span>{item.conta.nome}</span>

                      <span className="valor">
                        {formatarMoeda(item.saldo)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

            </div>
          </div>
        </div>


        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">

              <div className="painel-titulo">
                <h2>Para onde foi o dinheiro</h2>
              </div>

              <GraficoCategorias dados={dashboard.gastosPorCategoria} />

            </div>
          </div>
        </div>


        <div className="col-12">
          <ResumoMensal />
        </div>


        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">

              <div className="painel-titulo">
                <h2>Últimas transações</h2>

                <Link
                  to="/transacoes"
                  className="btn btn-sm btn-outline-primary"
                >
                  Ver todos
                </Link>
              </div>

              {dashboard.ultimasTransacoes.length === 0 ? (
                <p className="text-muted mb-0">
                  Nenhuma transação por enquanto.
                </p>
              ) : (
                <table className="table align-middle mb-0 tabela-cartao">

                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Data</th>
                      <th className="text-end">Valor</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.ultimasTransacoes.map((transacao) => (
                      <tr key={transacao.id}>

                        <td data-titulo="Descrição">{transacao.descricao}</td>

                        <td data-titulo="Categoria">
                          {transacao.categoria?.nome}
                        </td>

                        <td data-titulo="Data">
                          {formatarData(transacao.data)}
                        </td>

                        <td
                          data-titulo="Valor"
                          className={
                            transacao.tipo === "receita"
                              ? "valor receita text-end"
                              : "valor despesa text-end"
                          }
                        >
                          {transacao.tipo === "receita" ? "+" : "-"}{" "}
                          {formatarMoeda(transacao.valor)}
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              )}

            </div>
          </div>
        </div>


      </div>


    </div>
  );
}


export default Dashboard;
