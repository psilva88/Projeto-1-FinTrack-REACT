require('dotenv').config();

const express = require('express');
const cors = require('cors');
const conectarBanco = require('./database');
const criarMiddlewareGraphQL = require('./graphql');

const iniciar = async () => {
  const app = express();

  // Libera o frontend (Vite, porta 5173) a consumir a API
  app.use(cors());

  app.use(express.json());

  await conectarBanco();

  // Rota de teste — confirma que o servidor está no ar
  app.get('/', (req, res) => {
    res.json({ mensagem: 'API FinTrack rodando!' });
  });

  // Rotas REST
  app.use('/auth', require('./routes/authRoutes'));
  app.use('/usuarios', require('./routes/usuarioRoutes'));
  app.use('/contas', require('./routes/contaRoutes'));
  app.use('/categorias', require('./routes/categoriaRoutes'));
  app.use('/transacoes', require('./routes/transacaoRoutes'));

  // Endpoint GraphQL
  app.use('/graphql', await criarMiddlewareGraphQL());

  // Rota não encontrada
  app.use((req, res) => {
    res.status(404).json({ mensagem: 'Rota não encontrada' });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`REST:    http://localhost:${PORT}`);
    console.log(`GraphQL: http://localhost:${PORT}/graphql`);
  });
};

iniciar();
