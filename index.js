const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Cette ligne peut être supprimée car la configuration du port existe déjà à la fin du fichier

const app = express();

// Configuration CORS pour accepter les requêtes de toutes les origines
app.use(cors({
  origin: '*', // Accepter toutes les origines
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Stockage des sessions en mémoire
const sessions = {};

// Fonction pour obtenir un mot français aléatoire à partir d'une seed
async function getRandomFrenchWord(seed) {
  try {
    // Liste de mots français courants et vérifiés
    const verifiedWords = [
      "maison", "voiture", "chat", "chien", "livre", "table", "arbre", "fleur", "soleil", "montagne",
      "école", "travail", "famille", "ami", "musique", "film", "cuisine", "jardin", "sport", "voyage",
      "café", "pain", "fromage", "vin", "eau", "fruit", "légume", "viande", "poisson", "dessert",
      "téléphone", "ordinateur", "internet", "télévision", "radio", "journal", "magazine", "livre", "stylo", "papier",
      "vêtement", "chaussure", "chapeau", "manteau", "pantalon", "chemise", "robe", "jupe", "bijou", "montre",
      "médecin", "hôpital", "pharmacie", "médicament", "santé", "maladie", "douleur", "fièvre", "rhume", "grippe",
      "banque", "argent", "carte", "crédit", "dette", "épargne", "impôt", "salaire", "budget", "économie",
      "train", "avion", "bus", "métro", "taxi", "vélo", "moto", "bateau", "route", "pont",
      "ville", "pays", "nation", "continent", "océan", "mer", "lac", "rivière", "montagne", "forêt",
      "animal", "oiseau", "poisson", "insecte", "reptile", "mammifère", "plante", "arbre", "fleur", "herbe"
    ];
    
    // Utiliser la seed pour sélectionner un mot de manière déterministe
    // Si la seed est entre 0 et 999, on l'utilise directement
    if (seed >= 0 && seed < 1000) {
      return verifiedWords[seed % verifiedWords.length];
    }
    
    // Sinon, on essaie d'utiliser l'API DicoLink
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
      const mot = data[0].mot.toLowerCase();
      // Vérifier que le mot est valide (au moins 3 lettres et pas de caractères spéciaux)
      if (mot.length >= 3 && /^[a-zàáâäæçèéêëìíîïòóôöùúûüÿœ]+$/i.test(mot)) {
        return mot;
      }
    }
    
    // En cas d'échec de l'API ou de mot invalide, utiliser notre liste de mots vérifiés
    return verifiedWords[seed % verifiedWords.length];
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
    // Liste de mots similaires vérifiés pour les mots courants
    const verifiedSimilarWords = {
      "maison": ["appartement", "demeure", "habitation", "logement", "résidence"],
      "voiture": ["véhicule", "automobile", "auto", "berline", "cabriolet"],
      "chat": ["félin", "matou", "minet", "chaton", "minou"],
      "chien": ["canin", "toutou", "clebs", "cabot", "chiot"],
      "livre": ["roman", "ouvrage", "bouquin", "volume", "publication"],
      "table": ["bureau", "meuble", "plateau", "pupitre", "comptoir"],
      "arbre": ["plante", "végétal", "arbuste", "buisson", "bosquet"],
      "fleur": ["rose", "plante", "bouquet", "marguerite", "tulipe"],
      "soleil": ["étoile", "astre", "lumière", "chaleur", "rayonnement"],
      "montagne": ["colline", "sommet", "pic", "massif", "relief"]
    };
    
    // Vérifier si nous avons des mots similaires vérifiés pour ce mot
    if (verifiedSimilarWords[word]) {
      const similarWords = verifiedSimilarWords[word];
      const index = seed % similarWords.length;
      return similarWords[index];
    }
    
    // Utilisation de l'API Datamuse pour obtenir des mots similaires
    const response = await fetch(`https://api.datamuse.com/words?ml=${word}&v=fr&max=20`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      // Filtrer les mots pour s'assurer qu'ils sont valides (au moins 3 lettres et pas de caractères spéciaux)
      const validWords = data.filter(item => 
        item.word && 
        item.word.length >= 3 && 
        /^[a-zàáâäæçèéêëìíîïòóôöùúûüÿœ]+$/i.test(item.word)
      );
      
      if (validWords.length > 0) {
        // Utiliser la seed pour sélectionner un mot de manière déterministe
        const index = seed % validWords.length;
        return validWords[index].word.toLowerCase();
      }
    }
    
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
        
        // Vérifier que les mots sont différents
        if (mainWord === similarWord) {
          console.log(`Attention: Les mots générés sont identiques. Génération d'un mot similaire alternatif.`);
          // Utiliser une seed différente pour générer un mot similaire alternatif
          const altSeed = (secondSeed + 50) % 100;
          const altSimilarWord = await getSimilarWord(mainWord, altSeed);
          
          // Vérifier à nouveau
          if (mainWord === altSimilarWord) {
            console.log(`Échec de génération d'un mot similaire différent. Utilisation d'un mot de secours.`);
            // Utiliser un mot de secours prédéfini
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
            
            const finalSimilarWord = backupSimilarWords[mainWord] || mainWord + "s";
            console.log(`Mot similaire de secours utilisé: ${finalSimilarWord}`);
            sessions[sid].wordPair = [mainWord, finalSimilarWord];
          } else {
            console.log(`Nouveau mot similaire généré: ${altSimilarWord}`);
            sessions[sid].wordPair = [mainWord, altSimilarWord];
          }
        } else {
          // Stocker la paire de mots dans la session
          sessions[sid].wordPair = [mainWord, similarWord];
          console.log(`Paire de mots stockée: ${mainWord} / ${similarWord}`);
        }
      } catch (error) {
        console.error('Erreur lors de la génération des mots:', error);
        // En cas d'erreur, utiliser des mots de secours
        sessions[sid].wordPair = ["maison", "appartement"];
        console.log(`Erreur de génération, mots de secours utilisés: maison / appartement`);
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