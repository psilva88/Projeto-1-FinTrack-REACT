import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

import { GET_CATEGORIAS } from "../graphql/queries";
import {
  CRIAR_CATEGORIA,
  ATUALIZAR_CATEGORIA,
  EXCLUIR_CATEGORIA,
} from "../graphql/mutations";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Modal from "../components/Modal";
import { mensagemDeErro } from "../utils/erros";
import { useToast } from "../contexts/ToastContext";


function Categorias() {
  const { mostrar } = useToast();

  const [filtro, setFiltro] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_CATEGORIAS, {
    variables: { tipo: filtro || null },
    fetchPolicy: "network-only",
  });

  const [criarCategoria] = useMutation(CRIAR_CATEGORIA);
  const [atualizarCategoria] = useMutation(ATUALIZAR_CATEGORIA);
  const [excluirCategoria] = useMutation(EXCLUIR_CATEGORIA);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erroForm, setErroForm] = useState("");

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("despesa");


  function abrirNova() {
    setEditando(null);

    setNome("");
    setTipo("despesa");

    setErroForm("");
    setMostrarModal(true);
  }


  function abrirEdicao(categoria) {
    setEditando(categoria);

    setNome(categoria.nome);
    setTipo(categoria.tipo);

    setErroForm("");
    setMostrarModal(true);
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setErroForm("");

    try {
      if (editando) {
        await atualizarCategoria({
          variables: { id: editando.id, nome, tipo },
        });
      } else {
        await criarCategoria({
          variables: { nome, tipo },
        });
      }

      await refetch();

      setMostrarModal(false);
    } catch (error) {
      setErroForm(mensagemDeErro(error));
    }
  }


  async function handleExcluir(categoria) {
    const confirmar = window.confirm(
      `Excluir a categoria "${categoria.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirCategoria({ variables: { id: categoria.id } });

      await refetch();

      mostrar("Categoria excluída com sucesso", "success");
    } catch (error) {
      mostrar(mensagemDeErro(error));
    }
  }


  if (loading) {
    return <Loading />;
  }


  return (
    <div className="container py-4">


      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Categorias</h1>

        <button className="btn btn-primary" onClick={abrirNova}>
          Nova categoria
        </button>
      </div>


      <div className="mb-3">
        <label className="visually-hidden" htmlFor="filtro-tipo">
          Filtrar por tipo
        </label>

        <select
          id="filtro-tipo"
          className="form-select w-auto"
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
        >
          <option value="">Todas</option>
          <option value="receita">Somente receitas</option>
          <option value="despesa">Somente despesas</option>
        </select>
      </div>


      {error && <ErrorMessage message={mensagemDeErro(error)} />}


      {data?.categorias.length === 0 ? (
        <div className="vazio">
          <p>
            Categorias organizam suas transações: alimentação, transporte,
            salário. Crie as que fizerem sentido para você.
          </p>

          <button className="btn btn-primary" onClick={abrirNova}>
            Cadastrar categoria
          </button>
        </div>
      ) : (
        <div className="tabela-quadro">
          <div className="table-responsive">
            <table className="table align-middle mb-0 tabela-cartao bg-white">

              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>

              <tbody>
                {data?.categorias.map((categoria) => (
                  <tr key={categoria.id}>

                    <td data-titulo="Nome">{categoria.nome}</td>

                    <td data-titulo="Tipo">
                      <span
                        className={
                          categoria.tipo === "receita"
                            ? "marca marca-receita"
                            : "marca marca-despesa"
                        }
                      >
                        {categoria.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>

                    <td data-titulo="Ações" className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => abrirEdicao(categoria)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleExcluir(categoria)}
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
      )}


      {mostrarModal && (
        <Modal
          titulo={editando ? "Editar categoria" : "Nova categoria"}
          onFechar={() => setMostrarModal(false)}
        >
          <form onSubmit={handleSubmit}>


            {erroForm && (
              <div className="alert alert-danger py-2">{erroForm}</div>
            )}


            <div className="mb-3">
              <label className="form-label" htmlFor="cat-nome">Nome</label>

              <input
                id="cat-nome"
                type="text"
                className="form-control"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
              />
            </div>


            <div className="mb-4">
              <label className="form-label" htmlFor="cat-tipo">Tipo</label>

              <select
                id="cat-tipo"
                className="form-select"
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
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


export default Categorias;
