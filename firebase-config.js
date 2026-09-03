// ============================================================
// firebase-config.js — ABBA Mise en Action
// Même projet Firebase qu'ABBA Life et Parcours Bâtisseur.
// Ne rien changer ici : toutes les apps partagent ce fichier.
// ============================================================
export const firebaseConfig = {
  apiKey: "AIzaSyDsYhgv4jHUmLY-BedopJSTwALrDoryDgw",
  authDomain: "abba-life-c6b5c.firebaseapp.com",
  projectId: "abba-life-c6b5c",
  storageBucket: "abba-life-c6b5c.firebasestorage.app",
  messagingSenderId: "1057124245132",
  appId: "1:1057124245132:web:907b910f80109c8c8925a9",
};

// Adresses e-mail des coordinateurs (accès total).
// ⚠️ Doit rester identique à celle du fichier firestore.rules.
export const ADMIN_EMAILS = [
  "apotrepaulabba@gmail.com",
];
