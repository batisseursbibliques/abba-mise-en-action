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
  enableIndexedDbPersistence,
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
// PDP — Plan de Développement Personnel
// /users/{uid}/priv/mea_pdp — toutes les sections initiales (S1–S8, S16, S17)
// Écrit par le bâtisseur, lu par admin et mentor assigné (via mea_summaries).
// ============================================================
function watchMyPDP(uid, callback) {
  return onSnapshot(doc(db, "users", uid, "priv", "mea_pdp"), (snap) => {
    callback(snap.exists() ? snap.data() : {});
  }, (err) => console.error("watchMyPDP:", err));
}
async function saveMyPDP(uid, data) {
  await setDoc(doc(db, "users", uid, "priv", "mea_pdp"), {
    ...data, updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ============================================================
// RENCONTRES MENSUELLES
// /users/{uid}/priv/mea_rencontres — { mois1: {...}, mois2: {...}, ... }
// Un objet par mois, jamais écrasé — merge: true garantit l'historique.
//
// Structure d'une rencontre :
// {
//   date, themesAbordes, notes8dim: { esprit, psychologie, physique,
//   subsistance, education, profession, finance, societe },
//   victoires, defis, actionsCorrectves,
//   defisPartages: true/false  (décidé par le bâtisseur)
// }
// ============================================================
function watchMyRencontres(uid, callback) {
  return onSnapshot(doc(db, "users", uid, "priv", "mea_rencontres"), (snap) => {
    callback(snap.exists() ? snap.data() : {});
  }, (err) => console.error("watchMyRencontres:", err));
}
async function saveRencontre(uid, moisKey, data) {
  // moisKey = "mois1" … "mois6"
  await setDoc(doc(db, "users", uid, "priv", "mea_rencontres"), {
    [moisKey]: { ...data, updatedAt: serverTimestamp() },
  }, { merge: true });
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

window.AbbaSync = {
  isAdminEmail,
  logIn, logOut, watchAuth, getUserProfile,
  watchAdmins,
  watchMentors, addMentor, removeMentor,
  assignMentor, unassignMentor, unassignMentorFromSummary,
  getMyAssignment, loadAllAssignments,
  watchMyPDP, saveMyPDP,
  watchMyRencontres, saveRencontre,
  saveSummary, loadAllSummaries, loadMySummaries,
  watchMyPDPOnce: readPDPOnce,
  loadAllUsers,
};
