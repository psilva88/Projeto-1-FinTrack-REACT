import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";


// Protege o painel de administração. A verificação aqui é só de interface:
// quem tentar chamar a API direto continua barrado pelo backend, que confere
// o papel assinado dentro do token.
function RotaAdmin({ children }) {
  const { usuario, autenticado, carregando } = useAuth();

  if (carregando) {
    return <Loading />;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.papel !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


export default RotaAdmin;
