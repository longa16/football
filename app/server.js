// Importation des modules nécessaires pour créer un serveur et gérer les connexions en temps réel
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Création d'une application Express pour servir les fichiers côté client
const app = express();

// Création d'un serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Initialisation de Socket.IO pour ajouter des fonctionnalités de communication en temps réel au serveur
const io = socketIo(server);

// Utilisation d'Express pour servir les fichiers statiques (HTML, CSS, JS) situés dans le dossier "public"
app.use(express.static(__dirname + '/public'));

// Variable pour stocker les joueurs connectés, chaque joueur sera identifié par un ID unique
let players = {};

// Gestion des événements lorsqu'un utilisateur se connecte au serveur
io.on('connection', (socket) => {
 console.log('Nouvel utilisateur connecté :', socket.id);

 // Lorsqu'un nouveau joueur se connecte, on lui attribue un cube dans l'espace 3D.
 // Les coordonnées X et Z sont générées aléatoirement pour placer chaque joueur à un endroit différent.
 // Chaque joueur a aussi une couleur aléatoire.
 players[socket.id] = {
 id: socket.id, // ID unique pour identifier le joueur
 x: Math.random() * 10 - 5, // Position X du joueur (aléatoire)
 y: 0, // Position Y (0 car les joueurs sont sur le sol)
 z: Math.random() * 10 - 5, // Position Z du joueur (aléatoire)
 color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Couleur aléatoire
 };

 // Envoyer la liste de tous les joueurs actuels au nouveau joueur
 socket.emit('init', players);

 // Informer tous les autres joueurs qu'un nouveau joueur vient de se connecter
 socket.broadcast.emit('newPlayer', players[socket.id]);

 // Lorsqu'un joueur se déplace, il envoie sa nouvelle position au serveur
 socket.on('move', (data) => {
 // Mettre à jour la position du joueur dans la liste des joueurs
 players[socket.id].x = data.x;
 players[socket.id].z = data.z;

 // Envoyer les nouvelles coordonnées du joueur à tous les autres joueurs connectés
 socket.broadcast.emit('playerMoved', players[socket.id]);
 });

 // Gestion de la déconnexion d'un joueur
 socket.on('disconnect', () => {
 console.log('Utilisateur déconnecté :', socket.id);

 // Retirer le joueur de la liste des joueurs connectés
 delete players[socket.id];

 // Informer tous les autres joueurs qu'un joueur s'est déconnecté
 io.emit('playerDisconnected', socket.id);
 });
});

// Le serveur écoute les connexions sur le port 3000
server.listen(3000, () => {
 console.log('Serveur démarré sur le port 3000');
});