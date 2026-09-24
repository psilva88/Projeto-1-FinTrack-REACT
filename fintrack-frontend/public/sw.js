// Service Worker do FinTrack
// Estratégias: Cache First para os arquivos do app,
// Network First para as chamadas da API.

const VERSAO = "fintrack-v1";

const ARQUIVOS_ESSENCIAIS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icone-192.png",
  "/icone-512.png",
];


// Instalação: guarda os arquivos básicos no cache
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(VERSAO)
      .then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
      .then(() => self.skipWaiting())
  );
});


// Ativação: apaga caches de versões antigas
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((chave) => chave !== VERSAO)
            .map((chave) => caches.delete(chave))
        )
      )
      .then(() => self.clients.claim())
  );
});


self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;

  // O service worker só trata requisições GET
  if (requisicao.method !== "GET") {
    return;
  }

  const url = new URL(requisicao.url);

  // Requisições para a API não são cacheadas como arquivo:
  // saldo e transações precisam vir atualizados
  const ehApi =
    url.pathname.startsWith("/graphql") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/contas") ||
    url.pathname.startsWith("/categorias") ||
    url.pathname.startsWith("/transacoes") ||
    url.pathname.startsWith("/usuarios");

  if (ehApi) {
    evento.respondWith(networkFirst(requisicao));
    return;
  }

  // Navegação entre telas: tenta a rede e cai no offline.html
  if (requisicao.mode === "navigate") {
    evento.respondWith(
      fetch(requisicao).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  evento.respondWith(cacheFirst(requisicao));
});


// Cache First: entrega do cache e só busca na rede se não tiver
async function cacheFirst(requisicao) {
  const emCache = await caches.match(requisicao);

  if (emCache) {
    return emCache;
  }

  try {
    const resposta = await fetch(requisicao);

    // Guarda apenas respostas válidas do próprio site
    if (resposta.ok && requisicao.url.startsWith(self.location.origin)) {
      const cache = await caches.open(VERSAO);

      cache.put(requisicao, resposta.clone());
    }

    return resposta;
  } catch {
    return caches.match("/offline.html");
  }
}


// Network First: tenta a rede e, se falhar, usa a última resposta guardada
async function networkFirst(requisicao) {
  try {
    const resposta = await fetch(requisicao);

    if (resposta.ok) {
      const cache = await caches.open(VERSAO);

      cache.put(requisicao, resposta.clone());
    }

    return resposta;
  } catch {
    const emCache = await caches.match(requisicao);

    if (emCache) {
      return emCache;
    }

    return new Response(
      JSON.stringify({
        mensagem: "Você está offline. Não foi possível consultar os dados.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
