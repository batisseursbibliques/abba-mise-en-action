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
// Limite de bâtisseurs par mentor : réglée par le coordinateur (maximum 20, garanti par les règles de sécurité)
async function getLimiteMentors() {
  try { const sn = await getDoc(doc(db, "mea_config", "limites")); return sn.exists() ? (sn.data().maxParMentor || 20) : 20; }
  catch (e) { return 20; }
}
async function setLimiteMentors(n, byEmail) {
  await setDoc(doc(db, "mea_config", "limites"), { maxParMentor: n, par: byEmail, updatedAt: serverTimestamp() });
}
// Remet les compteurs d'accord avec les affectations réelles (le serveur compare ensuite n -> n+1). Renvoie { email: nombre }.
async function recalculerCharges() {
  const as = await loadAllAssignments();
  const cnt = {};
  as.forEach(a => { if (a.mentorEmail) cnt[a.mentorEmail] = (cnt[a.mentorEmail] || 0) + 1; });
  const snap = await getDocs(collection(db, "mea_charges"));
  const exist = {}; snap.docs.forEach(d => { exist[d.id] = d.data().count || 0; });
  for (const e of new Set([...Object.keys(cnt), ...Object.keys(exist)])) {
    const n = cnt[e] || 0;
    if (exist[e] !== n) {
      try { await setDoc(doc(db, "mea_charges", e), { count: n, updatedAt: serverTimestamp() }); }
      catch (err) { console.warn("compteur non mis à jour pour", e, err.message); }
    }
  }
  return cnt;
}
async function assignMentor(batisseurUid, mentorEmail, mentorUid, mentorNom, byEmail) {
  const key = mentorEmail.trim().toLowerCase();
  const [limite, cnt, ancien] = await Promise.all([getLimiteMentors(), recalculerCharges(), getMyAssignment(batisseurUid)]);
  const ancienEmail = ancien?.mentorEmail || "";
  if (ancienEmail === key) return;
  if ((cnt[key] || 0) >= limite) throw new Error(`Ce mentor suit déjà ${cnt[key] || 0} bâtisseurs (limite : ${limite}).`);
  // Tout part dans UN SEUL envoi : l'affectation, les compteurs, le résumé et l'historique.
  // Les règles de sécurité vérifient que le compteur du mentor passe bien de n à n+1 sans dépasser la limite.
  const lot = writeBatch(db);
  lot.set(doc(db, "mea_charges", key), { count: (cnt[key] || 0) + 1, updatedAt: serverTimestamp() });
  if (ancienEmail) lot.set(doc(db, "mea_charges", ancienEmail), { count: Math.max(0, (cnt[ancienEmail] || 1) - 1), updatedAt: serverTimestamp() });
  lot.set(doc(db, "mea_assignments", batisseurUid), {
    mentorEmail: key, mentorUid, mentorNom, assignedBy: byEmail, assignedAt: serverTimestamp(),
  });
  lot.set(doc(db, "mea_summaries", batisseurUid), { mentorEmail: key, mentorNom, updatedAt: serverTimestamp() }, { merge: true });
  lot.set(doc(collection(db, "mea_affectations_histo")), {
    batisseurUid, ancienMentor: ancienEmail || null, nouveauMentor: key, par: byEmail, at: serverTimestamp(),
  });
  await lot.commit();
}
async function unassignMentorFromSummary(batisseurUid) {
  await setDoc(doc(db, "mea_summaries", batisseurUid), {
    mentorEmail: null, mentorNom: null, updatedAt: serverTimestamp(),
  }, { merge: true });
}
async function unassignMentor(batisseurUid, byEmail) {
  const [cnt, ancien] = await Promise.all([recalculerCharges(), getMyAssignment(batisseurUid)]);
  const lot = writeBatch(db);
  if (ancien?.mentorEmail) {
    lot.set(doc(db, "mea_charges", ancien.mentorEmail), { count: Math.max(0, (cnt[ancien.mentorEmail] || 1) - 1), updatedAt: serverTimestamp() });
  }
  lot.delete(doc(db, "mea_assignments", batisseurUid));
  lot.set(doc(db, "mea_summaries", batisseurUid), { mentorEmail: null, mentorNom: null, updatedAt: serverTimestamp() }, { merge: true });
  lot.set(doc(collection(db, "mea_affectations_histo")), {
    batisseurUid, ancienMentor: ancien?.mentorEmail || null, nouveauMentor: null, par: byEmail || null, at: serverTimestamp(),
  });
  await lot.commit();
}
// Réaffecte en un clic tous les bâtisseurs d'un mentor vers un autre (l'historique est conservé)
async function reaffecterMentor(ancienEmail, nouveau, byEmail) {
  const [limite, cnt, as] = await Promise.all([getLimiteMentors(), recalculerCharges(), loadAllAssignments()]);
  const aDeplacer = as.filter(a => a.mentorEmail === ancienEmail);
  const place = limite - (cnt[nouveau.email] || 0);
  if (aDeplacer.length > place) throw new Error(`${nouveau.nom || nouveau.email} n'a de la place que pour ${Math.max(0, place)} bâtisseur(s) (limite : ${limite}) ; il y en a ${aDeplacer.length} à déplacer.`);
  for (const a of aDeplacer) await assignMentor(a.batisseurUid, nouveau.email, nouveau.uid, nouveau.nom || nouveau.email, byEmail);
  return aDeplacer.length;
}
async function loadAllConfirmations() {
  const snap = await getDocs(collection(db, "mea_confirmations"));
  const out = {}; snap.docs.forEach(d => { out[d.id] = d.data(); });
  return out;
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
// GRILLE HEBDOMADAIRE (annexe B) — 26 semaines
// /users/{uid}/priv/mea_semaines — { pratiques: [{id,label}], semaines: { s1: { coches:{id:[7 booléens]}, note, victoire, defisPartages, defi? } } }
//   (partagé avec le mentor ; « defi » seulement si defisPartages)
// /users/{uid}/priv/mea_prive    — { semaines: { s1: { defi } } } (privé)
// ============================================================
function watchMyGrille(uid, callback) {
  return watchSharedAndPrive(uid, "mea_semaines", (shared, prive) => {
    const out = { debut: shared.debut || null, pratiques: shared.pratiques || null, semaines: { ...(shared.semaines || {}) } };
    for (const [k, r] of Object.entries(prive.semaines || {})) {
      if (out.semaines[k] && r && r.defi !== undefined) out.semaines[k] = { ...out.semaines[k], defi: r.defi };
    }
    return out;
  }, callback);
}
async function saveSemaine(uid, cle, data, pratiques) {
  const { defi, ...autres } = data;
  const texte = defi || "";
  const partage = !!autres.defisPartages;
  const lot = writeBatch(db);
  lot.set(privRef(uid, "mea_prive"), { semaines: { [cle]: { defi: texte, updatedAt: serverTimestamp() } }, updatedAt: serverTimestamp() }, { merge: true });
  const shared = { semaines: { [cle]: { ...autres, defi: partage ? texte : deleteField(), updatedAt: serverTimestamp() } }, updatedAt: serverTimestamp() };
  if (pratiques) shared.pratiques = pratiques;
  lot.set(privRef(uid, "mea_semaines"), shared, { merge: true });
  await lot.commit();
}
async function saveDebutGrille(uid, jourISO) {
  await setDoc(privRef(uid, "mea_semaines"), { debut: jourISO, updatedAt: serverTimestamp() }, { merge: true });
}
async function savePratiques(uid, pratiques) {
  await setDoc(privRef(uid, "mea_semaines"), { pratiques, updatedAt: serverTimestamp() }, { merge: true });
}
async function getGrilleOf(uid) {
  const snap = await getDoc(privRef(uid, "mea_semaines"));
  return snap.exists() ? snap.data() : {};
}

// ============================================================
// SUIVI ÉCONOMIQUE MENSUEL
// /users/{uid}/priv/mea_economie — { mois: { "2026-11": { revenus, depenses, note } } }
// Lisible seulement par l'étudiant et son mentor affecté (pas par la Trésorière).
// La mention « vu, plausible » du mentor est écrite dans /mea_confirmations/{uid}.economie.
// ============================================================
function watchMyEconomie(uid, callback) {
  return onSnapshot(privRef(uid, "mea_economie"), (snap) => callback(snap.exists() ? snap.data() : {}),
    (err) => { console.error("watch mea_economie:", err); callback({}); });
}
async function saveMoisEco(uid, cle, data) {
  await setDoc(privRef(uid, "mea_economie"), { mois: { [cle]: { ...data, updatedAt: serverTimestamp() } }, updatedAt: serverTimestamp() }, { merge: true });
}
async function getEconomieOf(uid) {
  const snap = await getDoc(privRef(uid, "mea_economie"));
  return snap.exists() ? snap.data() : {};
}
async function saveVuEco(uid, cle, data) {
  await setDoc(doc(db, "mea_confirmations", uid), { economie: { [cle]: { ...data, at: new Date().toISOString() } } }, { merge: true });
}

// ============================================================
// CONFIRMATIONS DU MENTOR
// /mea_confirmations/{batisseurUid} — { mois1: { statut: "confirmee" | "correction", version, demandes: [{champ, libelle, message}], par, at }, ... }
// Écrit UNIQUEMENT par le mentor affecté (règles Firestore) : il ne touche jamais aux textes de l'étudiant.
// « version » = version de la rencontre examinée ; si l'étudiant renvoie la rencontre, sa version augmente et la confirmation ne vaut plus.
// ============================================================
function watchMyConfirmations(uid, callback) {
  return onSnapshot(doc(db, "mea_confirmations", uid), (snap) => callback(snap.exists() ? snap.data() : {}),
    (err) => { console.error("watch mea_confirmations:", err); callback({}); });
}
async function getConfirmations(uid) {
  const snap = await getDoc(doc(db, "mea_confirmations", uid));
  return snap.exists() ? snap.data() : {};
}
async function saveDerniereConfirmee(uid, dateStr) {
  await setDoc(doc(db, "mea_confirmations", uid), { derniereConfirmeeLe: dateStr }, { merge: true });
}
async function getRencontresOf(uid) {
  const snap = await getDoc(privRef(uid, "mea_rencontres"));
  return snap.exists() ? snap.data() : {};
}
async function saveConfirmation(uid, moisKey, data) {
  await setDoc(doc(db, "mea_confirmations", uid), { [moisKey]: { ...data, at: new Date().toISOString() } }, { merge: true });
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

// ─── Test de leadership (exercice facultatif du module 14.1 de Parcours) ───
// 60 affirmations notées de 1 à 3, par groupes de 6 (une compétence = un groupe, dans l'ordre de LEADERSHIP_COMPETENCES).
// Note sur 10 : le score minimum possible (6) donne 1, le maximum (18) donne 10.
function calculerLeadership(scores) {
  if (!scores) return null;
  const notes = [];
  for (let g = 0; g < 10; g++) {
    let tot = 0;
    for (let k = g * 6 + 1; k <= g * 6 + 6; k++) {
      const v = Number(scores[String(k)]);
      if (!(v >= 1 && v <= 3)) return null;   // test incomplet
      tot += v;
    }
    notes.push(Math.max(1, Math.min(10, Math.round((tot - 6) / 12 * 9 + 1))));
  }
  return notes;
}
// Lit les réponses de l'étudiant (lecture de son propre dossier). Le test refait en mode révision (module déjà validé) prime.
async function getTestLeadership(uid) {
  const lire = async (chemin) => { try { const sn = await getDoc(doc(db, ...chemin)); return sn.exists() ? sn.data() : null; } catch (e) { return null; } };
  const [rev, mod] = await Promise.all([lire(["formation", uid, "revisions", "m14"]), lire(["formation", uid, "modules", "m14"])]);
  for (const src of [rev, mod]) {
    const notes = calculerLeadership(src?.exercices?.test_leadership?.scores);
    if (notes) return { notes };
  }
  return null;
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

// ============================================================
// ENTRÉE AVEC LE NUMÉRO D'UN CERTIFICAT (formation suivie hors de l'application)
// /mea_numeros/{numero} = { uid, email, pays, statut: "valide" | "attente", at }
// Un numéro ne sert qu'une fois (règle de sécurité du serveur). « valide » si le nom du certificat
// est le même que celui du compte, sinon « attente » : le coordinateur national du pays (ou le PPV) valide.
// ============================================================
// Met un numéro saisi à la main au bon format (ex. « abbap1234abcd » → « ABBA-P-1234-ABCD »)
function normaliserNumero(brut) {
  const c = String(brut || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = /^ABBAP([A-Z0-9]{4})([A-Z0-9]{4})$/.exec(c);
  return m ? `ABBA-P-${m[1]}-${m[2]}` : "";
}
// Vérifie que le numéro correspond à un certificat de fin de formation réellement délivré (fiche publique de vérification)
async function verifierNumeroCertificat(brut) {
  const n = normaliserNumero(brut);
  if (!n) return { erreur: "format" };
  let snap;
  try { snap = await getDoc(doc(db, "attestations", n)); } catch (e) { return { erreur: "reseau" }; }
  if (!snap.exists() || snap.data().type !== "parcours") return { erreur: "inconnu" };
  return { numero: n, nom: snap.data().nom || "", date: snap.data().date || "" };
}
// La demande d'entrée de cette personne (valide d'abord, sinon la première), ou null
async function getMonAcces(uid) {
  const r = await getDocs(query(collection(db, "mea_numeros"), where("uid", "==", uid)));
  if (r.empty) return null;
  const liste = r.docs.map(d => ({ numero: d.id, ...d.data() }));
  return liste.find(d => d.statut === "valide") || liste[0];
}
// Pays du compte (code à 2 lettres) s'il est renseigné dans le profil Parcours
async function getMonPays(uid) {
  try {
    const c = (await getDoc(doc(db, "users", uid, "priv", "contact"))).data() || {};
    const p = String(c.pays || "").toUpperCase();
    return /^[A-Z]{2}$/.test(p) ? p : "";
  } catch (e) { return ""; }
}
// Utilise le numéro pour ce compte. Rend « valide » ou « attente ». Échoue (permission-denied) si le numéro est déjà utilisé.
async function reclamerNumero(user, cert, pays) {
  let profil = {};
  try { profil = await getUserProfile(user.uid) || {}; } catch (e) { profil = {}; }
  let statut = (profil.nom && String(cert.nom).toLowerCase() === String(profil.nom).toLowerCase()) ? "valide" : "attente";
  const ref = doc(db, "mea_numeros", cert.numero);
  const base = { uid: user.uid, email: String(user.email).toLowerCase(), pays, at: serverTimestamp() };
  try { await setDoc(ref, { ...base, statut }); }
  catch (e) {
    if (statut !== "valide") throw e;
    statut = "attente";                       // le serveur n'a pas reconnu l'identité des noms : on demande une validation
    await setDoc(ref, { ...base, statut });
  }
  return statut;
}
// Côté coordinateurs
async function listDemandesAcces() {
  const r = await getDocs(query(collection(db, "mea_numeros"), where("statut", "==", "attente")));
  return r.docs.map(d => ({ numero: d.id, ...d.data() }));
}
async function validerDemandeAcces(numero) { await setDoc(doc(db, "mea_numeros", numero), { statut: "valide" }, { merge: true }); }
async function refuserDemandeAcces(numero) { await deleteDoc(doc(db, "mea_numeros", numero)); }
async function getMonRoleAdmin(email) {
  try { const sn = await getDoc(doc(db, "admins", String(email).toLowerCase())); return sn.exists() ? sn.data() : null; } catch (e) { return null; }
}

// ============================================================
// PHASE 4 — SERVICE COMMUNAUTAIRE, JALONS DU PROJET, DOSSIER, CERTIFICATION DES BÂTISSEURS
// /users/{uid}/priv/mea_services — { services: { id: { quoi, ou, date, personnes, appris, v } } } (écrit par l'étudiant, lu par son mentor)
// /mea_confirmations/{uid}.services[id] et .jalons[jalonId] — écrits par le mentor seulement
// /mea_dossiers/{uid} — { mentor: { statut: "valide" | "corrections", ... }, coordo: { statut: "valide", certifId, ... } }
//     « mentor » écrit par le mentor affecté ; « coordo » écrit par le coordinateur national (ou le PPV)
// /mea_certifications/{id} — { nom (cohorte), date, lieu } : la date de la Certification des Bâtisseurs, fixée par le coordinateur
// ============================================================
function watchMyServices(uid, callback) {
  return onSnapshot(privRef(uid, "mea_services"), (snap) => callback(snap.exists() ? (snap.data().services || {}) : {}),
    (err) => { console.error("watch mea_services:", err); callback({}); });
}
async function getServicesOf(uid) {
  const snap = await getDoc(privRef(uid, "mea_services"));
  return snap.exists() ? (snap.data().services || {}) : {};
}
async function saveService(uid, id, data) {
  await setDoc(privRef(uid, "mea_services"), { services: { [id]: { ...data, updatedAt: serverTimestamp() } }, updatedAt: serverTimestamp() }, { merge: true });
}
async function deleteService(uid, id) {
  await setDoc(privRef(uid, "mea_services"), { services: { [id]: deleteField() }, updatedAt: serverTimestamp() }, { merge: true });
}
async function saveConfirmationService(uid, id, data) {
  await setDoc(doc(db, "mea_confirmations", uid), { services: { [id]: { ...data, at: new Date().toISOString() } } }, { merge: true });
}
async function saveConfirmationJalon(uid, jalonId, data) {
  await setDoc(doc(db, "mea_confirmations", uid), { jalons: { [jalonId]: { ...data, at: new Date().toISOString() } } }, { merge: true });
}
function watchMyDossier(uid, callback) {
  return onSnapshot(doc(db, "mea_dossiers", uid), (snap) => callback(snap.exists() ? snap.data() : {}),
    (err) => { console.error("watch mea_dossiers:", err); callback({}); });
}
async function getDossier(uid) {
  const snap = await getDoc(doc(db, "mea_dossiers", uid));
  return snap.exists() ? snap.data() : {};
}
async function saveDossierMentor(uid, data) {
  await setDoc(doc(db, "mea_dossiers", uid), { mentor: { ...data, at: new Date().toISOString() } }, { merge: true });
}
async function saveDossierCoordo(uid, data) {
  await setDoc(doc(db, "mea_dossiers", uid), { coordo: { ...data, at: new Date().toISOString() } }, { merge: true });
}
async function loadAllDossiers() {
  const snap = await getDocs(collection(db, "mea_dossiers"));
  const out = {}; snap.docs.forEach(d => { out[d.id] = d.data(); });
  return out;
}
async function loadCertifications() {
  const snap = await getDocs(collection(db, "mea_certifications"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function getCertification(id) {
  const snap = await getDoc(doc(db, "mea_certifications", id));
  return snap.exists() ? { id, ...snap.data() } : null;
}
async function saveCertification(id, data) {
  await setDoc(doc(db, "mea_certifications", id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
async function deleteCertification(id) { await deleteDoc(doc(db, "mea_certifications", id)); }

window.AbbaSync = {
  normaliserNumero, verifierNumeroCertificat, getMonAcces, getMonPays, reclamerNumero,
  listDemandesAcces, validerDemandeAcces, refuserDemandeAcces, getMonRoleAdmin,
  getCertificatParcours, estExempte, getReprise, calculerReprise, getTestLeadership, calculerLeadership,
  getComptePaiement,
  isAdminEmail,
  logIn, logOut, watchAuth, getUserProfile,
  watchAdmins,
  watchMyMentorRole, watchMentors, addMentor, removeMentor,
  assignMentor, unassignMentor, unassignMentorFromSummary, getLimiteMentors, setLimiteMentors, recalculerCharges, reaffecterMentor, loadAllConfirmations,
  getMyAssignment, loadAllAssignments,
  watchMyPDP, saveMyPDP,
  watchMyRencontres, saveRencontre,
  watchMyEconomie, saveMoisEco, getEconomieOf, saveVuEco,
  watchMyGrille, saveSemaine, savePratiques, saveDebutGrille, getGrilleOf,
  watchMyConfirmations, getConfirmations, saveDerniereConfirmee, getRencontresOf, saveConfirmation,
  saveSummary, loadAllSummaries, loadMySummaries,
  watchMyPDPOnce: readPDPOnce,
  loadAllUsers,
  watchMyServices, getServicesOf, saveService, deleteService, saveConfirmationService, saveConfirmationJalon,
  watchMyDossier, getDossier, saveDossierMentor, saveDossierCoordo, loadAllDossiers,
  loadCertifications, getCertification, saveCertification, deleteCertification,
};
