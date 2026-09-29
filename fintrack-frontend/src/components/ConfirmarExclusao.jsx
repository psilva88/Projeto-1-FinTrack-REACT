import Modal from "./Modal";


// Caixa de confirmação usada antes de qualquer exclusão.
// Substitui o window.confirm do navegador, que não segue o visual do
// sistema e mostra o endereço do site no título.
// O conteúdo do aviso vem de fora, porque cada tela explica uma
// consequência diferente.
function ConfirmarExclusao({
  titulo,
  children,
  processando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal titulo={titulo} onFechar={onCancelar}>

      {children}

      <div className="d-flex justify-content-end gap-2 mt-3">

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancelar}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="btn btn-danger"
          disabled={processando}
          onClick={onConfirmar}
        >
          {processando ? "Excluindo..." : "Excluir"}
        </button>

      </div>
    </Modal>
  );
}


export default ConfirmarExclusao;
