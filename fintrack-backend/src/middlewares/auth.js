const jwt = require('jsonwebtoken');

/**
 * Verifica se a requisição possui um token JWT válido.
 */
const autenticar = (req, res, next) => {
  const cabecalho = req.headers.authorization;

  // O token deve vir no formato: Authorization: Bearer <token>
  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token não informado' });
  }

  const token = cabecalho.split(' ')[1];

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
      id: decodificado.id,
      papel: decodificado.papel
    };

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
};

module.exports = autenticar;
