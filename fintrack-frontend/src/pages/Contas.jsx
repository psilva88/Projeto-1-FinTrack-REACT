import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

import { GET_CONTAS } from "../graphql/queries";
import {
  CRIAR_CONTA,
  ATUALIZAR_CONTA,
  EXCLUIR_CONTA,
} from "../graphql/mutations";

import { formatarMoeda } from "../utils/formatar";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Modal from "../components/Modal";
import { mensagemDeErro } from "../utils/erros";
import { useToast } from "../contexts/ToastContext";


const TIPOS = [
  { valor: "carteira", texto: "Carteira" },
  { valor: "banco", texto: "Conta bancária" },
  { valor: "cartao", texto: "Cartão de crédito" },
];


function Contas() {
  const { mostrar } = useToast();

  const { loading, error, data, refetch } = useQuery(GET_CONTAS, {
    fetchPolicy: "network-only",
  });

  const [criarConta] = useMutation(CRIAR_CONTA);
  const [atualizarConta] = useMutation(ATUALIZAR_CONTA);
  const [excluirConta] = useMutation(EXCLUIR_CONTA);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erroForm, setErroForm] = useState("");

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("carteira");
  const [saldoInicial, setSaldoInicial] = useState("");


  function abrirNova() {
    setEditando(null);

    setNome("");
    setTipo("carteira");
    setSaldoInicial("");

    setErroForm("");
    setMostrarModal(true);
  }


  function abrirEdicao(conta) {
    setEditando(conta);

    setNome(conta.nome);
    setTipo(conta.tipo);
    setSaldoInicial(conta.saldoInicial);

    setErroForm("");
    setMostrarModal(true);
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setErroForm("");

    try {
      if (editando) {
        await atualizarConta({
          variables: {
            id: editando.id,
            nome,
            tipo,
            saldoInicial: Number(saldoInicial),
          },
        });
      } else {
        await criarConta({
          variables: {
            nome,
            tipo,
            saldoInicial: Number(saldoInicial) || 0,
          },
        });
      }

      await refetch();

      setMostrarModal(false);
    } catch (error) {
      setErroForm(mensagemDeErro(error));
    }
  }


  async function handleExcluir(conta) {
    const confirmar = window.confirm(
      `Excluir a conta "${conta.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirConta({ variables: { id: conta.id } });

      await refetch();

      mostrar("Conta excluída com sucesso", "success");
    } catch (error) {
      // O backend bloqueia a exclusão se houver transações vinculadas
      mostrar(mensagemDeErro(error));
    }
  }


  if (loading) {
    return <Loading />;
  }


  return (
    <div className="container py-4">


      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Contas</h1>

        <button className="btn btn-primary" onClick={abrirNova}>
          Nova conta
        </button>
      </div>


      {error && <ErrorMessage message={mensagemDeErro(error)} />}


      {data?.saldoPorConta.length === 0 ? (
        <div className="vazio">
          <p>
            Cadastre onde o seu dinheiro fica: carteira, conta do banco ou
            cartão. Depois é só lançar as movimentações.
          </p>

          <button className="btn btn-primary" onClick={abrirNova}>
            Cadastrar conta
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
                  <th className="text-end">Saldo inicial</th>
                  <th className="text-end">Saldo atual</th>
                  <th className="text-center">Transações</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>

              <tbody>
                {data?.saldoPorConta.map((item) => (
                  <tr key={item.conta.id}>

                    <td data-titulo="Nome">{item.conta.nome}</td>

                    <td data-titulo="Tipo" className="text-capitalize">{item.conta.tipo}</td>

                    <td data-titulo="Saldo inicial" className="valor text-end">
                      {formatarMoeda(item.conta.saldoInicial)}
                    </td>

                    <td data-titulo="Saldo atual" className="valor text-end">
                      {formatarMoeda(item.saldo)}
                    </td>

                    <td data-titulo="Transações" className="text-center">{item.totalTransacoes}</td>

                    <td data-titulo="Ações" className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => abrirEdicao(item.conta)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleExcluir(item.conta)}
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
          titulo={editando ? "Editar conta" : "Nova conta"}
          onFechar={() => setMostrarModal(false)}
        >
          <form onSubmit={handleSubmit}>


            {erroForm && (
              <div className="alert alert-danger py-2">{erroForm}</div>
            )}


            <div className="mb-3">
              <label className="form-label" htmlFor="conta-nome">Nome</label>

              <input
                id="conta-nome"
                type="text"
                className="form-control"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
              />
            </div>


            <div className="mb-3">
              <label className="form-label" htmlFor="conta-tipo">Tipo</label>

              <select
                id="conta-tipo"
                className="form-select"
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
              >
                {TIPOS.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>
                    {opcao.texto}
                  </option>
                ))}
              </select>
            </div>


            <div className="mb-4">
              <label className="form-label" htmlFor="conta-saldo">Saldo inicial</label>

              <input
                id="conta-saldo"
                type="number"
                step="0.01"
                className="form-control"
                value={saldoInicial}
                onChange={(event) => setSaldoInicial(event.target.value)}
                placeholder="0,00"
              />
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


export default Contas;
