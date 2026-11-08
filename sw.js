const CACHE = "abba-mea-v44";
const ASSETS = [
  "./", "./index.html", "./style.css", "./app.js", "./sync.js", "./voies.js", "./ministeres.js", "./declaration.js", "./voixNative.js", "./i18n.js", "./lang/en.json",
  "./firebase-config.js", "./manifest.json", "./logo.png",
  "./icon-192.png", "./icon-512.png",
  "/abba-batisseur/habillage.css", "/abba-batisseur/habillage.js", "/abba-batisseur/barre.js", "/abba-batisseur/fond-accueil.webp",
  // La bibliothèque Firebase elle-même (fichiers versionnés) : indispensable pour que l'app puisse démarrer SANS connexion.
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js",
];

// Le réseau d'abord (toujours la dernière version quand il y a du réseau, sans passer par le cache HTTP du téléphone),
// le cache en secours : hors ligne, ou si le réseau met plus de 6 secondes à répondre.
function reseauPuisCache(req, nomCache) {
  const cacheOuvert = caches.open(nomCache);
  const reseau = fetch(new Request(req, { cache: "no-cache" })).then((res) => {
    if (res && res.ok && res.type !== "opaque") { const copie = res.clone(); cacheOuvert.then((c) => c.put(req, copie)); }
    return res;
  });
  const secours = () => cacheOuvert.then((c) => c.match(req)).then((hit) => hit || reseau);
  const delai = new Promise((resolve) => setTimeout(() => resolve(secours()), 6000));
  return Promise.race([reseau.catch(secours), delai]);
}

// Installation : mettre tous les fichiers en cache immédiatement
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(u => fetch(new Request(u, { cache: "reload" })).then(r => (r.ok ? c.put(u, r) : null)).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

// Activation : supprimer les anciens caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch : réseau d'abord, cache en secours (hors ligne garanti)
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Bibliothèque Firebase (fichiers versionnés) : le cache d'abord, pour démarrer sans connexion
  if (e.request.method === "GET" && url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/")) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); } return res; })));
    return;
  }

  // Les vraies requêtes Firebase / Google (données, connexion) : réseau uniquement, jamais en cache
  if (url.hostname.includes("firebase") ||
      url.hostname.includes("googleapis") ||
      url.hostname.includes("gstatic") ||
      url.hostname.includes("firebaseio")) {
    return; // le navigateur gère directement
  }

  // Fichiers de l'app : le réseau d'abord, le cache en secours
  if (e.request.method !== "GET") return;
  e.respondWith(reseauPuisCache(e.request, CACHE));
});
