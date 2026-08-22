const Conta = require('../models/Conta');
const Transacao = require('../models/Transacao');

// POST /contas
const criar = async (req, res) => {
  try {
    const { nome, tipo, saldoInicial } = req.body;

    const conta = await Conta.create({
      nome,
      tipo,
      saldoInicial,
      usuario: req.usuario.id // sempre do token, nunca do body
    });

    res.status(201).json(conta);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensagem: 'Você já possui uma conta com esse nome' });
    }

    if (error.name === 'ValidationError') {
      const erros = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensagem: 'Dados inválidos', erros });
    }

    res.status(500).json({ mensagem: 'Erro ao criar conta', erro: error.message });
  }
};

// GET /contas
const listar = async (req, res) => {
  try {
    const contas = await Conta.find({ usuario: req.usuario.id }).sort({ nome: 1 });
    res.status(200).json(contas);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar contas', erro: error.message });
  }
};

// GET /contas/:id
const buscarPorId = async (req, res) => {
  try {
    const conta = await Conta.findOne({
      _id: req.params.id,
      usuario: req.usuario.id
    });

    if (!conta) {
      return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }

    res.status(200).json(conta);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar conta', erro: error.message });
  }
};

// PUT /contas/:id
const atualizar = async (req, res) => {
  try {
    const { nome, tipo, saldoInicial } = req.body;

    const conta = await Conta.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario.id },
      { nome, tipo, saldoInicial },
      { new: true, runValidators: true, omitUndefined: true }
    );

    if (!conta) {
      return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }

    res.status(200).json(conta);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const erros = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensagem: 'Dados inválidos', erros });
    }

    res.status(500).json({ mensagem: 'Erro ao atualizar conta', erro: error.message });
  }
};

// DELETE /contas/:id
const remover = async (req, res) => {
  try {
    // Não deixa apagar uma conta que ainda tem transações vinculadas
    const temTransacoes = await Transacao.exists({
      conta: req.params.id,
      usuario: req.usuario.id
    });

    if (temTransacoes) {
      return res.status(409).json({
        mensagem: 'Não é possível excluir: existem transações vinculadas a esta conta'
      });
    }

    const conta = await Conta.findOneAndDelete({
      _id: req.params.id,
      usuario: req.usuario.id
    });

    if (!conta) {
      return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }

    res.status(200).json({ mensagem: 'Conta excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao excluir conta', erro: error.message });
  }
};

module.exports = { criar, listar, buscarPorId, atualizar, remover };
