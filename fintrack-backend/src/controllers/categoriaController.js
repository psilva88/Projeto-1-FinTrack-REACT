const Categoria = require('../models/Categoria');
const Transacao = require('../models/Transacao');

// POST /categorias
const criar = async (req, res) => {
  try {
    const { nome, tipo } = req.body;

    const categoria = await Categoria.create({
      nome,
      tipo,
      usuario: req.usuario.id
    });

    res.status(201).json(categoria);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensagem: 'Você já possui uma categoria com esse nome' });
    }

    if (error.name === 'ValidationError') {
      const erros = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensagem: 'Dados inválidos', erros });
    }

    res.status(500).json({ mensagem: 'Erro ao criar categoria', erro: error.message });
  }
};

// GET /categorias   (aceita ?tipo=receita ou ?tipo=despesa)
const listar = async (req, res) => {
  try {
    const filtro = { usuario: req.usuario.id };

    if (req.query.tipo) {
      filtro.tipo = req.query.tipo;
    }

    const categorias = await Categoria.find(filtro).sort({ nome: 1 });
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar categorias', erro: error.message });
  }
};

// GET /categorias/:id
const buscarPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findOne({
      _id: req.params.id,
      usuario: req.usuario.id
    });

    if (!categoria) {
      return res.status(404).json({ mensagem: 'Categoria não encontrada' });
    }

    res.status(200).json(categoria);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar categoria', erro: error.message });
  }
};

// PUT /categorias/:id
const atualizar = async (req, res) => {
  try {
    const { nome, tipo } = req.body;

    const categoria = await Categoria.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario.id },
      { nome, tipo },
      { new: true, runValidators: true, omitUndefined: true }
    );

    if (!categoria) {
      return res.status(404).json({ mensagem: 'Categoria não encontrada' });
    }

    res.status(200).json(categoria);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const erros = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensagem: 'Dados inválidos', erros });
    }

    res.status(500).json({ mensagem: 'Erro ao atualizar categoria', erro: error.message });
  }
};

// DELETE /categorias/:id
const remover = async (req, res) => {
  try {
    const temTransacoes = await Transacao.exists({
      categoria: req.params.id,
      usuario: req.usuario.id
    });

    if (temTransacoes) {
      return res.status(409).json({
        mensagem: 'Não é possível excluir: existem transações vinculadas a esta categoria'
      });
    }

    const categoria = await Categoria.findOneAndDelete({
      _id: req.params.id,
      usuario: req.usuario.id
    });

    if (!categoria) {
      return res.status(404).json({ mensagem: 'Categoria não encontrada' });
    }

    res.status(200).json({ mensagem: 'Categoria excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao excluir categoria', erro: error.message });
  }
};

module.exports = { criar, listar, buscarPorId, atualizar, remover };
