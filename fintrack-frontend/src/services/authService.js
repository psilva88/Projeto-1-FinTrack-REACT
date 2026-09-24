// Camada de serviço: concentra as chamadas à API de autenticação.
// As telas não chamam fetch diretamente, só usam estas funções.

const API_URL = import.meta.env.VITE_API_URL;


export async function login(email, senha) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
  } catch {
    // fetch só falha assim quando o servidor está fora do ar
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se a API está rodando."
    );
  }

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || "Não foi possível entrar");
  }

  return dados;
}


export async function cadastrar(nome, email, senha) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se a API está rodando."
    );
  }

  const dados = await resposta.json();

  if (!resposta.ok) {
    // O backend devolve a lista "erros" quando a validação do Mongoose falha
    if (dados.erros?.length > 0) {
      throw new Error(dados.erros.join(". "));
    }

    throw new Error(dados.mensagem || "Não foi possível cadastrar");
  }

  return dados;
}
