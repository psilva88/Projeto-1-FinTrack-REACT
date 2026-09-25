import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";


function Cadastro() {
  const navigate = useNavigate();

  const { registrar, entrar } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);


  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setEnviando(true);

    try {
      await registrar(nome, email, senha);

      // O cadastro não devolve token, então já fazemos o login
      await entrar(email, senha);

      navigate("/dashboard");
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }


  return (
    <div className="container tela-acesso">
      <div className="row justify-content-center w-100">
        <div className="col-sm-9 col-md-6 col-lg-5">


          <img
            src="/logo-fintrack.png"
            alt="FinTrack"
            className="logo-acesso"
          />


          <div className="cartao-acesso">
            <div>

              <h1 className="mb-4">Criar conta</h1>


              {erro && (
                <div className="alert alert-danger py-2">{erro}</div>
              )}


              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label" htmlFor="cad-nome">Nome</label>

                  <input
                    id="cad-nome"
                    type="text"
                    className="form-control"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    required
                  />
                </div>


                <div className="mb-3">
                  <label className="form-label" htmlFor="cad-email">E-mail</label>

                  <input
                    id="cad-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>


                <div className="mb-4">
                  <label className="form-label" htmlFor="cad-senha">Senha</label>

                  <input
                    id="cad-senha"
                    type="password"
                    className="form-control"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    minLength={6}
                    required
                  />

                  <div className="form-text">Mínimo de 6 caracteres</div>
                </div>


                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={enviando}
                >
                  {enviando ? "Cadastrando..." : "Cadastrar"}
                </button>

              </form>


              <p className="text-center small mt-4 mb-0">
                Já tem conta? <Link to="/login">Entrar</Link>
              </p>


            </div>
          </div>


        </div>
      </div>
    </div>
  );
}


export default Cadastro;
