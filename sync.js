// ============================================================
// sync.js — ABBA Mise en Action
// Même projet Firebase qu'ABBA Life et Parcours Bâtisseur :
// mêmes comptes, même base de données. Connexion uniquement —
// le compte se crée sur ABBA Life.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
  onSnapshot, serverTimestamp, collection, getDocs, query, where,
  enableIndexedDbPersistence, deleteField, writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAILS } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try { enableIndexedDbPersistence(db); } catch (e) { /* déjà actif dans un autre onglet */ }

// ============================================================
// UTILITAIRES
// ============================================================
function isAdminEmail(email) {
  return !!email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(String(email).toLowerCase());
}

// ============================================================
// AUTHENTIFICATION
// Connexion uniquement — inscription sur ABBA Life
// ============================================================
async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}
async function logOut() { await signOut(auth); }
function watchAuth(callback) { onAuthStateChanged(auth, callback); }
async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ============================================================
// COORDINATEURS / ADMINS (même liste que sur ABBA Life)
// ============================================================
function watchAdmins(callback) {
  return onSnapshot(collection(db, "admins"), (snap) => {
    callback(snap.docs.map(d => d.id));
  }, (err) => console.error("watchAdmins:", err));
}

// ============================================================
// MENTORS
// /mea_mentors/{email} — { uid, nom, email, createdBy, createdAt }
// Créés et supprimés par les admins uniquement.
// ============================================================
// Savoir si MOI je suis mentor : on lit seulement ma propre fiche (la liste complète est réservée aux coordinateurs)
function watchMyMentorRole(email, callback) {
  return onSnapshot(doc(db, "mea_mentors", String(email).trim().toLowerCase()), (snap) => {
    callback(snap.exists());
  }, (err) => { console.error("watchMyMentorRole:", err); callback(false); });
}
// Liste complète des mentors : coordinateurs seulement
function watchMentors(callback) {
  return onSnapshot(collection(db, "mea_mentors"), (snap) => {
    callback(snap.docs.map(d => ({ email: d.id, ...d.data() })));
  }, (err) => console.error("watchMentors:", err));
}
async function addMentor(email, uid, nom, createdByEmail) {
  const key = email.trim().toLowerCase();
  await setDoc(doc(db, "mea_mentors", key), {
    uid, nom, email: key, createdBy: createdByEmail, createdAt: serverTimestamp(),
  });
}
async function removeMentor(email) {
  await deleteDoc(doc(db, "mea_mentors", email.trim().toLowerCase()));
}

// ============================================================
// ASSIGNMENTS — qui suit qui
// /mea_assignments/{batisseurUid} — { mentorEmail, mentorUid, mentorNom, assignedBy, assignedAt }
// Écrit par admin, lu par mentor (pour ses bâtisseurs) et par le bâtisseur lui-même.
// ============================================================
async function assignMentor(batisseurUid, mentorEmail, mentorUid, mentorNom, byEmail) {
  const key = mentorEmail.trim().toLowerCase();
  // Écrire l'assignment
  await setDoc(doc(db, "mea_assignments", batisseurUid), {
    mentorEmail: key,
    mentorUid,
    mentorNom,
    assignedBy: byEmail,
    assignedAt: serverTimestamp(),
  });
  // Propager mentorEmail dans mea_summaries pour que le mentor puisse filtrer
  await setDoc(doc(db, "mea_summaries", batisseurUid), {
    mentorEmail: key,
    mentorNom,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

async function unassignMentorFromSummary(batisseurUid) {
  await setDoc(doc(db, "mea_summaries", batisseurUid), {
    mentorEmail: null,
    mentorNom: null,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
async function unassignMentor(batisseurUid) {
  await deleteDoc(doc(db, "mea_assignments", batisseurUid));
  await unassignMentorFromSummary(batisseurUid);
}
async function getMyAssignment(batisseurUid) {
  const snap = await getDoc(doc(db, "mea_assignments", batisseurUid));
  return snap.exists() ? snap.data() : null;
}
async function loadAllAssignments() {
  const snap = await getDocs(collection(db, "mea_assignments"));
  return snap.docs.map(d => ({ batisseurUid: d.id, ...d.data() }));
}

// ============================================================
// CONFIDENTIALITÉ GARANTIE PAR LE SERVEUR
// Deux documents par bâtisseur :
//   /users/{uid}/priv/mea_pdp, mea_rencontres → PARTAGÉS : lisibles par le mentor affecté et le suivi.
//                                                 Ils ne contiennent un texte sensible (blessures, défis)
//                                                 QUE si le bâtisseur a coché « partager ».
//   /users/{uid}/priv/mea_prive               → PRIVÉ : lisible par le bâtisseur seul (règles Firestore).
//                                                 Il garde toujours le texte complet.
// Ainsi le mentor ne peut pas lire un texte non partagé, même en contournant l'écran.
// ============================================================
function privRef(uid, nom) { return doc(db, "users", uid, "priv", nom); }

// Écoute deux documents et rend à l'application la vue complète (partagé + privé) du bâtisseur
function watchSharedAndPrive(uid, sharedName, fusion, callback) {
  let shared = {}, prive = {};
  const emit = () => callback(fusion(shared, prive));
  const u1 = onSnapshot(privRef(uid, sharedName), (snap) => { shared = snap.exists() ? snap.data() : {}; emit(); },
    (err) => console.error("watch " + sharedName + ":", err));
  const u2 = onSnapshot(privRef(uid, "mea_prive"), (snap) => { prive = snap.exists() ? snap.data() : {}; emit(); },
    (err) => console.error("watch mea_prive:", err));
  return () => { u1(); u2(); };
}

// ============================================================
// PDP — Plan de Développement Personnel
// /users/{uid}/priv/mea_pdp — toutes les sections (partagées avec le mentor)
// /users/{uid}/priv/mea_prive — { blessures } : jamais lisible par le mentor
// ============================================================
function watchMyPDP(uid, callback) {
  return watchSharedAndPrive(uid, "mea_pdp", (shared, prive) => {
    if (prive.blessures === undefined) return shared;
    return { ...shared, s2: { ...(shared.s2 || {}), blessures: prive.blessures } };
  }, callback);
}
async function saveMyPDP(uid, data) {
  const s2 = data.s2 || null;
  const blessures = s2 ? (s2.blessures || "") : null;
  const partage = !!(s2 && s2.blessuresPartagees);
  const shared = { ...data, updatedAt: serverTimestamp() };
  if (s2) {
    const { blessures: _prive, ...s2Public } = s2;
    // Le texte n'est copié dans le document partagé que si la personne l'a choisi ; sinon on l'y efface
    shared.s2 = { ...s2Public, blessures: partage ? blessures : deleteField() };
  }
  const lot = writeBatch(db);
  if (s2) lot.set(privRef(uid, "mea_prive"), { blessures, updatedAt: serverTimestamp() }, { merge: true });
  lot.set(privRef(uid, "mea_pdp"), shared, { merge: true });
  await lot.commit();
}

// ============================================================
// RENCONTRES MENSUELLES
// /users/{uid}/priv/mea_rencontres — { mois1: {...}, ... } (partagé ; « defis » seulement si defisPartages)
// /users/{uid}/priv/mea_prive      — { rencontres: { mois1: { defis } } } (privé)
//
// Structure d'une rencontre :
// { date, themes, notes8dim: {...}, victoires, defis, defisPartages (choix du bâtisseur),
//   actionsCorrectves, verrouille, verrouilleAt }
// ============================================================
function watchMyRencontres(uid, callback) {
  return watchSharedAndPrive(uid, "mea_rencontres", (shared, prive) => {
    const out = { ...shared };
    for (const [k, r] of Object.entries(prive.rencontres || {})) {
      if (out[k] && r && r.defis !== undefined) out[k] = { ...out[k], defis: r.defis };
    }
    return out;
  }, callback);
}
async function saveRencontre(uid, moisKey, data) {
  // moisKey = "mois1" … "mois6"
  const { defis, ...autres } = data;
  const texte = defis || "";
  const partage = !!autres.defisPartages;
  const lot = writeBatch(db);
  lot.set(privRef(uid, "mea_prive"), {
    rencontres: { [moisKey]: { defis: texte, updatedAt: serverTimestamp() } },
    updatedAt: serverTimestamp(),
  }, { merge: true });
  lot.set(privRef(uid, "mea_rencontres"), {
    [moisKey]: { ...autres, defis: partage ? texte : deleteField(), updatedAt: serverTimestamp() },
  }, { merge: true });
  await lot.commit();
}

// ============================================================
// RÉSUMÉS — vue allégée pour mentor et admin
// /mea_summaries/{batisseurUid}
// {
//   nom, email, dateDebut, moisEnCours (1–6 ou "bilan"),
//   dernieresNotes8dim: { esprit, … },  ← toujours visibles
//   dernieresVictoires: string,          ← toujours visibles
//   derniersDefis: string|null,          ← seulement si defisPartages=true
//   prochaineRencontre: string (date),
//   pdpComplet: boolean,
//   updatedAt
// }
// Écrit par le bâtisseur lui-même à chaque sauvegarde rencontre/PDP.
// Lu par admin (tous) et mentor (ses bâtisseurs seulement — réglé dans firestore.rules).
// ============================================================
async function saveSummary(uid, summary) {
  await setDoc(doc(db, "mea_summaries", uid), {
    ...summary, updatedAt: serverTimestamp(),
  }, { merge: true });
}
async function loadAllSummaries() {
  const snap = await getDocs(collection(db, "mea_summaries"));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}
// Le mentor charge uniquement les résumés de ses bâtisseurs
// Utilise un champ mentorEmail stocké dans mea_summaries (pas de lecture de mea_assignments)
async function loadMySummaries(mentorEmail) {
  const key = mentorEmail.trim().toLowerCase();
  const q = query(
    collection(db, "mea_summaries"),
    where("mentorEmail", "==", key)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

// ============================================================
// LISTE DES BÂTISSEURS ENREGISTRÉS (pour l'interface admin)
// Réutilise /summaries (ABBA Life) pour récupérer les noms/emails connus
// + /mea_summaries pour savoir qui a un PDP.
// ============================================================
async function loadAllUsers() {
  // Charge depuis /summaries (ABBA Life) + /users directement
  // pour couvrir tous les comptes même sans activité ABBA Life
  const [summSnap, usersSnap] = await Promise.all([
    getDocs(collection(db, "summaries")),
    getDocs(collection(db, "users")),
  ]);
  const map = {};
  // D'abord les profils /users (source de vérité pour nom/prénom/email)
  usersSnap.docs.forEach(d => { map[d.id] = { uid: d.id, ...d.data() }; });
  // Compléter avec summaries si le profil /users est incomplet
  summSnap.docs.forEach(d => {
    if (!map[d.id]) map[d.id] = { uid: d.id, ...d.data() };
  });
  return Object.values(map).filter(u => u.email || u.nom || u.prenom);
}

// Lecture unique du PDP d'un bâtisseur (par le mentor ou l'admin)
async function readPDPOnce(uid) {
  const snap = await getDoc(doc(db, "users", uid, "priv", "mea_pdp"));
  return snap.exists() ? snap.data() : null;
}

// Compte de paiement du Parcours (formation/{uid}/compte/paiement) : la Mise en Action s'ouvre une fois le total payé
async function getComptePaiement(uid) {
  const snap = await getDoc(doc(db, "formation", uid, "compte", "paiement"));
  return snap.exists() ? snap.data() : null;
}
// Certificat de fin de formation du Parcours (copie privée de l'étudiant) : null tant qu'il n'est pas délivré
async function getCertificatParcours(uid) {
  const snap = await getDoc(doc(db, "formation", uid, "attestations", "parcours"));
  return snap.exists() ? snap.data() : null;
}

// Coordinateurs et mentors entrent toujours dans la Mise en Action
async function estExempte(user) {
  if (isAdminEmail(user.email)) return true;
  const email = String(user.email || "").trim().toLowerCase();
  try { if ((await getDoc(doc(db, "mea_mentors", email))).exists()) return true; } catch (e) { /* ignoré */ }
  try { if ((await getDoc(doc(db, "admins", email))).exists()) return true; } catch (e) { /* non coordinateur : lecture refusée */ }
  return false;
}

// Modules du Parcours, dans l'ordre des 14 modules de la Mise en Action (le 14 regroupe 14.1 et 14.2)
const PARCOURS_MODULES = [["m1"],["m2"],["m3"],["m4"],["m5"],["m6"],["m7"],["m8"],["m9"],["m10"],["m11"],["m12"],["m13"],["m14","m14b"]];

// Calcule ce qu'on peut reprendre à partir des données brutes du Parcours (fonction pure, testable)
function calculerReprise(brut) {
  const out = { nom: brut.nom || "", paysCode: brut.paysCode || "", mbti: brut.mbti || "", notes: null, niveaux: null, nbValides: 0 };
  const fiche = brut.autoeval && brut.autoeval.done ? (brut.autoeval.ficheData || {}) : null;
  if (fiche) {
    const notes = [1,2,3,4,5,6,7,8].map(n => Math.min(5, Math.max(0, Number(fiche["d" + n]) || 0)));
    if (notes.every(n => n > 0)) out.notes = notes;
  }
  const acquis = brut.acquis || [];
  const modules = brut.modules || {};
  const fini = (id) => acquis.includes(id) || (modules[id] && modules[id].ficheStatus === "validated" && modules[id].qcm && modules[id].qcm.ok);
  out.niveaux = PARCOURS_MODULES.map(ids => ids.every(fini) ? 3 : 1);
  out.nbValides = out.niveaux.filter(n => n === 3).length;
  if (!out.nbValides && !acquis.length && !Object.keys(modules).length) out.niveaux = null;
  return out;
}

// Lit les données du Parcours de l'étudiant (toutes lisibles par lui seul) ; une lecture qui échoue n'empêche pas les autres
async function getReprise(uid) {
  const lire = async (fn, vide) => { try { return await fn(); } catch (e) { return vide; } };
  const [profil, contact, profilForm, formation, modSnap] = await Promise.all([
    lire(async () => (await getDoc(doc(db, "users", uid))).data() || {}, {}),
    lire(async () => (await getDoc(doc(db, "users", uid, "priv", "contact"))).data() || {}, {}),
    lire(async () => (await getDoc(doc(db, "users", uid, "priv", "profilFormation"))).data() || {}, {}),
    lire(async () => (await getDoc(doc(db, "formation", uid))).data() || {}, {}),
    lire(async () => await getDocs(collection(db, "formation", uid, "modules")), null),
  ]);
  const modules = {};
  if (modSnap) modSnap.docs.forEach(d => { modules[d.id] = d.data(); });
  const pays = String(contact.pays || "").toUpperCase();
  return calculerReprise({
    // Dans le compte Parcours, « nom » contient déjà le prénom et le nom
    nom: String(profil.nom || [profil.prenomSaisi, profil.nomFamille].filter(Boolean).join(" ")).trim(),
    paysCode: /^[A-Z]{2}$/.test(pays) ? pays : "",
    mbti: profilForm.mbti || "",
    autoeval: modules.autoeval || null,
    acquis: formation.acquis || [],
    modules,
  });
}

window.AbbaSync = {
  getCertificatParcours, estExempte, getReprise, calculerReprise,
  getComptePaiement,
  isAdminEmail,
  logIn, logOut, watchAuth, getUserProfile,
  watchAdmins,
  watchMyMentorRole, watchMentors, addMentor, removeMentor,
  assignMentor, unassignMentor, unassignMentorFromSummary,
  getMyAssignment, loadAllAssignments,
  watchMyPDP, saveMyPDP,
  watchMyRencontres, saveRencontre,
  saveSummary, loadAllSummaries, loadMySummaries,
  watchMyPDPOnce: readPDPOnce,
  loadAllUsers,
};
