import { createContext, useCallback, useContext, useState } from "react";


const ToastContext = createContext();


// Substitui os alert() do navegador por avisos discretos no canto da tela
export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);


  const remover = useCallback((id) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
  }, []);


  const mostrar = useCallback(
    (texto, tipo = "danger") => {
      const id = Date.now() + Math.random();

      setAvisos((atuais) => [...atuais, { id, texto, tipo }]);

      // Some sozinho depois de alguns segundos
      setTimeout(() => remover(id), 4000);
    },
    [remover]
  );


  return (
    <ToastContext.Provider value={{ mostrar }}>
      {children}

      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1080 }}
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`toast show text-bg-${aviso.tipo} mb-2`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{aviso.texto}</div>

              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Fechar"
                onClick={() => remover(aviso.id)}
              ></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


export function useToast() {
  const contexto = useContext(ToastContext);

  if (!contexto) {
    throw new Error("useToast precisa estar dentro de um ToastProvider");
  }

  return contexto;
}
