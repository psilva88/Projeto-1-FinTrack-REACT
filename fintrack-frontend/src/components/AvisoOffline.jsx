import { useEffect, useState } from "react";


// Mostra um aviso fixo quando o navegador perde a conexão
function AvisoOffline() {
  const [offline, setOffline] = useState(!navigator.onLine);


  useEffect(() => {
    function ficouOnline() {
      setOffline(false);
    }

    function ficouOffline() {
      setOffline(true);
    }

    window.addEventListener("online", ficouOnline);
    window.addEventListener("offline", ficouOffline);

    return () => {
      window.removeEventListener("online", ficouOnline);
      window.removeEventListener("offline", ficouOffline);
    };
  }, []);


  if (!offline) {
    return null;
  }


  return (
    <div className="alert alert-warning text-center rounded-0 mb-0 py-2">
      Você está sem conexão. Os dados exibidos podem estar desatualizados.
    </div>
  );
}


export default AvisoOffline;
