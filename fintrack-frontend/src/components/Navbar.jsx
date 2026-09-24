import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import Avatar from "./Avatar";


function Navbar() {
  const navigate = useNavigate();

  const { usuario, autenticado, sair } = useAuth();

  const [aberto, setAberto] = useState(false);


  async function handleSair() {
    setAberto(false);

    await sair();

    navigate("/login");
  }


  // Fecha o menu ao navegar, senão ele fica aberto no celular
  function fechar() {
    setAberto(false);
  }


  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">


        <Link className="navbar-brand me-auto" to="/" onClick={fechar}>
          <img
            src="/logo-fintrack-branca.png"
            alt="FinTrack"
            className="logo-navbar"
          />
        </Link>


        {/*
          Identificação do usuário fica sempre visível no canto direito.
          O botão de sair acompanha ela no computador e, no celular,
          vai para o fim do menu retrátil.
        */}
        <div className="d-flex align-items-center gap-2 order-lg-last">

          {autenticado && (
            <>
              <div className="bloco-usuario" title={usuario.nome}>
                <Avatar nome={usuario.nome} />

                <span className="usuario-nome d-none d-md-inline">
                  {usuario.nome}
                </span>
              </div>

              <button
                className="btn btn-outline-light btn-sm d-none d-lg-inline-block"
                onClick={handleSair}
              >
                Sair
              </button>

              <button
                className="navbar-toggler ms-1"
                type="button"
                aria-label="Abrir menu"
                aria-expanded={aberto}
                onClick={() => setAberto(!aberto)}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </>
          )}

        </div>


        <div className={`collapse navbar-collapse ${aberto ? "show" : ""}`}>

          {autenticado && (
            <ul className="navbar-nav ms-lg-3 py-2 py-lg-0">

              <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard" onClick={fechar}>
                  Resumo
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/transacoes" onClick={fechar}>
                  Transações
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/contas" onClick={fechar}>
                  Contas
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/categorias" onClick={fechar}>
                  Categorias
                </NavLink>
              </li>

              <li className="nav-item d-lg-none">
                <button className="nav-link sair-menu" onClick={handleSair}>
                  Sair
                </button>
              </li>

            </ul>
          )}

        </div>


      </div>
    </nav>
  );
}


export default Navbar;
