const mongoose = require('mongoose');

const transacaoSchema = new mongoose.Schema(
  {
    descricao: {
      type: String,
      required: [true, 'A descrição é obrigatória'],
      trim: true
    },

    valor: {
      type: Number,
      required: [true, 'O valor é obrigatório'],
      min: [0.01, 'O valor deve ser maior que zero']
    },

    tipo: {
      type: String,
      required: [true, 'O tipo é obrigatório'],
      enum: ['receita', 'despesa']
    },

    data: {
      type: Date,
      required: [true, 'A data é obrigatória'],
      default: Date.now
    },

    // Relacionamentos muitos-para-um
    conta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conta',
      required: true
    },

    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: true
    },

    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    }
  },
  { timestamps: true }
);

transacaoSchema.index({ usuario: 1, data: -1 });

module.exports = mongoose.model('Transacao', transacaoSchema);
