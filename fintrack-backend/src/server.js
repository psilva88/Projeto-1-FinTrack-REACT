require('dotenv').config();

const express = require('express');
const conectarBanco = require('./database');

const app = express();

app.use(express.json());

conectarBanco();

// Rota de teste — confirma que o servidor está no ar
app.get('/', (req, res) => {
  res.json({ mensagem: 'API FinTrack rodando!' });
});

// As rotas entram aqui nos próximos passos
// app.use('/auth', require('./routes/authRoutes'));
// app.use('/contas', require('./routes/contaRoutes'));
// app.use('/categorias', require('./routes/categoriaRoutes'));
// app.use('/transacoes', require('./routes/transacaoRoutes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
