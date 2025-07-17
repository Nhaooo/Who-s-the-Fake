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
    // Liste de mots français courants et vérifiés, organisés par catégories
    const verifiedWords = [
      // Objets du quotidien
      "maison", "voiture", "chat", "chien", "livre", "table", "arbre", "fleur", "soleil", "montagne",
      "école", "travail", "famille", "ami", "musique", "film", "cuisine", "jardin", "sport", "voyage",
      
      // Nourriture et boissons
      "café", "pain", "fromage", "vin", "eau", "fruit", "légume", "viande", "poisson", "dessert",
      "pomme", "poire", "banane", "orange", "fraise", "chocolat", "gâteau", "pizza", "pâtes", "riz",
      "thé", "jus", "soda", "bière", "lait", "yaourt", "beurre", "sucre", "sel", "poivre",
      
      // Technologie
      "téléphone", "ordinateur", "internet", "télévision", "radio", "journal", "magazine", "stylo", "papier",
      "tablette", "console", "montre", "appareil", "caméra", "écran", "clavier", "souris", "batterie", "câble",
      "iphone", "samsung", "xiaomi", "huawei", "google", "sony", "nintendo", "playstation", "xbox", "application",
      
      // Vêtements
      "vêtement", "chaussure", "chapeau", "manteau", "pantalon", "chemise", "robe", "jupe", "bijou", "montre",
      "t-shirt", "pull", "veste", "short", "chaussette", "gant", "écharpe", "ceinture", "sac", "lunettes",
      
      // Santé
      "médecin", "hôpital", "pharmacie", "médicament", "santé", "maladie", "douleur", "fièvre", "rhume", "grippe",
      
      // Finance
      "banque", "argent", "carte", "crédit", "dette", "épargne", "impôt", "salaire", "budget", "économie",
      
      // Transport
      "train", "avion", "bus", "métro", "taxi", "vélo", "moto", "bateau", "route", "pont",
      "voiture", "camion", "trottinette", "tramway", "autobus", "hélicoptère", "navire", "ferry", "ambulance", "police",
      
      // Géographie
      "ville", "pays", "nation", "continent", "océan", "mer", "lac", "rivière", "montagne", "forêt",
      "plage", "désert", "île", "colline", "vallée", "prairie", "champ", "village", "capitale", "région",
      
      // Nature
      "animal", "oiseau", "poisson", "insecte", "reptile", "mammifère", "plante", "arbre", "fleur", "herbe",
      
      // Mobilier
      "table", "chaise", "canapé", "lit", "armoire", "bureau", "étagère", "commode", "fauteuil", "tabouret",
      
      // Habitation
      "maison", "appartement", "villa", "chalet", "cabane", "château", "immeuble", "studio", "duplex", "loft"
    ];
    
    // Utiliser la seed pour sélectionner un mot de manière déterministe
    // Privilégier notre liste de mots vérifiés pour plus de fiabilité
    if (true) { // Toujours utiliser notre liste de mots vérifiés pour éviter les problèmes
      // Utiliser la seed pour sélectionner un mot de manière déterministe
      return verifiedWords[seed % verifiedWords.length];
    }
    
    // Le code ci-dessous est désactivé car il peut générer des mots problématiques
    // Nous gardons le code au cas où nous voudrions le réactiver plus tard
    
    // Essayer d'utiliser l'API DicoLink
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
      if (mot.length >= 3 && mot.length <= 10 && /^[a-zàáâäæçèéêëìíîïòóôöùúûüÿœ]+$/i.test(mot)) {
        // Vérifier que le mot est courant (en le comparant à notre liste)
        if (verifiedWords.includes(mot)) {
          return mot;
        }
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
    // IMPORTANT: Nous n'utilisons plus l'API Datamuse car elle renvoie souvent des mots en anglais
    // Nous utilisons uniquement des dictionnaires de mots français prédéfinis
    
    // Dictionnaire complet de mots français par catégorie
    const frenchWordPairs = {
      // Fruits
      "pomme": ["poire", "banane", "orange", "fraise", "abricot"],
      "poire": ["pomme", "banane", "orange", "fraise", "abricot"],
      "banane": ["pomme", "poire", "orange", "fraise", "abricot"],
      "orange": ["pomme", "poire", "banane", "fraise", "abricot"],
      "fraise": ["pomme", "poire", "banane", "orange", "abricot"],
      "cerise": ["pomme", "poire", "banane", "orange", "fraise"],
      "raisin": ["pomme", "poire", "banane", "orange", "fraise"],
      "ananas": ["pomme", "poire", "banane", "orange", "fraise"],
      "pêche": ["pomme", "poire", "banane", "orange", "fraise"],
      "abricot": ["pomme", "poire", "banane", "orange", "fraise"],
      
      // Légumes
      "tomate": ["carotte", "poivron", "concombre", "aubergine", "courgette"],
      "carotte": ["tomate", "poivron", "concombre", "aubergine", "courgette"],
      "poivron": ["tomate", "carotte", "concombre", "aubergine", "courgette"],
      "concombre": ["tomate", "carotte", "poivron", "aubergine", "courgette"],
      "aubergine": ["tomate", "carotte", "poivron", "concombre", "courgette"],
      "courgette": ["tomate", "carotte", "poivron", "concombre", "aubergine"],
      "poireau": ["tomate", "carotte", "poivron", "concombre", "aubergine"],
      "oignon": ["tomate", "carotte", "poivron", "concombre", "aubergine"],
      "navet": ["tomate", "carotte", "poivron", "concombre", "aubergine"],
      "céleri": ["tomate", "carotte", "poivron", "concombre", "aubergine"],
      
      // Habitations
      "maison": ["appartement", "villa", "chalet", "cabane", "château"],
      "appartement": ["maison", "villa", "chalet", "cabane", "château"],
      "villa": ["maison", "appartement", "chalet", "cabane", "château"],
      "chalet": ["maison", "appartement", "villa", "cabane", "château"],
      "cabane": ["maison", "appartement", "villa", "chalet", "château"],
      "château": ["maison", "appartement", "villa", "chalet", "cabane"],
      "immeuble": ["maison", "appartement", "villa", "chalet", "cabane"],
      "studio": ["maison", "appartement", "villa", "chalet", "cabane"],
      "duplex": ["maison", "appartement", "villa", "chalet", "cabane"],
      "loft": ["maison", "appartement", "villa", "chalet", "cabane"],
      
      // Véhicules
      "voiture": ["moto", "camion", "vélo", "bus", "trottinette"],
      "moto": ["voiture", "camion", "vélo", "bus", "trottinette"],
      "camion": ["voiture", "moto", "vélo", "bus", "trottinette"],
      "vélo": ["voiture", "moto", "camion", "bus", "trottinette"],
      "bus": ["voiture", "moto", "camion", "vélo", "trottinette"],
      "trottinette": ["voiture", "moto", "camion", "vélo", "bus"],
      "train": ["voiture", "moto", "camion", "vélo", "bus"],
      "avion": ["voiture", "moto", "camion", "vélo", "bus"],
      "bateau": ["voiture", "moto", "camion", "vélo", "bus"],
      "métro": ["voiture", "moto", "camion", "vélo", "bus"],
      "tramway": ["voiture", "moto", "camion", "vélo", "bus"],
      "taxi": ["voiture", "moto", "camion", "vélo", "bus"],
      "autobus": ["voiture", "moto", "camion", "vélo", "tram"],
      "tram": ["voiture", "moto", "camion", "vélo", "autobus"],
      "navire": ["voiture", "moto", "camion", "vélo", "bus"],
      "hélicoptère": ["voiture", "moto", "camion", "vélo", "bus"],
      
      // Animaux
      "chat": ["chien", "lapin", "hamster", "souris", "poisson"],
      "chien": ["chat", "lapin", "hamster", "souris", "poisson"],
      "lapin": ["chat", "chien", "hamster", "souris", "poisson"],
      "hamster": ["chat", "chien", "lapin", "souris", "poisson"],
      "souris": ["chat", "chien", "lapin", "hamster", "poisson"],
      "poisson": ["chat", "chien", "lapin", "hamster", "souris"],
      "oiseau": ["chat", "chien", "lapin", "hamster", "souris"],
      "tortue": ["chat", "chien", "lapin", "hamster", "souris"],
      "serpent": ["chat", "chien", "lapin", "hamster", "souris"],
      "grenouille": ["chat", "chien", "lapin", "hamster", "souris"],
      "loup": ["chat", "chien", "lapin", "hamster", "souris"],
      "renard": ["chat", "chien", "lapin", "hamster", "souris"],
      "cheval": ["chat", "chien", "lapin", "hamster", "souris"],
      
      // Meubles
      "table": ["chaise", "canapé", "lit", "armoire", "bureau"],
      "chaise": ["table", "canapé", "lit", "armoire", "bureau"],
      "canapé": ["table", "chaise", "lit", "armoire", "bureau"],
      "lit": ["table", "chaise", "canapé", "armoire", "bureau"],
      "armoire": ["table", "chaise", "canapé", "lit", "bureau"],
      "bureau": ["table", "chaise", "canapé", "lit", "armoire"],
      "fauteuil": ["table", "chaise", "canapé", "lit", "armoire"],
      "commode": ["table", "chaise", "canapé", "lit", "armoire"],
      "étagère": ["table", "chaise", "canapé", "lit", "armoire"],
      "tabouret": ["table", "chaise", "canapé", "lit", "armoire"],
      "bibliothèque": ["table", "chaise", "canapé", "lit", "armoire"],
      "pupitre": ["table", "chaise", "canapé", "lit", "armoire"],
      
      // Nature
      "arbre": ["fleur", "buisson", "herbe", "plante", "champignon"],
      "fleur": ["arbre", "buisson", "herbe", "plante", "champignon"],
      "buisson": ["arbre", "fleur", "herbe", "plante", "champignon"],
      "herbe": ["arbre", "fleur", "buisson", "plante", "champignon"],
      "plante": ["arbre", "fleur", "buisson", "herbe", "champignon"],
      "champignon": ["arbre", "fleur", "buisson", "herbe", "plante"],
      "forêt": ["plage", "montagne", "désert", "lac", "rivière"],
      "plage": ["forêt", "montagne", "désert", "lac", "rivière"],
      "montagne": ["forêt", "plage", "désert", "lac", "rivière"],
      "désert": ["forêt", "plage", "montagne", "lac", "rivière"],
      "lac": ["forêt", "plage", "montagne", "désert", "rivière"],
      "rivière": ["forêt", "plage", "montagne", "désert", "lac"],
      "océan": ["forêt", "plage", "montagne", "désert", "lac"],
      "mer": ["forêt", "plage", "montagne", "désert", "lac"],
      "étang": ["forêt", "plage", "montagne", "désert", "lac"],
      "fleuve": ["forêt", "plage", "montagne", "désert", "lac"],
      
      // Électronique
      "téléphone": ["ordinateur", "tablette", "télévision", "console", "radio"],
      "ordinateur": ["téléphone", "tablette", "télévision", "console", "radio"],
      "tablette": ["téléphone", "ordinateur", "télévision", "console", "radio"],
      "télévision": ["téléphone", "ordinateur", "tablette", "console", "radio"],
      "console": ["téléphone", "ordinateur", "tablette", "télévision", "radio"],
      "radio": ["téléphone", "ordinateur", "tablette", "télévision", "console"],
      "montre": ["téléphone", "ordinateur", "tablette", "télévision", "console"],
      "appareil": ["téléphone", "ordinateur", "tablette", "télévision", "console"],
      "caméra": ["téléphone", "ordinateur", "tablette", "télévision", "console"],
      "enceinte": ["téléphone", "ordinateur", "tablette", "télévision", "console"],
      "écran": ["téléphone", "ordinateur", "tablette", "télévision", "console"],
      "manette": ["téléphone", "ordinateur", "tablette", "télévision", "console"],
      "chaîne": ["téléphone", "ordinateur", "tablette", "télévision", "console"],
      
      // Vêtements
      "pantalon": ["chemise", "veste", "manteau", "chapeau", "cravate"],
      "chemise": ["pantalon", "veste", "manteau", "chapeau", "cravate"],
      "veste": ["pantalon", "chemise", "manteau", "chapeau", "cravate"],
      "manteau": ["pantalon", "chemise", "veste", "chapeau", "cravate"],
      "chapeau": ["pantalon", "chemise", "veste", "manteau", "cravate"],
      "cravate": ["pantalon", "chemise", "veste", "manteau", "chapeau"],
      "robe": ["jupe", "chemisier", "short", "pantalon", "chemise"],
      "jupe": ["robe", "chemisier", "short", "pantalon", "chemise"],
      "chemisier": ["robe", "jupe", "short", "pantalon", "chemise"],
      "short": ["robe", "jupe", "chemisier", "pantalon", "chemise"],
      "blouson": ["pantalon", "chemise", "veste", "manteau", "chapeau"],
      
      // Boissons
      "eau": ["café", "thé", "jus", "soda", "bière"],
      "café": ["eau", "thé", "jus", "soda", "bière"],
      "thé": ["eau", "café", "jus", "soda", "bière"],
      "jus": ["eau", "café", "thé", "soda", "bière"],
      "soda": ["eau", "café", "thé", "jus", "bière"],
      "bière": ["eau", "café", "thé", "jus", "soda"],
      "vin": ["eau", "café", "thé", "jus", "soda"],
      "sirop": ["eau", "café", "thé", "jus", "soda"],
      "chocolat": ["eau", "café", "thé", "jus", "soda"],
      "limonade": ["eau", "café", "thé", "jus", "soda"],
      "cidre": ["eau", "café", "thé", "jus", "soda"],
      "tisane": ["eau", "café", "thé", "jus", "soda"],
      
      // Nourriture
      "pain": ["fromage", "jambon", "beurre", "confiture", "gâteau"],
      "fromage": ["pain", "jambon", "beurre", "confiture", "gâteau"],
      "jambon": ["pain", "fromage", "beurre", "confiture", "gâteau"],
      "beurre": ["pain", "fromage", "jambon", "confiture", "gâteau"],
      "confiture": ["pain", "fromage", "jambon", "beurre", "gâteau"],
      "gâteau": ["pain", "fromage", "jambon", "beurre", "confiture"],
      "viande": ["poisson", "légume", "fruit", "dessert", "salade"],
      "poisson": ["viande", "légume", "fruit", "dessert", "salade"],
      "légume": ["viande", "poisson", "fruit", "dessert", "salade"],
      "fruit": ["viande", "poisson", "légume", "dessert", "salade"],
      "dessert": ["viande", "poisson", "légume", "fruit", "salade"],
      "salade": ["viande", "poisson", "légume", "fruit", "dessert"],
      "yaourt": ["pain", "fromage", "jambon", "beurre", "confiture"],
      "camembert": ["pain", "fromage", "jambon", "beurre", "confiture"],
      
      // Lieux
      "école": ["hôpital", "mairie", "cinéma", "musée", "bibliothèque"],
      "hôpital": ["école", "mairie", "cinéma", "musée", "bibliothèque"],
      "mairie": ["école", "hôpital", "cinéma", "musée", "bibliothèque"],
      "cinéma": ["école", "hôpital", "mairie", "musée", "bibliothèque"],
      "musée": ["école", "hôpital", "mairie", "cinéma", "bibliothèque"],
      "bibliothèque": ["école", "hôpital", "mairie", "cinéma", "musée"],
      "collège": ["école", "hôpital", "mairie", "cinéma", "musée"],
      "clinique": ["école", "hôpital", "mairie", "cinéma", "musée"],
      "théâtre": ["école", "hôpital", "mairie", "cinéma", "musée"],
      "galerie": ["école", "hôpital", "mairie", "cinéma", "musée"],
      
      // Objets quotidiens
      "stylo": ["crayon", "gomme", "cahier", "règle", "trousse"],
      "crayon": ["stylo", "gomme", "cahier", "règle", "trousse"],
      "gomme": ["stylo", "crayon", "cahier", "règle", "trousse"],
      "cahier": ["stylo", "crayon", "gomme", "règle", "trousse"],
      "règle": ["stylo", "crayon", "gomme", "cahier", "trousse"],
      "trousse": ["stylo", "crayon", "gomme", "cahier", "règle"],
      "montre": ["bracelet", "collier", "bague", "lunettes", "portefeuille"],
      "bracelet": ["montre", "collier", "bague", "lunettes", "portefeuille"],
      "collier": ["montre", "bracelet", "bague", "lunettes", "portefeuille"],
      "bague": ["montre", "bracelet", "collier", "lunettes", "portefeuille"],
      "lunettes": ["montre", "bracelet", "collier", "bague", "portefeuille"],
      "portefeuille": ["montre", "bracelet", "collier", "bague", "lunettes"],
      
      // Métiers
      "médecin": ["professeur", "boulanger", "policier", "pompier", "facteur"],
      "professeur": ["médecin", "boulanger", "policier", "pompier", "facteur"],
      "boulanger": ["médecin", "professeur", "policier", "pompier", "facteur"],
      "policier": ["médecin", "professeur", "boulanger", "pompier", "facteur"],
      "pompier": ["médecin", "professeur", "boulanger", "policier", "facteur"],
      "facteur": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "avocat": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "juge": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "notaire": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "architecte": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "ingénieur": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "infirmier": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "instituteur": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "pâtissier": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      "gendarme": ["médecin", "professeur", "boulanger", "policier", "pompier"],
      
      // Loisirs
      "livre": ["film", "musique", "jeu", "sport", "danse"],
      "film": ["livre", "musique", "jeu", "sport", "danse"],
      "musique": ["livre", "film", "jeu", "sport", "danse"],
      "jeu": ["livre", "film", "musique", "sport", "danse"],
      "sport": ["livre", "film", "musique", "jeu", "danse"],
      "danse": ["livre", "film", "musique", "jeu", "sport"],
      "football": ["tennis", "natation", "cyclisme", "rugby", "basketball"],
      "tennis": ["football", "natation", "cyclisme", "rugby", "basketball"],
      "natation": ["football", "tennis", "cyclisme", "rugby", "basketball"],
      "cyclisme": ["football", "tennis", "natation", "rugby", "basketball"],
      "rugby": ["football", "tennis", "natation", "cyclisme", "basketball"],
      "basketball": ["football", "tennis", "natation", "cyclisme", "rugby"],
      "badminton": ["football", "tennis", "natation", "cyclisme", "rugby"],
      "série": ["livre", "film", "musique", "jeu", "sport"],
      
      // Éléments naturels
      "soleil": ["lune", "étoile", "nuage", "pluie", "vent"],
      "lune": ["soleil", "étoile", "nuage", "pluie", "vent"],
      "étoile": ["soleil", "lune", "nuage", "pluie", "vent"],
      "nuage": ["soleil", "lune", "étoile", "pluie", "vent"],
      "pluie": ["soleil", "lune", "étoile", "nuage", "vent"],
      "vent": ["soleil", "lune", "étoile", "nuage", "pluie"],
      "brouillard": ["soleil", "lune", "étoile", "nuage", "pluie"],
      
      // Parties du corps
      "main": ["pied", "tête", "bras", "jambe", "doigt"],
      "pied": ["main", "tête", "bras", "jambe", "doigt"],
      "tête": ["main", "pied", "bras", "jambe", "doigt"],
      "bras": ["main", "pied", "tête", "jambe", "doigt"],
      "jambe": ["main", "pied", "tête", "bras", "doigt"],
      "doigt": ["main", "pied", "tête", "bras", "jambe"],
      "orteil": ["main", "pied", "tête", "bras", "jambe"],
      "pouce": ["main", "pied", "tête", "bras", "jambe"],
      "ongle": ["main", "pied", "tête", "bras", "jambe"],
      "poignet": ["main", "pied", "tête", "bras", "jambe"],
      
      // Couleurs
      "rouge": ["bleu", "vert", "jaune", "noir", "blanc"],
      "bleu": ["rouge", "vert", "jaune", "noir", "blanc"],
      "vert": ["rouge", "bleu", "jaune", "noir", "blanc"],
      "jaune": ["rouge", "bleu", "vert", "noir", "blanc"],
      "noir": ["rouge", "bleu", "vert", "jaune", "blanc"],
      "blanc": ["rouge", "bleu", "vert", "jaune", "noir"],
      "gris": ["rouge", "bleu", "vert", "jaune", "noir"],
      "marron": ["rouge", "bleu", "vert", "jaune", "noir"],
      "violet": ["rouge", "bleu", "vert", "jaune", "noir"],
      "orange": ["rouge", "bleu", "vert", "jaune", "noir"],
      
      // Divers
      "crédit": ["argent", "banque", "carte", "épargne", "dette"],
      "argent": ["crédit", "banque", "carte", "épargne", "dette"],
      "banque": ["crédit", "argent", "carte", "épargne", "dette"],
      "carte": ["crédit", "argent", "banque", "épargne", "dette"],
      "épargne": ["crédit", "argent", "banque", "carte", "dette"],
      "dette": ["crédit", "argent", "banque", "carte", "épargne"],
      "médicament": ["maladie", "pharmacie", "docteur", "santé", "hôpital"],
      "maladie": ["médicament", "pharmacie", "docteur", "santé", "hôpital"],
      "pharmacie": ["médicament", "maladie", "docteur", "santé", "hôpital"],
      "docteur": ["médicament", "maladie", "pharmacie", "santé", "hôpital"],
      "santé": ["médicament", "maladie", "pharmacie", "docteur", "hôpital"],
      "batterie": ["énergie", "électricité", "pile", "courant", "chargeur"],
      "énergie": ["batterie", "électricité", "pile", "courant", "chargeur"],
      "électricité": ["batterie", "énergie", "pile", "courant", "chargeur"],
      "pile": ["batterie", "énergie", "électricité", "courant", "chargeur"],
      "courant": ["batterie", "énergie", "électricité", "pile", "chargeur"],
      "chargeur": ["batterie", "énergie", "électricité", "pile", "courant"]
    };
    
    // Vérifier si nous avons des mots de la même catégorie pour ce mot
    if (frenchWordPairs[word]) {
      const similarWords = frenchWordPairs[word];
      const index = seed % similarWords.length;
      return similarWords[index];
    }
    
    // Si le mot n'est pas dans notre dictionnaire, utiliser des catégories générales
    // Nous n'utilisons plus l'API Datamuse car elle renvoie souvent des mots en anglais
    const generalCategories = {
      "objets": ["table", "chaise", "stylo", "livre", "téléphone", "ordinateur", "montre", "lunettes"],
      "animaux": ["chat", "chien", "lapin", "poisson", "oiseau", "cheval", "vache", "mouton"],
      "nourriture": ["pain", "fromage", "pomme", "banane", "viande", "légume", "gâteau", "chocolat"],
      "vêtements": ["pantalon", "chemise", "robe", "manteau", "chapeau", "chaussure", "cravate", "écharpe"],
      "lieux": ["maison", "école", "hôpital", "magasin", "restaurant", "parc", "plage", "montagne"],
      "transports": ["voiture", "vélo", "bus", "train", "avion", "bateau", "métro", "tram"],
      "couleurs": ["rouge", "bleu", "vert", "jaune", "noir", "blanc", "gris", "violet"],
      "corps": ["main", "pied", "tête", "bras", "jambe", "doigt", "œil", "nez"]
    };
    
    // Choisir une catégorie générale basée sur la seed
    const categoryKeys = Object.keys(generalCategories);
    const categoryIndex = seed % categoryKeys.length;
    const selectedCategory = categoryKeys[categoryIndex];
    const generalWords = generalCategories[selectedCategory];
    
    // Choisir un mot dans la catégorie générale
    const wordIndex = (seed * 13) % generalWords.length; // Utiliser un multiplicateur pour varier la sélection
    return generalWords[wordIndex];
    
    // Dictionnaire étendu de mots français par catégorie
    const frenchCategories = {
      // Fruits et légumes
      "pomme": ["poire", "banane", "fraise", "cerise", "abricot"],
      "tomate": ["carotte", "poivron", "concombre", "aubergine"],
      "carotte": ["poireau", "navet", "oignon", "céleri"],
      
      // Animaux
      "chat": ["chien", "lapin", "hamster", "souris"],
      "chien": ["chat", "loup", "renard", "cheval"],
      "oiseau": ["poisson", "tortue", "serpent", "grenouille"],
      
      // Transports
      "voiture": ["vélo", "moto", "camion", "autobus"],
      "train": ["avion", "bateau", "métro", "tramway"],
      "bus": ["taxi", "tram", "métro", "vélo"],
      
      // Habitation
      "maison": ["château", "cabane", "immeuble", "villa"],
      "appartement": ["studio", "loft", "duplex", "chalet"],
      
      // Mobilier
      "table": ["chaise", "bureau", "armoire", "canapé"],
      "lit": ["canapé", "fauteuil", "commode", "étagère"],
      
      // Vêtements
      "pantalon": ["chemise", "veste", "manteau", "chapeau"],
      "robe": ["jupe", "chemisier", "short", "cravate"],
      
      // Boissons
      "eau": ["vin", "bière", "jus", "sirop"],
      "café": ["thé", "chocolat", "limonade", "cidre"],
      
      // Nourriture
      "pain": ["fromage", "jambon", "beurre", "confiture"],
      "viande": ["poisson", "légume", "fruit", "dessert"],
      
      // Lieux
      "école": ["hôpital", "mairie", "cinéma", "musée"],
      "plage": ["montagne", "forêt", "désert", "lac"],
      
      // Objets quotidiens
      "stylo": ["crayon", "gomme", "cahier", "règle"],
      "montre": ["bracelet", "collier", "bague", "lunettes"],
      
      // Électronique
      "téléphone": ["ordinateur", "tablette", "console", "télévision"],
      "radio": ["télévision", "magnétoscope", "enceinte", "appareil"],
      
      // Métiers
      "médecin": ["professeur", "boulanger", "policier", "pompier"],
      "avocat": ["juge", "notaire", "architecte", "ingénieur"],
      
      // Loisirs
      "livre": ["film", "musique", "jeu", "sport"],
      "football": ["tennis", "natation", "danse", "cyclisme"],
      
      // Éléments naturels
      "soleil": ["lune", "étoile", "nuage", "pluie"],
      "mer": ["océan", "rivière", "lac", "étang"],
      
      // Parties du corps
      "main": ["pied", "tête", "bras", "jambe"],
      "doigt": ["orteil", "pouce", "ongle", "poignet"],
      
      // Couleurs
      "rouge": ["bleu", "vert", "jaune", "noir"],
      "blanc": ["noir", "gris", "marron", "violet"]
    };
    
    // Vérifier si le mot est dans notre dictionnaire étendu
    if (frenchCategories[word]) {
      const similarWords = frenchCategories[word];
      const index = seed % similarWords.length;
      return similarWords[index];
    }
    
    // Si le mot n'est pas dans notre dictionnaire étendu, vérifier dans les catégories générales
    // Créer des catégories générales étendues pour classer les mots qui ne sont pas dans le dictionnaire spécifique
    const extendedCategories = {
      "fruits": ["pomme", "poire", "banane", "orange", "fraise", "cerise", "abricot", "pêche", "raisin", "ananas"],
      "légumes": ["carotte", "tomate", "poivron", "concombre", "aubergine", "courgette", "poireau", "navet", "oignon", "céleri"],
      "animaux": ["chat", "chien", "lapin", "hamster", "souris", "oiseau", "poisson", "tortue", "serpent", "grenouille"],
      "transports": ["voiture", "vélo", "moto", "camion", "bus", "train", "avion", "bateau", "métro", "tramway"],
      "habitation": ["maison", "appartement", "château", "cabane", "immeuble", "villa", "studio", "loft", "duplex", "chalet"],
      "mobilier": ["table", "chaise", "bureau", "armoire", "canapé", "lit", "fauteuil", "commode", "étagère", "tabouret"],
      "vêtements": ["pantalon", "chemise", "veste", "manteau", "chapeau", "robe", "jupe", "chemisier", "short", "cravate"],
      "boissons": ["eau", "vin", "bière", "jus", "sirop", "café", "thé", "chocolat", "limonade", "cidre"],
      "nourriture": ["pain", "fromage", "jambon", "beurre", "confiture", "viande", "poisson", "légume", "fruit", "dessert"],
      "lieux": ["école", "hôpital", "mairie", "cinéma", "musée", "plage", "montagne", "forêt", "désert", "lac"],
      "objets": ["stylo", "crayon", "gomme", "cahier", "règle", "montre", "bracelet", "collier", "bague", "lunettes"],
      "électronique": ["téléphone", "ordinateur", "tablette", "console", "télévision", "radio", "magnétoscope", "enceinte", "appareil", "caméra"],
      "métiers": ["médecin", "professeur", "boulanger", "policier", "pompier", "avocat", "juge", "notaire", "architecte", "ingénieur"],
      "loisirs": ["livre", "film", "musique", "jeu", "sport", "football", "tennis", "natation", "danse", "cyclisme"],
      "nature": ["soleil", "lune", "étoile", "nuage", "pluie", "mer", "océan", "rivière", "lac", "étang"],
      "corps": ["main", "pied", "tête", "bras", "jambe", "doigt", "orteil", "pouce", "ongle", "poignet"],
      "couleurs": ["rouge", "bleu", "vert", "jaune", "noir", "blanc", "gris", "marron", "violet", "orange"]
    };
    
    // Trouver la catégorie générale du mot
    let wordCategory = null;
    for (const category in extendedCategories) {
      if (extendedCategories[category].includes(word)) {
        wordCategory = category;
        break;
      }
    }
    
    // Si on a trouvé une catégorie, choisir un autre mot de cette catégorie
    if (wordCategory) {
      const categoryWords = extendedCategories[wordCategory].filter(w => w !== word);
      if (categoryWords.length > 0) {
        const index = seed % categoryWords.length;
        return categoryWords[index];
      }
    }
    
    // Si aucun mot similaire n'a été trouvé dans notre dictionnaire principal ou général,
    // utiliser un mot de secours à partir de notre dictionnaire de secours
    const backupSimilarWords = {
      // Objets du quotidien
      "maison": "château",
      "voiture": "moto",
      "chat": "chien",
      "chien": "chat",
      "livre": "magazine",
      "table": "chaise",
      "arbre": "fleur",
      "fleur": "arbre",
      "soleil": "lune",
      "montagne": "plage",
      "téléphone": "ordinateur",
      "eau": "café",
      "pain": "gâteau",
      "pomme": "poire",
      
      // Transports
      "bus": "tram",
      "train": "métro",
      "avion": "hélicoptère",
      "bateau": "navire",
      "vélo": "trottinette",
      "taxi": "ambulance",
      
      // Habitation
      "appartement": "studio",
      "villa": "chalet",
      "immeuble": "tour",
      "cabane": "hutte",
      
      // Mobilier
      "canapé": "fauteuil",
      "armoire": "commode",
      "bureau": "pupitre",
      "étagère": "bibliothèque",
      
      // Vêtements
      "chemise": "veste",
      "pantalon": "short",
      "robe": "jupe",
      "manteau": "blouson",
      
      // Nourriture
      "fromage": "yaourt",
      "viande": "poisson",
      "légume": "salade",
      "fruit": "dessert",
      
      // Boissons
      "vin": "bière",
      "jus": "sirop",
      "thé": "tisane",
      "soda": "limonade",
      
      // Électronique
      "ordinateur": "tablette",
      "télévision": "écran",
      "console": "manette",
      "radio": "chaîne",
      
      // Lieux
      "école": "collège",
      "hôpital": "clinique",
      "cinéma": "théâtre",
      "musée": "galerie",
      
      // Métiers
      "médecin": "infirmier",
      "professeur": "instituteur",
      "boulanger": "pâtissier",
      "policier": "gendarme",
      
      // Loisirs
      "football": "rugby",
      "tennis": "badminton",
      "musique": "danse",
      "film": "série",
      
      // Nature
      "mer": "océan",
      "rivière": "fleuve",
      "forêt": "jungle",
      "nuage": "brouillard"
    };
    return backupSimilarWords[word] || word + "s";
  } catch (error) {
    console.error('Erreur lors de la récupération du mot similaire:', error);
    
    // En cas d'erreur, utiliser un mot de secours français
    const backupWords = [
      "voiture", "vélo", "chat", "chien", "maison", "appartement", 
      "livre", "magazine", "téléphone", "ordinateur", "arbre", "fleur",
      "table", "chaise", "pain", "fromage", "école", "hôpital",
      "soleil", "lune", "montagne", "plage", "rivière", "forêt",
      "pomme", "banane", "orange", "fraise", "carotte", "tomate",
      "pantalon", "chemise", "robe", "manteau", "chapeau", "chaussure",
      "médecin", "professeur", "boulanger", "policier", "pompier", "facteur"
    ];
    const index = seed % backupWords.length;
    return backupWords[index];
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
        
        // Fonction pour calculer la similarité entre deux chaînes (distance de Levenshtein normalisée)
        function calculateSimilarity(str1, str2) {
          // Normaliser les chaînes (minuscules, sans accents)
          str1 = str1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          str2 = str2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          
          // Si l'un des mots est inclus dans l'autre, ils sont trop similaires
          if (str1.includes(str2) || str2.includes(str1)) {
            return 0.9; // Très similaire
          }
          
          // Calculer la distance de Levenshtein
          const track = Array(str2.length + 1).fill(null).map(() =>
            Array(str1.length + 1).fill(null));
          for (let i = 0; i <= str1.length; i += 1) {
            track[0][i] = i;
          }
          for (let j = 0; j <= str2.length; j += 1) {
            track[j][0] = j;
          }
          for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
              const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
              track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
              );
            }
          }
          const distance = track[str2.length][str1.length];
          const maxLength = Math.max(str1.length, str2.length);
          return maxLength > 0 ? 1 - distance / maxLength : 0;
        }
        
        // Vérifier que les mots sont suffisamment différents
        const similarity = calculateSimilarity(mainWord, similarWord);
        if (similarity > 0.7 || mainWord === similarWord || similarWord.includes(mainWord) || mainWord.includes(similarWord)) {
          console.log(`Attention: Les mots générés sont trop similaires (similarité: ${similarity}). Génération d'un mot alternatif.`);
          // Utiliser une seed différente pour générer un mot similaire alternatif
          const altSeed = (secondSeed + 50) % 100;
          const altSimilarWord = await getSimilarWord(mainWord, altSeed);
          
          // Vérifier à nouveau
          const altSimilarity = calculateSimilarity(mainWord, altSimilarWord);
          if (altSimilarity > 0.7 || mainWord === altSimilarWord || altSimilarWord.includes(mainWord) || mainWord.includes(altSimilarWord)) {
            console.log(`Échec de génération d'un mot suffisamment différent. Utilisation d'un mot de secours.`);
            // Utiliser un mot de secours prédéfini avec des alternatives distinctes
            const backupSimilarWords = {
              "maison": "château",
              "voiture": "moto",
              "chat": "chien",
              "chien": "chat",
              "livre": "magazine",
              "table": "chaise",
              "arbre": "fleur",
              "fleur": "arbre",
              "soleil": "lune",
              "montagne": "plage",
              "téléphone": "ordinateur",
              "eau": "café",
              "pain": "gâteau",
              "pomme": "poire",
              "banane": "fraise",
              "bus": "train",
              "avion": "bateau",
              "école": "université",
              "stylo": "crayon"
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
const PORT = process.env.PORT || 3002; // Changé de 3000 à 3002 pour éviter les conflits
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});