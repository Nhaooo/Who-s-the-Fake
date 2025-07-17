const express = require('express');
const path = require('path');

const app = express();

// Servir les fichiers statiques depuis le répertoire courant
app.use(express.static(__dirname));

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Port pour le serveur local
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Serveur local démarré sur http://localhost:${PORT}`);
  console.log(`Ouvrez votre navigateur et accédez à http://localhost:${PORT}`);
  console.log(`Utilisez cette URL dans le champ 'URL du serveur' pour vous connecter au serveur Render.`);
});