# Who's the Fake - Jeu d'imposteur

Ce projet est un jeu à 3 joueurs où l'un est l'imposteur. Deux joueurs reçoivent le même mot, tandis que l'imposteur reçoit un mot similaire. Les joueurs doivent discuter et deviner qui est l'imposteur.

Le projet est divisé en deux parties :
- **Backend** (Node.js Express) : Gère la logique du jeu, les sessions et l'attribution des mots
- **Frontend** (HTML/CSS/JS) : Interface utilisateur pour jouer au jeu

## Fonctionnalités

- Route `POST /join` pour rejoindre une session
- Route `GET /word` pour récupérer le mot attribué à un joueur
- Gestion de plusieurs sessions simultanées
- Attribution aléatoire des mots aux joueurs

## Guide de déploiement

Ce projet est conçu pour être déployé de la manière suivante :
- **Backend (index.js et package.json)** : Déployé sur Render
- **Frontend (index.html et app.js)** : Déployé sur GitHub Pages

### 1. Déploiement du backend sur Render

1. Connectez-vous à [Render.com](https://render.com/)
2. Cliquez sur "New" puis sélectionnez "Web Service"
3. Connectez votre compte GitHub ou importez un dépôt existant
4. Sélectionnez le dépôt contenant votre projet
5. Configurez le service avec les paramètres suivants :
   - **Name** : whos-the-fake (ou un autre nom de votre choix)
   - **Environment** : Node
   - **Build Command** : npm install
   - **Start Command** : npm start
   - **Plan** : Free
6. Cliquez sur "Create Web Service"
7. Render va automatiquement déployer votre application
8. Une fois le déploiement terminé, Render vous fournira une URL (généralement sous la forme `https://whos-the-fake.onrender.com`)
9. **Notez cette URL**, vous en aurez besoin pour configurer le frontend

### 2. Déploiement du frontend sur GitHub Pages

1. Créez un compte sur [GitHub](https://github.com/) si vous n'en avez pas déjà un
2. Créez un nouveau dépôt public sur GitHub (ex: "whos-the-fake")
3. Clonez le dépôt sur votre ordinateur ou utilisez l'interface web de GitHub pour ajouter des fichiers
4. Pour le déploiement du frontend uniquement, ajoutez les fichiers suivants dans le dépôt :
   - `index.html`
   - `app.js`
   - `.gitignore` (pour exclure les fichiers inutiles)
5. **Important** : Assurez-vous que la constante `DEFAULT_SERVER_URL` dans `app.js` pointe vers l'URL de votre service Render obtenue à l'étape 1 (par exemple `https://whos-the-fake.onrender.com`)
6. Committez et poussez les changements vers GitHub
7. Allez dans les paramètres de votre dépôt GitHub (onglet "Settings")
8. Dans la section "Pages" (dans le menu latéral gauche), sélectionnez la branche principale (main ou master) comme source
9. Sélectionnez le dossier racine (/(root)) comme source
10. Cliquez sur "Save"
11. Attendez quelques minutes que GitHub déploie votre site
12. Votre site sera disponible à l'adresse `https://votre-username.github.io/nom-du-depot`

**Note** : Si vous préférez déployer l'ensemble du projet (backend et frontend) sur le même dépôt GitHub, vous pouvez également le faire. Dans ce cas, assurez-vous d'inclure tous les fichiers du projet dans votre dépôt. Render pourra déployer le backend à partir de ce même dépôt.

## Utilisation

### Comment jouer

1. Ouvrez l'URL de votre site GitHub Pages dans votre navigateur
2. Générez un code de session en cliquant sur "Générer un code" ou entrez manuellement un code à 5 chiffres
3. Cliquez sur "Rejoindre" pour créer/rejoindre la session
4. Partagez ce code avec deux autres joueurs (ils devront accéder au même site et entrer le même code)
5. Une fois que 3 joueurs ont rejoint la session, chacun peut cliquer sur "Récupérer mon mot"
6. Chaque joueur verra son mot : deux joueurs auront le même mot, un joueur (l'imposteur) aura un mot similaire
7. Discutez ensemble pour deviner qui a le mot différent (l'imposteur)

### Fonctionnalités de l'interface

- **Double-clic sur le titre** : Affiche/masque les éléments techniques (URL du serveur, ID du joueur, console)
- **Bouton "Générer un code"** : Crée un code de session aléatoire à 5 chiffres
- **Bouton "Rejoindre"** : Rejoint la session avec le code indiqué
- **Bouton "Récupérer mon mot"** : Disponible une fois que 3 joueurs ont rejoint, permet d'obtenir son mot
- **Liste des joueurs** : Affiche les joueurs connectés à la session

## Notes et maintenance

- Le serveur utilise uniquement la mémoire pour stocker les sessions, donc les données seront perdues si le serveur redémarre
- Le backend utilise deux APIs externes pour générer les mots :
  - [DicoLink](https://api.dicolink.com) pour obtenir un mot français aléatoire
  - [Datamuse](https://api.datamuse.com) pour obtenir un mot similaire
- Si les APIs sont indisponibles, le système utilise des mots de secours prédéfinis
- Le code SID à 5 chiffres est utilisé comme seed pour générer les mots de manière déterministe :
  - Les 3 premiers chiffres servent de seed pour le mot principal
  - Les 2 derniers chiffres servent de seed pour le mot similaire

## Dépannage

- **Le serveur ne répond pas** : Vérifiez que votre service Render est bien en cours d'exécution
- **Impossible de rejoindre une session** : Assurez-vous que l'URL du serveur dans `app.js` est correcte
- **Les mots ne s'affichent pas** : Vérifiez la console du navigateur pour les erreurs
- **Problèmes de connexion** : Si Render est en maintenance, votre backend peut être temporairement indisponible
- **Service en veille** : Sur le plan gratuit de Render, votre service peut se mettre en veille après une période d'inactivité. La première connexion peut prendre un peu plus de temps pendant que le service redémarre

## Personnalisation

- Vous pouvez modifier les styles CSS dans le fichier `index.html` pour personnaliser l'apparence
- Pour ajouter des mots de secours, modifiez les tableaux `backupWords` et `backupSimilarWords` dans `index.js`