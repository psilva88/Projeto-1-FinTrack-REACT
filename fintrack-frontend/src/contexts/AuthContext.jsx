import { createContext, useContext, useEffect, useState } from "react";

import * as authService from "../services/authService";
import client from "../services/apollo";


const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);


  // Recupera a sessão ao abrir o app, para o usuário não
  // precisar logar de novo a cada F5
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (token && usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }

    setCarregando(false);
  }, []);


  async function entrar(email, senha) {
    const dados = await authService.login(email, senha);

    // Zera o cache do Apollo para não misturar dados de outro usuário
    await client.clearStore();

    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuario", JSON.stringify(dados.usuario));

    setUsuario(dados.usuario);

    return dados;
  }


  async function registrar(nome, email, senha) {
    // O cadastro não devolve token: depois dele o usuário faz login
    return authService.cadastrar(nome, email, senha);
  }


  // Com JWT o logout é do lado do cliente: descarta o token e
  // limpa o cache, senão o próximo usuário veria dados do anterior
  async function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setUsuario(null);

    await client.clearStore();
  }


  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        autenticado: !!usuario,
        entrar,
        registrar,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// Hook customizado: evita importar o contexto em toda tela
export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth precisa estar dentro de um AuthProvider");
  }

  return contexto;
}
