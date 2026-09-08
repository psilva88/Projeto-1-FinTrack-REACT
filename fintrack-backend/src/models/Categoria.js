const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome da categoria é obrigatório'],
      trim: true
    },

    tipo: {
      type: String,
      required: [true, 'O tipo da categoria é obrigatório'],
      enum: ['receita', 'despesa']
    },

    // Relacionamento muitos-para-um: muitas Categorias para um Usuario
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    }
  },
  { timestamps: true }
);

categoriaSchema.index({ usuario: 1, nome: 1 }, { unique: true });

module.exports = mongoose.model('Categoria', categoriaSchema);
