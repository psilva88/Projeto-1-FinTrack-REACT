import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";

import { GET_ESTATISTICAS } from "../graphql/queries";
import * as usuarioService from "../services/usuarioService";

import { formatarMoeda } from "../utils/formatar";
import { mensagemDeErro } from "../utils/erros";

import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmarExclusao from "../components/ConfirmarExclusao";


function Admin() {
  const { usuario } = useAuth();
  const { mostrar } = useToast();

  // Os números da plataforma vêm do GraphQL, em uma consulta só
  const {
    loading: carregandoNumeros,
    error: erroNumeros,
    data,
    refetch: recarregarNumeros,
  } = useQuery(GET_ESTATISTICAS, { fetchPolicy: "network-only" });

  // A lista de usuários vem das rotas REST, que já existiam desde a Fase 1
  const [usuarios, setUsuarios] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erroLista, setErroLista] = useState("");

  const [excluindo, setExcluindo] = useState(null);
  const [resumoExclusao, setResumoExclusao] = useState(null);
  const [processando, setProcessando] = useState(false);


  const carregarUsuarios = useCallback(async () => {
    setErroLista("");

    try {
      const lista = await usuarioService.listar();
      setUsuarios(lista);
    } catch (error) {
      setErroLista(mensagemDeErro(error));
    } finally {
      setCarregandoLista(false);
    }
  }, []);


  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);


  // O volume de dados de cada pessoa só é consultado aqui, na hora de
  // confirmar a exclusão: é a única situação em que ele é necessário.
  async function abrirExclusao(alvo) {
    setExcluindo(alvo);
    setResumoExclusao(null);

    try {
      setResumoExclusao(await usuarioService.resumo(alvo._id));
    } catch {
      // Sem os números o modal ainda funciona, com o aviso genérico
      setResumoExclusao(null);
    }
  }


  function fecharExclusao() {
    setExcluindo(null);
    setResumoExclusao(null);
  }


  async function handlePapel(alvo) {
    const novoPapel = alvo.papel === "admin" ? "usuario" : "admin";

    setProcessando(true);

    try {
      await usuarioService.alterarPapel(alvo._id, novoPapel);

      await carregarUsuarios();
      await recarregarNumeros();

      mostrar(
        novoPapel === "admin"
          ? `${alvo.nome} agora é administrador`
          : `${alvo.nome} voltou a ser usuário comum`,
        "success"
      );
    } catch (error) {
      mostrar(mensagemDeErro(error));
    } finally {
      setProcessando(false);
    }
  }


  async function handleExcluir() {
    setProcessando(true);

    try {
      const resposta = await usuarioService.excluir(excluindo._id);

      await carregarUsuarios();
      await recarregarNumeros();

      // O backend informa quanta coisa saiu junto com o usuário
      const removidos = resposta.removidos;

      mostrar(
        removidos
          ? `${excluindo.nome} foi excluído, junto com ${removidos.transacoes} transações, ${removidos.contas} contas e ${removidos.categorias} categorias`
          : `${excluindo.nome} foi excluído`,
        "success"
      );

      fecharExclusao();
    } catch (error) {
      mostrar(mensagemDeErro(error));
    } finally {
      setProcessando(false);
    }
  }


  if (carregandoNumeros && carregandoLista) {
    return <Loading />;
  }


  const numeros = data?.estatisticasGerais;


  return (
    <div className="container py-4">


      <div className="mb-4">
        <h1 className="mb-1">Administração</h1>

        <p className="text-muted mb-0">
          Números gerais da plataforma e gestão dos usuários cadastrados.
        </p>
      </div>


      {erroNumeros && <ErrorMessage message={mensagemDeErro(erroNumeros)} />}


      {numeros && (
        <>
          <div className="painel-saldo mb-4">
            <p className="rotulo mb-0">Saldo de todos os usuários</p>

            <p className="numero">{formatarMoeda(numeros.saldoPlataforma)}</p>

            <p className="rotulo mb-0 mt-2">
              {formatarMoeda(numeros.saldoInicialTotal)} de saldo inicial das
              contas, mais {formatarMoeda(numeros.volumeReceitas)} em receitas e
              menos {formatarMoeda(numeros.volumeDespesas)} em despesas
            </p>
          </div>


          <div className="row g-3 mb-4">

            <div className="col-6 col-lg-2">
              <div className="indicador">
                <span className="rotulo">Usuários</span>
                <span className="numero">{numeros.totalUsuarios}</span>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="indicador">
                <span className="rotulo">Administradores</span>
                <span className="numero">{numeros.totalAdmins}</span>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="indicador">
                <span className="rotulo">Novos em 30 dias</span>
                <span className="numero">{numeros.novosUsuarios30Dias}</span>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="indicador">
                <span className="rotulo">Transações</span>
                <span className="numero">{numeros.totalTransacoes}</span>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="indicador">
                <span className="rotulo">Contas</span>
                <span className="numero">{numeros.totalContas}</span>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="indicador">
                <span className="rotulo">Categorias</span>
                <span className="numero">{numeros.totalCategorias}</span>
              </div>
            </div>

          </div>
        </>
      )}


      <div className="painel-titulo">
        <h2 className="h4 mb-0">Usuários cadastrados</h2>
      </div>


      {erroLista && <ErrorMessage message={erroLista} />}


      {carregandoLista ? (
        <Loading />
      ) : (
        <div className="tabela-quadro">
          <div className="table-responsive">
            <table className="table align-middle mb-0 tabela-cartao bg-white">

              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Papel</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((item) => {
                  // O próprio administrador não pode se rebaixar nem se excluir:
                  // é a mesma regra que o backend aplica
                  const souEu = item._id === usuario.id;

                  return (
                    <tr key={item._id}>

                      <td data-titulo="Nome">
                        {item.nome}

                        {souEu && (
                          <span className="text-muted small ms-2">(você)</span>
                        )}
                      </td>

                      <td data-titulo="E-mail">{item.email}</td>

                      <td data-titulo="Papel">
                        <span
                          className={`selo-papel ${
                            item.papel === "admin" ? "selo-admin" : ""
                          }`}
                        >
                          {item.papel === "admin" ? "Administrador" : "Usuário"}
                        </span>
                      </td>

                      <td data-titulo="Ações" className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          disabled={souEu || processando}
                          onClick={() => handlePapel(item)}
                        >
                          {item.papel === "admin"
                            ? "Tornar usuário"
                            : "Tornar admin"}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={souEu || processando}
                          onClick={() => abrirExclusao(item)}
                        >
                          Excluir
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      )}


      {excluindo && (
        <ConfirmarExclusao
          titulo="Excluir usuário"
          processando={processando}
          onConfirmar={handleExcluir}
          onCancelar={fecharExclusao}
        >
          <p>
            Tem certeza que deseja excluir <strong>{excluindo.nome}</strong>?
          </p>

          <div className="alert alert-danger py-2 small mb-3">
            {resumoExclusao ? (
              <>
                Serão apagadas{" "}
                <strong>{resumoExclusao.contas} contas</strong>,{" "}
                <strong>{resumoExclusao.categorias} categorias</strong> e{" "}
                <strong>{resumoExclusao.transacoes} transações</strong>.
              </>
            ) : (
              <>
                Todas as contas, categorias e transações dessa pessoa serão
                apagadas junto.
              </>
            )}{" "}
            <strong>Esta ação é irreversível</strong> e não há como recuperar
            os dados depois.
          </div>
        </ConfirmarExclusao>
      )}


    </div>
  );
}


export default Admin;
