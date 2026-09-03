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
let unsubMentors   = null;

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
  [unsubAdmins, unsubPDP, unsubRencontres, unsubMentors].forEach(fn => fn && fn());
  unsubAdmins = unsubPDP = unsubRencontres = unsubMentors = null;

  if (!user) {
    CURRENT_USER = null; IS_ADMIN = false; IS_MENTOR = false;
    document.getElementById("authScreen").style.display = "flex";
    document.getElementById("app").style.display = "none";
    return;
  }

  CURRENT_USER = user;
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("app").style.display = "";

  const hint = `Connecté(e) en tant que ${user.displayName || user.email}`;
  document.getElementById("accueilEmail").textContent = hint;
  document.getElementById("accountEmailHint").textContent = hint;

  // Charger profil utilisateur
  const profile = await window.AbbaSync.getUserProfile(user.uid) || {};
  document.getElementById("accueilSalut").textContent =
    profile.prenom ? `Bienvenue, ${profile.prenom} 👋` : "Phase 2 — Mise en Action";

  // S1 — mentor assigné (readonly)
  MY_ASSIGNMENT = await window.AbbaSync.getMyAssignment(user.uid);
  if (MY_ASSIGNMENT) {
    document.getElementById("s1Mentor").value = MY_ASSIGNMENT.mentorNom || MY_ASSIGNMENT.mentorEmail;
  }

  // Admins
  unsubAdmins = window.AbbaSync.watchAdmins((emails) => {
    const isBootstrap = window.AbbaSync.isAdminEmail(user.email);
    IS_ADMIN = isBootstrap || emails.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
    applyRoles();
  });

  // Mentors — vérifier si l'utilisateur est mentor
  unsubMentors = window.AbbaSync.watchMentors((list) => {
    ALL_MENTORS = list;
    IS_MENTOR = list.some(m => m.email.toLowerCase() === user.email.toLowerCase());
    applyRoles();
  });

  // PDP
  unsubPDP = window.AbbaSync.watchMyPDP(user.uid, (data) => {
    MY_PDP = data;
    loadPdpIntoForm();
    updatePdpProgress();
    updateAccueilPdpHint();
  });

  // Rencontres
  unsubRencontres = window.AbbaSync.watchMyRencontres(user.uid, (data) => {
    MY_RENCONTRES = data;
    renderRencontresPanel();
    updateBilan();
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

  // Bouton enregistrer
  document.getElementById("savePdpBtn").addEventListener("click", savePdp);

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
          <span class="dim-eval-score" id="s3-score-display-${dim.key}">5</span>
        </div>
        <div class="dim-score-row">
          <input type="range" min="1" max="10" value="5" id="s3-range-${dim.key}"
            oninput="updateDimScore('${dim.key}')">
          <span class="dim-level-badge" id="s3-badge-${dim.key}">En développement</span>
        </div>
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
  const val = parseInt(document.getElementById("s3-range-" + key).value);
  document.getElementById("s3-score-display-" + key).textContent = val + "/10";
  const badge = document.getElementById("s3-badge-" + key);
  if (val <= 3) { badge.textContent = "Critique"; badge.className = "dim-level-badge critique"; }
  else if (val <= 6) { badge.textContent = "En développement"; badge.className = "dim-level-badge dev"; }
  else if (val <= 8) { badge.textContent = "Bon"; badge.className = "dim-level-badge bon"; }
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
    if (range && v.note) { range.value = v.note; updateDimScore(dim.key); }
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
}

async function savePdp() {
  if (!CURRENT_USER) return;
  const btn = document.getElementById("savePdpBtn");
  btn.textContent = "Enregistrement…"; btn.disabled = true;

  const data = {
    s1: {
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
    data.s3[dim.key] = {
      note:  parseInt(document.getElementById("s3-range-" + dim.key)?.value) || 5,
      desc:  getVal("s3-desc-" + dim.key),
      forts: getVal("s3-forts-" + dim.key),
      defis: getVal("s3-defis-" + dim.key),
    };
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

  try {
    await window.AbbaSync.saveMyPDP(CURRENT_USER.uid, data);
    // Mettre à jour le résumé pour le mentor
    await pushSummary();
    btn.textContent = "✓ Enregistré";
    setTimeout(() => { btn.textContent = "Enregistrer"; btn.disabled = false; }, 2000);
  } catch (err) {
    console.error(err);
    btn.textContent = "Erreur — Réessayer"; btn.disabled = false;
  }
}

function updatePdpProgress() {
  if (!MY_PDP || !Object.keys(MY_PDP).length) return;
  // Score simple : combien de sections ont au moins un champ rempli
  const sections = ["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10"];
  const filled = sections.filter(s => MY_PDP[s] && Object.keys(MY_PDP[s]).length).length;
  const pct = Math.round((filled / sections.length) * 100);
  // Colorier les onglets PDP terminés
  sections.forEach(s => {
    const tab = document.querySelector(`.pdp-tab[data-section="${s}"]`);
    if (tab && MY_PDP[s] && Object.keys(MY_PDP[s]).length) tab.classList.add("done");
  });
}

function updateAccueilPdpHint() {
  const hint = document.getElementById("accueilPdpHint");
  if (!MY_PDP || !Object.keys(MY_PDP).length) {
    hint.textContent = "Remplis ton PDP pour démarrer ta Phase 2.";
  } else {
    const sections = ["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10"];
    const filled = sections.filter(s => MY_PDP[s] && Object.keys(MY_PDP[s]).length).length;
    hint.textContent = `${filled} / ${sections.length} sections complétées.`;
  }
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

    <p class="eyebrow" style="margin-top:4px;">Évaluation des 8 dimensions (1–10)</p>
    <div class="dim-grid">
      ${DIMENSIONS.map(dim => `
        <div class="dim-item">
          <span class="dim-label">${dim.icone} ${dim.label}</span>
          <div class="dim-score">
            <input type="range" min="1" max="10" value="5"
              id="r-dim-${dim.key}" oninput="updateRDim('${dim.key}')">
            <span class="dim-score-val" id="r-dim-val-${dim.key}">5</span>
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
      const val = d.notes8dim?.[dim.key] || "—";
      return `<span class="histo-dim">${dim.icone} <strong>${val}</strong><small>${dim.label.substring(0,5)}</small></span>`;
    }).join("");
    return `
      <div class="histo-card">
        <div class="histo-head">
          <span class="histo-label">${MOIS_LABELS[moisNum-1]}</span>
          <span class="histo-date">${d.date || ""}</span>
          <span class="histo-lock">🔒</span>
        </div>
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
    notes8dim[dim.key] = parseInt(document.getElementById("r-dim-" + dim.key)?.value) || 5;
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
  const notesDebut = MY_PDP?.s3 ?
    DIMENSIONS.reduce((acc, d) => { acc[d.key] = MY_PDP.s3[d.key]?.note || 0; return acc; }, {}) :
    (r1.notes8dim || {});
  const notesFin = r6.notes8dim || {};

  // Tableau comparatif
  const rows = DIMENSIONS.map(dim => {
    const debut = notesDebut[dim.key] || 0;
    const fin   = notesFin[dim.key]   || 0;
    const diff  = fin - debut;
    const cls   = diff > 0 ? "bilan-prog-pos" : diff < 0 ? "bilan-prog-neg" : "bilan-prog-zero";
    const sign  = diff > 0 ? "+" : "";
    return `<tr>
      <td>${dim.icone} ${dim.label}</td>
      <td>${debut}/10</td>
      <td>${fin}/10</td>
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
        <thead><tr><th>Dimension</th><th>Début</th><th>Fin</th><th>Évolution</th></tr></thead>
        <tbody>
          ${rows.join("")}
          <tr style="font-weight:700;border-top:1px solid var(--ink);">
            <td>Moyenne</td>
            <td>${dMoy}/10</td>
            <td>${fMoy}/10</td>
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
                <div class="radar-bar-fill" style="width:${val * 10}%"></div>
              </div>
              <span class="radar-bar-val">${val}/10</span>
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
async function pushSummary() {
  if (!CURRENT_USER) return;
  const profile = await window.AbbaSync.getUserProfile(CURRENT_USER.uid) || {};
  const moisDone = MOIS_KEYS.filter(k => MY_RENCONTRES[k]?.date).length;
  const dernierMois = MOIS_KEYS.slice().reverse().find(k => MY_RENCONTRES[k]?.date);
  const derniereRencontre = dernierMois ? MY_RENCONTRES[dernierMois] : null;

  // Prochaine rencontre = mois suivant non complété
  const prochainMois = MOIS_KEYS.find(k => !MY_RENCONTRES[k]?.date);

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
    pdpComplet:    Object.keys(MY_PDP).length >= 8,
    // Champ clé : permet au mentor de filtrer ses résumés sans lire mea_assignments
    mentorEmail:   MY_ASSIGNMENT?.mentorEmail || null,
    mentorNom:     MY_ASSIGNMENT?.mentorNom   || null,
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

    return `<div class="suivi-card">
      <div class="suivi-card-head">
        <span class="suivi-card-name">${s.prenom || ""} ${s.nom || s.email}</span>
        <span class="suivi-badge ${s.moisEnCours}">${moisLabel}</span>
      </div>
      <div class="suivi-dims">${dimsHtml}</div>
      ${s.dernieresVictoires ? `<p style="font-size:12px;color:var(--ink-soft);margin:0;">
        ✓ <em>${s.dernieresVictoires.substring(0, 80)}${s.dernieresVictoires.length > 80 ? "…" : ""}</em></p>` : ""}
      ${s.derniersDefis ? `<p style="font-size:12px;color:var(--brick);margin:0;">
        ⚠ <em>${s.derniersDefis.substring(0, 80)}${s.derniersDefis.length > 80 ? "…" : ""}</em></p>` : ""}
      <div class="suivi-meta">
        <span>📅 PDP débuté : ${s.dateDebut || "—"}</span>
        <span>→ Prochaine : ${s.prochaineRencontre || "—"}</span>
      </div>
      <button class="btn-secondary" style="font-size:12px;padding:7px 12px;margin-top:6px;"
        onclick="showPdpMentor('${s.uid}')">📋 Voir le PDP</button>
    </div>`;
  }).join("")}</div>`;

  document.getElementById("refreshSuiviBtn").onclick = loadSuivi;
}

// Vue PDP complète pour le mentor (modale)
window.showPdpMentor = async function(uid) {
  const snap = await window.AbbaSync.watchMyPDPOnce(uid);
  if (!snap) { alert("PDP non encore rempli."); return; }
  const d = snap;

  // Trouver le nom dans SUIVI_DATA
  const s = SUIVI_DATA.find(x => x.uid === uid) || {};
  const nom = `${s.prenom || ""} ${s.nom || ""}`.trim() || uid;

  const dimsHtml = DIMENSIONS.map(dim => {
    const v = d.s3?.[dim.key];
    return v ? `<div class="pdp-mentor-row">
      <dt>${dim.icone} ${dim.label}</dt>
      <dd>${v.note || "—"}/10 — ${v.desc || ""}</dd>
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
      <h2 style="font-family:var(--font-display);color:var(--navy);margin:0 0 6px;">PDP — ${nom}</h2>
      <p style="font-size:12px;color:var(--ink-soft);margin:0 0 20px;">Plan de Développement Personnel · Phase 2</p>

      <div class="pdp-mentor-section">
        <h3>S1 — Informations</h3>
        <div class="pdp-mentor-row"><dt>Membre ABBA</dt><dd>${d.s1?.membre || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Base locale</dt><dd>${d.s1?.base || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Église</dt><dd>${d.s1?.eglise || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Début coaching</dt><dd>${d.s1?.dateDebut || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Fin prévue</dt><dd>${d.s1?.dateFin || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S2 — Vision et Identité</h3>
        <div class="pdp-mentor-row"><dt>Verset personnel</dt><dd>${d.s2?.verset || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Vision à 5 ans</dt><dd>${d.s2?.vision || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Mission de vie</dt><dd>${d.s2?.mission || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>MBTI</dt><dd>${d.s2?.mbti || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Forces spirituelles</dt><dd>${d.s2?.forces || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Talents</dt><dd>${d.s2?.talents || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Dons spirituels</dt><dd>${d.s2?.donsSpiris || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Domaines de croissance</dt><dd>${d.s2?.croissance || "—"}</dd></div>
        ${d.s2?.blessuresPartagees ? `<div class="pdp-mentor-row"><dt>Blessures / blocages</dt><dd>${d.s2?.blessures || "—"}</dd></div>` : `<div class="pdp-mentor-row"><dt>Blessures / blocages</dt><dd><em style="color:var(--ink-soft);">(non partagé)</em></dd></div>`}
      </div>

      <div class="pdp-mentor-section">
        <h3>S3 — Évaluation initiale des 8 dimensions</h3>
        ${dimsHtml || "<p class='settings-hint'>Non rempli.</p>"}
      </div>

      <div class="pdp-mentor-section">
        <h3>S4 — Intégration des 14 modules</h3>
        ${modulesHtml}
        <div class="pdp-mentor-row"><dt>Priorité 1</dt><dd>${d.s4?.prio1 || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Priorité 2</dt><dd>${d.s4?.prio2 || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Priorité 3</dt><dd>${d.s4?.prio3 || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S5 — Ministère choisi</h3>
        <div class="pdp-mentor-row"><dt>Ministère</dt><dd>${d.s5?.ministre || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Raisons</dt><dd>${d.s5?.raisons || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M1-M2</dt><dd>${d.s5?.planM12 || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M3-M4</dt><dd>${d.s5?.planM34 || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M5-M6</dt><dd>${d.s5?.planM56 || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S6 — Projet économique</h3>
        <div class="pdp-mentor-row"><dt>Type</dt><dd>${d.s6?.typeProjet || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Description</dt><dd>${d.s6?.description || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Objectifs 6 mois</dt><dd>${d.s6?.objectifs || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Revenus visés</dt><dd>${d.s6?.revenusVises ? d.s6.revenusVises + " FCFA/mois" : "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M1</dt><dd>${d.s6?.lancM1 || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M2-M3</dt><dd>${d.s6?.lancM23 || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan M4-M6</dt><dd>${d.s6?.lancM46 || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S8 — Leadership</h3>
        <div class="pdp-mentor-row"><dt>Formations prévues</dt><dd>${d.s8?.formations || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Modèles</dt><dd>${d.s8?.modeles || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Opportunités</dt><dd>${d.s8?.opportunites || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S9 — Gestion du temps</h3>
        <div class="pdp-mentor-row"><dt>Ajustements</dt><dd>${d.s9?.ajustements || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>À réduire</dt><dd>${d.s9?.reduire || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>À augmenter</dt><dd>${d.s9?.augmenter || "—"}</dd></div>
      </div>

      <div class="pdp-mentor-section">
        <h3>S10 — Relations</h3>
        <div class="pdp-mentor-row"><dt>Famille</dt><dd>${d.s10?.famille || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Église</dt><dd>${d.s10?.eglise || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>ABBA</dt><dd>${d.s10?.abba || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Relations à réparer</dt><dd>${d.s10?.reparer || "—"}</dd></div>
        <div class="pdp-mentor-row"><dt>Plan relationnel</dt><dd>${d.s10?.planAction || "—"}</dd></div>
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
