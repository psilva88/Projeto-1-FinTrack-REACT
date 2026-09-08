const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const jwt = require('jsonwebtoken');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

/**
 * Lê o token do cabeçalho Authorization e devolve os dados do usuário.
 */
const montarContexto = async ({ req }) => {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return { usuario: null };
  }

  try {
    const decodificado = jwt.verify(cabecalho.split(' ')[1], process.env.JWT_SECRET);
    return { usuario: { id: decodificado.id, papel: decodificado.papel } };
  } catch (error) {
    return { usuario: null };
  }
};

/**
 * Cria o Apollo Server e devolve o middleware pronto para o Express.
 */
const criarMiddlewareGraphQL = async () => {
  const apollo = new ApolloServer({ typeDefs, resolvers });

  await apollo.start();

  return expressMiddleware(apollo, { context: montarContexto });
};

module.exports = criarMiddlewareGraphQL;
