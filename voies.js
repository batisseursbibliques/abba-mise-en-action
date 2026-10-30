// Les 9 voies du projet personnel (étape S6 du PDP).
// Le contenu est tiré des leçons du Parcours (modules 14.1 et 14.2) : chaque voie dit d'où il vient (« source »).
// À RELIRE par Paul : titres, questions, étapes, indicateurs et étapes à faire valider par le mentor.
//
// Pour chaque voie :
//   questions : ce que l'étudiant doit réfléchir et écrire (spécifique à la voie)
//   etapes    : le déroulé conseillé sur 6 mois (3 temps : mois 1, mois 2-3, mois 4-6)
//   indicateurs : ce qu'on suit pour savoir si ça avance
//   jalons    : 3 ou 4 étapes précises que le MENTOR valide (ou fait reprendre) au fil des 6 mois
//   revenuLabel : ce que « revenus visés » veut dire pour cette voie
window.VOIES_PROJET = [
  {
    id: "zero",
    titre: "Démarrer à zéro, avec un premier revenu",
    pour: "Tu n’as pas encore d’activité qui te rapporte. L’objectif de ces 6 mois : gagner un premier revenu, même petit, avec une idée que tu as vraiment testée.",
    source: "Module 14.1 — les 8 clés de la réussite, l’entrepreneuriat et la gestion de projet en cinq phases.",
    questions: [
      { id: "q1", label: "Quel problème veux-tu résoudre, et pour qui ?", aide: "Décris-le avec des mots simples que les autres comprennent." },
      { id: "q2", label: "Qu’est-ce que tu sais déjà faire et que des gens accepteraient de payer ?" },
      { id: "q3", label: "Qui sont tes trois premiers clients possibles ?", aide: "Des personnes précises, pas « tout le monde »." },
      { id: "q4", label: "Avec quoi commences-tu, sans emprunter ?", aide: "Ce que tu as déjà : un téléphone, une table, quelques outils…" },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Poser l’idée et planifier", actions: [
        "Décrire le problème, pour qui, et le résultat attendu.",
        "Fixer un objectif précis, chiffré et daté (par exemple : « 5 clients payants d’ici la fin du mois 4 »).",
        "Faire un petit budget avec une marge pour les imprévus.",
        "Trouver trois personnes prêtes à payer, même peu."] },
      { periode: "Mois 2–3", titre: "Tester à petite échelle", actions: [
        "Commencer avec ce que tu as, sans emprunter.",
        "Servir tes premiers clients et noter : combien tu as gagné, combien d’heures cela a pris, ce que les clients ont dit.",
        "Ajuster le prix et la façon de faire. Un seul test à la fois."] },
      { periode: "Mois 4–6", titre: "Un premier revenu régulier, puis faire le point", actions: [
        "Servir des clients de façon régulière.",
        "Séparer ton argent personnel de celui de l’activité et tenir des comptes simples.",
        "Faire le point avec ton mentor : continuer, élargir ou corriger."] },
    ],
    indicateurs: [
      "Nombre de clients qui ont payé",
      "Revenu du mois : ce que tu as vendu moins ce que tu as dépensé",
      "Régularité : nombre de semaines avec au moins une vente",
      "Argent mis de côté chaque mois",
    ],
    jalons: [
      { id: "zero-j1", label: "L’idée est décrite par écrit : le problème, le client visé et un objectif chiffré avec une date." },
      { id: "zero-j2", label: "Trois personnes ont payé (même peu) pour ton produit ou ton service." },
      { id: "zero-j3", label: "Des comptes simples sont tenus chaque mois : ventes, dépenses, bénéfice." },
      { id: "zero-j4", label: "Un premier revenu régulier pendant au moins deux mois." },
    ],
    revenuLabel: "Revenu mensuel visé à 6 mois (bénéfice, pas seulement les ventes), en FCFA",
  },

  {
    id: "evoluer",
    titre: "Évoluer dans mon emploi",
    pour: "Tu as un emploi et tu veux grandir : prendre plus de responsabilités, mieux gagner, sans perdre ton intégrité.",
    source: "Module 14.2 — Évoluer dans son emploi.",
    questions: [
      { id: "q1", label: "Où en es-tu dans ton travail aujourd’hui, et où veux-tu être dans un an et dans trois ans ?" },
      { id: "q2", label: "Que te manque-t-il pour le poste d’au-dessus ?", aide: "Demande à deux collègues ou amis ce qu’ils voient de bon en toi, et ce qui te manque." },
      { id: "q3", label: "Quels résultats comptent vraiment pour ton employeur ?", aide: "Ce qui lui fait gagner ou économiser de l’argent." },
      { id: "q4", label: "Quelle nouvelle compétence vas-tu apprendre cette année ?" },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Faire le point", actions: [
        "Écrire où tu es, où tu veux aller, et ce qui te retient (peur, manque de formation, contacts).",
        "Demander à deux personnes ce qu’elles voient de bon en toi.",
        "Bien connaître ton contrat et ta fiche de paie."] },
      { periode: "Mois 2–3", titre: "Devenir plus précieux", actions: [
        "Travailler ta fiabilité : l’heure, la parole tenue, le travail fini.",
        "Commencer ta formation ou ta nouvelle compétence.",
        "Réaliser une amélioration concrète dans ton travail et en noter le résultat."] },
      { periode: "Mois 4–6", titre: "Demander et avancer", actions: [
        "Réunir tes résultats concrets.",
        "Parler de ton évolution, et d’argent, avec ton employeur, avec ces résultats en main.",
        "Décider avec ton mentor : évoluer ici, ou regarder ailleurs.",
        "Si ton salaire monte, ne pas dépenser plus."] },
    ],
    indicateurs: [
      "Compétence apprise ou formation suivie",
      "Résultats concrets que tu peux montrer à ton employeur",
      "Conversation d’évolution demandée ou tenue",
      "Part du salaire mise de côté chaque mois",
    ],
    jalons: [
      { id: "evoluer-j1", label: "Le point est fait par écrit : forces, manques, objectif à un an et à trois ans." },
      { id: "evoluer-j2", label: "Une nouvelle compétence est apprise, ou une formation est commencée." },
      { id: "evoluer-j3", label: "Des résultats concrets sont réunis et un entretien d’évolution est demandé ou tenu." },
    ],
    revenuLabel: "Revenu mensuel visé à 6 mois (salaire ou prime), en FCFA",
  },

  {
    id: "reconversion",
    titre: "Me reconvertir sans briser la chaîne",
    pour: "Un autre métier t’appelle. Tu veux y aller sans tout perdre : on construit un pont, on ne saute pas.",
    source: "Module 14.2 — La reconversion sans briser la chaîne.",
    questions: [
      { id: "q1", label: "Quel autre métier t’appelle, et pourquoi ?" },
      { id: "q2", label: "Est-ce vraiment un appel, ou de la fatigue ?", aide: "Si ton travail actuel devenait meilleur, l’envie resterait-elle ?" },
      { id: "q3", label: "Comment gardes-tu ton revenu actuel pendant la transition ?" },
      { id: "q4", label: "Qui exerce ce métier et peut te parler de la réalité ?" },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Préparer", actions: [
        "Clarifier ce que tu veux faire et pourquoi.",
        "Parler à des gens du métier visé.",
        "En parler à ta famille.",
        "Commencer ou renforcer ton épargne d’urgence."] },
      { periode: "Mois 2–3", titre: "Se former et tester sans tout arrêter", actions: [
        "Te former le soir ou le week-end.",
        "Trouver trois personnes prêtes à payer, même peu, pour ce que tu proposes.",
        "Garder ton revenu actuel."] },
      { periode: "Mois 4–6", titre: "Mesurer et décider", actions: [
        "Noter ce que le nouveau métier rapporte et ce qu’il coûte en temps.",
        "Fixer à partir de quel revenu tu pourras quitter l’ancien : on ne quitte une source de revenus que quand une autre peut la remplacer.",
        "Faire le point avec ton mentor."] },
    ],
    indicateurs: [
      "Heures par semaine consacrées au nouveau métier",
      "Nombre de personnes qui ont payé",
      "Revenu du nouveau métier",
      "Épargne d’urgence, en mois de dépenses",
    ],
    jalons: [
      { id: "reconversion-j1", label: "L’appel est clarifié par écrit et partagé avec ta famille." },
      { id: "reconversion-j2", label: "Une formation est commencée sans arrêter ton revenu actuel." },
      { id: "reconversion-j3", label: "Trois personnes ont payé pour ton nouveau service (test à petite échelle)." },
      { id: "reconversion-j4", label: "Le seuil est fixé : à partir de quel revenu tu pourras quitter l’ancien emploi." },
    ],
    revenuLabel: "Revenu mensuel du nouveau métier visé à 6 mois, en FCFA",
  },

  {
    id: "reconstruire",
    titre: "Me reconstruire après un échec ou une faillite",
    pour: "Tu as tout perdu ou presque : une entreprise, un emploi, de l’argent, parfois ta réputation. Être en bas n’est pas être fini. Le chemin du retour commence par regarder ta situation en face.",
    source: "Module 14.2 — Se reconstruire (les quatre dernières leçons).",
    avertissement: "Ton mentor lira cette étape. Écris l’essentiel ; garde les détails les plus personnels pour votre rencontre.",
    questions: [
      { id: "q1", label: "Quelle est ta situation réelle aujourd’hui ?", aide: "Ce qu’il te reste, ce que tu dois, ce que tu dépenses, ce que tu gagnes." },
      { id: "q2", label: "À qui dois-tu de l’argent, à peu près combien, et à quelles conditions ?" },
      { id: "q3", label: "Qui peut t’accompagner ?", aide: "Ton conjoint, un frère ou une sœur, un pasteur de confiance. Ne porte pas cela seul." },
      { id: "q4", label: "Quel tout petit premier pas vas-tu faire cette semaine ?" },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Regarder en face et compter", actions: [
        "T’asseoir et regarder ta situation réelle, sans te cacher la vérité.",
        "Écrire ce qu’il te reste : ce que tu possèdes, ce que tu sais faire, qui te soutient.",
        "Lister toutes tes dettes.",
        "Faire un budget de survie : l’essentiel d’un côté, le superflu de l’autre."] },
      { periode: "Mois 2–3", titre: "Stabiliser", actions: [
        "Rencontrer chaque créancier et convenir d’un remboursement réaliste.",
        "Réduire, et vendre ce qui ne produit rien, en gardant ce qui peut produire.",
        "Trouver un premier revenu, même petit : un emploi ou une petite activité.",
        "Parler à ton conjoint sans rien cacher."] },
      { periode: "Mois 4–6", titre: "Relancer", actions: [
        "Tenir les remboursements convenus, aux dates promises.",
        "Mettre de côté un petit montant chaque mois, même très petit.",
        "Te former là où il te manque quelque chose.",
        "Rebâtir la confiance par de petites promesses tenues."] },
    ],
    indicateurs: [
      "Budget de survie tenu chaque mois (oui ou non)",
      "Nombre de créanciers rencontrés et d’accords conclus",
      "Revenu mensuel régulier",
      "Montant remboursé et montant mis de côté",
    ],
    jalons: [
      { id: "reconstruire-j1", label: "L’inventaire est écrit : ce qu’il te reste, tes dettes et tes dépenses." },
      { id: "reconstruire-j2", label: "Le budget de survie est tenu pendant deux mois." },
      { id: "reconstruire-j3", label: "Chaque créancier est rencontré et un accord de remboursement réaliste est posé." },
      { id: "reconstruire-j4", label: "Un premier revenu régulier existe et un plan en trois étapes, avec des dates, est écrit." },
    ],
    revenuLabel: "Revenu mensuel minimal à atteindre pour stabiliser ta situation, en FCFA",
  },

  {
    id: "emploi",
    titre: "Trouver ou sécuriser un emploi",
    pour: "Tu cherches un emploi, ou tu veux sécuriser celui que tu as, y compris si tu n’as pas de travail en ce moment. On avance avec un plan de 90 jours, puis on recommence avec ce qu’on a appris.",
    source: "Module 14.1 — Sécuriser un emploi, et Quand on n’a pas d’emploi (le plan des 90 jours).",
    avertissement: "Ne paie jamais pour être recruté. Un employeur sérieux ne demande pas d’argent pour t’embaucher.",
    questions: [
      { id: "q1", label: "Quels chemins vas-tu suivre ?", aide: "Salariat privé, fonction publique, activité indépendante organisée, entreprise. Ils ne s’excluent pas." },
      { id: "q2", label: "Que peux-tu offrir ? Dis-le en une phrase." },
      { id: "q3", label: "Quelles sont les dix personnes que tu vas informer de ta recherche ?" },
      { id: "q4", label: "En attendant, quelle activité ou formation courte fais-tu ?", aide: "Pour garder un rythme et fabriquer de l’expérience." },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Me mettre en règle (jours 1 à 30)", actions: [
        "Un CV honnête d’une page, relu par quelqu’un.",
        "Ta phrase « ce que j’offre » et la liste de dix personnes à informer.",
        "Noter tes dépenses essentielles.",
        "T’inscrire auprès de l’agence nationale pour l’emploi de ton pays (au Bénin : l’ANPE)."] },
      { periode: "Mois 2–3", titre: "Chercher, apprendre, faire le point (jours 31 à 90)", actions: [
        "Tenir un rythme chaque semaine : des contacts, des candidatures, une démarche.",
        "Suivre une formation courte, gratuite si possible, ou faire du bénévolat ou un stage.",
        "À la fin des 90 jours : noter ce qui a marché, ce qui n’a pas marché, qui t’a répondu."] },
      { periode: "Mois 4–6", titre: "Élargir, décider, tenir", actions: [
        "Recommencer avec ce que tu as appris, élargir la recherche, changer l’angle si besoin.",
        "Regarder si une activité indépendante peut compléter.",
        "Avant de signer : lire le contrat. Après la signature : bien tenir les trois premiers mois."] },
    ],
    indicateurs: [
      "Nombre de personnes informées et de contacts par semaine",
      "Nombre de candidatures et de démarches faites",
      "Formation, bénévolat ou stage réalisé",
      "Entretiens obtenus, offre reçue",
    ],
    jalons: [
      { id: "emploi-j1", label: "Un CV d’une page est prêt et relu, et ta phrase « ce que j’offre » est écrite." },
      { id: "emploi-j2", label: "Les dix personnes de ta liste sont informées." },
      { id: "emploi-j3", label: "Le rythme de la semaine est tenu pendant huit semaines (contacts, candidatures, une démarche)." },
      { id: "emploi-j4", label: "Le point des 90 jours est fait par écrit : ce qui a marché, ce qu’on change." },
    ],
    revenuLabel: "Revenu mensuel visé à 6 mois (salaire ou activité), en FCFA",
  },

  {
    id: "entreprise",
    titre: "Faire grandir mon entreprise",
    pour: "Tu as déjà une activité qui tourne. Tu veux la gérer plus sérieusement : de l’ordre dans l’argent, des factures, se faire payer, se mettre en règle, la piloter chaque mois.",
    source: "Module 14.2 — Gérer son entreprise, Facturer, Se faire payer, se formaliser et piloter son entreprise.",
    questions: [
      { id: "q1", label: "Où en est ton activité aujourd’hui ?", aide: "Clients, ventes, employés ou associés, lieu." },
      { id: "q2", label: "Ton argent personnel et celui de l’entreprise sont-ils séparés ?" },
      { id: "q3", label: "Comment calcules-tu ton prix, et que te reste-t-il à la fin du mois ?" },
      { id: "q4", label: "Combien de clients te doivent de l’argent, et depuis combien de temps ?" },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Mettre de l’ordre", actions: [
        "Séparer l’argent de l’entreprise et le tien.",
        "Tenir des comptes simples : ce qui rentre, ce qui sort.",
        "Calculer ton prix en comptant tous tes coûts, avec une marge."] },
      { periode: "Mois 2–3", titre: "Facturer et se faire payer", actions: [
        "Utiliser des devis et des factures.",
        "Relancer les clients qui n’ont pas payé.",
        "Suivre ta trésorerie pour ne pas être à court."] },
      { periode: "Mois 4–6", titre: "Se formaliser et piloter", actions: [
        "Engager ou mettre à jour tes démarches pour être en règle (statut, impôts).",
        "Chaque mois, regarder six chiffres : ventes, marge, dépenses fixes, bénéfice, trésorerie, impayés.",
        "Décider avec ton mentor de la suite : élargir, embaucher, ou consolider."] },
    ],
    indicateurs: [
      "Ventes du mois, comparées au mois précédent",
      "Marge et dépenses fixes",
      "Bénéfice du mois et trésorerie disponible",
      "Impayés : combien et depuis quand",
    ],
    jalons: [
      { id: "entreprise-j1", label: "L’argent de l’entreprise est séparé du tien et les comptes sont tenus chaque mois." },
      { id: "entreprise-j2", label: "Les prix sont recalculés avec la marge, et des devis et factures sont utilisés." },
      { id: "entreprise-j3", label: "Le pilotage mensuel (les six chiffres) est fait trois mois de suite." },
      { id: "entreprise-j4", label: "Les démarches pour être en règle sont engagées ou à jour." },
    ],
    revenuLabel: "Bénéfice mensuel visé à 6 mois, en FCFA",
  },

  {
    id: "investir",
    titre: "Investir, ou soutenir le projet d’un autre bâtisseur",
    pour: "Tu as une capacité à investir, ou tu veux appuyer un autre bâtisseur. Deux chemins : construire ton plan d’investissement personnel, ou soutenir le projet d’un frère ou d’une sœur et l’accompagner.",
    source: "Module 14.2 — Investir : comprendre avant de placer son argent, et Construire son plan d’investissement.",
    avertissement: "N’investis jamais de l’argent emprunté, ni l’argent dont tu as besoin pour manger, te loger ou payer l’école. Méfie-toi des promesses de gains rapides.",
    questions: [
      { id: "q1", label: "Quel est ton choix : ton plan d’investissement personnel, ou le soutien au projet d’un autre bâtisseur ?" },
      { id: "q2", label: "Ta base est-elle en ordre ?", aide: "Pas de dette chère, une épargne d’urgence d’au moins trois mois de dépenses, les assurances de base." },
      { id: "q3", label: "Ton objectif et ta durée : combien, pour quoi, dans combien de temps ?" },
      { id: "q4", label: "Quelle somme régulière peux-tu y mettre chaque mois, sans emprunter ?" },
      { id: "q5", label: "Si tu soutiens un autre bâtisseur : quel projet, quelle aide (argent, conseil, réseau) et comment l’accompagnes-tu ?" },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Mettre sa maison en ordre", actions: [
        "Rembourser ou réduire les dettes chères.",
        "Constituer une épargne d’urgence d’au moins trois mois de dépenses.",
        "Écrire ton objectif, ta durée et la somme mensuelle."] },
      { periode: "Mois 2–3", titre: "Comprendre et décider", actions: [
        "Étudier les lois de l’investissement et les placements avant de placer un franc.",
        "Choisir ta répartition entre sécurité, croissance et une petite part de risque.",
        "Si tu soutiens un bâtisseur : choisir le projet et écrire clairement avec lui ce que tu apportes."] },
      { periode: "Mois 4–6", titre: "Investir régulièrement et suivre", actions: [
        "Mettre ta somme chaque mois, même petite.",
        "Revoir ton plan une ou deux fois par an, pas chaque jour.",
        "Si tu soutiens un bâtisseur : le voir chaque mois et l’aider à avancer."] },
    ],
    indicateurs: [
      "Base en ordre : dettes chères, épargne d’urgence, assurances (oui ou non)",
      "Somme investie ou mise de côté chaque mois",
      "Respect du plan que tu t’es donné",
      "Si tu soutiens un bâtisseur : étapes de son projet atteintes",
    ],
    jalons: [
      { id: "investir-j1", label: "La base est en ordre : plus de dette chère, épargne d’urgence, assurances de base." },
      { id: "investir-j2", label: "Le plan est écrit : objectif chiffré, durée, somme mensuelle et répartition." },
      { id: "investir-j3", label: "L’investissement régulier est fait trois mois de suite, ou le soutien concret est apporté au bâtisseur." },
    ],
    revenuLabel: "Somme mensuelle visée à investir ou à apporter, en FCFA",
  },

  {
    id: "competences",
    titre: "Me préparer d’abord à une future activité",
    pour: "Tu n’es pas encore prêt à lancer ou à chercher. Tu choisis de développer d’abord les compétences qui te manquent, pour partir ensuite sur de bonnes bases.",
    source: "Module 14.1 — les 8 clés de la réussite (« Faites-vous une carte », « Faites-vous former »).",
    questions: [
      { id: "q1", label: "Quelle activité veux-tu pouvoir exercer, et pourquoi ?" },
      { id: "q2", label: "Quelles compétences as-tu déjà, et lesquelles te manquent ?" },
      { id: "q3", label: "Quelle formation vas-tu suivre ?", aide: "Gratuite si possible, courte, dans le domaine visé." },
      { id: "q4", label: "Où peux-tu pratiquer ?", aide: "Bénévolat, stage, apprentissage, aider quelqu’un du métier." },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Choisir et se faire une carte", actions: [
        "Écrire l’activité visée.",
        "Lister ce que tu sais déjà faire et ce qui te manque.",
        "Choisir la formation à suivre."] },
      { periode: "Mois 2–3", titre: "Se former et pratiquer", actions: [
        "Suivre ta formation chaque semaine.",
        "Pratiquer pour de vrai : bénévolat, stage ou apprentissage.",
        "Rencontrer des personnes qui exercent ce métier."] },
      { periode: "Mois 4–6", titre: "Passer à la preuve", actions: [
        "Réaliser un premier vrai travail, même petit ou gratuit, et demander un retour.",
        "Préparer le passage vers un premier revenu : une idée à tester, ou une recherche d’emploi.",
        "Faire le point avec ton mentor."] },
    ],
    indicateurs: [
      "Heures de formation suivies",
      "Nombre de pratiques réelles (stage, service rendu, premier travail)",
      "Retours reçus de personnes du métier",
      "Compétences acquises, comparées à ta liste de départ",
    ],
    jalons: [
      { id: "competences-j1", label: "La carte est écrite : activité visée, compétences acquises et compétences manquantes." },
      { id: "competences-j2", label: "La formation est suivie régulièrement." },
      { id: "competences-j3", label: "Une pratique réelle est accomplie (bénévolat, stage ou premier travail), avec un retour d’une personne du métier." },
    ],
    revenuLabel: "Revenu mensuel que tu espères quand tu exerceras cette activité, en FCFA",
  },

  {
    id: "abba",
    titre: "Un projet d’ABBA (par exemple SmartGarden)",
    pour: "Tu portes ou tu rejoins un projet de l’Alliance. Un contrat de partenariat Bâtisseur fixera les règles de ce projet. Il te sera présenté dans l’application, et tu devras l’accepter avant tout calcul de contribution.",
    source: "Projets de l’Alliance des Bâtisseurs Bibliques en Action.",
    questions: [
      { id: "q1", label: "Quel projet d’ABBA portes-tu, et quel est ton rôle ?" },
      { id: "q2", label: "Qui est responsable du projet, et avec qui travailles-tu ?" },
      { id: "q3", label: "Quelles activités du projet te sont confiées pendant ces 6 mois ?" },
      { id: "q4", label: "Que dois-tu apprendre pour bien tenir ton rôle ?" },
    ],
    etapes: [
      { periode: "Mois 1", titre: "Comprendre le projet et mon rôle", actions: [
        "Rencontrer le responsable du projet.",
        "Écrire avec lui ton rôle et tes objectifs.",
        "Lire le contrat de partenariat Bâtisseur quand il te sera présenté."] },
      { periode: "Mois 2–3", titre: "Démarrer", actions: [
        "Réaliser les activités qui te sont confiées.",
        "Commencer le suivi mensuel : revenus, dépenses, bénéfice net."] },
      { periode: "Mois 4–6", titre: "Développer et faire le point", actions: [
        "Constater les premiers résultats et ajuster.",
        "Faire le bilan avec ton mentor et le responsable du projet."] },
    ],
    indicateurs: [
      "Activités du projet réalisées",
      "Revenus, dépenses et bénéfice net du mois",
      "Régularité du suivi mensuel",
      "Résultats comparés aux objectifs écrits au mois 1",
    ],
    jalons: [
      { id: "abba-j1", label: "Ton rôle et tes objectifs sont écrits avec le responsable du projet." },
      { id: "abba-j2", label: "Le suivi mensuel des revenus et des dépenses est tenu." },
      { id: "abba-j3", label: "Des premiers résultats sont constatés et un bilan est fait à 6 mois." },
    ],
    revenuLabel: "Revenu mensuel visé à 6 mois grâce à ce projet, en FCFA",
  },
];

// Anciennes valeurs de « type de projet » (avant les voies) → voie correspondante
window.VOIES_ANCIENNES = {
  smartgarden: "abba", entrepreneurial: "zero", salarie: "emploi",
  investissement: "investir", carriere: "evoluer", competences: "competences",
};
