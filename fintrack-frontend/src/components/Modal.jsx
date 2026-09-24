// Modal simples do Bootstrap controlado pelo React.
// Usado pelos formulários de conta, categoria e transação.
function Modal({ titulo, children, onFechar }) {
  return (
    <>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">


            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>

              <button
                type="button"
                className="btn-close"
                onClick={onFechar}
              ></button>
            </div>


            <div className="modal-body">{children}</div>


          </div>
        </div>
      </div>

      <div className="modal-backdrop show"></div>
    </>
  );
}


export default Modal;
