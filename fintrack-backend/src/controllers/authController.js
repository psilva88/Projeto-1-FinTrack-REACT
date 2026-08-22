const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Gera o token JWT com o id e o papel do usuário.
 * O papel vai dentro do token para que o middleware de admin
 * não precise consultar o banco a cada requisição.
 */
const gerarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
};

// POST /auth/register
const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: 'Nome, e-mail e senha são obrigatórios'
      });
    }

    const jaExiste = await Usuario.findOne({ email });

    if (jaExiste) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado' });
    }

    // O papel nunca vem do req.body: senão qualquer um se cadastraria como admin
    const usuario = await Usuario.create({ nome, email, senha });

    res.status(201).json({
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel
      },
      token: gerarToken(usuario)
    });
  } catch (error) {
    // Erros de validação do Mongoose (e-mail inválido, senha curta, etc.)
    if (error.name === 'ValidationError') {
      const erros = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensagem: 'Dados inválidos', erros });
    }

    res.status(500).json({
      mensagem: 'Erro ao cadastrar usuário',
      erro: error.message
    });
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios' });
    }

    // O campo senha tem select: false no model, por isso o +senha
    const usuario = await Usuario.findOne({ email }).select('+senha');

    if (!usuario) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos' });
    }

    const senhaConfere = await usuario.compararSenha(senha);

    if (!senhaConfere) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos' });
    }

    res.status(200).json({
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel
      },
      token: gerarToken(usuario)
    });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao fazer login', erro: error.message });
  }
};

// GET /auth/perfil  (rota protegida — devolve os dados de quem está logado)
const perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar perfil', erro: error.message });
  }
};

module.exports = { registrar, login, perfil };
