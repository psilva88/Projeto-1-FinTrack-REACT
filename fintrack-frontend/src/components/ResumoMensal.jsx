import { useState } from "react";
import { useQuery } from "@apollo/client";

import { GET_RESUMO_MENSAL } from "../graphql/queries";
import { formatarMoeda } from "../utils/formatar";
import { mensagemDeErro } from "../utils/erros";

import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";


const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];


function ResumoMensal() {
  const agora = new Date();

  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());


  const { loading, error, data } = useQuery(GET_RESUMO_MENSAL, {
    variables: { mes: Number(mes), ano: Number(ano) },
    fetchPolicy: "network-only",
  });


  // Lista os últimos anos para o seletor
  const anos = [];

  for (let i = agora.getFullYear(); i >= agora.getFullYear() - 4; i--) {
    anos.push(i);
  }


  const resumo = data?.resumoMensal;


  return (
    <div className="card shadow-sm">
      <div className="card-body">


        <div className="painel-titulo flex-wrap">

          <h2>Fechamento do mês</h2>

          <div className="d-flex gap-2">

            <label className="visually-hidden" htmlFor="resumo-mes">
              Mês
            </label>

            <select
              id="resumo-mes"
              className="form-select form-select-sm seletor-periodo"
              value={mes}
              onChange={(event) => setMes(event.target.value)}
            >
              {MESES.map((nome, indice) => (
                <option key={nome} value={indice + 1}>
                  {nome}
                </option>
              ))}
            </select>


            <label className="visually-hidden" htmlFor="resumo-ano">
              Ano
            </label>

            <select
              id="resumo-ano"
              className="form-select form-select-sm"
              style={{ minWidth: "5.5rem" }}
              value={ano}
              onChange={(event) => setAno(event.target.value)}
            >
              {anos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

        </div>


        {loading && <Loading />}

        {error && <ErrorMessage message={mensagemDeErro(error)} />}


        {resumo && !loading && (
          <>
            <div className="row g-3 mb-3">

              <div className="col-6 col-lg-3">
                <div className="indicador">
                  <span className="rotulo">Receitas</span>

                  <span className="numero receita">
                    {formatarMoeda(resumo.totalReceitas)}
                  </span>
                </div>
              </div>


              <div className="col-6 col-lg-3">
                <div className="indicador">
                  <span className="rotulo">Despesas</span>

                  <span className="numero despesa">
                    {formatarMoeda(resumo.totalDespesas)}
                  </span>
                </div>
              </div>


              <div className="col-6 col-lg-3">
                <div className="indicador">
                  <span className="rotulo">Resultado</span>

                  <span
                    className={
                      resumo.saldo >= 0 ? "numero receita" : "numero despesa"
                    }
                  >
                    {formatarMoeda(resumo.saldo)}
                  </span>
                </div>
              </div>


              <div className="col-6 col-lg-3">
                <div className="indicador">
                  <span className="rotulo">Transações</span>

                  <span className="numero">{resumo.quantidadeTransacoes}</span>
                </div>
              </div>

            </div>


            {resumo.gastosPorCategoria.length === 0 ? (
              <p className="text-muted mb-0">
                Sem despesas neste mês.
              </p>
            ) : (
              <ul className="list-group list-group-flush">
                {resumo.gastosPorCategoria.map((item) => (
                  <li
                    key={item.categoria.id}
                    className="list-group-item d-flex justify-content-between px-0"
                  >
                    <span>{item.categoria.nome}</span>

                    <span>
                      <span className="valor">{formatarMoeda(item.total)}</span>

                      <span className="text-muted ms-2" style={{ fontSize: "0.8rem" }}>
                        {item.percentual}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}


      </div>
    </div>
  );
}


export default ResumoMensal;
