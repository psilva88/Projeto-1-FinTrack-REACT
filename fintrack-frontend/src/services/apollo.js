import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";


const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});


// Envia o token do usuário logado em toda requisição GraphQL
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});


// Se o token expirar, limpa a sessão e devolve o usuário ao login
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((erro) => {
      console.error("[GraphQL]", erro.message);
    });
  }

  if (networkError) {
    console.error("[Rede]", networkError.message);
  }

  const expirou = graphQLErrors?.some(
    (erro) => erro.extensions?.code === "UNAUTHENTICATED"
  );

  // Só redireciona se já havia sessão, para não interromper quem está no login
  if (expirou && localStorage.getItem("token")) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    window.location.href = "/login";
  }
});


const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});


export default client;
