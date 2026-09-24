function ErrorMessage({ message }) {
  return (
    <div className="alert alert-danger" role="alert">
      <strong>Erro:</strong> {message}
    </div>
  );
}


export default ErrorMessage;
