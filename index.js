const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Cette ligne peut être supprimée car la configuration du port existe déjà à la fin du fichier

const app = express();

// Configuration CORS pour accepter les requêtes depuis GitHub Pages et d'autres domaines
app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origine (comme les appels d'API mobile ou Postman)
    if (!origin) return callback(null, true);
    
    // Liste des origines autorisées
    const allowedOrigins = [
      'https://noahj.github.io',
      'http://localhost:3000',
      // Ajoutez d'autres origines si nécessaire
    ];
    
    // Vérifier si l'origine de la requête est autorisée
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Stockage des sessions en mémoire
const sessions = {};

// Fonction pour obtenir un mot français aléatoire à partir d'une seed
async function getRandomFrenchWord(seed) {
  try {
    // Utilisation de l'API DicoLink pour obtenir un mot français aléatoire
    // La seed est utilisée pour obtenir un mot déterministe
    const response = await fetch(`https://api.dicolink.com/v1/mots/aleatoire?avecDefinition=false&nombreMots=1&avecVariantes=false&seed=${seed}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && data[0].mot) {
      return data[0].mot.toLowerCase();
    } else {
      // Mots de secours en cas d'échec de l'API
      const backupWords = ["maison", "voiture", "chat", "chien", "livre", "table", "arbre", "fleur", "soleil", "montagne"];
      return backupWords[seed % backupWords.length];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du mot aléatoire:', error);
    // Mots de secours en cas d'erreur
    const backupWords = ["maison", "voiture", "chat", "chien", "livre", "table", "arbre", "fleur", "soleil", "montagne"];
    return backupWords[seed % backupWords.length];
  }
}

// Fonction pour obtenir un mot similaire à partir d'un mot donné et d'une seed
async function getSimilarWord(word, seed) {
  try {
    // Utilisation de l'API Datamuse pour obtenir des mots similaires
    const response = await fetch(`https://api.datamuse.com/words?ml=${word}&v=fr&max=20`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      // Utiliser la seed pour sélectionner un mot de manière déterministe
      const index = seed % data.length;
      return data[index].word.toLowerCase();
    } else {
      // Mots similaires de secours en cas d'échec de l'API
      const backupSimilarWords = {
        "maison": "appartement",
        "voiture": "véhicule",
        "chat": "félin",
        "chien": "canin",
        "livre": "roman",
        "table": "bureau",
        "arbre": "plante",
        "fleur": "rose",
        "soleil": "étoile",
        "montagne": "colline"
      };
      return backupSimilarWords[word] || word + "s";
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du mot similaire:', error);
    // Mots similaires de secours en cas d'erreur
    const backupSimilarWords = {
      "maison": "appartement",
      "voiture": "véhicule",
      "chat": "félin",
      "chien": "canin",
      "livre": "roman",
      "table": "bureau",
      "arbre": "plante",
      "fleur": "rose",
      "soleil": "étoile",
      "montagne": "colline"
    };
    return backupSimilarWords[word] || word + "s";
  }
}

// Route pour rejoindre une session
app.post('/join', async (req, res) => {
  const { sid, playerId } = req.body;
  
  if (!sid || !playerId) {
    return res.status(400).json({ error: 'SID et playerId sont requis' });
  }
  
  // Vérifier que le SID est composé de 5 chiffres
  if (!/^\d{5}$/.test(sid)) {
    return res.status(400).json({ error: 'Le SID doit être composé de 5 chiffres' });
  }
  
  // Si la session n'existe pas, on la crée
  if (!sessions[sid]) {
    sessions[sid] = {
      players: [],
      words: null,
      assigned: {}
    };
    
    // Générer les mots à partir du SID
    try {
      // Utiliser les 3 premiers chiffres comme seed pour le mot principal
      const firstSeed = parseInt(sid.substring(0, 3));
      // Utiliser les 2 derniers chiffres comme seed pour le mot similaire
      const secondSeed = parseInt(sid.substring(3, 5));
      
      console.log(`Génération de mots pour la session ${sid} avec seeds ${firstSeed} et ${secondSeed}`);
      
      // Obtenir le mot principal
      const mainWord = await getRandomFrenchWord(firstSeed);
      console.log(`Mot principal généré: ${mainWord}`);
      
      // Obtenir le mot similaire
      const similarWord = await getSimilarWord(mainWord, secondSeed);
      console.log(`Mot similaire généré: ${similarWord}`);
      
      // Stocker la paire de mots dans la session
      sessions[sid].wordPair = [mainWord, similarWord];
    } catch (error) {
      console.error('Erreur lors de la génération des mots:', error);
      // En cas d'erreur, utiliser des mots de secours
      sessions[sid].wordPair = ["maison", "appartement"];
    }
  }
  
  // Vérifier si la session est déjà complète
  if (sessions[sid].players.length >= 3) {
    return res.status(400).json({ error: 'Session déjà complète' });
  }
  
  // Vérifier si le joueur est déjà dans la session
  if (sessions[sid].players.includes(playerId)) {
    return res.status(200).json({ 
      message: 'Déjà dans la session',
      playersCount: sessions[sid].players.length,
      isReady: sessions[sid].players.length === 3,
      playersList: sessions[sid].players
    });
  }
  
  // Ajouter le joueur à la session
  sessions[sid].players.push(playerId);
  
  // Si 3 joueurs sont connectés, attribuer les mots
  if (sessions[sid].players.length === 3) {
    // Utiliser la paire de mots générée dynamiquement
    sessions[sid].words = sessions[sid].wordPair;
    console.log(`Attribution des mots pour la session ${sid}: ${sessions[sid].words[0]} et ${sessions[sid].words[1]}`);
    
    // Choisir aléatoirement l'imposteur parmi les 3 joueurs
    const impostorIndex = Math.floor(Math.random() * 3);
    
    // Attribuer les mots aux joueurs
    sessions[sid].players.forEach((player, index) => {
      if (index === impostorIndex) {
        // L'imposteur reçoit le mot similaire
        sessions[sid].assigned[player] = sessions[sid].words[1];
        console.log(`Joueur ${player} est l'imposteur avec le mot: ${sessions[sid].words[1]}`);
      } else {
        // Les autres joueurs reçoivent le mot principal
        sessions[sid].assigned[player] = sessions[sid].words[0];
        console.log(`Joueur ${player} est normal avec le mot: ${sessions[sid].words[0]}`);
      }
    });
  }
  
  res.status(200).json({ 
    message: 'Joueur ajouté à la session', 
    playersCount: sessions[sid].players.length,
    isReady: sessions[sid].players.length === 3,
    playersList: sessions[sid].players
  });
});

// Route pour récupérer le mot attribué à un joueur
app.get('/word', (req, res) => {
  const { sid, playerId } = req.query;
  
  if (!sid || !playerId) {
    return res.status(400).json({ error: 'SID et playerId sont requis' });
  }
  
  // Vérifier si la session existe
  if (!sessions[sid]) {
    return res.status(404).json({ error: 'Session non trouvée' });
  }
  
  // Vérifier si le joueur est dans la session
  if (!sessions[sid].players.includes(playerId)) {
    return res.status(404).json({ error: 'Joueur non trouvé dans cette session' });
  }
  
  // Vérifier si les mots ont été attribués
  if (!sessions[sid].words) {
    return res.status(400).json({ error: 'En attente d\'autres joueurs' });
  }
  
  // Renvoyer le mot attribué au joueur
  const word = sessions[sid].assigned[playerId];
  res.status(200).json({ word });
});

// Route pour obtenir la liste des joueurs d'une session
app.get('/players', (req, res) => {
  const { sid } = req.query;
  
  if (!sid) {
    return res.status(400).json({ error: 'SID est requis' });
  }
  
  // Vérifier si la session existe
  if (!sessions[sid]) {
    return res.status(404).json({ error: 'Session non trouvée' });
  }
  
  res.status(200).json({ 
    players: sessions[sid].players,
    playersCount: sessions[sid].players.length,
    isReady: sessions[sid].players.length === 3
  });
});

// Route de base pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.send('Serveur du jeu "Who\'s the Fake" en ligne!');
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});