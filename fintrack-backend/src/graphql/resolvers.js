const mongoose = require('mongoose');
const { GraphQLError } = require('graphql');

const Usuario = require('../models/Usuario');
const Conta = require('../models/Conta');
const Categoria = require('../models/Categoria');
const Transacao = require('../models/Transacao');

const exigirLogin = (contexto) => {
  if (!contexto.usuario) {
    throw new GraphQLError('Não autenticado', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }

  return new mongoose.Types.ObjectId(contexto.usuario.id);
};

/**
 * Confere se a conta e a categoria pertencem ao usuário logado.
 * Mesma regra usada no controller REST de transações.
 */
const validarVinculos = async (contaId, categoriaId, usuarioId) => {
  const conta = await Conta.findOne({ _id: contaId, usuario: usuarioId });

  if (!conta) {
    throw new GraphQLError('Conta não encontrada', {
      extensions: { code: 'NOT_FOUND' }
    });
  }

  const categoria = await Categoria.findOne({ _id: categoriaId, usuario: usuarioId });

  if (!categoria) {
    throw new GraphQLError('Categoria não encontrada', {
      extensions: { code: 'NOT_FOUND' }
    });
  }
};

/** Monta o filtro de período usado em várias queries */
const filtroPeriodo = (inicio, fim) => {  if (!inicio && !fim) return {};

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

    contas: async (_, __, contexto) => {
      const usuarioId = exigirLogin(contexto);

      return Conta.find({ usuario: usuarioId }).sort({ nome: 1 });
    },

    categorias: async (_, { tipo }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      const filtro = { usuario: usuarioId };

      if (tipo) {
        filtro.tipo = tipo;
      }

      return Categoria.find(filtro).sort({ nome: 1 });
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
  },

  Mutation: {
    criarConta: async (_, args, contexto) => {
      const usuarioId = exigirLogin(contexto);

      try {
        return await Conta.create({
          nome: args.nome,
          tipo: args.tipo,
          saldoInicial: args.saldoInicial || 0,
          usuario: usuarioId
        });
      } catch (erro) {
        // Índice composto: o mesmo usuário não pode repetir o nome da conta
        if (erro.code === 11000) {
          throw new GraphQLError('Você já possui uma conta com esse nome', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        throw new GraphQLError(erro.message, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
    },

    atualizarConta: async (_, { id, ...campos }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      const conta = await Conta.findOne({ _id: id, usuario: usuarioId });

      if (!conta) {
        throw new GraphQLError('Conta não encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Só aplica os campos que vieram na mutation
      Object.keys(campos).forEach((chave) => {
        if (campos[chave] !== undefined && campos[chave] !== null) {
          conta[chave] = campos[chave];
        }
      });

      await conta.save();

      return conta;
    },

    excluirConta: async (_, { id }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      // Mesma regra do REST: não deixa conta com transação virar registro órfão
      const temTransacoes = await Transacao.exists({
        conta: id,
        usuario: usuarioId
      });

      if (temTransacoes) {
        throw new GraphQLError(
          'Não é possível excluir: existem transações vinculadas a esta conta',
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      const conta = await Conta.findOneAndDelete({ _id: id, usuario: usuarioId });

      if (!conta) {
        throw new GraphQLError('Conta não encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      return 'Conta excluída com sucesso';
    },

    criarCategoria: async (_, args, contexto) => {
      const usuarioId = exigirLogin(contexto);

      try {
        return await Categoria.create({
          nome: args.nome,
          tipo: args.tipo,
          usuario: usuarioId
        });
      } catch (erro) {
        if (erro.code === 11000) {
          throw new GraphQLError('Você já possui uma categoria com esse nome', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        throw new GraphQLError(erro.message, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
    },

    atualizarCategoria: async (_, { id, ...campos }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      const categoria = await Categoria.findOne({ _id: id, usuario: usuarioId });

      if (!categoria) {
        throw new GraphQLError('Categoria não encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      Object.keys(campos).forEach((chave) => {
        if (campos[chave] !== undefined && campos[chave] !== null) {
          categoria[chave] = campos[chave];
        }
      });

      await categoria.save();

      return categoria;
    },

    excluirCategoria: async (_, { id }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      const temTransacoes = await Transacao.exists({
        categoria: id,
        usuario: usuarioId
      });

      if (temTransacoes) {
        throw new GraphQLError(
          'Não é possível excluir: existem transações vinculadas a esta categoria',
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      const categoria = await Categoria.findOneAndDelete({
        _id: id,
        usuario: usuarioId
      });

      if (!categoria) {
        throw new GraphQLError('Categoria não encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      return 'Categoria excluída com sucesso';
    },

    criarTransacao: async (_, args, contexto) => {
      const usuarioId = exigirLogin(contexto);

      await validarVinculos(args.conta, args.categoria, usuarioId);

      const transacao = await Transacao.create({
        descricao: args.descricao,
        valor: args.valor,
        tipo: args.tipo,
        data: args.data || new Date(),
        conta: args.conta,
        categoria: args.categoria,
        usuario: usuarioId
      });

      await transacao.populate(['conta', 'categoria']);

      return transacao;
    },

    atualizarTransacao: async (_, { id, ...campos }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      const atual = await Transacao.findOne({ _id: id, usuario: usuarioId });

      if (!atual) {
        throw new GraphQLError('Transação não encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Se estiver trocando a conta ou a categoria, valida os novos vínculos
      if (campos.conta || campos.categoria) {
        await validarVinculos(
          campos.conta || atual.conta,
          campos.categoria || atual.categoria,
          usuarioId
        );
      }

      // Só aplica os campos que vieram na mutation
      Object.keys(campos).forEach((chave) => {
        if (campos[chave] !== undefined && campos[chave] !== null) {
          atual[chave] = campos[chave];
        }
      });

      await atual.save();
      await atual.populate(['conta', 'categoria']);

      return atual;
    },

    excluirTransacao: async (_, { id }, contexto) => {
      const usuarioId = exigirLogin(contexto);

      const transacao = await Transacao.findOneAndDelete({
        _id: id,
        usuario: usuarioId
      });

      if (!transacao) {
        throw new GraphQLError('Transação não encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      return 'Transação excluída com sucesso';
    }
  }
};

module.exports = resolvers;
