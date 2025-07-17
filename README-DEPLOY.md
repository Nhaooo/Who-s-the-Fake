# Guide de déploiement pour Who's the Fake

Ce guide vous explique comment déployer le jeu "Who's the Fake" en ligne en utilisant GitHub Pages pour le frontend et Render pour le backend.

## Étape 1 : Préparation du dépôt GitHub

1. Créez un compte sur [GitHub](https://github.com/) si vous n'en avez pas déjà un
2. Créez un nouveau dépôt public sur GitHub (ex: "whos-the-fake")
3. Clonez le dépôt sur votre ordinateur ou utilisez l'interface web de GitHub pour ajouter des fichiers

## Étape 2 : Préparation des fichiers

1. Assurez-vous que tous les fichiers du projet sont prêts :
   - `index.html` et `app.js` pour le frontend
   - `index.js` et `package.json` pour le backend
   - `.gitignore` pour exclure les fichiers inutiles
   - `Procfile` et `render.yaml` pour la configuration de Render

2. Vérifiez que la constante `DEFAULT_SERVER_URL` dans `app.js` est configurée avec l'URL que vous prévoyez d'utiliser sur Render (par exemple `https://whos-the-fake.onrender.com`)

## Étape 3 : Déploiement du backend sur Render

1. Créez un compte sur [Render](https://render.com/) si vous n'en avez pas déjà un
2. Connectez votre compte GitHub à Render
3. Dans le tableau de bord Render, cliquez sur "New" puis sélectionnez "Web Service"
4. Sélectionnez le dépôt GitHub contenant votre projet
5. Configurez le service avec les paramètres suivants :
   - **Name** : whos-the-fake (ou un autre nom de votre choix)
   - **Environment** : Node
   - **Build Command** : npm install
   - **Start Command** : npm start
   - **Plan** : Free
6. Cliquez sur "Create Web Service"
7. Attendez que Render déploie votre application (cela peut prendre quelques minutes)
8. Une fois le déploiement terminé, notez l'URL fournie par Render (généralement sous la forme `https://whos-the-fake.onrender.com`)

## Étape 4 : Mise à jour de l'URL du serveur

1. Si l'URL fournie par Render est différente de celle que vous avez configurée dans `app.js`, mettez à jour la constante `DEFAULT_SERVER_URL` dans `app.js` avec la nouvelle URL
2. Committez et poussez les changements vers GitHub

## Étape 5 : Déploiement du frontend sur GitHub Pages

1. Allez dans les paramètres de votre dépôt GitHub (onglet "Settings")
2. Dans la section "Pages" (dans le menu latéral gauche), sous "Source", sélectionnez la branche principale (main ou master)
3. Sélectionnez le dossier racine (/(root)) comme source
4. Cliquez sur "Save"
5. Attendez quelques minutes que GitHub déploie votre site
6. Votre site sera disponible à l'adresse `https://votre-username.github.io/nom-du-depot`

## Étape 6 : Vérification du déploiement

1. Accédez à l'URL de votre site GitHub Pages
2. Vérifiez que vous pouvez générer un code de session
3. Vérifiez que vous pouvez rejoindre une session
4. Testez le jeu avec plusieurs appareils pour vous assurer que tout fonctionne correctement

## Remarques importantes

- Sur le plan gratuit de Render, votre service peut se mettre en veille après une période d'inactivité. La première connexion peut prendre un peu plus de temps pendant que le service redémarre.
- Si vous rencontrez des problèmes de connexion, vérifiez que votre service Render est bien en cours d'exécution.
- Assurez-vous que les paramètres CORS dans votre backend permettent les requêtes depuis votre domaine GitHub Pages.

## Dépannage

- **Le serveur ne répond pas** : Vérifiez l'état de votre service sur le tableau de bord Render
- **Erreurs CORS** : Vérifiez que votre backend accepte les requêtes depuis votre domaine GitHub Pages
- **Les mots ne s'affichent pas** : Vérifiez la console du navigateur pour les erreurs
- **Impossible de rejoindre une session** : Assurez-vous que l'URL du serveur dans `app.js` est correcte