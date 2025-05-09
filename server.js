<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();
let roomId = null;
let playerSymbol = null;
let gameOver = false;

// Bij klikken op online starten
function startOnline() {
  document.getElementById("menu-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  socket.emit("joinRoom");
}

socket.on("roomJoined", ({ room, symbol }) => {
  roomId = room;
  playerSymbol = symbol;
  console.log("Joined room", roomId, "as", playerSymbol);
});

socket.on("updateBoard", ({ index, symbol }) => {
  gameBoard[index] = symbol;
  document.getElementById('tic-tac-toe-grid').children[index].textContent = symbol;
});

socket.on("gameOver", (winner) => {
  gameOver = true;
  if (winner) {
    alert(`${winner} wins!`);
  } else {
    alert("It's a draw!");
  }

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "Restart Game";
  restartBtn.className = "start-button";
  restartBtn.onclick = () => {
    socket.emit("restartGame", { room: roomId });
    restartBtn.remove();
  };
  document.getElementById("game-screen").appendChild(restartBtn);
});

socket.on("gameRestarted", () => {
  gameOver = false;
  gameBoard = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';

  const cells = document.querySelectorAll('.grid button');
  cells.forEach(cell => (cell.textContent = ''));
});

function markCell(index) {
  if (gameOver || gameBoard[index] !== '') return;

  if (playerSymbol !== currentPlayer) return;

  socket.emit("makeMove", {
    room: roomId,
    index,
    symbol: playerSymbol,
  });
}
</script>
