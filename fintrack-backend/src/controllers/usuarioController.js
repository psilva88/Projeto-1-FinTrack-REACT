const Usuario = require('../models/Usuario');
const Conta = require('../models/Conta');
const Categoria = require('../models/Categoria');
const Transacao = require('../models/Transacao');

// GET /usuarios (somente admin)
const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ nome: 1 });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar usuários', erro: error.message });
  }
};

// GET /usuarios/:id
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

// PUT /usuarios/:id
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
    if (senha) usuario.senha = senha;


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

// GET /usuarios/:id/resumo (somente admin)
// Conta quantos registros o usuário possui. Serve para o painel avisar,
// antes de confirmar, o tamanho do que a exclusão vai apagar.
// Devolve apenas quantidades: os valores financeiros seguem privados.
const resumoDeDados = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const [contas, categorias, transacoes] = await Promise.all([
      Conta.countDocuments({ usuario: usuario._id }),
      Categoria.countDocuments({ usuario: usuario._id }),
      Transacao.countDocuments({ usuario: usuario._id })
    ]);

    res.status(200).json({ contas, categorias, transacoes });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao resumir os dados do usuário', erro: error.message });
  }
};

// DELETE /usuarios/:id (somente admin)
// A exclusão é em cascata: os dados financeiros pertencem à pessoa,
// então saem junto com ela. Sem isso, as contas, categorias e transações
// ficariam no banco apontando para um usuário que não existe mais.
const remover = async (req, res) => {
  try {
    if (req.usuario.id === req.params.id) {
      return res.status(400).json({ mensagem: 'Você não pode excluir a própria conta de admin' });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // As transações saem primeiro, porque dependem de conta e categoria
    const transacoes = await Transacao.deleteMany({ usuario: usuario._id });

    const [contas, categorias] = await Promise.all([
      Conta.deleteMany({ usuario: usuario._id }),
      Categoria.deleteMany({ usuario: usuario._id })
    ]);

    await usuario.deleteOne();

    res.status(200).json({
      mensagem: 'Usuário excluído com sucesso',
      removidos: {
        transacoes: transacoes.deletedCount,
        contas: contas.deletedCount,
        categorias: categorias.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao excluir usuário', erro: error.message });
  }
};

module.exports = { listar, buscarPorId, atualizar, remover, resumoDeDados };
