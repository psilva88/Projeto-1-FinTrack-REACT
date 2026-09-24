import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

import {
  GET_TRANSACOES,
  GET_CONTAS_SIMPLES,
  GET_CATEGORIAS,
} from "../graphql/queries";

import {
  CRIAR_TRANSACAO,
  ATUALIZAR_TRANSACAO,
  EXCLUIR_TRANSACAO,
} from "../graphql/mutations";

import { formatarMoeda, formatarData } from "../utils/formatar";
import { mensagemDeErro } from "../utils/erros";
import { useToast } from "../contexts/ToastContext";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Modal from "../components/Modal";


// Data de hoje no formato aceito pelo input type="date"
function hoje() {
  return new Date().toISOString().slice(0, 10);
}


function Transacoes() {
  const { mostrar } = useToast();

  const [filtros, setFiltros] = useState({
    inicio: "",
    fim: "",
    tipo: "",
    conta: "",
    categoria: "",
  });

  const { loading, error, data, refetch } = useQuery(GET_TRANSACOES, {
    variables: {
      inicio: filtros.inicio || null,
      fim: filtros.fim || null,
      tipo: filtros.tipo || null,
      conta: filtros.conta || null,
      categoria: filtros.categoria || null,
      limite: 100,
    },
    fetchPolicy: "network-only",
  });

  // O formulário precisa das contas e categorias para montar os selects
  const { data: dadosContas } = useQuery(GET_CONTAS_SIMPLES, {
    fetchPolicy: "network-only",
  });

  const { data: dadosCategorias } = useQuery(GET_CATEGORIAS, {
    fetchPolicy: "network-only",
  });

  const [criarTransacao] = useMutation(CRIAR_TRANSACAO);
  const [atualizarTransacao] = useMutation(ATUALIZAR_TRANSACAO);
  const [excluirTransacao] = useMutation(EXCLUIR_TRANSACAO);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erroForm, setErroForm] = useState("");

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [data_, setData] = useState(hoje());
  const [conta, setConta] = useState("");
  const [categoria, setCategoria] = useState("");


  const contas = dadosContas?.contas || [];
  const categorias = dadosCategorias?.categorias || [];

  // Só faz sentido oferecer categorias do mesmo tipo do lançamento
  const categoriasDoTipo = categorias.filter(
    (item) => item.tipo === tipo
  );


  function atualizarFiltro(campo, valorCampo) {
    setFiltros({ ...filtros, [campo]: valorCampo });
  }


  function limparFiltros() {
    setFiltros({ inicio: "", fim: "", tipo: "", conta: "", categoria: "" });
  }


  function abrirNova() {
    setEditando(null);

    setDescricao("");
    setValor("");
    setTipo("despesa");
    setData(hoje());
    setConta(contas[0]?.id || "");
    setCategoria("");

    setErroForm("");
    setMostrarModal(true);
  }


  function abrirEdicao(transacao) {
    setEditando(transacao);

    setDescricao(transacao.descricao);
    setValor(transacao.valor);
    setTipo(transacao.tipo);
    setData(new Date(transacao.data).toISOString().slice(0, 10));
    setConta(transacao.conta?.id || "");
    setCategoria(transacao.categoria?.id || "");

    setErroForm("");
    setMostrarModal(true);
  }


  // Ao trocar receita/despesa, a categoria escolhida pode não servir mais
  function handleTipo(novoTipo) {
    setTipo(novoTipo);

    const aindaServe = categorias.some(
      (item) => item.id === categoria && item.tipo === novoTipo
    );

    if (!aindaServe) {
      setCategoria("");
    }
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setErroForm("");

    const variaveis = {
      descricao,
      valor: Number(valor),
      tipo,
      data: data_,
      conta,
      categoria,
    };

    try {
      if (editando) {
        await atualizarTransacao({
          variables: { id: editando.id, ...variaveis },
        });
      } else {
        await criarTransacao({ variables: variaveis });
      }

      await refetch();

      setMostrarModal(false);
    } catch (error) {
      setErroForm(mensagemDeErro(error));
    }
  }


  async function handleExcluir(transacao) {
    const confirmar = window.confirm(
      `Excluir a transação "${transacao.descricao}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirTransacao({ variables: { id: transacao.id } });

      await refetch();

      mostrar("Transação excluída com sucesso", "success");
    } catch (error) {
      mostrar(mensagemDeErro(error));
    }
  }


  const transacoes = data?.transacoesComRelacoes || [];

  const totalReceitas = transacoes
    .filter((item) => item.tipo === "receita")
    .reduce((soma, item) => soma + item.valor, 0);

  const totalDespesas = transacoes
    .filter((item) => item.tipo === "despesa")
    .reduce((soma, item) => soma + item.valor, 0);


  return (
    <div className="container py-4">


      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Transações</h1>

        <button
          className="btn btn-primary"
          onClick={abrirNova}
          disabled={contas.length === 0 || categorias.length === 0}
        >
          Nova transação
        </button>
      </div>


      {(contas.length === 0 || categorias.length === 0) && (
        <div className="alert alert-warning">
          Cadastre ao menos uma conta e uma categoria antes de lançar
          transações.
        </div>
      )}


      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <div className="row g-3 align-items-end">

            <div className="col-md-2">
              <label className="form-label small" htmlFor="filtro-inicio">De</label>

              <input
                id="filtro-inicio"
                type="date"
                className="form-control"
                value={filtros.inicio}
                onChange={(event) =>
                  atualizarFiltro("inicio", event.target.value)
                }
              />
            </div>


            <div className="col-md-2">
              <label className="form-label small" htmlFor="filtro-fim">Até</label>

              <input
                id="filtro-fim"
                type="date"
                className="form-control"
                value={filtros.fim}
                onChange={(event) =>
                  atualizarFiltro("fim", event.target.value)
                }
              />
            </div>


            <div className="col-md-2">
              <label className="form-label small" htmlFor="filtro-tipo">Tipo</label>

              <select
                id="filtro-tipo"
                className="form-select"
                value={filtros.tipo}
                onChange={(event) =>
                  atualizarFiltro("tipo", event.target.value)
                }
              >
                <option value="">Todos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>


            <div className="col-md-2">
              <label className="form-label small" htmlFor="filtro-conta">Conta</label>

              <select
                id="filtro-conta"
                className="form-select"
                value={filtros.conta}
                onChange={(event) =>
                  atualizarFiltro("conta", event.target.value)
                }
              >
                <option value="">Todas</option>

                {contas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>


            <div className="col-md-2">
              <label className="form-label small" htmlFor="filtro-categoria">Categoria</label>

              <select
                id="filtro-categoria"
                className="form-select"
                value={filtros.categoria}
                onChange={(event) =>
                  atualizarFiltro("categoria", event.target.value)
                }
              >
                <option value="">Todas</option>

                {categorias.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>


            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={limparFiltros}
              >
                Limpar
              </button>
            </div>

          </div>

        </div>
      </div>


      {error && <ErrorMessage message={mensagemDeErro(error)} />}


      {loading ? (
        <Loading />
      ) : transacoes.length === 0 ? (
        <div className="vazio">
          <p>
            Nenhuma transação encontrada. Ajuste o período ou os filtros acima.
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">

            <div className="col-6 col-md-4">
              <div className="indicador">
                <span className="rotulo">Entrou</span>

                <span className="numero receita">
                  {formatarMoeda(totalReceitas)}
                </span>
              </div>
            </div>


            <div className="col-6 col-md-4">
              <div className="indicador">
                <span className="rotulo">Saiu</span>

                <span className="numero despesa">
                  {formatarMoeda(totalDespesas)}
                </span>
              </div>
            </div>


            <div className="col-12 col-md-4">
              <div className="indicador">
                <span className="rotulo">Resultado</span>

                <span
                  className={
                    totalReceitas - totalDespesas >= 0
                      ? "numero receita"
                      : "numero despesa"
                  }
                >
                  {formatarMoeda(totalReceitas - totalDespesas)}
                </span>
              </div>
            </div>

          </div>


          <div className="tabela-quadro">
            <div className="table-responsive">
              <table className="table align-middle mb-0 tabela-cartao bg-white">

                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Conta</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th className="text-end">Valor</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {transacoes.map((transacao) => (
                    <tr key={transacao.id}>

                      <td data-titulo="Descrição">{transacao.descricao}</td>

                      <td data-titulo="Conta">{transacao.conta?.nome}</td>

                      <td data-titulo="Categoria">{transacao.categoria?.nome}</td>

                      <td data-titulo="Data">{formatarData(transacao.data)}</td>

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

                      <td data-titulo="Ações" className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirEdicao(transacao)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleExcluir(transacao)}
                        >
                          Excluir
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </>
      )}


      {mostrarModal && (
        <Modal
          titulo={editando ? "Editar transação" : "Nova transação"}
          onFechar={() => setMostrarModal(false)}
        >
          <form onSubmit={handleSubmit}>


            {erroForm && (
              <div className="alert alert-danger py-2">{erroForm}</div>
            )}


            <div className="mb-3">
              <label className="form-label" htmlFor="tr-descricao">Descrição</label>

              <input
                id="tr-descricao"
                type="text"
                className="form-control"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                required
              />
            </div>


            <div className="row g-3 mb-3">

              <div className="col-6">
                <label className="form-label" htmlFor="tr-tipo">Tipo</label>

                <select
                  id="tr-tipo"
                  className="form-select"
                  value={tipo}
                  onChange={(event) => handleTipo(event.target.value)}
                >
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>


              <div className="col-6">
                <label className="form-label" htmlFor="tr-valor">Valor</label>

                <input
                  id="tr-valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  value={valor}
                  onChange={(event) => setValor(event.target.value)}
                  required
                />
              </div>

            </div>


            <div className="mb-3">
              <label className="form-label" htmlFor="tr-data">Data</label>

              <input
                id="tr-data"
                type="date"
                className="form-control"
                value={data_}
                onChange={(event) => setData(event.target.value)}
                required
              />
            </div>


            <div className="mb-3">
              <label className="form-label" htmlFor="tr-conta">Conta</label>

              <select
                id="tr-conta"
                className="form-select"
                value={conta}
                onChange={(event) => setConta(event.target.value)}
                required
              >
                <option value="">Selecione</option>

                {contas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>


            <div className="mb-4">
              <label className="form-label" htmlFor="tr-categoria">Categoria</label>

              <select
                id="tr-categoria"
                className="form-select"
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
                required
              >
                <option value="">Selecione</option>

                {categoriasDoTipo.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>

              {categoriasDoTipo.length === 0 && (
                <div className="form-text text-danger">
                  Nenhuma categoria de {tipo} cadastrada.
                </div>
              )}
            </div>


            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>

              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>


          </form>
        </Modal>
      )}


    </div>
  );
}


export default Transacoes;
