const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

let waitingPlayer = null;

io.on('connection', socket => {
  console.log('Gebruiker verbonden:', socket.id);

  if (waitingPlayer) {
    const room = waitingPlayer.id + "#" + socket.id;
    socket.join(room);
    waitingPlayer.join(room);
    io.to(room).emit('start', { room, players: [waitingPlayer.id, socket.id] });
    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
  }

  socket.on('move', ({ room, index, symbol }) => {
    socket.to(room).emit('move', { index, symbol });
  });

  socket.on('disconnect', () => {
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server draait op poort 3000');
});
