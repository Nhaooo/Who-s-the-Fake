document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const serverUrlInput = document.getElementById('server-url');
    const sessionIdInput = document.getElementById('session-id');
    const playerIdInput = document.getElementById('player-id');
    const joinBtn = document.getElementById('join-btn');
    const generateSessionBtn = document.getElementById('generate-session-btn');
    const getWordBtn = document.getElementById('get-word-btn');
    const resultDiv = document.getElementById('result');
    const wordDisplay = document.getElementById('word-display');
    const playersList = document.getElementById('players');
    const serverUrlGroup = document.getElementById('server-url-group');
    const playerIdGroup = document.getElementById('player-id-group');
    
    // Catégories d'animaux pour l'affichage coordonné
    const animalCategories = {
        'félins': ['Lion', 'Tigre', 'Panthère', 'Guépard', 'Lynx', 'Jaguar', 'Puma', 'Léopard'],
        'canidés': ['Loup', 'Renard', 'Chacal', 'Coyote', 'Dingo', 'Fennec', 'Lycaon', 'Chien'],
        'oiseaux': ['Aigle', 'Faucon', 'Hibou', 'Perroquet', 'Colibri', 'Flamant', 'Pingouin', 'Autruche'],
        'marins': ['Dauphin', 'Baleine', 'Requin', 'Méduse', 'Pieuvre', 'Crabe', 'Homard', 'Phoque'],
        'reptiles': ['Tortue', 'Lézard', 'Caméléon', 'Crocodile', 'Alligator', 'Iguane', 'Cobra', 'Python'],
        'primates': ['Gorille', 'Chimpanzé', 'Orang-outan', 'Babouin', 'Macaque', 'Gibbon', 'Mandrill', 'Capucin'],
        'rongeurs': ['Écureuil', 'Castor', 'Raton', 'Marmotte', 'Hamster', 'Chinchilla', 'Gerbille', 'Souris'],
        'herbivores': ['Éléphant', 'Girafe', 'Zèbre', 'Rhinocéros', 'Hippopotame', 'Bison', 'Antilope', 'Gazelle']
    };
    
    // Dictionnaire pour stocker les noms d'animaux attribués aux joueurs
    const playerAnimals = {};
    
    // Dictionnaire pour stocker la catégorie d'animaux par session
    const sessionCategories = {};
    
    // URL du serveur par défaut (URL de Render)
    const DEFAULT_SERVER_URL = 'https://who-s-the-fake.onrender.com';
    
    // Définir l'URL du serveur par défaut
    if (!serverUrlInput.value) {
        serverUrlInput.value = DEFAULT_SERVER_URL;
    }
    
    // Variables pour le polling
    let pollingInterval = null;
    let hasJoined = false;
    let currentPlayerId = '';
    
    // Générer un ID de joueur unique avec un nom d'animal
    const generatePlayerId = () => {
        // Liste d'animaux en français
        const animaux = [
            // Mammifères
            "Tigre", "Lion", "Éléphant", "Girafe", "Zèbre", "Panda", "Koala", "Kangourou", "Loup", "Renard", 
            "Ours", "Écureuil", "Hérisson", "Loutre", "Blaireau", "Raton", "Belette", "Furet", "Castor", "Bison",
            // Oiseaux
            "Aigle", "Faucon", "Hibou", "Perroquet", "Colibri", "Flamant", "Pingouin", "Autruche", "Paon", "Cygne",
            // Reptiles et amphibiens
            "Tortue", "Lézard", "Caméléon", "Grenouille", "Salamandre", "Crocodile", "Alligator", "Iguane", "Cobra", "Python",
            // Poissons et créatures marines
            "Dauphin", "Baleine", "Requin", "Méduse", "Pieuvre", "Crabe", "Homard", "Crevette", "Étoile", "Corail",
            // Insectes et autres
            "Papillon", "Abeille", "Coccinelle", "Libellule", "Scarabée", "Mante", "Fourmi", "Araignée", "Scorpion", "Escargot"
        ];
        
        // Choisir un animal aléatoire
        const animal = animaux[Math.floor(Math.random() * animaux.length)];
        
        // Ajouter un numéro aléatoire pour garantir l'unicité
        return animal + '-' + Math.floor(Math.random() * 1000);
    };
    
    // Initialiser l'ID du joueur
    playerIdInput.value = generatePlayerId();
    
    // Fonction pour mettre à jour le résultat
    const updateResult = (message, isError = false) => {
        const className = isError ? 'error' : 'status';
        const loadingClass = !isError ? 'loading-dots' : '';
        resultDiv.innerHTML = `<p class="${className} ${loadingClass}">${message}</p>`;
        
        // Afficher le résultat uniquement s'il y a un message
        if (message) {
            resultDiv.style.display = 'block';
        } else {
            resultDiv.style.display = 'none';
        }
    };
    
    // Fonction pour ajouter un message au résultat
    const appendResult = (message, isError = false) => {
        const className = isError ? 'error' : 'status';
        resultDiv.innerHTML += `<p class="${className}">${message}</p>`;
        resultDiv.style.display = 'block';
    };
    
    // Fonction pour mettre à jour la liste des joueurs
    const updatePlayersList = (players) => {
        if (!players || !Array.isArray(players)) {
            console.error('Liste de joueurs invalide:', players);
            return;
        }
        
        console.log('Mise à jour de la liste des joueurs:', players);
        console.log('Joueur actuel:', currentPlayerId);
        
        // Stocker les joueurs actuels pour détecter les nouveaux
        const currentPlayers = Array.from(playersList.querySelectorAll('li')).map(li => li.dataset.playerId);
        
        playersList.innerHTML = '';
        
        // Obtenir l'ID de session actuel
        const sessionId = sessionIdInput.value.trim();
        
        // Si c'est une nouvelle session, choisir une catégorie d'animaux
        if (!sessionCategories[sessionId]) {
            const categoryNames = Object.keys(animalCategories);
            const randomCategoryIndex = Math.floor(Math.random() * categoryNames.length);
            sessionCategories[sessionId] = categoryNames[randomCategoryIndex];
            console.log(`Nouvelle session ${sessionId} avec catégorie: ${sessionCategories[sessionId]}`);
        }
        
        // Obtenir la catégorie d'animaux pour cette session
        const categoryName = sessionCategories[sessionId];
        const categoryAnimals = animalCategories[categoryName];
        
        players.forEach(player => {
            // Attribuer un nom d'animal si ce n'est pas déjà fait
            if (!playerAnimals[player]) {
                // Trouver un animal non utilisé dans cette session
                const usedAnimals = players
                    .filter(p => p !== player && playerAnimals[p])
                    .map(p => playerAnimals[p]);
                
                const availableAnimals = categoryAnimals.filter(animal => !usedAnimals.includes(animal));
                
                // Si tous les animaux sont utilisés, en choisir un au hasard
                if (availableAnimals.length === 0) {
                    const randomIndex = Math.floor(Math.random() * categoryAnimals.length);
                    playerAnimals[player] = categoryAnimals[randomIndex];
                } else {
                    const randomIndex = Math.floor(Math.random() * availableAnimals.length);
                    playerAnimals[player] = availableAnimals[randomIndex];
                }
                
                console.log(`Joueur ${player} a reçu l'animal: ${playerAnimals[player]} (catégorie: ${categoryName})`);
            }
            
            const li = document.createElement('li');
            li.dataset.playerId = player; // Stocker l'ID complet comme attribut de données
            
            // Vérifier si c'est un nouveau joueur
            const isNewPlayer = !currentPlayers.includes(player) && currentPlayers.length > 0;
            if (isNewPlayer) {
                li.classList.add('new-player');
                // Supprimer la classe après l'animation
                setTimeout(() => {
                    li.classList.remove('new-player');
                }, 2000);
            }
            
            const animalIcon = document.createElement('span');
            animalIcon.className = 'animal-icon';
            animalIcon.innerHTML = '<i class="fas fa-paw"></i>';
            
            const playerName = document.createElement('span');
            playerName.className = 'player-name';
            playerName.textContent = playerAnimals[player];
            
            // Ajouter l'ID réel en petit et discret
            const playerId = document.createElement('span');
            playerId.className = 'player-id';
            playerId.textContent = player.substring(0, 8); // Tronquer l'ID pour qu'il soit plus court
            
            li.appendChild(animalIcon);
            li.appendChild(playerName);
            li.appendChild(playerId);
            
            // Mettre en évidence le joueur actuel
            if (player === currentPlayerId && currentPlayerId) {
                li.classList.add('current-player');
                playerName.textContent += ' (vous)';
            }
            
            playersList.appendChild(li);
        });
        
        // Afficher le nombre de joueurs connectés
        const playersCount = document.createElement('div');
        playersCount.className = 'players-count';
        playersCount.innerHTML = `<i class="fas fa-users"></i> ${players.length} joueur${players.length > 1 ? 's' : ''} connecté${players.length > 1 ? 's' : ''}`;
        
        // Ajouter le compteur avant la liste
        const playersListHeader = document.querySelector('.players-list-header');
        if (playersListHeader) {
            playersListHeader.innerHTML = '';
            playersListHeader.appendChild(playersCount);
        }
    };
    
    // Fonction pour vérifier l'état de la session
    const checkSessionStatus = async () => {
        const serverUrl = serverUrlInput.value.trim();
        const sessionId = sessionIdInput.value.trim();
        const playerId = playerIdInput.value.trim();
        
        if (!serverUrl || !sessionId) {
            return;
        }
        
        try {
            // Utiliser l'endpoint /players pour obtenir la liste des joueurs
            // Vérification de l'état de la session
            const response = await fetch(`${serverUrl}/players?sid=${sessionId}`, {
                mode: 'cors'
            });
            const data = await response.json();
            
            if (response.ok) {
                // Mettre à jour la liste des joueurs
                if (data.players && Array.isArray(data.players)) {
                    updatePlayersList(data.players);
                }
                
                // Vérifier si la session est prête
                if (data.isReady) {
                    getWordBtn.disabled = false;
                    
                    // Récupérer automatiquement le mot si on a déjà rejoint
                    if (hasJoined && getWordBtn.disabled) {
                        getWord();
                    }
                }
            }
        } catch (error) {
            // Erreur silencieuse pour ne pas perturber l'utilisateur
        }
    };
    
    // Fonction pour rejoindre une session
    const joinSession = async () => {
        const serverUrl = serverUrlInput.value.trim();
        const sessionId = sessionIdInput.value.trim();
        const playerId = playerIdInput.value.trim();
        
        if (!serverUrl || !sessionId || !playerId) {
            updateResult('Veuillez remplir tous les champs', true);
            return;
        }
        
        // Vérifier que le SID est composé de 5 chiffres
        if (!/^\d{5}$/.test(sessionId)) {
            updateResult('Le code de session (SID) doit être composé de 5 chiffres', true);
            return;
        }
        
        // Ajouter la classe loading au bouton
        joinBtn.classList.add('loading');
        
        try {
            updateResult('Connexion en cours...');
            document.querySelector('.status').classList.add('loading-dots');
            // Vérifier si le serveur est accessible
            try {
                const pingResponse = await fetch(`${serverUrl}`, { mode: 'cors' });
            } catch (pingError) {
                updateResult(`Erreur de connexion au serveur: ${pingError.message}. Vérifiez l'URL du serveur.`, true);
                return;
            }
            
            const response = await fetch(`${serverUrl}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sid: sessionId, playerId }),
                mode: 'cors'
            });
            
            // Traitement de la réponse
            const data = await response.json();
            
            if (response.ok) {
                hasJoined = true;
                currentPlayerId = playerId;
                updateResult(`Connexion réussie! ${data.playersCount}/3 joueurs dans la session`);
                
                // Masquer l'ID du joueur après connexion
                playerIdGroup.classList.add('hidden');
                
                // Masquer le champ de session après connexion
                document.querySelector('.form-group').classList.add('hidden');
                
                // Mettre à jour la liste des joueurs
                if (data.playersList) {
                    updatePlayersList(data.playersList);
                }
                
                if (data.isReady) {
                    appendResult('<strong>La session est prête! Vous pouvez récupérer votre mot.</strong>', false);
                    getWordBtn.disabled = false;
                } else {
                    appendResult(`En attente d'autres joueurs (${data.playersCount}/3)`);
                }
                
                // Assurer que le polling est actif pour tous les joueurs
                if (!pollingInterval) {
                    pollingInterval = setInterval(checkSessionStatus, 2000);
                }
            } else {
                updateResult(`Erreur: ${data.error}`, true);
            }
        } catch (error) {
            updateResult(`Erreur de connexion: ${error.message}`, true);
        } finally {
            // Retirer la classe loading du bouton
            joinBtn.classList.remove('loading');
        }
    };
    
    // Fonction pour récupérer le mot
    const getWord = async () => {
        const serverUrl = serverUrlInput.value.trim();
        const sessionId = sessionIdInput.value.trim();
        const playerId = playerIdInput.value.trim();
        
        try {
            // Masquer les boutons et afficher un message de chargement
            getWordBtn.disabled = true;
            getWordBtn.classList.add('loading');
            
            // Récupération du mot
            const response = await fetch(`${serverUrl}/word?sid=${sessionId}&playerId=${playerId}`, {
                mode: 'cors'
            });
            const data = await response.json();
            
            if (response.ok && data.word) {
                // Afficher le mot
                wordDisplay.textContent = data.word;
                wordDisplay.style.display = 'block';
                
                // Masquer le bouton de récupération du mot
                getWordBtn.style.display = 'none';
                
                // Lancer les confettis pour célébrer
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#4361ee', '#4cc9f0', '#f72585']
                    });
                }
                
                // Ajouter une explication sur le jeu dans le wordDisplay
                const gameRules = document.createElement('div');
                gameRules.innerHTML = `
                    <p style="font-size: 14px; margin-top: 10px; text-align: left;">
                        <strong>Comment jouer:</strong><br>
                        1. Discutez tous ensemble du mot que vous avez reçu<br>
                        2. Deux joueurs ont le même mot, un joueur a un mot similaire<br>
                        3. Essayez de deviner qui est l'imposteur
                    </p>
                `;
                wordDisplay.appendChild(gameRules);
            } else {
                updateResult(`Erreur: ${data.error}`, true);
                getWordBtn.disabled = false;
                getWordBtn.classList.remove('loading');
            }
        } catch (error) {
            updateResult(`Erreur lors de la récupération du mot: ${error.message}`, true);
            getWordBtn.disabled = false;
            getWordBtn.classList.remove('loading');
        }
    };
    
    // Fonction pour générer un code de session aléatoire à 5 chiffres
    const generateRandomSession = () => {
        // Générer un nombre aléatoire à 5 chiffres
        const randomSession = Math.floor(10000 + Math.random() * 90000);
        sessionIdInput.value = randomSession.toString();
        // Mettre à jour l'interface
        updateResult('');
        resultDiv.style.display = 'none';
        
        // Vérifier l'état de la session
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        
        setTimeout(() => {
            checkSessionStatus();
            pollingInterval = setInterval(checkSessionStatus, 2000);
        }, 500);
        
        return randomSession;
    };
    
    // Événements
    joinBtn.addEventListener('click', joinSession);
    getWordBtn.addEventListener('click', getWord);
    generateSessionBtn.addEventListener('click', generateRandomSession);
    
    // Permettre de générer un nouvel ID de joueur
    playerIdInput.addEventListener('dblclick', () => {
        playerIdInput.value = generatePlayerId();
        playerIdInput.readOnly = false;
        
        // Animation subtile pour indiquer le changement
        playerIdInput.classList.add('highlight');
        setTimeout(() => {
            playerIdInput.classList.remove('highlight');
        }, 1000);
    });
    
    // Afficher/masquer les éléments avancés avec un double-clic sur le titre
    document.querySelector('h1').addEventListener('dblclick', () => {
        serverUrlGroup.classList.toggle('hidden');
        playerIdGroup.classList.toggle('hidden');
        resultDiv.classList.toggle('hidden');
    });
    
    // Vérifier si le serveur est en ligne (fonction silencieuse)
    const checkServerStatus = async () => {
        const serverUrl = serverUrlInput.value.trim();
        
        try {
            // Vérification du statut du serveur
            const response = await fetch(serverUrl, {
                mode: 'cors'
            });
            return response.ok;
        } catch (error) {
            console.error('Erreur lors de la vérification du serveur:', error);
            return false;
        }
    };
    
    // Démarrer le polling immédiatement après le chargement de la page ou lorsque l'ID de session change
    // pour que même les joueurs qui n'ont pas encore rejoint puissent voir l'état de la session
    sessionIdInput.addEventListener('input', () => {
        const sessionId = sessionIdInput.value.trim();
        const serverUrl = serverUrlInput.value.trim();
        
        if (sessionId && serverUrl) {
            console.log('ID de session modifié:', sessionId);
            
            // Arrêter le polling existant si nécessaire
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
            
            // Vérifier l'état de la session une fois immédiatement
            setTimeout(() => {
                if (sessionId === sessionIdInput.value.trim()) {
                    checkSessionStatus();
                    
                    // Démarrer le polling pour la nouvelle session
                    pollingInterval = setInterval(checkSessionStatus, 2000);
                    console.log('Démarrage du polling pour la session:', sessionId);
                }
            }, 500);
        }
    });
    
    // Démarrer le polling lorsque l'URL du serveur change
    serverUrlInput.addEventListener('input', () => {
        const sessionId = sessionIdInput.value.trim();
        const serverUrl = serverUrlInput.value.trim();
        
        if (sessionId && serverUrl) {
            console.log('URL du serveur modifiée:', serverUrl);
            
            // Arrêter le polling existant si nécessaire
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
            
            // Vérifier l'état de la session une fois immédiatement
            setTimeout(() => {
                if (serverUrl === serverUrlInput.value.trim() && sessionId === sessionIdInput.value.trim()) {
                    checkSessionStatus();
                    
                    // Démarrer le polling pour la nouvelle URL
                    pollingInterval = setInterval(checkSessionStatus, 2000);
                    console.log('Démarrage du polling avec la nouvelle URL du serveur');
                }
            }, 500);
        }
    });
    
    // Vérifier si un ID de session est déjà présent au chargement
    if (sessionIdInput.value.trim() && serverUrlInput.value.trim()) {
        console.log('ID de session déjà présent au chargement:', sessionIdInput.value.trim());
        setTimeout(checkSessionStatus, 1000);
        
        // Démarrer le polling si ce n'est pas déjà fait
        if (!pollingInterval) {
            pollingInterval = setInterval(checkSessionStatus, 2000);
            console.log('Démarrage du polling initial');
        }
    }
    
    // Nettoyer l'intervalle lorsque l'utilisateur quitte la page
    window.addEventListener('beforeunload', () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
    });
});