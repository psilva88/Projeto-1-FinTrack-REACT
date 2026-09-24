// Iniciais do usuário dentro de um círculo: ocupa pouco espaço
// e funciona igual no celular e no computador.
function Avatar({ nome }) {
  const partes = (nome || "").trim().split(/\s+/);

  const iniciais = (
    partes.length > 1
      ? partes[0][0] + partes[partes.length - 1][0]
      : (partes[0] || "?").slice(0, 2)
  ).toUpperCase();


  return (
    <span className="avatar" aria-hidden="true">
      {iniciais}
    </span>
  );
}


export default Avatar;
