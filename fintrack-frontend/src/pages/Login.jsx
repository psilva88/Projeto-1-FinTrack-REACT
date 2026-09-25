import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";


function Login() {
  const navigate = useNavigate();

  const { entrar, autenticado } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);


  // Quem já está logado não precisa ver a tela de login
  if (autenticado) {
    return <Navigate to="/dashboard" replace />;
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setEnviando(true);

    try {
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

              <h1 className="mb-1">Entrar</h1>

              <p className="text-muted mb-4">Acesse sua conta para continuar</p>


              {erro && (
                <div className="alert alert-danger py-2">{erro}</div>
              )}


              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label" htmlFor="login-email">E-mail</label>

                  <input
                    id="login-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>


                <div className="mb-4">
                  <label className="form-label" htmlFor="login-senha">Senha</label>

                  <input
                    id="login-senha"
                    type="password"
                    className="form-control"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    required
                  />
                </div>


                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={enviando}
                >
                  {enviando ? "Entrando..." : "Entrar"}
                </button>

              </form>


              <p className="text-center small mt-4 mb-0">
                Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
              </p>


            </div>
          </div>


        </div>
      </div>
    </div>
  );
}


export default Login;
