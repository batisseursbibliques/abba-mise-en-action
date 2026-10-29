/* ============================================================
   ABBA Mise en Action — app.js
   Phase 2 du Parcours Bâtisseur
   Même projet Firebase qu'ABBA Life et Parcours Bâtisseur.
   ============================================================ */

// ── Constantes ────────────────────────────────────────────────
const DIMENSIONS = [
  { key: "esprit",       label: "Spirituelle",     icone: "🙏" },
  { key: "psychologie",  label: "Psychologique",   icone: "🧠" },
  { key: "physique",     label: "Physique",         icone: "💪" },
  { key: "subsistance",  label: "Subsistance",      icone: "🏠" },
  { key: "education",    label: "Éducative",        icone: "📚" },
  { key: "profession",   label: "Professionnelle",  icone: "💼" },
  { key: "finance",      label: "Financière",       icone: "💰" },
  { key: "societe",      label: "Sociale",          icone: "🤝" },
];

const MODULES_14 = [
  "Disciple de Christ",
  "Guérir des blessures de l'âme",
  "Cure d'âme personnelle",
  "Aimer",
  "Bâtir le caractère",
  "Relation avec le Saint-Esprit",
  "Victoire par la prière",
  "Le monde spirituel",
  "Évangélisation / Guérison / Délivrance",
  "Les ministères de Dieu",
  "Maîtriser sa santé et son argent",
  "Les tests de la République",
  "Premiers secours",
  "Entrepreneuriat / Leadership / Gestion de projet",
];

// Échelle des 8 dimensions : 1 à 5 (comme l'auto-évaluation de Parcours).
// Les anciennes notes sur 10 (données de test) sont ramenées sur 5 à l'affichage.
// Échappe le texte venant d'ailleurs (noms, etc.) avant de l'afficher dans la page
const escapeAttr = (t) => String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const n5 = (v) => { v = Number(v) || 0; return v > 5 ? Math.round(v / 2) : v; };

const LEADERSHIP_COMPETENCES = [
  "Vision et direction",
  "Communication efficace",
  "Prise de décision",
  "Gestion d'équipe",
  "Résolution de conflits",
  "Intelligence émotionnelle",
  "Intégrité et éthique",
  "Innovation et créativité",
  "Résilience",
  "Mentorat et formation",
];

const MOIS_LABELS = ["Mois 1","Mois 2","Mois 3","Mois 4","Mois 5","Mois 6"];
const MOIS_KEYS   = ["mois1","mois2","mois3","mois4","mois5","mois6"];

// ── État global ────────────────────────────────────────────────
let CURRENT_USER   = null;
let IS_ADMIN       = false;
let IS_MENTOR      = false;
let MY_PDP         = {};
let MY_RENCONTRES  = {};
let ALL_USERS      = [];   // { uid, nom, prenom, email, … }
let ALL_MENTORS    = [];   // { email, uid, nom }
let ALL_ASSIGNMENTS = [];  // { batisseurUid, mentorEmail, mentorUid, mentorNom }
let MY_ASSIGNMENT  = null;
let SUIVI_DATA     = [];   // résumés chargés pour le mentor/admin

let unsubAdmins    = null;
let unsubPDP       = null;
let unsubRencontres = null;
let unsubMentors   = null;   // liste complète des mentors (coordinateurs seulement)
let unsubMyRole    = null;   // ma propre fiche de mentor (tout le monde)
let ADMIN_OUVERT   = false;  // vrai une fois l'écran Admin chargé

// ─────────────────────────────────────────────────────────────
// ENTRÉE AVEC LE NUMÉRO D'UN CERTIFICAT (Parcours suivi hors de l'application)
// ─────────────────────────────────────────────────────────────
const CODES_PAYS = ["AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU", "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"];

function afficherReclamation(user) {
  afficherVerrou(`<h2>🔒 Mise en Action</h2>
    <p>La Mise en Action s’ouvre quand ton <strong>certificat de fin de formation</strong> du Parcours Bâtisseur est délivré.</p>
    <p>Termine tes modules dans le Parcours : ton coordinateur te délivrera ensuite ton certificat.</p>
    <hr style="margin:16px 0;opacity:.3;">
    <p><strong>Tu as déjà ton certificat</strong> (formation suivie hors de l’application) ? Saisis son numéro ou scanne son QR code.</p>
    <input id="certNumInput" class="text-input" placeholder="ABBA-P-XXXX-XXXX" autocomplete="off" autocapitalize="characters" style="text-align:center;">
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button id="certVerifBtn" class="btn-primary" type="button" style="flex:1;">Vérifier</button>
      <button id="certScanBtn" class="btn-secondary" type="button">📷 Scanner</button>
    </div>
    <div id="certResultat" style="margin-top:12px;text-align:left;"></div>
    <p style="margin-top:16px;"><a href="../ABBA-Parcours/">← Retour au Parcours Bâtisseur</a></p>`);
  const input = document.getElementById("certNumInput");
  const verifier = () => verifierNumeroSaisi(user);
  document.getElementById("certVerifBtn").addEventListener("click", verifier);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") verifier(); });
  document.getElementById("certScanBtn").addEventListener("click", () => {
    scannerQR((numero) => { input.value = numero; verifier(); }, document.getElementById("certResultat"));
  });
}

async function verifierNumeroSaisi(user) {
  const res = document.getElementById("certResultat");
  res.textContent = "Vérification…";
  const r = await window.AbbaSync.verifierNumeroCertificat(document.getElementById("certNumInput").value);
  if (r.erreur === "format") { res.innerHTML = "<p>Ce numéro n’a pas le bon format. Il ressemble à <strong>ABBA-P-XXXX-XXXX</strong>.</p>"; return; }
  if (r.erreur === "reseau") { res.innerHTML = "<p>Impossible de vérifier pour le moment. Vérifie ta connexion et réessaie.</p>"; return; }
  if (r.erreur === "inconnu") { res.innerHTML = "<p>Aucun certificat de fin de formation ne correspond à ce numéro. Vérifie-le sur ton certificat.</p>"; return; }
  const paysCompte = await window.AbbaSync.getMonPays(user.uid);
  const choixPays = paysCompte ? "" : `
    <label style="display:block;margin-top:8px;">Ton pays
      <select id="certPaysSel" class="text-input"><option value="">— Choisir —</option>${
        CODES_PAYS.map(c => ({ c, n: nomPays(c) })).sort((a, b) => a.n.localeCompare(b.n, "fr"))
          .map(x => `<option value="${x.c}">${escapeAttr(x.n)}</option>`).join("")}</select>
    </label>`;
  res.innerHTML = `
    <p>Certificat au nom de <strong>${escapeAttr(r.nom)}</strong>.</p>
    ${choixPays}
    <label style="display:flex;gap:8px;align-items:center;margin-top:8px;">
      <input type="checkbox" id="certMoi"> <span>C’est bien mon certificat</span>
    </label>
    <button id="certConfirmBtn" class="btn-primary" type="button" style="margin-top:10px;width:100%;" disabled>Entrer dans la Mise en Action</button>
    <p id="certMsg" class="settings-hint" style="margin-top:8px;"></p>`;
  const cb = document.getElementById("certMoi"), btn = document.getElementById("certConfirmBtn"), msg = document.getElementById("certMsg");
  const maj = () => { btn.disabled = !cb.checked || (!paysCompte && !document.getElementById("certPaysSel").value); };
  cb.addEventListener("change", maj);
  document.getElementById("certPaysSel")?.addEventListener("change", maj);
  btn.addEventListener("click", async () => {
    btn.disabled = true; msg.textContent = "Enregistrement…";
    try {
      const pays = paysCompte || document.getElementById("certPaysSel").value;
      await window.AbbaSync.reclamerNumero(user, r, pays);
      location.reload();
    } catch (e) {
      console.error(e);
      msg.textContent = (e && e.code === "permission-denied")
        ? "Ce numéro ne peut pas être utilisé avec ce compte (il a peut-être déjà servi). Contacte ton coordinateur."
        : "Impossible d’enregistrer pour le moment. Vérifie ta connexion et réessaie.";
      btn.disabled = false;
    }
  });
}

// Scan du QR code du certificat avec la caméra (si le téléphone le permet) ; sinon on invite à saisir le numéro
async function scannerQR(auNumero, zoneMsg) {
  const saisir = (t) => { zoneMsg.innerHTML = `<p>${t} Saisis plutôt le numéro écrit sur le certificat.</p>`; };
  if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) { saisir("Le scan n’est pas disponible sur cet appareil."); return; }
  let flux;
  try { flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); }
  catch (e) { saisir("Impossible d’ouvrir la caméra."); return; }
  const voile = document.createElement("div");
  voile.style.cssText = "position:fixed;inset:0;background:#000;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;";
  voile.innerHTML = `<video playsinline muted autoplay style="width:100%;max-height:70vh;object-fit:cover;"></video>
    <p style="color:#fff;margin:0;">Place le QR code du certificat dans le cadre</p>
    <button class="btn-secondary" type="button">Fermer</button>`;
  document.body.appendChild(voile);
  const video = voile.querySelector("video");
  video.srcObject = flux;
  let actif = true;
  const fermer = () => { actif = false; flux.getTracks().forEach(t => t.stop()); voile.remove(); };
  voile.querySelector("button").addEventListener("click", fermer);
  const detecteur = new BarcodeDetector({ formats: ["qr_code"] });
  while (actif) {
    try {
      for (const c of await detecteur.detect(video)) {
        const m = /ABBA-P-[A-Z0-9]{4}-[A-Z0-9]{4}/i.exec(c.rawValue || "");
        if (m) { fermer(); auNumero(m[0].toUpperCase()); return; }
      }
    } catch (e) { /* image pas prête : on réessaie */ }
    await new Promise(r => setTimeout(r, 300));
  }
}

// Côté coordinateurs : demandes d'entrée en attente (nom du certificat différent du nom du compte)
async function chargerDemandesAcces() {
  const carte = document.getElementById("demandesAccesCard");
  const zone = document.getElementById("demandesAccesList");
  if (!carte || !zone || !CURRENT_USER) return;
  let liste = [];
  try { liste = await window.AbbaSync.listDemandesAcces(); } catch (e) { carte.hidden = true; return; }
  const estPPV = window.AbbaSync.isAdminEmail(CURRENT_USER.email);
  const role = estPPV ? null : await window.AbbaSync.getMonRoleAdmin(CURRENT_USER.email);
  // Je ne vois que les demandes sur lesquelles je peux agir : toutes pour le PPV, celles de mon pays pour un coordinateur national
  const visibles = liste.filter(d => estPPV || (role && role.fonction === "national" && role.pays === d.pays));
  carte.hidden = false;
  if (!visibles.length) { zone.innerHTML = "<p class='settings-hint'>Aucune demande en attente.</p>"; return; }
  const certs = await Promise.all(visibles.map(d => window.AbbaSync.verifierNumeroCertificat(d.numero)));
  zone.innerHTML = visibles.map((d, i) => `
    <div class="mentor-chip" style="display:block;margin-bottom:8px;">
      <div><strong>${escapeAttr(certs[i].nom || "—")}</strong> · ${escapeAttr(nomPays(d.pays))}</div>
      <div class="settings-hint">Compte : ${escapeAttr(d.email)} · N° ${escapeAttr(d.numero)}</div>
      <div style="display:flex;gap:8px;margin-top:6px;">
        <button class="btn-primary" type="button" data-acces="valider" data-numero="${escapeAttr(d.numero)}">Valider</button>
        <button class="btn-secondary" type="button" data-acces="refuser" data-numero="${escapeAttr(d.numero)}">Refuser</button>
      </div>
    </div>`).join("");
  zone.querySelectorAll("button[data-acces]").forEach(b => b.addEventListener("click", async () => {
    const numero = b.dataset.numero, valider = b.dataset.acces === "valider";
    if (!valider && !confirm("Refuser cette demande ? Le numéro sera libéré et pourra être utilisé par la bonne personne.")) return;
    b.disabled = true;
    try { valider ? await window.AbbaSync.validerDemandeAcces(numero) : await window.AbbaSync.refuserDemandeAcces(numero); }
    catch (e) { alert("Action impossible : " + (e.code || e.message)); }
    chargerDemandesAcces();
  }));
}

// Écran de verrouillage (accès pas encore ouvert)
function afficherVerrou(html) {
  document.getElementById("app").style.display = "none";
  const box = document.createElement("div");
  box.id = "paiementLock";
  box.style.cssText = "max-width:520px;margin:12vh auto;padding:24px;text-align:center;";
  box.innerHTML = html;
  document.body.appendChild(box);
}

// ── Init ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupTabs();
  setupAuth();
  setupPdpNav();
  setupRencontresNav();
  window.AbbaSync.watchAuth(onAuthChanged);
});

// ── Thème clair / sombre ──────────────────────────────────────
function setupTheme() {
  const saved = localStorage.getItem("mea-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  document.getElementById("themeToggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mea-theme", next);
  });
}

// ── Navigation onglets principaux ─────────────────────────────
function setupTabs() {
  function switchTab(name) {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
    document.querySelectorAll(".bnav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
    if (name === "suivi") loadSuivi();
    if (name === "admin") loadAdmin();
  }
  document.querySelectorAll(".tab, .bnav-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  document.querySelectorAll(".link-btn[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.goto));
  });
}

// ── Auth ──────────────────────────────────────────────────────
function setupAuth() {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const pw    = document.getElementById("loginPassword").value;
    const errEl = document.getElementById("loginError");
    errEl.textContent = "";
    try { await window.AbbaSync.logIn(email, pw); }
    catch (err) { errEl.textContent = traduireErreur(err); }
  });
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await window.AbbaSync.logOut();
  });
}

function traduireErreur(err) {
  const c = err && err.code ? err.code : "";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found"))
    return "E-mail ou mot de passe incorrect.";
  if (c.includes("invalid-email")) return "Adresse e-mail invalide.";
  if (c.includes("network-request-failed")) return "Pas de connexion internet.";
  return "Une erreur est survenue. Réessaie.";
}

async function onAuthChanged(user) {
  // Nettoyer les listeners
  [unsubAdmins, unsubPDP, unsubRencontres, unsubMentors, unsubMyRole].forEach(fn => fn && fn());
  unsubAdmins = unsubPDP = unsubRencontres = unsubMentors = unsubMyRole = null;
  ALL_MENTORS = [];

  if (!user) {
    CURRENT_USER = null; IS_ADMIN = false; IS_MENTOR = false; ADMIN_OUVERT = false;
    const verrou0 = document.getElementById("paiementLock"); if (verrou0) verrou0.remove();
    document.getElementById("authScreen").style.display = "flex";
    document.getElementById("app").style.display = "none";
    return;
  }

  CURRENT_USER = user;
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("app").style.display = "";
  const verrou = document.getElementById("paiementLock");
  if (verrou) verrou.remove();

  // ACCÈS. Les coordinateurs et les mentors entrent toujours.
  // Un bâtisseur entre quand (1) son certificat de fin de formation du Parcours est délivré
  // et (2) son paiement du Parcours est soldé (sans compte de paiement : pas de blocage).
  // En cas d'erreur de lecture (réseau), on n'empêche pas l'accès.
  let exempte = false;
  try { exempte = await window.AbbaSync.estExempte(user); } catch (e) { exempte = false; }
  if (!exempte) {
    try {
      const cert = await window.AbbaSync.getCertificatParcours(user.uid);
      if (!cert) {
        // Pas de certificat dans le compte : la personne a peut-être suivi le Parcours hors de l'application
        // et est entrée avec le numéro de son certificat (« valide » ou « attente »).
        let acces = null;
        try { acces = await window.AbbaSync.getMonAcces(user.uid); } catch (e) { acces = null; }
        if (!acces) { afficherReclamation(user); return; }
        if (acces.statut !== "valide") {
          afficherVerrou(`<h2>⏳ Mise en Action</h2>
            <p>Ta demande d’entrée avec le certificat <strong>N° ${escapeAttr(acces.numero)}</strong> est <strong>en attente de validation</strong>.</p>
            <p>Le nom écrit sur le certificat n’est pas exactement celui de ton compte. Le coordinateur national de ton pays (${escapeAttr(nomPays(acces.pays))}) doit vérifier ta demande. Reviens un peu plus tard.</p>
            <p><button class="btn-primary" type="button" onclick="location.reload()">Actualiser</button></p>
            <p><a href="../ABBA-Parcours/">← Retour au Parcours Bâtisseur</a></p>`);
          return;
        }
      }
    } catch (e) { /* lecture impossible : pas de blocage */ }
    try {
      const cp = await window.AbbaSync.getComptePaiement(user.uid);
      if (cp && cp.actif !== false && Number(cp.paye || 0) < Number(cp.total ?? 5000)) {
        afficherVerrou(`<h2>🔒 Mise en Action</h2>
          <p>La Mise en Action s’ouvre une fois les ${Number(cp.total ?? 5000).toLocaleString("fr-FR")} F du Parcours payés.</p>
          <p><strong>Versé : ${Number(cp.paye || 0).toLocaleString("fr-FR")} F sur ${Number(cp.total ?? 5000).toLocaleString("fr-FR")} F.</strong></p>
          <p>Termine ton paiement dans le Parcours Bâtisseur (carte « Mon paiement » de l’accueil), puis reviens ici.</p>
          <p><a href="../ABBA-Parcours/">← Retour au Parcours Bâtisseur</a></p>`);
        return;
      }
    } catch (e) { /* en cas d'erreur de lecture, on n'empêche pas l'accès */ }
  }

  const hint = `Connecté(e) en tant que ${user.displayName || user.email}`;
  document.getElementById("accueilEmail").textContent = hint;
  document.getElementById("accountEmailHint").textContent = hint;

  // Appliquer immédiatement les rôles admin bootstrap (sans attendre Firebase)
  if (window.AbbaSync.isAdminEmail(user.email)) {
    IS_ADMIN = true;
    applyRoles();
    startAllMentorsList();
  }

  // Charger profil utilisateur
  const profile = await window.AbbaSync.getUserProfile(user.uid) || {};
  document.getElementById("accueilSalut").textContent =
    profile.prenom ? `Bienvenue, ${profile.prenom} 👋` : "Phase 2 — Mise en Action";

  // S1 — mentor assigné (readonly)
  MY_ASSIGNMENT = await window.AbbaSync.getMyAssignment(user.uid);
  if (MY_ASSIGNMENT) {
    document.getElementById("s1Mentor").value = MY_ASSIGNMENT.mentorNom || MY_ASSIGNMENT.mentorEmail;
  }

  // Admins (listener — pour les admins dynamiques non-bootstrap)
  unsubAdmins = window.AbbaSync.watchAdmins((emails) => {
    const isBootstrap = window.AbbaSync.isAdminEmail(user.email);
    IS_ADMIN = isBootstrap || emails.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
    applyRoles();
    if (IS_ADMIN) startAllMentorsList();
  });

  // Mentors
  // Suis-je mentor ? On lit seulement ma propre fiche (les autres mentors ne sont visibles que des coordinateurs)
  unsubMyRole = window.AbbaSync.watchMyMentorRole(user.email, (estMentor) => {
    IS_MENTOR = !!estMentor;
    applyRoles();
  });

  // PDP
  unsubPDP = window.AbbaSync.watchMyPDP(user.uid, (data) => {
    MY_PDP = data;
    chargerPdpPreservantBrouillon();
    updatePdpProgress();
    updateAccueilPdpHint();
    afficherReprise();
    afficherReperesS3();
  });

  // Rencontres
  unsubRencontres = window.AbbaSync.watchMyRencontres(user.uid, (data) => {
    MY_RENCONTRES = data;
    renderRencontresPanel();
    updateBilan();
  });
}

// Liste complète des mentors : seulement pour les coordinateurs (les règles de sécurité l'exigent aussi)
function startAllMentorsList() {
  if (unsubMentors) return;
  unsubMentors = window.AbbaSync.watchMentors((list) => {
    ALL_MENTORS = list;
    // Si l'écran Admin est déjà ouvert, on le rafraîchit avec la liste qui vient d'arriver
    if (ADMIN_OUVERT) { renderMentorsList(); renderMentorSelect(); renderAssignSelects(); }
  });
}

function applyRoles() {
  const showMentor = IS_ADMIN || IS_MENTOR;
  document.querySelectorAll(".mentor-only, .admin-only").forEach(el => {
    el.style.display = showMentor ? "" : "none";
  });
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = IS_ADMIN ? "" : "none";
  });
  if (showMentor) {
    document.getElementById("tabSuivi").style.display = "";
    document.getElementById("bnavSuivi").style.display = "";
    document.getElementById("accueilSuiviCard").style.display = "";
  }
  if (IS_ADMIN) {
    document.getElementById("tabAdmin").style.display = "";
    document.getElementById("bnavAdmin").style.display = "";
  }
}

// ─────────────────────────────────────────────────────────────
// PDP — navigation sections
// ─────────────────────────────────────────────────────────────
// <<PDP-MODELE
// Les 13 étapes du PDP. « oblig » : étape obligatoire pour la certification.
const ETAPES = [
  { key: "s1",  titre: "Informations",                      oblig: false },
  { key: "s2",  titre: "Vision et identité",                oblig: true  },
  { key: "s3",  titre: "Évaluation des 8 dimensions",       oblig: true  },
  { key: "s4",  titre: "Intégration des 14 modules",        oblig: false },
  { key: "s5",  titre: "Ministère",                         oblig: true  },
  { key: "s6",  titre: "Projet personnel",                  oblig: true  },
  { key: "s7",  titre: "Objectifs SMART",                   oblig: false },
  { key: "s8",  titre: "Leadership",                        oblig: false },
  { key: "s9",  titre: "Gestion du temps",                  oblig: false },
  { key: "s10", titre: "Relations",                         oblig: false },
  { key: "s11", titre: "Service communautaire : plan",      oblig: false },
  { key: "s12", titre: "Engagement et redevabilité",        oblig: true  },
  { key: "s13", titre: "Fruits de l’Esprit et disciplines", oblig: false },
];
const FRUITS_ESPRIT = ["amour","joie","paix","patience","bienveillance","bonte","fidelite","douceur","maitrise"];
const DISCIPLINES   = ["priere","bible","meditation","jeune","adoration","communion","service","partage","generosite","silence"];

// Vrai si la valeur contient quelque chose de réellement rempli (texte non vide, nombre > 0, case cochée)
function aDuContenu(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (typeof v === "number") return v > 0;
  if (typeof v === "boolean") return v === true;
  if (Array.isArray(v)) return v.some(aDuContenu);
  if (typeof v === "object") return Object.values(v).some(aDuContenu);
  return false;
}
// « terminee » : la personne l'a marquée terminée ; « commencee » : il y a du contenu ; sinon « afaire »
function statutEtape(pdp, key) {
  if (pdp && pdp.etapes && pdp.etapes[key] && pdp.etapes[key].fait === true) return "terminee";
  return aDuContenu(pdp && pdp[key]) ? "commencee" : "afaire";
}
function calculerProgression(pdp) {
  const statuts = {}; let terminees = 0;
  ETAPES.forEach(e => { statuts[e.key] = statutEtape(pdp, e.key); if (statuts[e.key] === "terminee") terminees++; });
  const pct = Math.round(terminees / ETAPES.length * 100);
  const manquantes = ETAPES.filter(e => e.oblig && statuts[e.key] !== "terminee").map(e => e.key);
  return { statuts, terminees, total: ETAPES.length, pct, manquantes, atteint: pct >= 80 && manquantes.length === 0 };
}
// Message si l'étape ne peut pas encore être marquée terminée ("" si tout va bien). d = données du formulaire.
function problemeEtape(key, d) {
  const plein = (x) => aDuContenu(x);
  switch (key) {
    case "s2":  return plein(d.s2?.vision) && plein(d.s2?.mission) ? "" : "Pour terminer cette étape, écris au moins ta vision à 5 ans et ta mission de vie.";
    case "s3":  return DIMENSIONS.every(dim => d.s3?.[dim.key]?.note > 0) ? "" : "Pour terminer cette étape, évalue les 8 dimensions (bouge chaque curseur).";
    case "s5":  return plein(d.s5?.ministre) && plein(d.s5?.raisons) ? "" : "Pour terminer cette étape, choisis ton ministère et écris tes raisons.";
    case "s6":  return plein(d.s6?.typeProjet) && plein(d.s6?.description) ? "" : "Pour terminer cette étape, choisis le type de ton projet et décris-le.";
    case "s12": return plein(d.s12?.engagements) && d.s12?.confirme === true ? "" : "Pour terminer cette étape, écris tes engagements et coche « Je confirme ces engagements ».";
    default:    return plein(d[key]) ? "" : "Remplis au moins un champ avant de terminer cette étape.";
  }
}
// PDP-MODELE>>

// Outils de la formation à relire pour chaque étape
const OUTILS_ETAPES = {
  s2:  "Module 5 — Bâtir le Caractère : reprends tes exercices pour nourrir ta vision, tes forces et tes talents.",
  s4:  "Relis tes modules dans le Parcours avant de te noter.",
  s5:  "Module 10 — Les Ministères de Dieu : relis-le avant de choisir ton ministère.",
  s6:  "Module 14 — Création de richesse (14.1 et 14.2) : les leçons t’aident à choisir et à construire ton projet.",
  s7:  "Module 11 — Maîtriser sa santé et son argent : le budget en 4 enveloppes t’aide pour tes objectifs financiers.",
  s10: "Module 4 — Aimer : relis-le pour préparer les relations à restaurer.",
  s11: "Module 12 — Citoyenneté responsable : des idées pour ta communauté.",
  s13: "Module 7 — Victoire par la Prière : ton journal de prière. Module 6 — Le Saint-Esprit : les fruits de l’Esprit.",
};

// Sections modifiées mais pas encore enregistrées : un rechargement venu du serveur ne doit pas les écraser
const PDP_DIRTY = new Set();

function chargerPdpPreservantBrouillon() {
  if (!PDP_DIRTY.size) { loadPdpIntoForm(); return; }
  const brouillon = collectPdpData();
  const sauve = MY_PDP;
  const fusion = { ...MY_PDP };
  PDP_DIRTY.forEach(k => { fusion[k] = brouillon[k]; });
  MY_PDP = fusion;
  try { loadPdpIntoForm(); } finally { MY_PDP = sauve; }
}

function construirePiedsEtapes() {
  ETAPES.forEach((e, i) => {
    const sec = document.getElementById("pdp-" + e.key);
    if (!sec) return;
    if (OUTILS_ETAPES[e.key]) sec.insertAdjacentHTML("afterbegin",
      `<p class="pdp-outil">🧰 <strong>Outil de la formation :</strong> ${OUTILS_ETAPES[e.key]} <a href="../ABBA-Parcours/">Ouvrir le Parcours</a></p>`);
    sec.insertAdjacentHTML("beforeend", `
      <div class="pdp-step-foot">
        <div class="pdp-step-status" id="stepStatus-${e.key}"></div>
        <div class="pdp-step-buttons">
          <button class="btn-secondary" type="button" data-step-save="${e.key}">💾 Enregistrer cette étape</button>
          <button class="btn-primary" type="button" data-step-done="${e.key}">✓ Marquer comme terminée</button>
          ${i < ETAPES.length - 1 ? `<button class="btn-secondary" type="button" data-step-next="${ETAPES[i + 1].key}">Étape suivante →</button>` : ""}
        </div>
        <p class="settings-hint" id="stepMsg-${e.key}" style="margin-top:6px;"></p>
      </div>`);
  });
  const panneau = document.getElementById("panel-pdp");
  panneau.addEventListener("click", (ev) => {
    const b = ev.target.closest("button[data-step-save],button[data-step-done],button[data-step-next]");
    if (!b) return;
    if (b.dataset.stepSave) enregistrerEtape(b.dataset.stepSave);
    else if (b.dataset.stepDone) basculerEtape(b.dataset.stepDone);
    else if (b.dataset.stepNext) {
      document.querySelector(`.pdp-tab[data-section="${b.dataset.stepNext}"]`)?.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  const marquer = (ev) => { const sec = ev.target.closest(".pdp-section"); if (sec) PDP_DIRTY.add(sec.id.replace("pdp-", "")); };
  panneau.addEventListener("input", marquer);
  panneau.addEventListener("change", marquer);
}

function boutonsEtape(key, actifs) {
  document.querySelectorAll(`#pdp-${key} .pdp-step-foot button`).forEach(b => { b.disabled = !actifs; });
}
async function enregistrerEtape(key) {
  const msg = document.getElementById("stepMsg-" + key);
  boutonsEtape(key, false); msg.textContent = "Enregistrement…";
  const ok = await savePdp(key);
  msg.textContent = ok ? "✓ Enregistré" : "Impossible d’enregistrer pour le moment. Vérifie ta connexion et réessaie.";
  boutonsEtape(key, true);
}
async function basculerEtape(key) {
  const msg = document.getElementById("stepMsg-" + key);
  const deja = MY_PDP?.etapes?.[key]?.fait === true;
  if (!deja) {
    const pb = problemeEtape(key, collectPdpData());
    if (pb) { msg.textContent = pb; return; }
  }
  boutonsEtape(key, false); msg.textContent = "Enregistrement…";
  try {
    if (!(await savePdp(key))) throw new Error("enregistrement");
    const etapes = { [key]: { fait: !deja, le: new Date().toISOString() } };
    await window.AbbaSync.saveMyPDP(CURRENT_USER.uid, { etapes });
    await pushSummary({ etapes });
    msg.textContent = deja ? "Étape rouverte." : "✓ Étape terminée.";
  } catch (e) {
    console.error(e);
    msg.textContent = "Impossible d’enregistrer pour le moment. Vérifie ta connexion et réessaie.";
  }
  boutonsEtape(key, true);
}

function setupPdpNav() {
  // Construire les sous-sections dynamiques
  buildS3Dimensions();
  buildS4Modules();
  buildS7Smart();
  buildS8Leadership();

  // Onglets S1–S10
  document.querySelectorAll(".pdp-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".pdp-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".pdp-section").forEach(s => s.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("pdp-" + tab.dataset.section).classList.add("active");
    });
  });

  // Pieds d'étape : enregistrer / terminer / étape suivante, outils de la formation, suivi des brouillons
  construirePiedsEtapes();
  updatePdpProgress();

  // Total heures S9
  ["s9Travail","s9Formation","s9Abba","s9Spiritu","s9Famille","s9Repos","s9Sommeil"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateS9Total);
  });
}

// S3 — Évaluation initiale des 8 dimensions
function buildS3Dimensions() {
  const container = document.getElementById("s3DimensionsContainer");
  if (!container) return;
  DIMENSIONS.forEach(dim => {
    container.insertAdjacentHTML("beforeend", `
      <div class="dim-eval-card" id="s3-card-${dim.key}">
        <div class="dim-eval-head">
          <span class="dim-eval-title">${dim.icone} ${dim.label}</span>
          <span class="dim-eval-score" id="s3-score-display-${dim.key}">—</span>
        </div>
        <div class="dim-score-row">
          <input type="range" min="1" max="5" value="3" id="s3-range-${dim.key}"
            oninput="updateDimScore('${dim.key}')">
          <span class="dim-level-badge" id="s3-badge-${dim.key}">À évaluer</span>
        </div>
        <p class="settings-hint" id="s3-ref-${dim.key}" style="margin:0 0 8px;"></p>
        <label class="field">
          <span>Description de ma situation actuelle</span>
          <textarea class="text-input" rows="2" id="s3-desc-${dim.key}"
            placeholder="Mon état actuel dans cette dimension…"></textarea>
        </label>
        <label class="field">
          <span>Points forts</span>
          <textarea class="text-input" rows="2" id="s3-forts-${dim.key}"
            placeholder="Ce qui va bien…"></textarea>
        </label>
        <label class="field">
          <span>Défis à relever</span>
          <textarea class="text-input" rows="2" id="s3-defis-${dim.key}"
            placeholder="Ce que je dois améliorer…"></textarea>
        </label>
      </div>
    `);
  });
}

function updateDimScore(key) {
  // La dimension compte comme évaluée seulement quand la personne a bougé le curseur (ou qu'une note était déjà enregistrée)
  document.getElementById("s3-range-" + key).dataset.touched = "1";
  const val = parseInt(document.getElementById("s3-range-" + key).value);
  document.getElementById("s3-score-display-" + key).textContent = val + "/5";
  const badge = document.getElementById("s3-badge-" + key);
  if (val <= 2) { badge.textContent = "Critique"; badge.className = "dim-level-badge critique"; }
  else if (val === 3) { badge.textContent = "En développement"; badge.className = "dim-level-badge dev"; }
  else if (val === 4) { badge.textContent = "Bon"; badge.className = "dim-level-badge bon"; }
  else { badge.textContent = "Excellent"; badge.className = "dim-level-badge excellent"; }
}
window.updateDimScore = updateDimScore;

// S4 — 14 modules
function buildS4Modules() {
  const container = document.getElementById("s4ModulesContainer");
  if (!container) return;
  MODULES_14.forEach((nom, i) => {
    container.insertAdjacentHTML("beforeend", `
      <div class="module-row">
        <span class="module-label">${i + 1}. ${nom}</span>
        <select class="module-select" id="s4-mod-${i}" title="Niveau d'assimilation">
          <option value="0">—</option>
          <option value="1">1 — Pas assimilé</option>
          <option value="2">2 — Compris</option>
          <option value="3">3 — Application partielle</option>
          <option value="4">4 — Application régulière</option>
          <option value="5">5 — Maîtrise</option>
        </select>
      </div>
    `);
  });
}

// S7 — Objectifs SMART par dimension
function buildS7Smart() {
  const container = document.getElementById("s7SmartContainer");
  if (!container) return;
  DIMENSIONS.forEach(dim => {
    container.insertAdjacentHTML("beforeend", `
      <div class="smart-card" id="s7-card-${dim.key}">
        <div class="smart-card-head">${dim.icone} ${dim.label}</div>
        <label class="field"><span>Objectif SMART à 6 mois</span>
          <textarea class="text-input" rows="2" id="s7-obj-${dim.key}"
            placeholder="Que vais-je accomplir exactement ?"></textarea>
        </label>
        <label class="field"><span>Comment je mesure ma progression</span>
          <textarea class="text-input" rows="2" id="s7-mesure-${dim.key}"
            placeholder="Indicateur concret…"></textarea>
        </label>
        <div class="smart-mois-grid">
          ${MOIS_LABELS.map((ml, i) => `
            <label class="field">
              <span class="smart-mois-label">${ml}</span>
              <input type="text" class="text-input" id="s7-m${i+1}-${dim.key}"
                placeholder="Action concrète…">
            </label>
          `).join("")}
        </div>
      </div>
    `);
  });
}

// S8 — Leadership
function buildS8Leadership() {
  const container = document.getElementById("s8LeadershipContainer");
  if (!container) return;
  LEADERSHIP_COMPETENCES.forEach((comp, i) => {
    container.insertAdjacentHTML("beforeend", `
      <div class="leadership-row">
        <span class="leadership-label">${comp}</span>
        <input type="number" class="leadership-input text-input" id="s8-lead-${i}"
          min="1" max="10" placeholder="—" title="${comp}">
      </div>
    `);
  });
}

// S9 — Total heures
function updateS9Total() {
  const ids = ["s9Travail","s9Formation","s9Abba","s9Spiritu","s9Famille","s9Repos","s9Sommeil"];
  const total = ids.reduce((acc, id) => {
    const v = parseFloat(document.getElementById(id).value) || 0;
    return acc + v;
  }, 0);
  const hint = document.getElementById("s9TotalHint");
  hint.textContent = `Total : ${total} h / semaine (objectif : 168 h)`;
  hint.className = "settings-hint " + (total > 175 ? "bad" : total >= 155 ? "ok" : "warn");
}

// ─────────────────────────────────────────────────────────────
// PDP — charger / sauvegarder
// ─────────────────────────────────────────────────────────────
function loadPdpIntoForm() {
  if (!MY_PDP || !Object.keys(MY_PDP).length) return;
  const d = MY_PDP;

  // S1
  setVal("s1Nom",       d.s1?.nom);
  setVal("s1Pays",      d.s1?.pays);
  setVal("s1Membre",    d.s1?.membre);
  setVal("s1Base",      d.s1?.base);
  setVal("s1Eglise",    d.s1?.eglise);
  setVal("s1DateDebut", d.s1?.dateDebut);
  setVal("s1DateFin",   d.s1?.dateFin);

  // S2
  setVal("s2Verset",    d.s2?.verset);
  setVal("s2Vision",    d.s2?.vision);
  setVal("s2Mission",   d.s2?.mission);
  setVal("s2Mbti",      d.s2?.mbti);
  setVal("s2Forces",    d.s2?.forces);
  setVal("s2Talents",   d.s2?.talents);
  setVal("s2DonsSpiris",d.s2?.donsSpiris);
  setVal("s2Croissance",d.s2?.croissance);
  setVal("s2Blessures", d.s2?.blessures);
  setCheck("s2BlessuresPartagees", d.s2?.blessuresPartagees);

  // Listener toggle partage blessures
  const bt = document.getElementById("s2-partage-toggle");
  if (bt) bt.addEventListener("click", () => {
    const cb = document.getElementById("s2BlessuresPartagees");
    cb.checked = !cb.checked;
    bt.classList.toggle("actif", cb.checked);
    bt.querySelector(".partage-toggle-label").textContent =
      cb.checked ? "✓ Visible pour le mentor" : "Rendre visible pour mon mentor";
  });
  if (d.s2?.blessuresPartagees && bt) {
    bt.classList.add("actif");
    bt.querySelector(".partage-toggle-label").textContent = "✓ Visible pour le mentor";
  }

  // S3 — dimensions
  DIMENSIONS.forEach(dim => {
    const v = d.s3?.[dim.key];
    if (!v) return;
    const range = document.getElementById("s3-range-" + dim.key);
    if (range && v.note) { range.value = n5(v.note); updateDimScore(dim.key); }
    setVal("s3-desc-" + dim.key,  v.desc);
    setVal("s3-forts-" + dim.key, v.forts);
    setVal("s3-defis-" + dim.key, v.defis);
  });

  // S4 — modules
  if (d.s4?.modules) {
    d.s4.modules.forEach((val, i) => {
      const el = document.getElementById("s4-mod-" + i);
      if (el) el.value = val || 0;
    });
  }
  setVal("s4Prio1",      d.s4?.prio1);
  setVal("s4Prio2",      d.s4?.prio2);
  setVal("s4Prio3",      d.s4?.prio3);
  setVal("s4PlanAction", d.s4?.planAction);

  // S5 — ministère
  if (d.s5?.ministre) {
    const radio = document.querySelector(`input[name="s5Ministre"][value="${d.s5.ministre}"]`);
    if (radio) radio.checked = true;
  }
  setVal("s5Raisons",  d.s5?.raisons);
  setVal("s5PlanM12",  d.s5?.planM12);
  setVal("s5PlanM34",  d.s5?.planM34);
  setVal("s5PlanM56",  d.s5?.planM56);

  // S6 — projet économique
  if (d.s6?.typeProjet) {
    const radio = document.querySelector(`input[name="s6TypeProjet"][value="${d.s6.typeProjet}"]`);
    if (radio) radio.checked = true;
  }
  setVal("s6Description", d.s6?.description);
  setVal("s6Objectifs",   d.s6?.objectifs);
  if (d.s6?.competences) {
    const radio = document.querySelector(`input[name="s6Competences"][value="${d.s6.competences}"]`);
    if (radio) radio.checked = true;
  }
  setVal("s6Formations",  d.s6?.formations);
  setCheck("s6SoutienFormation",  d.s6?.soutienFormation);
  setCheck("s6SoutienFinancement",d.s6?.soutienFinancement);
  setCheck("s6SoutienMentorat",   d.s6?.soutienMentorat);
  setCheck("s6SoutienReseau",     d.s6?.soutienReseau);
  setVal("s6LancM1",      d.s6?.lancM1);
  setVal("s6LancM23",     d.s6?.lancM23);
  setVal("s6LancM46",     d.s6?.lancM46);
  setVal("s6RevenusVises",d.s6?.revenusVises);

  // S7 — objectifs SMART
  DIMENSIONS.forEach(dim => {
    const v = d.s7?.[dim.key];
    if (!v) return;
    setVal("s7-obj-" + dim.key,   v.objectif);
    setVal("s7-mesure-" + dim.key, v.mesure);
    MOIS_KEYS.forEach((_, i) => setVal(`s7-m${i+1}-${dim.key}`, v[`m${i+1}`]));
  });

  // S8 — leadership
  LEADERSHIP_COMPETENCES.forEach((_, i) => setVal("s8-lead-" + i, d.s8?.leadership?.[i]));
  setVal("s8Formations",   d.s8?.formations);
  setVal("s8Modeles",      d.s8?.modeles);
  setVal("s8Opportunites", d.s8?.opportunites);
  setVal("s8Mentores",     d.s8?.mentores);

  // S9 — temps
  setVal("s9Travail",     d.s9?.travail);
  setVal("s9Formation",   d.s9?.formation);
  setVal("s9Abba",        d.s9?.abba);
  setVal("s9Spiritu",     d.s9?.spiritu);
  setVal("s9Famille",     d.s9?.famille);
  setVal("s9Repos",       d.s9?.repos);
  setVal("s9Sommeil",     d.s9?.sommeil);
  updateS9Total();
  setVal("s9Ajustements", d.s9?.ajustements);
  setVal("s9Reduire",     d.s9?.reduire);
  setVal("s9Augmenter",   d.s9?.augmenter);
  setVal("s9Strategies",  d.s9?.strategies);

  // S10 — relations
  setVal("s10Famille",     d.s10?.famille);
  setVal("s10Eglise",      d.s10?.eglise);
  setVal("s10Abba",        d.s10?.abba);
  setVal("s10Pro",         d.s10?.pro);
  setVal("s10Reparer",     d.s10?.reparer);
  setVal("s10Nouvelles",   d.s10?.nouvelles);
  setCheck("s10CommAssertive",  d.s10?.commAssertive);
  setCheck("s10EcouteActive",   d.s10?.ecouteActive);
  setCheck("s10GestionConflits",d.s10?.gestionConflits);
  setCheck("s10Empathie",       d.s10?.empathie);
  setCheck("s10Equipe",         d.s10?.equipe);
  setCheck("s10Negociation",    d.s10?.negociation);
  setVal("s10PlanAction",  d.s10?.planAction);

  // S11 — service communautaire : plan
  setVal("s11Zone",          d.s11?.zone);
  setVal("s11Besoin",        d.s11?.besoin);
  setVal("s11Action",        d.s11?.action);
  setVal("s11Beneficiaires", d.s11?.beneficiaires);
  // S12 — engagement et redevabilité
  setVal("s12Engagements", d.s12?.engagements);
  setVal("s12Partenaires", d.s12?.partenaires);
  setVal("s12Frequence",   d.s12?.frequence);
  setCheck("s12Confirme",  d.s12?.confirme);
  // S13 — fruits de l'Esprit et disciplines
  FRUITS_ESPRIT.forEach(k => setVal("s13f-" + k, d.s13?.fruits?.[k] || ""));
  DISCIPLINES.forEach(k => setVal("s13d-" + k, d.s13?.disciplines?.[k] || ""));
  setVal("s13Priorite", d.s13?.priorite);
}

// Lit tout le formulaire et rend les données du PDP (sans rien enregistrer)
function collectPdpData() {
  const data = {
    s1: {
      nom:       getVal("s1Nom"),
      pays:      getVal("s1Pays"),
      membre:    getVal("s1Membre"),
      base:      getVal("s1Base"),
      eglise:    getVal("s1Eglise"),
      dateDebut: getVal("s1DateDebut"),
      dateFin:   getVal("s1DateFin"),
    },
    s2: {
      verset:    getVal("s2Verset"),
      vision:    getVal("s2Vision"),
      mission:   getVal("s2Mission"),
      mbti:      getVal("s2Mbti"),
      forces:    getVal("s2Forces"),
      talents:   getVal("s2Talents"),
      donsSpiris:getVal("s2DonsSpiris"),
      croissance:getVal("s2Croissance"),
      blessures: getVal("s2Blessures"),
      blessuresPartagees: getCheck("s2BlessuresPartagees"),
    },
    s3: {},
    s4: {
      modules: MODULES_14.map((_, i) => parseInt(document.getElementById("s4-mod-" + i)?.value) || 0),
      prio1:      getVal("s4Prio1"),
      prio2:      getVal("s4Prio2"),
      prio3:      getVal("s4Prio3"),
      planAction: getVal("s4PlanAction"),
    },
    s5: {
      ministre: document.querySelector('input[name="s5Ministre"]:checked')?.value || "",
      raisons:  getVal("s5Raisons"),
      planM12:  getVal("s5PlanM12"),
      planM34:  getVal("s5PlanM34"),
      planM56:  getVal("s5PlanM56"),
    },
    s6: {
      typeProjet:        document.querySelector('input[name="s6TypeProjet"]:checked')?.value || "",
      description:       getVal("s6Description"),
      objectifs:         getVal("s6Objectifs"),
      competences:       document.querySelector('input[name="s6Competences"]:checked')?.value || "",
      formations:        getVal("s6Formations"),
      soutienFormation:  getCheck("s6SoutienFormation"),
      soutienFinancement:getCheck("s6SoutienFinancement"),
      soutienMentorat:   getCheck("s6SoutienMentorat"),
      soutienReseau:     getCheck("s6SoutienReseau"),
      lancM1:            getVal("s6LancM1"),
      lancM23:           getVal("s6LancM23"),
      lancM46:           getVal("s6LancM46"),
      revenusVises:      getVal("s6RevenusVises"),
    },
    s7: {},
    s8: {
      leadership:   LEADERSHIP_COMPETENCES.map((_, i) => parseInt(document.getElementById("s8-lead-" + i)?.value) || 0),
      formations:   getVal("s8Formations"),
      modeles:      getVal("s8Modeles"),
      opportunites: getVal("s8Opportunites"),
      mentores:     getVal("s8Mentores"),
    },
    s9: {
      travail:      getVal("s9Travail"),
      formation:    getVal("s9Formation"),
      abba:         getVal("s9Abba"),
      spiritu:      getVal("s9Spiritu"),
      famille:      getVal("s9Famille"),
      repos:        getVal("s9Repos"),
      sommeil:      getVal("s9Sommeil"),
      ajustements:  getVal("s9Ajustements"),
      reduire:      getVal("s9Reduire"),
      augmenter:    getVal("s9Augmenter"),
      strategies:   getVal("s9Strategies"),
    },
    s10: {
      famille:       getVal("s10Famille"),
      eglise:        getVal("s10Eglise"),
      abba:          getVal("s10Abba"),
      pro:           getVal("s10Pro"),
      reparer:       getVal("s10Reparer"),
      nouvelles:     getVal("s10Nouvelles"),
      commAssertive: getCheck("s10CommAssertive"),
      ecouteActive:  getCheck("s10EcouteActive"),
      gestionConflits:getCheck("s10GestionConflits"),
      empathie:      getCheck("s10Empathie"),
      equipe:        getCheck("s10Equipe"),
      negociation:   getCheck("s10Negociation"),
      planAction:    getVal("s10PlanAction"),
    },
  };

  // S3 — dimensions
  DIMENSIONS.forEach(dim => {
    const rangeEl = document.getElementById("s3-range-" + dim.key);
    data.s3[dim.key] = {
      desc:  getVal("s3-desc-" + dim.key),
      forts: getVal("s3-forts-" + dim.key),
      defis: getVal("s3-defis-" + dim.key),
    };
    // Pas de note enregistrée tant que la personne ne s'est pas évaluée elle-même
    if (rangeEl && rangeEl.dataset.touched === "1") data.s3[dim.key].note = parseInt(rangeEl.value) || 3;
  });

  // S7 — SMART
  DIMENSIONS.forEach(dim => {
    data.s7[dim.key] = {
      objectif: getVal("s7-obj-" + dim.key),
      mesure:   getVal("s7-mesure-" + dim.key),
    };
    MOIS_KEYS.forEach((_, i) => {
      data.s7[dim.key][`m${i+1}`] = getVal(`s7-m${i+1}-${dim.key}`);
    });
  });

  // S11 — service communautaire : plan
  data.s11 = {
    zone:          getVal("s11Zone"),
    besoin:        getVal("s11Besoin"),
    action:        getVal("s11Action"),
    beneficiaires: getVal("s11Beneficiaires"),
  };
  // S12 — engagement et redevabilité
  const confirme = getCheck("s12Confirme");
  data.s12 = {
    engagements: getVal("s12Engagements"),
    partenaires: getVal("s12Partenaires"),
    frequence:   getVal("s12Frequence"),
    confirme,
  };
  if (confirme) data.s12.confirmeLe = MY_PDP?.s12?.confirmeLe || new Date().toISOString();
  // S13 — fruits de l'Esprit et disciplines (évaluation de départ, 1 à 5 ; rien d'enregistré tant que la case reste sur « — »)
  data.s13 = { fruits: {}, disciplines: {}, priorite: getVal("s13Priorite") };
  FRUITS_ESPRIT.forEach(k => { const v = getVal("s13f-" + k); if (v) data.s13.fruits[k] = Number(v); });
  DISCIPLINES.forEach(k => { const v = getVal("s13d-" + k); if (v) data.s13.disciplines[k] = Number(v); });
  return data;
}

// Enregistre tout le PDP, ou une seule étape (onlyKey). Rend true si c'est enregistré.
async function savePdp(onlyKey) {
  if (!CURRENT_USER) return false;
  const data = collectPdpData();
  const aEcrire = onlyKey ? { [onlyKey]: data[onlyKey] } : data;
  try {
    await window.AbbaSync.saveMyPDP(CURRENT_USER.uid, aEcrire);
    if (onlyKey) PDP_DIRTY.delete(onlyKey); else PDP_DIRTY.clear();
    await pushSummary(aEcrire);   // met à jour le résumé du mentor
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}


// ─────────────────────────────────────────────────────────────
// REPRISE depuis le Parcours Bâtisseur (nom, pays, MBTI, auto-évaluation, niveaux des modules)
// L'étudiant vérifie puis confirme ; rien n'est écrit dans son PDP avant sa confirmation.
// ─────────────────────────────────────────────────────────────
let REPRISE = null;

// Rappelle, à côté de chaque dimension de S3, la note du début du Parcours (repère seulement : S3 est une nouvelle évaluation)
function afficherReperesS3() {
  const notes = MY_PDP?.pont?.notesParcours || REPRISE?.notes || null;
  DIMENSIONS.forEach((dim, i) => {
    const el = document.getElementById("s3-ref-" + dim.key);
    if (el) el.textContent = notes && notes[i] ? `Au début du Parcours : ${notes[i]}/5` : "";
  });
}
let REPRISE_EN_COURS = false;

function nomPays(code) {
  try { return new Intl.DisplayNames(["fr"], { type: "region" }).of(code) || code; } catch (e) { return code; }
}

async function afficherReprise() {
  const box = document.getElementById("repriseCard");
  if (!box || !CURRENT_USER) return;
  if (MY_PDP?.pont?.confirmeLe) { box.innerHTML = ""; return; }
  let r = null;
  try { r = await window.AbbaSync.getReprise(CURRENT_USER.uid); } catch (e) { r = null; }
  if (!r || !(r.nom || r.paysCode || r.mbti || r.notes || r.niveaux)) { box.innerHTML = ""; return; }
  REPRISE = r;
  afficherReperesS3();
  const lignes = [];
  if (r.nom)      lignes.push(`<li><strong>Nom :</strong> ${escapeAttr(r.nom)}</li>`);
  if (r.paysCode) lignes.push(`<li><strong>Pays :</strong> ${escapeAttr(nomPays(r.paysCode))}</li>`);
  if (r.mbti)     lignes.push(`<li><strong>Profil MBTI :</strong> ${escapeAttr(r.mbti)}</li>`);
  if (r.notes) {
    lignes.push(`<li><strong>Ton auto-évaluation au début du Parcours (sur 5) :</strong> ` +
      DIMENSIONS.map((d, i) => `${d.icone} ${d.label} ${r.notes[i] || "—"}`).join(" · ") +
      `<br><small>Elle te sert de repère. À l’étape S3, tu te réévalues tel que tu es aujourd’hui : c’est cette nouvelle évaluation qui sera ton point de départ.</small></li>`);
  } else {
    lignes.push(`<li><strong>Auto-évaluation :</strong> pas faite dans le Parcours. Tu te noteras à l’étape S3.</li>`);
  }
  if (r.niveaux) {
    lignes.push(`<li><strong>Modules :</strong> ${r.nbValides} validé(s) dans le Parcours. Niveau de départ proposé : 3 pour un module validé, 1 sinon (tu pourras l’ajuster à l’étape S4).</li>`);
  }
  box.innerHTML = `
    <div class="card" style="border-left:4px solid var(--accent, #c9962b);margin-bottom:16px;">
      <p class="eyebrow">Reprise depuis ton Parcours Bâtisseur</p>
      <p class="settings-hint">Voici ce que nous avons retrouvé de ta formation. Vérifie, puis confirme pour l’ajouter à ton PDP. Tu pourras tout modifier ensuite.</p>
      <ul style="margin:8px 0 12px 18px;padding:0;line-height:1.6;">${lignes.join("")}</ul>
      <button class="btn-primary" id="repriseConfirmBtn" type="button">Confirmer et reprendre dans mon PDP</button>
      <p id="repriseMsg" class="settings-hint" style="margin-top:8px;"></p>
    </div>`;
  document.getElementById("repriseConfirmBtn").addEventListener("click", confirmerReprise);
}

async function confirmerReprise() {
  if (!REPRISE || REPRISE_EN_COURS || !CURRENT_USER) return;
  REPRISE_EN_COURS = true;
  const btn = document.getElementById("repriseConfirmBtn");
  const msg = document.getElementById("repriseMsg");
  btn.disabled = true; btn.textContent = "Reprise en cours…";
  const r = REPRISE;
  // On ne remplace jamais ce que la personne a déjà saisi
  const videSinon = (id, val) => { const el = document.getElementById(id); if (el && val && !el.value) el.value = val; };
  videSinon("s1Nom", r.nom);
  videSinon("s1Pays", r.paysCode ? nomPays(r.paysCode) : "");
  videSinon("s2Mbti", r.mbti);
  if (r.niveaux) {
    r.niveaux.forEach((val, i) => {
      const el = document.getElementById("s4-mod-" + i);
      if (el && (!el.value || el.value === "0")) el.value = val;
    });
  }
  try {
    if (!(await savePdp())) throw new Error("enregistrement du PDP");   // enregistre tout le formulaire (et met à jour le résumé du mentor)
    await window.AbbaSync.saveMyPDP(CURRENT_USER.uid, {
      s1: { paysCode: r.paysCode || "" },
      pont: { confirmeLe: new Date().toISOString(), source: "parcours", notesParcours: r.notes || null },
    });
    if (msg) msg.textContent = "";
  } catch (e) {
    console.error(e);
    REPRISE_EN_COURS = false;
    btn.disabled = false; btn.textContent = "Confirmer et reprendre dans mon PDP";
    if (msg) msg.textContent = "Impossible d’enregistrer pour le moment. Vérifie ta connexion et réessaie.";
    return;
  }
  REPRISE_EN_COURS = false;
}

function updatePdpProgress() {
  const prog = calculerProgression(MY_PDP || {});
  ETAPES.forEach(e => {
    const st = prog.statuts[e.key];
    const tab = document.querySelector(`.pdp-tab[data-section="${e.key}"]`);
    if (tab) { tab.classList.toggle("done", st === "terminee"); tab.classList.toggle("started", st === "commencee"); }
    const el = document.getElementById("stepStatus-" + e.key);
    if (el) {
      el.className = "pdp-step-status " + st;
      el.textContent = { afaire: "À faire", commencee: "Commencée", terminee: "Terminée ✓" }[st] + (e.oblig ? " · étape obligatoire pour la certification" : "");
    }
    const bd = document.querySelector(`[data-step-done="${e.key}"]`);
    if (bd) bd.textContent = st === "terminee" ? "↺ Rouvrir l’étape" : "✓ Marquer comme terminée";
  });
  const box = document.getElementById("pdpProgress");
  if (box) {
    const oblig = ETAPES.filter(e => e.oblig).map(e => e.key.toUpperCase()).join(", ");
    const reste = prog.manquantes.map(k => k.toUpperCase()).join(", ");
    box.innerHTML = `
      <p class="eyebrow">Ma progression</p>
      <div class="pdp-bar"><span style="width:${prog.pct}%"></span></div>
      <p style="margin:0;"><strong>${prog.terminees} étape${prog.terminees > 1 ? "s" : ""} terminée${prog.terminees > 1 ? "s" : ""} sur ${prog.total}</strong> · ${prog.pct} %</p>
      <p class="settings-hint" style="margin-top:6px;">Pour la certification : au moins 80 %, avec les étapes obligatoires terminées (${oblig}).
        ${prog.atteint ? "✓ Objectif atteint." : (prog.manquantes.length ? "Obligatoires restantes : " + reste + "." : "")}</p>`;
  }
}

function updateAccueilPdpHint() {
  const hint = document.getElementById("accueilPdpHint");
  if (!hint) return;
  const prog = calculerProgression(MY_PDP || {});
  const commence = Object.values(prog.statuts).some(st => st !== "afaire");
  hint.textContent = commence
    ? `${prog.terminees} étape${prog.terminees > 1 ? "s" : ""} terminée${prog.terminees > 1 ? "s" : ""} sur ${prog.total} (${prog.pct} %).`
    : "Remplis ton PDP pour démarrer ta Phase 2.";
}

// ─────────────────────────────────────────────────────────────
// RENCONTRES
// ─────────────────────────────────────────────────────────────
// setupRencontresNav remplacé par renderRencontresPanel (nouveau système)
function setupRencontresNav() { /* no-op — logique dans renderRencontresPanel */ }
function updateRencontreTabs() { renderRencontresPanel(); }

// ─────────────────────────────────────────────────────────────
// RENCONTRES — nouveau système : formulaire unique + historique verrouillé
// ─────────────────────────────────────────────────────────────
function renderRencontresPanel() {
  renderRencontreForm();
  renderRencontreHistorique();
  updateAccueilRencontresHint();
}

// Trouver le prochain mois non encore enregistré
function prochainMoisDisponible() {
  return MOIS_KEYS.find(k => !MY_RENCONTRES[k]?.verrouille) || null;
}

function renderRencontreForm() {
  const zone = document.getElementById("rencontreFormZone");
  const moisKey = prochainMoisDisponible();

  if (!moisKey) {
    zone.innerHTML = `<div class="rencontre-header-card">
      <p class="eyebrow" style="color:var(--sage);">✓ Les 6 rencontres sont complétées</p>
      <p class="settings-hint">Consulte ton bilan pour voir ta progression.</p>
    </div>`;
    return;
  }

  const moisNum = MOIS_KEYS.indexOf(moisKey) + 1;

  zone.innerHTML = `
    <div class="rencontre-header">
      <h2>Rencontre — ${MOIS_LABELS[moisNum - 1]}</h2>
      <p>${moisNum === 3 ? "Bilan mi-parcours inclus" : moisNum === 6 ? "Évaluation finale" : "Suivi mensuel"}</p>
    </div>

    <label class="field"><span>Date de la rencontre</span>
      <input type="date" class="text-input" id="r-date">
    </label>

    <label class="field"><span>Thèmes abordés</span>
      <textarea class="text-input" rows="2" id="r-themes"
        placeholder="Points discutés lors de cette rencontre…"></textarea>
    </label>

    <p class="eyebrow" style="margin-top:4px;">Évaluation des 8 dimensions (1–5)</p>
    <div class="dim-grid">
      ${DIMENSIONS.map(dim => `
        <div class="dim-item">
          <span class="dim-label">${dim.icone} ${dim.label}</span>
          <div class="dim-score">
            <input type="range" min="1" max="5" value="3"
              id="r-dim-${dim.key}" oninput="updateRDim('${dim.key}')">
            <span class="dim-score-val" id="r-dim-val-${dim.key}">3</span>
          </div>
        </div>
      `).join("")}
    </div>

    <label class="field" style="margin-top:12px;"><span>Victoires et réussites du mois</span>
      <textarea class="text-input" rows="3" id="r-victoires"
        placeholder="Ce qui a bien marché ce mois-ci…"></textarea>
    </label>

    <label class="field"><span>Défis rencontrés</span>
      <textarea class="text-input" rows="3" id="r-defis"
        placeholder="Difficultés rencontrées…"></textarea>
    </label>

    <div class="partage-toggle" id="r-partage-toggle">
      <input type="checkbox" id="r-defisPartages">
      <span class="partage-toggle-label">Partager ces défis avec mon mentor</span>
    </div>

    <label class="field" style="margin-top:12px;"><span>Actions correctives décidées</span>
      <textarea class="text-input" rows="3" id="r-actions"
        placeholder="Ce que tu vas faire différemment le mois prochain…"></textarea>
    </label>

    ${moisNum === 3 ? `
      <label class="field"><span>Ajustements majeurs mi-parcours</span>
        <textarea class="text-input" rows="3" id="r-ajustements"
          placeholder="Points à recadrer pour la seconde moitié…"></textarea>
      </label>
    ` : ""}

    <button class="btn-primary" id="r-save-btn" type="button" style="margin-top:8px;width:100%;"
      onclick="saveRencontre('${moisKey}')">Enregistrer et verrouiller</button>
    <p class="settings-hint" style="margin-top:6px;text-align:center;">
      ⚠ Une fois enregistré, ce mois ne pourra plus être modifié.
    </p>
    <p class="auth-error" id="r-error"></p>
  `;

  document.getElementById("r-partage-toggle").addEventListener("click", () => {
    const cb = document.getElementById("r-defisPartages");
    cb.checked = !cb.checked;
    document.getElementById("r-partage-toggle").classList.toggle("actif", cb.checked);
    document.querySelector("#r-partage-toggle .partage-toggle-label").textContent =
      cb.checked ? "✓ Défis partagés avec le mentor" : "Partager ces défis avec mon mentor";
  });
}

function renderRencontreHistorique() {
  const zone = document.getElementById("rencontreHistorique");
  const done = MOIS_KEYS.filter(k => MY_RENCONTRES[k]?.verrouille);
  if (!done.length) { zone.innerHTML = ""; return; }

  zone.innerHTML = done.map(k => {
    const d = MY_RENCONTRES[k];
    const moisNum = MOIS_KEYS.indexOf(k) + 1;
    const dimsHtml = DIMENSIONS.map(dim => {
      const val = d.notes8dim?.[dim.key] ? n5(d.notes8dim[dim.key]) : "—";
      return `<span class="histo-dim">${dim.icone} <strong>${val}</strong><small>${dim.label.substring(0,5)}</small></span>`;
    }).join("");
    return `
      <div class="histo-card">
        <div class="histo-head">
          <span class="histo-label">${MOIS_LABELS[moisNum-1]}</span>
          <span class="histo-date">${d.date || ""}</span>
          <span class="histo-lock">🔒</span>
        </div>
        ${d.themes ? `<p class="histo-line" style="font-style:italic;color:var(--ink-soft);margin-bottom:8px;">📝 ${d.themes}</p>` : ""}
        <div class="histo-dims">${dimsHtml}</div>
        ${d.victoires ? `<p class="histo-line histo-victoire">✓ ${d.victoires}</p>` : ""}
        ${d.defis ? `<p class="histo-line histo-defi">⚠ ${d.defisPartages ? d.defis : "(défis non partagés)"}</p>` : ""}
        ${d.actionsCorrectves ? `<p class="histo-line">→ ${d.actionsCorrectves}</p>` : ""}
      </div>`;
  }).join("");
}

window.updateRDim = function(key) {
  const val = document.getElementById("r-dim-" + key)?.value;
  if (val) document.getElementById("r-dim-val-" + key).textContent = val;
};

window.saveRencontre = async function(moisKey) {
  if (!CURRENT_USER || !moisKey) return;
  const btn = document.getElementById("r-save-btn");
  const dateVal = document.getElementById("r-date")?.value || "";
  if (!dateVal) {
    document.getElementById("r-error").textContent = "La date est obligatoire.";
    return;
  }
  btn.textContent = "Enregistrement…"; btn.disabled = true;

  const moisNum = MOIS_KEYS.indexOf(moisKey) + 1;
  const notes8dim = {};
  DIMENSIONS.forEach(dim => {
    notes8dim[dim.key] = parseInt(document.getElementById("r-dim-" + dim.key)?.value) || 3;
  });
  const defisPartages = document.getElementById("r-defisPartages")?.checked || false;

  const data = {
    date:             dateVal,
    themes:           document.getElementById("r-themes")?.value || "",
    notes8dim,
    victoires:        document.getElementById("r-victoires")?.value || "",
    defis:            document.getElementById("r-defis")?.value || "",
    defisPartages,
    actionsCorrectves: document.getElementById("r-actions")?.value || "",
    verrouille:       true,   // ← clé du verrouillage
    verrouilleAt:     new Date().toISOString(),
  };
  if (moisNum === 3) {
    data.ajustementsMiParcours = document.getElementById("r-ajustements")?.value || "";
  }

  try {
    await window.AbbaSync.saveRencontre(CURRENT_USER.uid, moisKey, data);
    await pushSummary();
    renderRencontresPanel();
  } catch (err) {
    console.error(err);
    document.getElementById("r-error").textContent = "Erreur — réessaie.";
    btn.textContent = "Enregistrer et verrouiller"; btn.disabled = false;
  }
};

function updateAccueilRencontresHint() {
  const hint = document.getElementById("accueilRencontresHint");
  const done = MOIS_KEYS.filter(k => MY_RENCONTRES[k]?.verrouille).length;
  if (done === 0) hint.textContent = "Tes 6 rencontres de suivi avec ton mentor.";
  else if (done < 6) hint.textContent = `${done} / 6 rencontres complétées.`;
  else hint.textContent = "✓ Les 6 rencontres sont complétées — consulte ton bilan !";
}

// ─────────────────────────────────────────────────────────────
// BILAN FINAL
// ─────────────────────────────────────────────────────────────
function updateBilan() {
  const r6 = MY_RENCONTRES["mois6"];
  const hasBilan = r6 && r6.date;
  document.getElementById("bilanNotDisponible").style.display = hasBilan ? "none" : "";
  const bilanContent = document.getElementById("bilanContent");
  bilanContent.style.display = hasBilan ? "" : "none";
  if (!hasBilan) return;

  const r1 = MY_RENCONTRES["mois1"] || {};
  // Départ de la Mise en Action : les notes de S3 ; à défaut (S3 pas évalué), celles de la rencontre du mois 1
  const notesS3 = Object.fromEntries(DIMENSIONS.map(d => [d.key, n5(MY_PDP?.s3?.[d.key]?.note)]));
  const notesDebut = Object.values(notesS3).some(v => v > 0)
    ? notesS3
    : Object.fromEntries(Object.entries(r1.notes8dim || {}).map(([k, v]) => [k, n5(v)]));
  const notesFin = Object.fromEntries(Object.entries(r6.notes8dim || {}).map(([k, v]) => [k, n5(v)]));
  // Note du début du Parcours (repère), si elle a été reprise
  const nParc = MY_PDP?.pont?.notesParcours;
  const notesParcours = Array.isArray(nParc) && nParc.length === DIMENSIONS.length
    ? Object.fromEntries(DIMENSIONS.map((d, i) => [d.key, n5(nParc[i])])) : {};
  const pMoy = DIMENSIONS.every(d => notesParcours[d.key])
    ? (DIMENSIONS.reduce((a, d) => a + notesParcours[d.key], 0) / DIMENSIONS.length).toFixed(1) + "/5" : "—";

  // Tableau comparatif
  const rows = DIMENSIONS.map(dim => {
    const debut = notesDebut[dim.key] || 0;
    const fin   = notesFin[dim.key]   || 0;
    const diff  = fin - debut;
    const cls   = diff > 0 ? "bilan-prog-pos" : diff < 0 ? "bilan-prog-neg" : "bilan-prog-zero";
    const sign  = diff > 0 ? "+" : "";
    return `<tr>
      <td>${dim.icone} ${dim.label}</td>
      <td>${notesParcours[dim.key] ? notesParcours[dim.key] + "/5" : "—"}</td>
      <td>${debut ? debut + "/5" : "—"}</td>
      <td>${fin ? fin + "/5" : "—"}</td>
      <td class="${cls}">${sign}${diff}</td>
    </tr>`;
  });

  // Moyenne
  const dTotal = DIMENSIONS.reduce((a, d) => a + (notesDebut[d.key] || 0), 0);
  const fTotal = DIMENSIONS.reduce((a, d) => a + (notesFin[d.key]   || 0), 0);
  const dMoy   = (dTotal / DIMENSIONS.length).toFixed(1);
  const fMoy   = (fTotal / DIMENSIONS.length).toFixed(1);
  const diffMoy = (fMoy - dMoy).toFixed(1);
  const cls    = diffMoy > 0 ? "bilan-prog-pos" : diffMoy < 0 ? "bilan-prog-neg" : "bilan-prog-zero";

  bilanContent.innerHTML = `
    <div class="card">
      <p class="eyebrow">Progression des 8 dimensions</p>
      <table class="bilan-table">
        <thead><tr><th>Dimension</th><th>Début du Parcours</th><th>Début de la Mise en Action</th><th>Fin</th><th>Évolution (Mise en Action)</th></tr></thead>
        <tbody>
          ${rows.join("")}
          <tr style="font-weight:700;border-top:1px solid var(--ink);">
            <td>Moyenne</td>
            <td>${pMoy}</td>
            <td>${dMoy}/5</td>
            <td>${fMoy}/5</td>
            <td class="${cls}">${diffMoy > 0 ? "+" : ""}${diffMoy}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <p class="eyebrow">Profil final — Barres de progression</p>
      <div class="radar-bars">
        ${DIMENSIONS.map(dim => {
          const val = notesFin[dim.key] || 0;
          return `
            <div class="radar-bar-row">
              <span class="radar-bar-label">${dim.icone} ${dim.label}</span>
              <div class="radar-bar-track">
                <div class="radar-bar-fill" style="width:${val * 20}%"></div>
              </div>
              <span class="radar-bar-val">${val}/5</span>
            </div>`;
        }).join("")}
      </div>
    </div>

    <div class="card">
      <p class="eyebrow">Projet économique</p>
      <p class="settings-hint">${MY_PDP?.s6?.description || "Non renseigné."}</p>
      <p style="font-size:13px;color:var(--ink-soft);">
        Objectifs fixés : <em>${MY_PDP?.s6?.objectifs || "—"}</em>
      </p>
    </div>

    <div class="card">
      <p class="eyebrow">Ministère intégré</p>
      <p style="font-size:14px;font-weight:600;color:var(--navy);">
        ${MY_PDP?.s5?.ministre || "Non renseigné"}
      </p>
      <p style="font-size:13px;color:var(--ink-soft);">${MY_PDP?.s5?.raisons || ""}</p>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
// RÉSUMÉ — pushé vers Firestore pour mentor/admin
// ─────────────────────────────────────────────────────────────
async function pushSummary(extra) {
  if (!CURRENT_USER) return;
  const profile = await window.AbbaSync.getUserProfile(CURRENT_USER.uid) || {};
  const moisDone = MOIS_KEYS.filter(k => MY_RENCONTRES[k]?.date).length;
  const dernierMois = MOIS_KEYS.slice().reverse().find(k => MY_RENCONTRES[k]?.date);
  const derniereRencontre = dernierMois ? MY_RENCONTRES[dernierMois] : null;

  // Prochaine rencontre = mois suivant non complété
  const prochainMois = MOIS_KEYS.find(k => !MY_RENCONTRES[k]?.date);

  // Progression calculée sur ce qui vient d'être enregistré (le serveur n'a pas encore renvoyé la nouvelle version)
  const pdpVue = { ...MY_PDP, ...(extra || {}), etapes: { ...(MY_PDP?.etapes || {}), ...((extra || {}).etapes || {}) } };
  const prog = calculerProgression(pdpVue);

  const summary = {
    nom:           profile.nom || "",
    prenom:        profile.prenom || "",
    email:         CURRENT_USER.email,
    dateDebut:     MY_PDP?.s1?.dateDebut || "",
    moisEnCours:   moisDone >= 6 ? "bilan" : MOIS_KEYS[moisDone] || "mois1",
    dernieresNotes8dim: derniereRencontre?.notes8dim || {},
    dernieresVictoires: derniereRencontre?.victoires || "",
    derniersDefis:      derniereRencontre?.defisPartages ? (derniereRencontre?.defis || "") : null,
    prochaineRencontre: prochainMois || "bilan",
    pdpComplet:    prog.atteint,
    pdpPct:        prog.pct,
    pdpEtapes:     prog.terminees,
    // mentorEmail / mentorNom ne sont PAS écrits ici : le coordinateur les pose lors de l'affectation
    // (les règles de sécurité refusent qu'un bâtisseur les modifie lui-même).
  };

  await window.AbbaSync.saveSummary(CURRENT_USER.uid, summary);
}

// ─────────────────────────────────────────────────────────────
// SUIVI (vue mentor / admin)
// ─────────────────────────────────────────────────────────────
async function loadSuivi() {
  const container = document.getElementById("suiviTable");
  const empty     = document.getElementById("suiviEmpty");
  container.innerHTML = "<p class='settings-hint'>Chargement…</p>";

  let data = [];
  if (IS_ADMIN) {
    data = await window.AbbaSync.loadAllSummaries();
  } else if (IS_MENTOR) {
    data = await window.AbbaSync.loadMySummaries(CURRENT_USER.email);
  }
  SUIVI_DATA = data;

  if (!data.length) {
    container.innerHTML = "";
    empty.style.display = "";
    return;
  }
  empty.style.display = "none";

  container.innerHTML = `<div class="suivi-cards">${data.map(s => {
    const moisLabel = s.moisEnCours === "bilan" ? "Bilan" :
      MOIS_LABELS[MOIS_KEYS.indexOf(s.moisEnCours)] || "—";
    const dimsHtml = DIMENSIONS.map(dim => {
      const val = s.dernieresNotes8dim?.[dim.key] || "—";
      return `<div class="suivi-dim">
        <span class="suivi-dim-icon">${dim.icone}</span>
        <span class="suivi-dim-val">${val}</span>
        <span class="suivi-dim-label">${dim.label.substring(0,5)}</span>
      </div>`;
    }).join("");

    return `<div class="suivi-accord">
      <button class="suivi-accord-head" onclick="toggleSuivi('${s.uid}')">
        <span class="suivi-card-name">${escapeAttr(s.prenom || "")} ${escapeAttr(s.nom || s.email)}</span>
        <span class="suivi-badge ${s.moisEnCours}">${moisLabel}</span>
        <span class="suivi-accord-arrow" id="arrow-${s.uid}">▸</span>
      </button>
      <div class="suivi-accord-body" id="body-${s.uid}" style="display:none;">
        <div class="suivi-dims">${dimsHtml}</div>
        ${s.dernieresVictoires ? `<p style="font-size:12px;color:var(--sage);margin:6px 0 0;">✓ <em>${escapeAttr(s.dernieresVictoires.substring(0, 120))}${s.dernieresVictoires.length > 120 ? "…" : ""}</em></p>` : ""}
        ${s.derniersDefis ? `<p style="font-size:12px;color:var(--brick);margin:4px 0 0;">⚠ <em>${escapeAttr(s.derniersDefis.substring(0, 120))}${s.derniersDefis.length > 120 ? "…" : ""}</em></p>` : ""}
        <div class="suivi-meta" style="margin-top:8px;">
          <span>📅 Débuté : ${escapeAttr(s.dateDebut || "—")}</span>
          <span>📋 PDP : ${s.pdpPct != null ? escapeAttr(s.pdpPct) + " %" : "—"}</span>
          <span>→ Prochain : ${s.prochaineRencontre || "—"}</span>
        </div>
        <button class="btn-secondary" style="font-size:12px;padding:7px 12px;margin-top:10px;width:100%;"
          onclick="showPdpMentor('${s.uid}')">📋 Voir le PDP</button>
      </div>
    </div>`;
  }).join("")}</div>`;

  document.getElementById("refreshSuiviBtn").onclick = loadSuivi;
}

window.toggleSuivi = function(uid) {
  const body  = document.getElementById("body-" + uid);
  const arrow = document.getElementById("arrow-" + uid);
  if (!body) return;
  const open = body.style.display === "none";
  body.style.display  = open ? "" : "none";
  arrow.textContent   = open ? "▾" : "▸";
};

// Vue PDP complète pour le mentor (modale)
window.showPdpMentor = async function(uid) {
  const snap = await window.AbbaSync.watchMyPDPOnce(uid);
  if (!snap) { alert("PDP non encore rempli."); return; }
  const d = snap;

  // Trouver le nom dans SUIVI_DATA
  const progM = calculerProgression(d);
  const s = SUIVI_DATA.find(x => x.uid === uid) || {};
  const nom = `${s.prenom || ""} ${s.nom || ""}`.trim() || uid;

  const dimsHtml = DIMENSIONS.map(dim => {
    const v = d.s3?.[dim.key];
    return v ? `<div class="pdp-mentor-row">
      <dt>${dim.icone} ${dim.label}</dt>
      <dd>${v.note ? n5(v.note) : "—"}/5 — ${escapeAttr(v.desc || "")}</dd>
    </div>` : "";
  }).join("");

  const modulesHtml = MODULES_14.map((m, i) => {
    const niveaux = ["—","Pas assimilé","Compris","Application partielle","Application régulière","Maîtrise"];
    const n = d.s4?.modules?.[i] || 0;
    return `<div class="pdp-mentor-row"><dt>${i+1}. ${m}</dt><dd>${niveaux[n] || "—"}</dd></div>`;
  }).join("");

  const html = `
  <div class="pdp-mentor-overlay" id="pdpMentorOverlay" onclick="closePdpMentor(event)">
    <div class="pdp-mentor-box">
      <button class="pdp-mentor-close" onclick="document.getElementById('pdpMentorOverlay').remove()">×</button>
      <h2 style="font-family:var(--font-display);color:var(--navy);margin:0 0 6px;">PDP — ${escapeAttr(nom)}</h2>
      <p style="font-size:12px;color:var(--ink-soft);margin:0 0 20px;">Plan de Développement Personnel · Phase 2</p>

      <p class="settings-hint" style="margin:0 0 10px;">Progression du PDP : <strong>${progM.pct} %</strong> (${progM.terminees} étape${progM.terminees > 1 ? "s" : ""} terminée${progM.terminees > 1 ? "s" : ""} sur ${progM.total}).</p>

      <div class="pdp-mentor-section">
        <h3>S1 — Informations</h3>
        <div class="pdp-mentor-row"><dt>Membre ABBA</dt><dd>${escapeAttr(d.s1?.membre) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Base locale</dt><dd>${escapeAttr(d.s1?.base) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Église</dt><dd>${escapeAttr(d.s1?.eglise) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Début coaching</dt><dd>${escapeAttr(d.s1?.dateDebut) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Fin prévue</dt><dd>${escapeAttr(d.s1?.dateFin) || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S2 — Vision et Identité</h3>
        <div class="pdp-mentor-row"><dt>Verset personnel</dt><dd>${escapeAttr(d.s2?.verset) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Vision à 5 ans</dt><dd>${escapeAttr(d.s2?.vision) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Mission de vie</dt><dd>${escapeAttr(d.s2?.mission) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>MBTI</dt><dd>${escapeAttr(d.s2?.mbti) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Forces spirituelles</dt><dd>${escapeAttr(d.s2?.forces) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Talents</dt><dd>${escapeAttr(d.s2?.talents) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Dons spirituels</dt><dd>${escapeAttr(d.s2?.donsSpiris) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Domaines de croissance</dt><dd>${escapeAttr(d.s2?.croissance) || "—"}</dd></div>
        ${d.s2?.blessuresPartagees ? `<div class="pdp-mentor-row"><dt>Blessures / blocages</dt><dd>${escapeAttr(d.s2?.blessures) || "—"}</dd></div>` : `<div class="pdp-mentor-row"><dt>Blessures / blocages</dt><dd><em style="color:var(--ink-soft);">(non partagé)</em></dd></div>`}
      </div>

      <div class="pdp-mentor-section">
        <h3>S3 — Évaluation initiale des 8 dimensions</h3>
        ${dimsHtml || "<p class='settings-hint'>Non rempli.</p>"}
      </div>

      <div class="pdp-mentor-section">
        <h3>S4 — Intégration des 14 modules</h3>
        ${modulesHtml}
        <div class="pdp-mentor-row"><dt>Priorité 1</dt><dd>${escapeAttr(d.s4?.prio1) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Priorité 2</dt><dd>${escapeAttr(d.s4?.prio2) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Priorité 3</dt><dd>${escapeAttr(d.s4?.prio3) || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S5 — Ministère choisi</h3>
        <div class="pdp-mentor-row"><dt>Ministère</dt><dd>${escapeAttr(d.s5?.ministre) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Raisons</dt><dd>${escapeAttr(d.s5?.raisons) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M1-M2</dt><dd>${escapeAttr(d.s5?.planM12) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M3-M4</dt><dd>${escapeAttr(d.s5?.planM34) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M5-M6</dt><dd>${escapeAttr(d.s5?.planM56) || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S6 — Projet économique</h3>
        <div class="pdp-mentor-row"><dt>Type</dt><dd>${escapeAttr(d.s6?.typeProjet) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Description</dt><dd>${escapeAttr(d.s6?.description) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Objectifs 6 mois</dt><dd>${escapeAttr(d.s6?.objectifs) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Revenus visés</dt><dd>${d.s6?.revenusVises ? escapeAttr(d.s6.revenusVises) + " FCFA/mois" : "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M1</dt><dd>${escapeAttr(d.s6?.lancM1) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M2-M3</dt><dd>${escapeAttr(d.s6?.lancM23) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M4-M6</dt><dd>${escapeAttr(d.s6?.lancM46) || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S8 — Leadership</h3>
        <div class="pdp-mentor-row"><dt>Formations prévues</dt><dd>${escapeAttr(d.s8?.formations) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Modèles</dt><dd>${escapeAttr(d.s8?.modeles) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Opportunités</dt><dd>${escapeAttr(d.s8?.opportunites) || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S9 — Gestion du temps</h3>
        <div class="pdp-mentor-row"><dt>Ajustements</dt><dd>${escapeAttr(d.s9?.ajustements) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>À réduire</dt><dd>${escapeAttr(d.s9?.reduire) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>À augmenter</dt><dd>${escapeAttr(d.s9?.augmenter) || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S10 — Relations</h3>
        <div class="pdp-mentor-row"><dt>Famille</dt><dd>${escapeAttr(d.s10?.famille) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Église</dt><dd>${escapeAttr(d.s10?.eglise) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>ABBA</dt><dd>${escapeAttr(d.s10?.abba) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Relations à réparer</dt><dd>${escapeAttr(d.s10?.reparer) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan relationnel</dt><dd>${escapeAttr(d.s10?.planAction) || "—"}</dd></div>
      </div>


      <div class="pdp-mentor-section">
        <h3>S11 — Service communautaire : plan</h3>
        <div class="pdp-mentor-row"><dt>Zone</dt><dd>${escapeAttr(d.s11?.zone) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Besoin identifié</dt><dd>${escapeAttr(d.s11?.besoin) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Action prévue</dt><dd>${escapeAttr(d.s11?.action) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Bénéficiaires</dt><dd>${escapeAttr(d.s11?.beneficiaires) || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S12 — Engagement et redevabilité</h3>
        <div class="pdp-mentor-row"><dt>Engagements</dt><dd>${escapeAttr(d.s12?.engagements) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Partenaires</dt><dd>${escapeAttr(d.s12?.partenaires) || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Fréquence</dt><dd>${{ hebdo: "Chaque semaine", quinzaine: "Toutes les deux semaines", mensuel: "Chaque mois" }[d.s12?.frequence] || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Engagement confirmé</dt><dd>${d.s12?.confirme ? "Oui" : "Non"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S13 — Fruits de l’Esprit et disciplines (départ, sur 5)</h3>
        <div class="pdp-mentor-row"><dt>Fruits</dt><dd>${FRUITS_ESPRIT.map(k => ({ amour: "Amour", joie: "Joie", paix: "Paix", patience: "Patience", bienveillance: "Bienveillance", bonte: "Bonté", fidelite: "Fidélité", douceur: "Douceur", maitrise: "Maîtrise de soi" }[k] + " " + (d.s13?.fruits?.[k] || "—"))).join(" · ")}</dd></div>
        <div class="pdp-mentor-row"><dt>Disciplines</dt><dd>${DISCIPLINES.map(k => ({ priere: "Prière", bible: "Bible", meditation: "Méditation", jeune: "Jeûne", adoration: "Adoration", communion: "Communion fraternelle", service: "Service", partage: "Partage de la foi", generosite: "Générosité", silence: "Silence et solitude" }[k] + " " + (d.s13?.disciplines?.[k] || "—"))).join(" · ")}</dd></div>
        <div class="pdp-mentor-row"><dt>À faire croître en priorité</dt><dd>${escapeAttr(d.s13?.priorite) || "—"}</dd></div>
      </div>

      <button class="btn-secondary" style="width:100%;margin-top:8px;"
        onclick="document.getElementById('pdpMentorOverlay').remove()">Fermer</button>
    </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", html);
};

window.closePdpMentor = function(e) {
  if (e.target.id === "pdpMentorOverlay") e.target.remove();
};

// ─────────────────────────────────────────────────────────────
// ADMIN — mentors + assignments
// ─────────────────────────────────────────────────────────────
async function loadAdmin() {
  ALL_USERS = await window.AbbaSync.loadAllUsers();
  ALL_ASSIGNMENTS = await window.AbbaSync.loadAllAssignments();
  ADMIN_OUVERT = true;
  chargerDemandesAcces();
  renderMentorsList();
  renderMentorSelect();
  renderAssignSelects();
  renderAssignmentsList();
}

function renderMentorsList() {
  const container = document.getElementById("mentorsList");
  if (!ALL_MENTORS.length) { container.innerHTML = "<p class='settings-hint'>Aucun mentor pour l'instant.</p>"; return; }
  container.innerHTML = ALL_MENTORS.map(m => `
    <div class="mentor-chip">
      ${m.nom || m.email}
      <button class="mentor-chip-del" title="Retirer le rôle de mentor"
        onclick="removeMentor('${m.email}')">×</button>
    </div>
  `).join("");
}

function renderMentorSelect() {
  const sel = document.getElementById("adminMentorSelect");
  const mentorEmails = ALL_MENTORS.map(m => m.email);
  const candidates = ALL_USERS.filter(u => !mentorEmails.includes(u.email?.toLowerCase()));
  sel.innerHTML = `<option value="">— Choisir un Bâtisseur à nommer mentor —</option>` +
    candidates.map(u => `<option value="${u.uid}|${u.email}|${u.nom || ""} ${u.prenom || ""}">
      ${u.prenom || ""} ${u.nom || u.email}
    </option>`).join("");
}

function renderAssignSelects() {
  const bSel = document.getElementById("assignBatisseur");
  const mSel = document.getElementById("assignMenteur");
  bSel.innerHTML = `<option value="">— Bâtisseur —</option>` +
    ALL_USERS.map(u => `<option value="${u.uid}">${u.prenom || ""} ${u.nom || u.email}</option>`).join("");
  mSel.innerHTML = `<option value="">— Mentor —</option>` +
    ALL_MENTORS.map(m => `<option value="${m.uid}|${m.email}|${m.nom || m.email}">
      ${m.nom || m.email}
    </option>`).join("");
}

function renderAssignmentsList() {
  const container  = document.getElementById("assignmentsList");
  const emptyHint  = document.getElementById("assignmentsEmpty");
  if (!ALL_ASSIGNMENTS.length) { container.innerHTML = ""; emptyHint.style.display = ""; return; }
  emptyHint.style.display = "none";
  const userMap = Object.fromEntries(ALL_USERS.map(u => [u.uid, u]));
  container.innerHTML = ALL_ASSIGNMENTS.map(a => {
    const bat = userMap[a.batisseurUid];
    const batLabel = bat ? `${bat.prenom || ""} ${bat.nom || bat.email}` : a.batisseurUid;
    return `<div class="assignment-row">
      <span>${batLabel}</span>
      <span class="assignment-arrow">→</span>
      <span>${a.mentorNom || a.mentorEmail}</span>
      <button class="assignment-del" title="Supprimer l'assignment"
        onclick="deleteAssignment('${a.batisseurUid}')">✕</button>
    </div>`;
  }).join("");
}

// Nommer mentor
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addMentorBtn")?.addEventListener("click", async () => {
    const sel = document.getElementById("adminMentorSelect");
    const [uid, email, nom] = (sel.value || "").split("|");
    const errEl = document.getElementById("mentorError");
    if (!uid || !email) { errEl.textContent = "Choisis un Bâtisseur."; return; }
    errEl.textContent = "";
    try {
      await window.AbbaSync.addMentor(email, uid, nom.trim(), CURRENT_USER.email);
      await loadAdmin();
    } catch (err) { errEl.textContent = "Erreur : " + err.message; }
  });

  document.getElementById("assignBtn")?.addEventListener("click", async () => {
    const batUid  = document.getElementById("assignBatisseur")?.value;
    const mentVal = document.getElementById("assignMenteur")?.value;
    const errEl   = document.getElementById("assignError");
    if (!batUid || !mentVal) { errEl.textContent = "Choisis un Bâtisseur et un mentor."; return; }
    const [mentUid, mentEmail, mentNom] = mentVal.split("|");
    errEl.textContent = "";
    try {
      await window.AbbaSync.assignMentor(batUid, mentEmail, mentUid, mentNom, CURRENT_USER.email);
      await loadAdmin();
    } catch (err) { errEl.textContent = "Erreur : " + err.message; }
  });
});

window.removeMentor = async function(email) {
  if (!confirm(`Retirer le rôle de mentor à ${email} ?`)) return;
  await window.AbbaSync.removeMentor(email);
  await loadAdmin();
};

window.deleteAssignment = async function(batisseurUid) {
  if (!confirm("Supprimer cet assignment ?")) return;
  await window.AbbaSync.unassignMentor(batisseurUid);
  await loadAdmin();
};

// ─────────────────────────────────────────────────────────────
// Utilitaires DOM
// ─────────────────────────────────────────────────────────────
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.value = val;
}
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}
function setCheck(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}
function getCheck(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}
