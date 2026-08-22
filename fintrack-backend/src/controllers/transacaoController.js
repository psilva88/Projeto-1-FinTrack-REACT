const Transacao = require('../models/Transacao');
const Conta = require('../models/Conta');
const Categoria = require('../models/Categoria');

/**
 * Confere se a conta e a categoria informadas existem E pertencem
 * ao usuário logado. Sem isso, alguém poderia lançar uma transação
 * na conta de outra pessoa mandando o id dela no body.
 */
const validarVinculos = async (contaId, categoriaId, usuarioId) => {
  const conta = await Conta.findOne({ _id: contaId, usuario: usuarioId });
  if (!conta) return 'Conta não encontrada';

  const categoria = await Categoria.findOne({ _id: categoriaId, usuario: usuarioId });
  if (!categoria) return 'Categoria não encontrada';

  return null;
};

// POST /transacoes
const criar = async (req, res) => {
  try {
    const { descricao, valor, tipo, data, conta, categoria } = req.body;

    if (!conta || !categoria) {
      return res.status(400).json({ mensagem: 'Conta e categoria são obrigatórias' });
    }

    const erroVinculo = await validarVinculos(conta, categoria, req.usuario.id);

    if (erroVinculo) {
      return res.status(404).json({ mensagem: erroVinculo });
    }

    const transacao = await Transacao.create({
      descricao,
      valor,
      tipo,
      data,
      conta,
      categoria,
      usuario: req.usuario.id
    });

    // populate para já devolver os nomes da conta e da categoria
    await transacao.populate([
      { path: 'conta', select: 'nome tipo' },
      { path: 'categoria', select: 'nome tipo' }
    ]);

    res.status(201).json(transacao);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const erros = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensagem: 'Dados inválidos', erros });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ mensagem: 'Id inválido' });
    }

    res.status(500).json({ mensagem: 'Erro ao criar transação', erro: error.message });
  }
};

/**
 * GET /transacoes
 * Filtros opcionais via query string:
 *   ?pagina=1&limite=10&tipo=despesa&categoria=<id>&conta=<id>&inicio=2026-08-01&fim=2026-08-31
 */
const listar = async (req, res) => {
  try {
    const pagina = Math.max(parseInt(req.query.pagina) || 1, 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite) || 10, 1), 100);

    const filtro = { usuario: req.usuario.id };

    if (req.query.tipo) filtro.tipo = req.query.tipo;
    if (req.query.categoria) filtro.categoria = req.query.categoria;
    if (req.query.conta) filtro.conta = req.query.conta;

    // Filtro por período
    if (req.query.inicio || req.query.fim) {
      filtro.data = {};
      if (req.query.inicio) filtro.data.$gte = new Date(req.query.inicio);
      if (req.query.fim) filtro.data.$lte = new Date(req.query.fim);
    }

    const total = await Transacao.countDocuments(filtro);

    const transacoes = await Transacao.find(filtro)
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome tipo')
      .sort({ data: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite);

    res.status(200).json({
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
      transacoes
    });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao listar transações', erro: error.message });
  }
};

// GET /transacoes/:id
const buscarPorId = async (req, res) => {
  try {
    const transacao = await Transacao.findOne({
      _id: req.params.id,
      usuario: req.usuario.id
    })
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome tipo');

    if (!transacao) {
      return res.status(404).json({ mensagem: 'Transação não encontrada' });
    }

    res.status(200).json(transacao);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar transação', erro: error.message });
  }
};

// PUT /transacoes/:id
const atualizar = async (req, res) => {
  try {
    const { descricao, valor, tipo, data, conta, categoria } = req.body;

    // Se estiver trocando a conta ou a categoria, valida os novos vínculos
    if (conta || categoria) {
      const atual = await Transacao.findOne({
        _id: req.params.id,
        usuario: req.usuario.id
      });

      if (!atual) {
        return res.status(404).json({ mensagem: 'Transação não encontrada' });
      }

      const erroVinculo = await validarVinculos(
        conta || atual.conta,
        categoria || atual.categoria,
        req.usuario.id
      );

      if (erroVinculo) {
        return res.status(404).json({ mensagem: erroVinculo });
      }
    }

    const transacao = await Transacao.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario.id },
      { descricao, valor, tipo, data, conta, categoria },
      { new: true, runValidators: true, omitUndefined: true }
    )
      .populate('conta', 'nome tipo')
      .populate('categoria', 'nome tipo');

    if (!transacao) {
      return res.status(404).json({ mensagem: 'Transação não encontrada' });
    }

    res.status(200).json(transacao);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const erros = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensagem: 'Dados inválidos', erros });
    }

    res.status(500).json({ mensagem: 'Erro ao atualizar transação', erro: error.message });
  }
};

// DELETE /transacoes/:id
const remover = async (req, res) => {
  try {
    const transacao = await Transacao.findOneAndDelete({
      _id: req.params.id,
      usuario: req.usuario.id
    });

    if (!transacao) {
      return res.status(404).json({ mensagem: 'Transação não encontrada' });
    }

    res.status(200).json({ mensagem: 'Transação excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao excluir transação', erro: error.message });
  }
};

module.exports = { criar, listar, buscarPorId, atualizar, remover };
