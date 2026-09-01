const mongoose = require('mongoose');
const { GraphQLError } = require('graphql');

const Usuario = require('../models/Usuario');
const Conta = require('../models/Conta');
const Categoria = require('../models/Categoria');
const Transacao = require('../models/Transacao');

const exigirLogin = (contexto) => {
  if (!contexto.usuario) {
    throw new GraphQLError('Não autenticado', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } }
    });
  }

  return new mongoose.Types.ObjectId(contexto.usuario.id);
};

/** Monta o filtro de período usado em várias queries */
const filtroPeriodo = (inicio, fim) => {
  if (!inicio && !fim) return {};

  const data = {};
  if (inicio) data.$gte = new Date(inicio);
  if (fim) data.$lte = new Date(`${fim}T23:59:59.999Z`);

  return { data };
};

/** Calcula o saldo de cada conta do usuário */
const calcularSaldoPorConta = async (usuarioId) => {
  const contas = await Conta.find({ usuario: usuarioId }).sort({ nome: 1 });

  const totais = await Transacao.aggregate([
    { $match: { usuario: usuarioId } },
    {
      $group: {
        _id: { conta: '$conta', tipo: '$tipo' },
        total: { $sum: '$valor' },
        quantidade: { $sum: 1 }
      }
    }
  ]);

  return contas.map((conta) => {
    const receitas = totais.find(
      (t) => String(t._id.conta) === String(conta._id) && t._id.tipo === 'receita'
    );

    const despesas = totais.find(
      (t) => String(t._id.conta) === String(conta._id) && t._id.tipo === 'despesa'
    );

    const somaReceitas = receitas ? receitas.total : 0;
    const somaDespesas = despesas ? despesas.total : 0;

    return {
      conta,
      receitas: somaReceitas,
      despesas: somaDespesas,
      saldo: conta.saldoInicial + somaReceitas - somaDespesas,
      totalTransacoes:
        (receitas ? receitas.quantidade : 0) + (despesas ? despesas.quantidade : 0)
    };
  });
};

/** Agrupa as despesas por categoria e calcula o percentual de cada uma */
const calcularGastosPorCategoria = async (usuarioId, inicio, fim) => {
  const agrupado = await Transacao.aggregate([
    {
      $match: {
        usuario: usuarioId,
        tipo: 'despesa',
        ...filtroPeriodo(inicio, fim)
      }
    },
    {
      $group: {
        _id: '$categoria',
        total: { $sum: '$valor' },
        quantidade: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const totalGeral = agrupado.reduce((soma, item) => soma + item.total, 0);

  const categorias = await Categoria.find({
    _id: { $in: agrupado.map((i) => i._id) }
  });

  return agrupado.map((item) => ({
    categoria: categorias.find((c) => String(c._id) === String(item._id)),
    total: item.total,
    quantidade: item.quantidade,
    percentual: totalGeral > 0 ? Number(((item.total / totalGeral) * 100).toFixed(2)) : 0
  }));
};

const resolvers = {
  Usuario: { id: (doc) => doc._id },
  Conta: { id: (doc) => doc._id },
  Categoria: { id: (doc) => doc._id },
  Transacao: {
    id: (doc) => doc._id,
    data: (doc) => doc.data.toISOString()
  },

  Query: {
    eu: async (_, __, contexto) => {
      const usuarioId = exigirLogin(contexto);
      return Usuario.findById(usuarioId);
    },

    saldoPorConta: async (_, __, contexto) => {
      const usuarioId = exigirLogin(contexto);
      return calcularSaldoPorConta(usuarioId);
    },

    gastosPorCategoria: async (_, { inicio, fim }, contexto) => {
      const usuarioId = exigirLogin(contexto);
      return calcularGastosPorCategoria(usuarioId, inicio, fim);
    },

    resumoMensal: async (_, { mes, ano }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      if (mes < 1 || mes > 12) {
        throw new GraphQLError('Mês deve estar entre 1 e 12', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      const inicio = new Date(Date.UTC(ano, mes - 1, 1));
      const fim = new Date(Date.UTC(ano, mes, 0, 23, 59, 59, 999));

      const totais = await Transacao.aggregate([
        { $match: { usuario: usuarioId, data: { $gte: inicio, $lte: fim } } },
        { $group: { _id: '$tipo', total: { $sum: '$valor' }, quantidade: { $sum: 1 } } }
      ]);

      const receitas = totais.find((t) => t._id === 'receita');
      const despesas = totais.find((t) => t._id === 'despesa');

      const totalReceitas = receitas ? receitas.total : 0;
      const totalDespesas = despesas ? despesas.total : 0;

      const gastos = await calcularGastosPorCategoria(
        usuarioId,
        inicio.toISOString().slice(0, 10),
        fim.toISOString().slice(0, 10)
      );

      return {
        mes,
        ano,
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        quantidadeTransacoes:
          (receitas ? receitas.quantidade : 0) + (despesas ? despesas.quantidade : 0),
        gastosPorCategoria: gastos
      };
    },

    transacoesComRelacoes: async (_, args, contexto) => {
      const usuarioId = exigirLogin(contexto);

      const filtro = { usuario: usuarioId, ...filtroPeriodo(args.inicio, args.fim) };

      if (args.tipo) filtro.tipo = args.tipo;
      if (args.conta) filtro.conta = args.conta;
      if (args.categoria) filtro.categoria = args.categoria;

      return Transacao.find(filtro)
        .populate('conta')
        .populate('categoria')
        .sort({ data: -1 })
        .limit(Math.min(args.limite || 50, 200));
    },

    dashboard: async (_, { inicio, fim }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      // As três consultas rodam em paralelo
      const [saldos, gastos, ultimas] = await Promise.all([
        calcularSaldoPorConta(usuarioId),
        calcularGastosPorCategoria(usuarioId, inicio, fim),
        Transacao.find({ usuario: usuarioId })
          .populate('conta')
          .populate('categoria')
          .sort({ data: -1 })
          .limit(5)
      ]);

      return {
        saldoGeral: saldos.reduce((soma, item) => soma + item.saldo, 0),
        saldoPorConta: saldos,
        gastosPorCategoria: gastos,
        ultimasTransacoes: ultimas
      };
    }
  }
};

module.exports = resolvers;
