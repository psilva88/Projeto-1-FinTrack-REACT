// Centraliza a leitura dos erros do Apollo para as telas
// sempre mostrarem a mensagem que o backend enviou.
export function mensagemDeErro(error) {
  if (!error) {
    return "";
  }

  // Erros de regra de negócio chegam dentro de "errors"
  if (error.graphQLErrors?.length > 0) {
    return error.graphQLErrors[0].message;
  }

  // Servidor fora do ar, sem internet ou CORS bloqueado
  if (error.networkError) {
    return "Não foi possível conectar ao servidor. Verifique se a API está rodando.";
  }

  return error.message || "Ocorreu um erro inesperado.";
}
