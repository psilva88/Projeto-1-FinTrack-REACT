/**
 * Permite o acesso apenas a usuários com papel 'admin'.
 */
const somenteAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.papel !== 'admin') {
    return res.status(403).json({
      mensagem: 'Acesso restrito a administradores'
    });
  }

  next();
};

module.exports = somenteAdmin;
