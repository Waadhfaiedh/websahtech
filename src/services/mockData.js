// ===================== MOCK DATA =====================

export const mockSpecialists = [
  {
    id: 1,
    name: "Dr. Amira Benali",
    specialty: "Kinésithérapeute",
    email: "amira.benali@sahtech.tn",
    phone: "+216 71 123 456",
    clinic: "Cabinet Benali",
    address: "15 Avenue Habib Bourguiba, Tunis Centre",
    wilaya: "Tunis",
    city: "Tunis",
    bio: "Spécialiste en rééducation fonctionnelle avec 12 ans d'expérience dans la prise en charge des pathologies musculo-squelettiques.",
    languages: ["Français", "Arabe", "Anglais"],
    diplomas: ["Doctorat en Kinésithérapie - Université de Tunis El Manar 2012", "DES Rééducation Fonctionnelle - CHU La Rabta 2014"],
    rating: 4.8,
    status: "active",
    registrationDate: "2023-03-15",
    profileVisible: true,
    avatar: null,
    lat: 36.8190,
    lng: 10.1658,
    role: "specialist",
    password: "password123"
  },
  {
    id: 2,
    name: "Dr. Karim Meziane",
    specialty: "Orthopédiste",
    email: "karim.meziane@sahtech.tn",
    phone: "+216 73 789 012",
    clinic: "Clinique Hannibal",
    address: "Rue Ibn Khaldoun, Lac 2, Tunis",
    wilaya: "Tunis",
    city: "Tunis",
    bio: "Chirurgien orthopédiste spécialisé dans la chirurgie du genou et de la hanche. Formé à Paris et Lyon.",
    languages: ["Français", "Arabe"],
    diplomas: ["Spécialité Orthopédie - Université Paris VI 2010", "Fellowship Arthroscopie - Lyon 2012"],
    rating: 4.9,
    status: "active",
    registrationDate: "2023-05-22",
    profileVisible: true,
    avatar: null,
    lat: 36.8397,
    lng: 10.2307,
    role: "specialist",
    password: "password123"
  },
  {
    id: 3,
    name: "Dr. Samira Touati",
    specialty: "Neurologue",
    email: "samira.touati@sahtech.tn",
    phone: "+216 74 456 789",
    clinic: "Centre Neurologique de Sfax",
    address: "Avenue Farhat Hached, Sfax",
    wilaya: "Sfax",
    city: "Sfax",
    bio: "Neurologue avec expertise en troubles du mouvement et rééducation neurologique post-AVC.",
    languages: ["Français", "Arabe"],
    diplomas: ["Spécialité Neurologie - CHU Hédi Chaker Sfax 2011", "DIU Troubles du Mouvement - Montpellier 2015"],
    rating: 4.7,
    status: "pending",
    registrationDate: "2024-01-10",
    profileVisible: false,
    avatar: null,
    lat: 34.7406,
    lng: 10.7603,
    role: "specialist",
    password: "password123"
  }
];

export const mockPatients = [
  {
    id: 1,
    name: "Mohamed Cherif",
    age: 45,
    email: "m.cherif@gmail.com",
    phone: "+216 22 234 567",
    condition: "Lombalgie chronique",
    assignedSpecialistId: 1,
    lastVisit: "2024-02-10",
    status: "active",
    registrationDate: "2023-09-01",
    medicalHistory: "Hernie discale L4-L5 diagnostiquée en 2022. Hypertension contrôlée.",
    treatmentPlan: "Séances de kinésithérapie 3x/semaine. Exercices de renforcement lombaire. Éviter port de charges lourdes.",
    avatar: null,
    address: "Cité El Khadra, Tunis",
    notes: [
      { date: "2024-02-10", text: "Amélioration notable de la mobilité. Douleur réduite de 7/10 à 4/10." },
      { date: "2024-01-25", text: "Début du protocole de renforcement. Patient motivé et coopératif." },
      { date: "2024-01-10", text: "Première consultation. Évaluation complète réalisée." }
    ]
  },
  {
    id: 2,
    name: "Fatima Zahra Hadj",
    age: 32,
    email: "fz.hadj@gmail.com",
    phone: "+216 25 345 678",
    condition: "Post-opératoire LCA",
    assignedSpecialistId: 1,
    lastVisit: "2024-02-12",
    status: "active",
    registrationDate: "2023-11-15",
    medicalHistory: "Rupture LCA genou droit. Reconstruction chirurgicale réalisée le 15/11/2023.",
    treatmentPlan: "Protocole rééducation post-LCA: Phase 1 mobilisation, Phase 2 renforcement, Phase 3 proprioception.",
    avatar: null,
    address: "La Marsa, Tunis",
    notes: [
      { date: "2024-02-12", text: "Phase 2 commencée. Flexion à 120°. Bon contrôle musculaire." },
      { date: "2024-01-28", text: "Fin de phase 1. Cicatrisation excellente." }
    ]
  },
  {
    id: 3,
    name: "Rachid Boudiaf",
    age: 58,
    email: "r.boudiaf@yahoo.fr",
    phone: "+216 71 678 901",
    condition: "Gonarthrose bilatérale",
    assignedSpecialistId: 2,
    lastVisit: "2024-02-08",
    status: "active",
    registrationDate: "2023-07-20",
    medicalHistory: "Arthrose sévère des deux genoux. Diabète type 2 équilibré. IMC 29.",
    treatmentPlan: "Infiltrations corticoïdes. Rééducation fonctionnelle. Bilan préopératoire PTG bilatérale.",
    avatar: null,
    address: "Menzah 6, Ariana",
    notes: [
      { date: "2024-02-08", text: "2ème infiltration réalisée. Soulagement temporaire. Planification PTG discutée." }
    ]
  },
  {
    id: 4,
    name: "Leila Mansouri",
    age: 28,
    email: "l.mansouri@gmail.com",
    phone: "+216 74 012 345",
    condition: "Cervicalgie + AVC partiel",
    assignedSpecialistId: 3,
    lastVisit: "2024-02-11",
    status: "active",
    registrationDate: "2024-01-05",
    medicalHistory: "AVC ischémique cérébral gauche (12/2023). Séquelles motrices légères côté droit. Cervicalgie associée.",
    treatmentPlan: "Rééducation neurologique intensive. Orthophonie. Suivi neurologique mensuel.",
    avatar: null,
    address: "Route de Tunis, Sfax",
    notes: [
      { date: "2024-02-11", text: "Récupération motrice main droite encourageante. Préhension fine améliorée." },
      { date: "2024-01-20", text: "IRM de contrôle stable. Pas de nouvelle lésion." }
    ]
  },
  {
    id: 5,
    name: "Omar Zitouni",
    age: 19,
    email: "o.zitouni@gmail.com",
    phone: "+216 29 567 890",
    condition: "Entorse cheville récidivante",
    assignedSpecialistId: 1,
    lastVisit: "2024-02-05",
    status: "pending",
    registrationDate: "2024-02-01",
    medicalHistory: "3ème entorse cheville gauche en 18 mois. Instabilité ligamentaire chronique suspectée.",
    treatmentPlan: "Bilan proprioceptif. Renforcement péroniers. Strapping préventif.",
    avatar: null,
    address: "Sousse Ville, Sousse",
    notes: [
      { date: "2024-02-05", text: "Bilan initial. Instabilité importante. Programme de renforcement prescrit." }
    ]
  }
];

export const mockReports = [
  {
    id: 1,
    patientId: 1,
    patientName: "Mohamed Cherif",
    date: "2024-02-10",
    time: "10:30",
    muscleGroup: "Lombaires / Érecteurs du rachis",
    summary: "Analyse de la flexion lombaire lors de la marche. Asymétrie notable du côté gauche. Activation musculaire réduite des érecteurs L3-L5.",
    riskLevel: "orange",
    findings: "Flexion antérieure limitée à 45° (norme: 80°). Rotation droite déficitaire de 30%. Muscles para-vertébraux gauches sous-activés.",
    recommendation: "Renforcer les érecteurs du rachis gauches. Exercices de mobilisation progressive. Réévaluation dans 3 semaines.",
    specialistComment: "Conforme à mon évaluation clinique. Protocole ajusté en conséquence.",
    status: "reviewed"
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Fatima Zahra Hadj",
    date: "2024-02-12",
    time: "14:00",
    muscleGroup: "Quadriceps / Ischio-jambiers",
    summary: "Analyse de la montée d'escalier post-reconstruction LCA. Bonne symétrie globale. Légère inhibition du vaste médial.",
    riskLevel: "green",
    findings: "Quadriceps à 78% de la force controlatérale (objectif 80%+). Ischio-jambiers bien récupérés. Proprioception en amélioration.",
    recommendation: "Continuer le renforcement excentrique. Introduire exercices en chaîne fermée. Autoriser vélo stationnaire.",
    specialistComment: "",
    status: "pending"
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Rachid Boudiaf",
    date: "2024-02-08",
    time: "09:00",
    muscleGroup: "Quadriceps / Adducteurs / Fessiers",
    summary: "Analyse de la marche avec gonarthrose bilatérale. Compensation sévère du côté droit. Patron de marche antalgique.",
    riskLevel: "red",
    findings: "Moment d'adduction du genou droit majoré de 35%. Effondrement du pied à chaque pas. Glute med insuffisant bilatéralement.",
    recommendation: "Urgent: semelles orthopédiques. Décharge partielle. Renforcement fessiers en priorité. Évaluation PTG accélérée.",
    specialistComment: "Patient référé pour consultation chirurgicale urgente.",
    status: "reviewed"
  },
  {
    id: 4,
    patientId: 4,
    patientName: "Leila Mansouri",
    date: "2024-02-11",
    time: "11:00",
    muscleGroup: "Membres supérieurs droits / Main",
    summary: "Analyse des mouvements de préhension post-AVC. Récupération progressive de la motricité fine.",
    riskLevel: "orange",
    findings: "Force de préhension droite: 68% du côté sain. Coordination main-œil perturbée. Tremblements légers à la tâche fine.",
    recommendation: "Intensifier la thérapie par contrainte induite. Exercices de dextérité quotidiens. Stimulation électrique fonctionnelle.",
    specialistComment: "Bonne évolution. Continuer le protocole actuel.",
    status: "reviewed"
  },
  {
    id: 5,
    patientId: 1,
    patientName: "Mohamed Cherif",
    date: "2024-01-25",
    time: "10:00",
    muscleGroup: "Muscles du tronc / Core",
    summary: "Évaluation initiale de la stabilité du core en position debout et dynamique.",
    riskLevel: "red",
    findings: "Activation du transverse de l'abdomen retardée de 120ms. Stabilisation lombaire insuffisante. Risque de récidive élevé.",
    recommendation: "Programme de stabilisation lombaire prioritaire. Éviter les mouvements en flexion-rotation. Réévaluation dans 2 semaines.",
    specialistComment: "Plan de traitement modifié suite à cette analyse.",
    status: "reviewed"
  },
  {
    id: 6,
    patientId: 5,
    patientName: "Omar Zitouni",
    date: "2024-02-05",
    time: "16:00",
    muscleGroup: "Cheville / Péroniers / Tibial antérieur",
    summary: "Analyse proprioceptive de la cheville gauche lors de la marche sur surface irrégulière.",
    riskLevel: "orange",
    findings: "Délai de réaction péronière: 180ms (norme: <100ms). Inversion passive exagérée. Déficit d'équilibre unipodal.",
    recommendation: "Rééducation proprioceptive intensive. Strapping préventif pendant 6 semaines. Renforcement excentrique péroniers.",
    specialistComment: "",
    status: "pending"
  },
  {
    id: 7,
    patientId: 2,
    patientName: "Fatima Zahra Hadj",
    date: "2024-01-28",
    time: "14:30",
    muscleGroup: "Genou / LCA / Stabilisateurs",
    summary: "Analyse de la marche à 6 semaines post-reconstruction LCA. Phase de rééducation 1 terminée.",
    riskLevel: "green",
    findings: "Flexion active: 95°. Extension complète récupérée. Pas d'épanchement. Cicatrice en bon état.",
    recommendation: "Passage en phase 2. Introduction du vélo stationnaire. Aquathérapie recommandée.",
    specialistComment: "Excellente évolution. Patient modèle.",
    status: "reviewed"
  },
  {
    id: 8,
    patientId: 3,
    patientName: "Rachid Boudiaf",
    date: "2024-01-15",
    time: "08:30",
    muscleGroup: "Genou / Compartiment médial",
    summary: "Analyse initiale de la démarche avec arthrose sévère. Évaluation pré-thérapeutique.",
    riskLevel: "red",
    findings: "Pincement articulaire médial bilatéral. Varus important côté droit. Ménisques internes atteints.",
    recommendation: "Traitement conservateur 3 mois. Si échec: PTG programmée. Semelles correctrices urgentes.",
    specialistComment: "Dossier chirurgical constitué.",
    status: "reviewed"
  }
];

export const mockConversations = [
  {
    id: 1,
    patientId: 1,
    patientName: "Mohamed Cherif",
    lastMessage: "Merci docteur, je ferai les exercices ce soir.",
    lastMessageTime: "2024-02-12T18:30:00",
    unreadCount: 2,
    messages: [
      { id: 1, senderId: 1, senderName: "Dr. Amira Benali", text: "Bonjour Mohamed, comment vous sentez-vous après la séance d'hier ?", time: "2024-02-12T10:00:00", isOwn: true },
      { id: 2, senderId: "p1", senderName: "Mohamed Cherif", text: "Bonjour docteur. Un peu de courbatures mais c'est normal je pense ?", time: "2024-02-12T10:15:00", isOwn: false },
      { id: 3, senderId: 1, senderName: "Dr. Amira Benali", text: "Oui tout à fait, c'est un bon signe ! Cela veut dire que les muscles travaillent.", time: "2024-02-12T10:20:00", isOwn: true },
      { id: 4, senderId: "p1", senderName: "Mohamed Cherif", text: "Est-ce que je peux prendre du paracétamol ?", time: "2024-02-12T10:22:00", isOwn: false },
      { id: 5, senderId: 1, senderName: "Dr. Amira Benali", text: "Oui, 1g toutes les 6h si besoin. Et pensez à appliquer de la glace 15 minutes après les exercices.", time: "2024-02-12T10:25:00", isOwn: true },
      { id: 6, senderId: "p1", senderName: "Mohamed Cherif", text: "D'accord merci. Et pour les exercices de ce soir, je fais combien de séries ?", time: "2024-02-12T18:00:00", isOwn: false },
      { id: 7, senderId: 1, senderName: "Dr. Amira Benali", text: "3 séries de 15 répétitions pour les abdominaux hypopressifs, et 2x20 pour les extensions.", time: "2024-02-12T18:10:00", isOwn: true },
      { id: 8, senderId: "p1", senderName: "Mohamed Cherif", text: "Parfait ! Une dernière question : est-ce que je peux aller marcher demain matin ?", time: "2024-02-12T18:20:00", isOwn: false },
      { id: 9, senderId: 1, senderName: "Dr. Amira Benali", text: "Oui, 20-30 minutes à allure modérée. Évitez les surfaces irrégulières.", time: "2024-02-12T18:25:00", isOwn: true },
      { id: 10, senderId: "p1", senderName: "Mohamed Cherif", text: "Merci docteur, je ferai les exercices ce soir.", time: "2024-02-12T18:30:00", isOwn: false }
    ]
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Fatima Zahra Hadj",
    lastMessage: "À jeudi pour la séance !",
    lastMessageTime: "2024-02-11T16:00:00",
    unreadCount: 0,
    messages: [
      { id: 1, senderId: 1, senderName: "Dr. Amira Benali", text: "Bonjour Fatima, j'ai reçu les résultats de votre analyse vidéo.", time: "2024-02-11T14:00:00", isOwn: true },
      { id: 2, senderId: "p2", senderName: "Fatima Zahra Hadj", text: "Bonjour ! Et alors, c'est bien ?", time: "2024-02-11T14:05:00", isOwn: false },
      { id: 3, senderId: 1, senderName: "Dr. Amira Benali", text: "Très bien ! Votre quadriceps est à 78% de récupération. Nous sommes presque à l'objectif.", time: "2024-02-11T14:08:00", isOwn: true },
      { id: 4, senderId: "p2", senderName: "Fatima Zahra Hadj", text: "Super nouvelle ! Combien de temps encore avant de reprendre le sport ?", time: "2024-02-11T14:10:00", isOwn: false },
      { id: 5, senderId: 1, senderName: "Dr. Amira Benali", text: "Si votre progression continue ainsi, environ 2 mois. On vise le printemps !", time: "2024-02-11T14:12:00", isOwn: true },
      { id: 6, senderId: "p2", senderName: "Fatima Zahra Hadj", text: "Parfait ! Je vais vraiment travailler dur. Merci pour tout.", time: "2024-02-11T14:15:00", isOwn: false },
      { id: 7, senderId: 1, senderName: "Dr. Amira Benali", text: "C'est votre mérite ! N'oubliez pas vos exercices à la maison.", time: "2024-02-11T14:18:00", isOwn: true },
      { id: 8, senderId: "p2", senderName: "Fatima Zahra Hadj", text: "Promis ! Je les fais tous les matins.", time: "2024-02-11T15:00:00", isOwn: false },
      { id: 9, senderId: 1, senderName: "Dr. Amira Benali", text: "Excellent. Rendez-vous jeudi à 14h pour la prochaine séance.", time: "2024-02-11T15:30:00", isOwn: true },
      { id: 10, senderId: "p2", senderName: "Fatima Zahra Hadj", text: "À jeudi pour la séance !", time: "2024-02-11T16:00:00", isOwn: false }
    ]
  },
  {
    id: 3,
    patientId: 5,
    patientName: "Omar Zitouni",
    lastMessage: "Reçu, merci !",
    lastMessageTime: "2024-02-06T09:00:00",
    unreadCount: 1,
    messages: [
      { id: 1, senderId: 1, senderName: "Dr. Amira Benali", text: "Bonjour Omar, comment va la cheville depuis la dernière séance ?", time: "2024-02-06T08:00:00", isOwn: true },
      { id: 2, senderId: "p5", senderName: "Omar Zitouni", text: "Bonjour docteur, ça va mieux ! Moins de douleur au matin.", time: "2024-02-06T08:15:00", isOwn: false },
      { id: 3, senderId: 1, senderName: "Dr. Amira Benali", text: "Bien ! Continuez les exercices proprioceptifs 2x/jour.", time: "2024-02-06T08:20:00", isOwn: true },
      { id: 4, senderId: "p5", senderName: "Omar Zitouni", text: "D'accord. Je peux reprendre le foot bientôt ?", time: "2024-02-06T08:25:00", isOwn: false },
      { id: 5, senderId: 1, senderName: "Dr. Amira Benali", text: "Patience ! Encore 4-6 semaines minimum. Le risque de récidive est encore trop élevé.", time: "2024-02-06T08:30:00", isOwn: true },
      { id: 6, senderId: "p5", senderName: "Omar Zitouni", text: "D'accord je comprends... Merci docteur.", time: "2024-02-06T08:45:00", isOwn: false },
      { id: 7, senderId: 1, senderName: "Dr. Amira Benali", text: "Courage ! Pensez à mettre le strapping avant de marcher longtemps.", time: "2024-02-06T08:50:00", isOwn: true },
      { id: 8, senderId: "p5", senderName: "Omar Zitouni", text: "Toujours. J'ai regardé la vidéo que vous m'avez envoyée sur le strapping.", time: "2024-02-06T08:55:00", isOwn: false },
      { id: 9, senderId: 1, senderName: "Dr. Amira Benali", text: "Parfait. Je vous envoie la liste des exercices pour cette semaine.", time: "2024-02-06T09:00:00", isOwn: true },
      { id: 10, senderId: "p5", senderName: "Omar Zitouni", text: "Reçu, merci !", time: "2024-02-06T09:00:00", isOwn: false }
    ]
  }
];

export const mockPosts = [
  {
    id: 1,
    specialistId: 1,
    specialistName: "Dr. Amira Benali",
    type: "article",
    title: "5 exercices essentiels pour soulager le mal de dos",
    content: "<p>Le mal de dos touche 80% des personnes au cours de leur vie. Voici les 5 exercices les plus efficaces pour renforcer votre dos et prévenir les douleurs chroniques.</p><h3>1. Le gainage ventral (Plank)</h3><p>Position horizontale, appui sur les avant-bras et les pointes des pieds. Maintenir 30 secondes, 3 répétitions.</p><h3>2. Le pont fessier</h3><p>Allongé sur le dos, genoux fléchis, soulever le bassin. Maintenir 5 secondes, 15 répétitions.</p>",
    excerpt: "Le mal de dos touche 80% des personnes. Découvrez les 5 exercices essentiels pour renforcer votre dos.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    date: "2024-02-10",
    category: "Rééducation",
    pinned: true,
    visible: true,
    likes: 128,
    views: 1450
  },
  {
    id: 2,
    specialistId: 1,
    specialistName: "Dr. Amira Benali",
    type: "photo",
    title: "Séance de rééducation post-opératoire LCA",
    content: "Photo de la salle de rééducation équipée de notre nouveau matériel de proprioception.",
    excerpt: "Notre nouvelle salle de rééducation est équipée des dernières technologies.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    date: "2024-02-05",
    category: "Cabinet",
    pinned: false,
    visible: true,
    likes: 89,
    views: 760
  },
  {
    id: 3,
    specialistId: 1,
    specialistName: "Dr. Amira Benali",
    type: "video",
    title: "Technique de massage des cervicales — Démonstration",
    content: "Démonstration de la technique de massage cervical que j'enseigne à mes patients.",
    excerpt: "Apprenez la technique de massage cervical pour soulager les tensions.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    date: "2024-01-28",
    category: "Tutoriel",
    pinned: false,
    visible: true,
    likes: 245,
    views: 3200
  },
  {
    id: 4,
    specialistId: 2,
    specialistName: "Dr. Karim Meziane",
    type: "article",
    title: "Tout savoir sur la prothèse totale de genou",
    content: "<p>La prothèse totale de genou (PTG) est une intervention chirurgicale permettant de remplacer l'articulation du genou usée par une prothèse artificielle.</p>",
    excerpt: "La PTG est une solution efficace pour les patients souffrant d'arthrose sévère. Découvrez tout sur cette intervention.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
    date: "2024-02-01",
    category: "Orthopédie",
    pinned: false,
    visible: true,
    likes: 67,
    views: 890
  },
  {
    id: 5,
    specialistId: 2,
    specialistName: "Dr. Karim Meziane",
    type: "photo",
    title: "Nouvelle salle opératoire — Clinique Hannibal",
    content: "Notre clinique vient d'inaugurer une nouvelle salle d'opération équipée des dernières technologies arthroscopiques.",
    excerpt: "Inauguration de notre nouvelle salle opératoire ultra-moderne à Tunis.",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80",
    date: "2024-01-20",
    category: "Clinique",
    pinned: false,
    visible: false,
    likes: 45,
    views: 340
  },
  {
    id: 6,
    specialistId: 3,
    specialistName: "Dr. Samira Touati",
    type: "article",
    title: "Récupération après AVC : ce que vous devez savoir",
    content: "<p>L'AVC (Accident Vasculaire Cérébral) est une urgence médicale. La récupération dépend de nombreux facteurs mais une rééducation précoce est essentielle.</p>",
    excerpt: "Comprendre la récupération post-AVC et l'importance de la rééducation neurologique précoce.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    date: "2024-01-15",
    category: "Neurologie",
    pinned: false,
    visible: true,
    likes: 198,
    views: 2100
  }
];

export const mockExercises = [
  { id: 1, title: "Planche abdominale (Plank)", muscleGroup: "Core / Abdominaux", description: "Position horizontale sur les avant-bras. Maintenir le corps aligné. 3x30 secondes.", videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw", thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80", difficulty: "Intermédiaire", duration: "10 min" },
  { id: 2, title: "Pont fessier", muscleGroup: "Fessiers / Lombaires", description: "Allongé sur le dos, genoux fléchis. Soulever le bassin. 3x15 répétitions.", videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8", thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80", difficulty: "Débutant", duration: "8 min" },
  { id: 3, title: "Squat goblet", muscleGroup: "Quadriceps / Fessiers", description: "Squat avec charge tenue devant la poitrine. 3x12 répétitions.", videoUrl: "https://www.youtube.com/embed/MeIiIdhvXT4", thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80", difficulty: "Intermédiaire", duration: "12 min" },
  { id: 4, title: "Étirement ischio-jambiers debout", muscleGroup: "Ischio-jambiers", description: "Debout, jambe tendue sur un support à hauteur de hanche. Incliner le buste en avant.", videoUrl: "https://www.youtube.com/embed/5bq7XPQGwLo", thumbnail: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=300&q=80", difficulty: "Débutant", duration: "5 min" },
  { id: 5, title: "Extension lombaire sur ballon", muscleGroup: "Lombaires / Érecteurs", description: "Allongé sur le ventre sur le ballon. Soulever le buste. 3x15.", videoUrl: "https://www.youtube.com/embed/ph3pddpKzzw", thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&q=80", difficulty: "Intermédiaire", duration: "10 min" },
  { id: 6, title: "Proprioception plateau instable", muscleGroup: "Cheville / Proprioception", description: "Équilibre sur un plateau instable. 1 minute par côté, 3 séries.", videoUrl: "https://www.youtube.com/embed/example6", thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=80", difficulty: "Intermédiaire", duration: "15 min" },
  { id: 7, title: "Renforcement péroniers avec élastique", muscleGroup: "Cheville / Péroniers", description: "Assis, pied sur élastique. Éversion contrôlée. 3x20 chaque côté.", videoUrl: "https://www.youtube.com/embed/example7", thumbnail: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&q=80", difficulty: "Débutant", duration: "8 min" },
  { id: 8, title: "Leg press unilatéral", muscleGroup: "Quadriceps / Rééducation genou", description: "Presse sur une jambe. Contrôle excentrique. 3x12 chaque côté.", videoUrl: "https://www.youtube.com/embed/example8", thumbnail: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&q=80", difficulty: "Avancé", duration: "15 min" },
  { id: 9, title: "Étirements cervicaux actifs", muscleGroup: "Cervicales / Trapèzes", description: "Inclinations latérales et rotations lentes de la tête. 10 répétitions chaque sens.", videoUrl: "https://www.youtube.com/embed/example9", thumbnail: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&q=80", difficulty: "Débutant", duration: "5 min" },
  { id: 10, title: "Renforcement coiffe des rotateurs", muscleGroup: "Épaule / Coiffe", description: "Rotation interne/externe avec élastique. 3x15 chaque côté.", videoUrl: "https://www.youtube.com/embed/example10", thumbnail: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&q=80", difficulty: "Intermédiaire", duration: "12 min" },
  { id: 11, title: "Gainage latéral", muscleGroup: "Obliques / Core", description: "Appui sur un avant-bras, corps aligné de profil. 3x20 secondes par côté.", videoUrl: "https://www.youtube.com/embed/example11", thumbnail: "https://images.unsplash.com/photo-1598971639058-fab3c3109a73?w=300&q=80", difficulty: "Intermédiaire", duration: "8 min" },
  { id: 12, title: "Travail de la marche post-AVC", muscleGroup: "Membres inférieurs / Neurologie", description: "Marche contrôlée avec repères visuels. Travail de l'appui talonnien. 20 min.", videoUrl: "https://www.youtube.com/embed/example12", thumbnail: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=80", difficulty: "Adapté", duration: "20 min" },
  { id: 13, title: "Préhension fine avec balles", muscleGroup: "Main / Doigts", description: "Prendre et relâcher des balles de différentes tailles. 5 minutes par main.", videoUrl: "https://www.youtube.com/embed/example13", thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80", difficulty: "Adapté", duration: "10 min" },
  { id: 14, title: "Hip thrust avec barre", muscleGroup: "Fessiers / Ischio-jambiers", description: "Appui épaules sur un banc, barre sur les hanches. Extension de hanche. 4x12.", videoUrl: "https://www.youtube.com/embed/example14", thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80", difficulty: "Avancé", duration: "15 min" },
  { id: 15, title: "Stretching global du dos (cat-cow)", muscleGroup: "Rachis / Mobilité", description: "À quatre pattes, alterner flexion et extension du dos. 10 cycles lents.", videoUrl: "https://www.youtube.com/embed/example15", thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80", difficulty: "Débutant", duration: "5 min" }
];

export const mockRDVs = [
  { id: 1, patientId: 1, patientName: "Mohamed Cherif", specialistId: 1, date: "2024-02-15", startTime: "10:00", endTime: "10:45", type: "Suivi", status: "upcoming", notes: "Vérification du protocole lombaire" },
  { id: 2, patientId: 2, patientName: "Fatima Zahra Hadj", specialistId: 1, date: "2024-02-15", startTime: "14:00", endTime: "14:45", type: "Rééducation", status: "upcoming", notes: "Séance Phase 2 LCA" },
  { id: 3, patientId: 5, patientName: "Omar Zitouni", specialistId: 1, date: "2024-02-16", startTime: "09:00", endTime: "09:30", type: "Bilan", status: "upcoming", notes: "Bilan proprioceptif cheville" },
  { id: 4, patientId: 1, patientName: "Mohamed Cherif", specialistId: 1, date: "2024-02-20", startTime: "10:00", endTime: "10:45", type: "Suivi", status: "pending", notes: "" },
  { id: 5, patientId: 4, patientName: "Leila Mansouri", specialistId: 3, date: "2024-02-18", startTime: "11:00", endTime: "12:00", type: "Neurologie", status: "pending", notes: "" },
  { id: 6, patientId: 1, patientName: "Mohamed Cherif", specialistId: 1, date: "2024-02-01", startTime: "10:00", endTime: "10:45", type: "Suivi", status: "past", notes: "Bonne progression. Douleur 4/10." },
  { id: 7, patientId: 2, patientName: "Fatima Zahra Hadj", specialistId: 1, date: "2024-01-28", startTime: "14:00", endTime: "14:45", type: "Rééducation", status: "past", notes: "Fin phase 1. Très bonne évolution." },
  { id: 8, patientId: 3, patientName: "Rachid Boudiaf", specialistId: 2, date: "2024-02-08", startTime: "09:00", endTime: "09:30", type: "Consultation", status: "past", notes: "2ème infiltration. Bilan pré-opératoire." },
  { id: 9, patientId: 5, patientName: "Omar Zitouni", specialistId: 1, date: "2024-02-05", startTime: "16:00", endTime: "16:30", type: "Bilan", status: "past", notes: "Bilan initial cheville." },
  { id: 10, patientId: 4, patientName: "Leila Mansouri", specialistId: 3, date: "2024-02-11", startTime: "11:00", endTime: "12:00", type: "Neurologie", status: "past", notes: "Bonne récupération motrice." }
];

export const mockUsers = [
  { id: "admin1", email: "admin@sahtech.tn", password: "admin123", role: "admin", name: "Admin SAHTECH" },
  { id: "s1", email: "amira.benali@sahtech.tn", password: "password123", role: "specialist", specialistId: 1, name: "Dr. Amira Benali" },
  { id: "s2", email: "karim.meziane@sahtech.tn", password: "password123", role: "specialist", specialistId: 2, name: "Dr. Karim Meziane" },
  { id: "s3", email: "samira.touati@sahtech.tn", password: "password123", role: "specialist", specialistId: 3, name: "Dr. Samira Touati" }
];
