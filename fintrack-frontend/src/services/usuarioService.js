// Camada de serviço da gestão de usuários.
// Essas rotas são REST desde a Fase 1, então o painel de administração
// consome a API REST aqui, enquanto os relatórios continuam no GraphQL.

const API_URL = import.meta.env.VITE_API_URL;


function cabecalhos() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}


// Confere o status antes de converter o corpo: uma resposta de erro
// pode vir vazia, e aí o .json() quebraria com uma mensagem confusa
async function tratarResposta(resposta) {
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : {};

  if (!resposta.ok) {
    if (dados.erros?.length > 0) {
      throw new Error(dados.erros.join(". "));
    }

    throw new Error(dados.mensagem || "Não foi possível completar a operação");
  }

  return dados;
}


async function chamar(caminho, opcoes = {}) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: cabecalhos(),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se a API está rodando."
    );
  }

  return tratarResposta(resposta);
}


export function listar() {
  return chamar("/usuarios");
}


// Quantidade de registros do usuário, usada no aviso de exclusão
export function resumo(id) {
  return chamar(`/usuarios/${id}/resumo`);
}


export function alterarPapel(id, papel) {
  return chamar(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify({ papel }),
  });
}


export function excluir(id) {
  return chamar(`/usuarios/${id}`, { method: "DELETE" });
}
