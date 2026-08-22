const mongoose = require('mongoose');

const contaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome da conta é obrigatório'],
      trim: true
    },

    tipo: {
      type: String,
      required: [true, 'O tipo da conta é obrigatório'],
      enum: ['carteira', 'banco', 'cartao']
    },

    saldoInicial: {
      type: Number,
      default: 0
    },

    // Relacionamento muitos-para-um: muitas Contas para um Usuario
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    }
  },
  { timestamps: true }
);

// Impede que o mesmo usuário crie duas contas com o mesmo nome
contaSchema.index({ usuario: 1, nome: 1 }, { unique: true });

module.exports = mongoose.model('Conta', contaSchema);
