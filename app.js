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
    
    // Générer un ID de joueur unique
    const generatePlayerId = () => {
        return 'player-' + Math.random().toString(36).substring(2, 9);
    };
    
    // Initialiser l'ID du joueur
    playerIdInput.value = generatePlayerId();
    
    // Fonction pour mettre à jour le résultat
    const updateResult = (message, isError = false) => {
        const className = isError ? 'error' : 'status';
        resultDiv.innerHTML = `<p class="${className}">${message}</p>`;
        
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
        
        playersList.innerHTML = '';
        
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            
            // Mettre en évidence le joueur actuel
            if (player === currentPlayerId && currentPlayerId) {
                li.classList.add('current-player');
                li.textContent += ' (vous)';
            }
            
            playersList.appendChild(li);
        });
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
            console.log('Vérification de l\'état de la session:', `${serverUrl}/players?sid=${sessionId}`);
            const response = await fetch(`${serverUrl}/players?sid=${sessionId}`, {
                mode: 'cors'
            });
            console.log('Réponse du serveur (checkSessionStatus):', response.status, response.statusText);
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
        
        try {
            updateResult('Connexion en cours...');
            console.log('Tentative de connexion à:', `${serverUrl}/join`);
            
            // Vérifier si le serveur est accessible
            try {
                const pingResponse = await fetch(`${serverUrl}`, { mode: 'cors' });
                console.log('Ping du serveur:', pingResponse.status, pingResponse.statusText);
            } catch (pingError) {
                console.error('Erreur lors du ping du serveur:', pingError);
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
            
            console.log('Réponse du serveur:', response.status, response.statusText);
            const data = await response.json();
            
            if (response.ok) {
                hasJoined = true;
                currentPlayerId = playerId;
                updateResult(`Connexion réussie! ${data.playersCount}/3 joueurs dans la session`);
                
                // Afficher l'ID du joueur
                playerIdGroup.classList.remove('hidden');
                
                // Mettre à jour la liste des joueurs
                if (data.playersList) {
                    updatePlayersList(data.playersList);
                    console.log('Liste des joueurs après connexion:', data.playersList);
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
                    console.log('Démarrage du polling après connexion');
                }
            } else {
                updateResult(`Erreur: ${data.error}`, true);
            }
        } catch (error) {
            updateResult(`Erreur de connexion: ${error.message}`, true);
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
            getWordBtn.textContent = 'Chargement...';
            
            console.log('Tentative de récupération du mot à:', `${serverUrl}/word?sid=${sessionId}&playerId=${playerId}`);
            const response = await fetch(`${serverUrl}/word?sid=${sessionId}&playerId=${playerId}`, {
                mode: 'cors'
            });
            console.log('Réponse du serveur (getWord):', response.status, response.statusText);
            const data = await response.json();
            
            if (response.ok && data.word) {
                // Afficher le mot
                wordDisplay.textContent = data.word;
                wordDisplay.style.display = 'block';
                
                // Masquer le bouton de récupération du mot
                getWordBtn.style.display = 'none';
                
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
                getWordBtn.textContent = 'Récupérer mon mot';
            }
        } catch (error) {
            updateResult(`Erreur lors de la récupération du mot: ${error.message}`, true);
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
            console.log('Vérification du statut du serveur:', serverUrl);
            const response = await fetch(serverUrl, {
                mode: 'cors'
            });
            console.log('Réponse du serveur (checkServerStatus):', response.status, response.statusText);
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