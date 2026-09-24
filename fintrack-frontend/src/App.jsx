import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AvisoOffline from "./components/AvisoOffline";
import RotaPrivada from "./components/RotaPrivada";

import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Contas from "./pages/Contas";
import Categorias from "./pages/Categorias";
import Transacoes from "./pages/Transacoes";


// As telas de entrada já mostram a logo e trazem o próprio link
// de alternar entre login e cadastro, então a navegação não aparece nelas
const ROTAS_DE_ACESSO = ["/login", "/cadastro"];


function Conteudo() {
  const local = useLocation();

  const telaDeAcesso = ROTAS_DE_ACESSO.includes(local.pathname);


  return (
    <>

      {!telaDeAcesso && <Navbar />}

      <AvisoOffline />

      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route
          path="/dashboard"
          element={
            <RotaPrivada>
              <Dashboard />
            </RotaPrivada>
          }
        />

        <Route
          path="/contas"
          element={
            <RotaPrivada>
              <Contas />
            </RotaPrivada>
          }
        />

        <Route
          path="/categorias"
          element={
            <RotaPrivada>
              <Categorias />
            </RotaPrivada>
          }
        />

        <Route
          path="/transacoes"
          element={
            <RotaPrivada>
              <Transacoes />
            </RotaPrivada>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>

    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Conteudo />
    </BrowserRouter>
  );
}


export default App;
