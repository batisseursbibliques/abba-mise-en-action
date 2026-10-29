# Règles de sécurité (Firestore)

Les règles de sécurité de la Mise en Action **ne sont plus dans ce dépôt**.

Elles se trouvent dans le fichier `firestore.rules` du dépôt **ABBA-Parcours** (section « MISE EN ACTION »).
La Mise en Action et le Parcours partagent la même base de données ; publier un fichier de règles
différent depuis ici effacerait celles de Parcours et casserait les deux applications.

Pour modifier les règles : modifier `firestore.rules` dans ABBA-Parcours. Le workflow
« Déployer les règles Firestore » les publie automatiquement.
