const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const jwt = require('jsonwebtoken');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

/**
 * Lê o token do cabeçalho Authorization e devolve os dados do usuário.
 * Se não houver token ou ele for inválido, devolve null — quem decide
 * bloquear é o exigirLogin() dentro de cada resolver.
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
 * Precisa ser async porque o server.start() é assíncrono.
 */
const criarMiddlewareGraphQL = async () => {
  const apollo = new ApolloServer({ typeDefs, resolvers });

  await apollo.start();

  return expressMiddleware(apollo, { context: montarContexto });
};

module.exports = criarMiddlewareGraphQL;
