import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";


// Protege as telas internas: sem sessão, manda para o login
function RotaPrivada({ children }) {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return <Loading />;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


export default RotaPrivada;
