const Usuario = require('../models/Usuario');

// GET /usuarios   (somente admin)
const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ nome: 1 });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar usuários', erro: error.message });
  }
};

// GET /usuarios/:id   (o próprio usuário ou um admin)
const buscarPorId = async (req, res) => {
  try {
    const ehOProprio = req.usuario.id === req.params.id;
    const ehAdmin = req.usuario.papel === 'admin';

    if (!ehOProprio && !ehAdmin) {
      return res.status(403).json({ mensagem: 'Acesso negado' });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar usuário', erro: error.message });
  }
};

// PUT /usuarios/:id   (o próprio usuário ou um admin)
const atualizar = async (req, res) => {
  try {
    const ehOProprio = req.usuario.id === req.params.id;
    const ehAdmin = req.usuario.papel === 'admin';

    if (!ehOProprio && !ehAdmin) {
      return res.status(403).json({ mensagem: 'Acesso negado' });
    }

    const { nome, email, senha } = req.body;

    const usuario = await Usuario.findById(req.params.id).select('+senha');

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (senha) usuario.senha = senha; // o pre('save') refaz o hash

    // Só admin pode mudar o papel de alguém
    if (req.body.papel && ehAdmin) {
      usuario.papel = req.body.papel;
    }

    await usuario.save();

    res.status(200).json({
      _id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado' });
    }

    if (error.name === 'ValidationError') {
      const erros = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensagem: 'Dados inválidos', erros });
    }

    res.status(500).json({ mensagem: 'Erro ao atualizar usuário', erro: error.message });
  }
};

// DELETE /usuarios/:id   (somente admin)
const remover = async (req, res) => {
  try {
    if (req.usuario.id === req.params.id) {
      return res.status(400).json({ mensagem: 'Você não pode excluir a própria conta de admin' });
    }

    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.status(200).json({ mensagem: 'Usuário excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao excluir usuário', erro: error.message });
  }
};

module.exports = { listar, buscarPorId, atualizar, remover };
