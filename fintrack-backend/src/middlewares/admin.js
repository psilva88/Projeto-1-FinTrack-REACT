/**
 * Permite o acesso apenas a usuários com papel 'admin'.
 * Deve ser usado sempre DEPOIS do middleware de autenticação,
 * porque depende do req.usuario preenchido por ele.
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
