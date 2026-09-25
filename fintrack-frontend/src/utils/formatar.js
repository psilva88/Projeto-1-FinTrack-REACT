export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}


export function formatarData(valor) {
  if (!valor) {
    return "";
  }

  // A data vem do backend em ISO; exibimos no formato brasileiro
  return new Date(valor).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}
