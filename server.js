const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", () => {
    let room = Object.keys(rooms).find((r) => rooms[r].players.length < 2);
    if (!room) {
      room = socket.id;
      rooms[room] = { players: [], board: Array(9).fill(""), currentTurn: "X" };
    }

    socket.join(room);
    rooms[room].players.push(socket.id);
    const symbol = rooms[room].players.length === 1 ? "X" : "O";

    socket.emit("roomJoined", { room, symbol });
  });

  socket.on("makeMove", ({ room, index, symbol }) => {
    const game = rooms[room];
    if (!game || game.board[index] !== "" || game.currentTurn !== symbol) return;

    game.board[index] = symbol;
    game.currentTurn = symbol === "X" ? "O" : "X";

    io.to(room).emit("updateBoard", { index, symbol });

    const winner = checkWinner(game.board);
    if (winner || !game.board.includes("")) {
      io.to(room).emit("gameOver", winner);
    }
  });

  socket.on("restartGame", ({ room }) => {
    if (!rooms[room]) return;
    rooms[room].board = Array(9).fill("");
    rooms[room].currentTurn = "X";
    io.to(room).emit("gameRestarted");
  });
});

function checkWinner(board) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
