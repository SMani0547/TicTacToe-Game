const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let players = {};
let messageCounter = 0; // Counter to track messages and assign unique IDs
let gameEnded = false;
let board = ['', '', '', '', '', '', '', '', '']; // Initialize an empty tic-tac-toe board

wss.on('connection', function connection(ws) {
    if (Object.keys(players).length < 2 && !gameEnded) {
        // Code to handle new player connections and game state
        const playerId = Object.keys(players).length + 1;
        console.log(`Player ${playerId} connected`);
        players[playerId] = { ws: ws, symbol: playerId === 1 ? 'X' : 'O' };

        ws.send(JSON.stringify({ type: 'playerId', playerId: playerId, symbol: players[playerId].symbol }));

        ws.on('message', function incoming(message) {
            const data = JSON.parse(message);
            if (data.type === 'move' && players[data.playerId].symbol === data.symbol) {
                // Log the move in the server terminal
                console.log(`Player ${data.playerId} moved to index ${data.index}`);
                board[data.index] = data.symbol; // Update the board with the move
                broadcast({ type: 'move', index: data.index, symbol: data.symbol });

                // Check for winning condition after each move
                const hasWinner = checkForWinner();
                if (hasWinner) {
                    console.log(`Player ${data.playerId} won!`);
                    broadcast({ type: 'win', winner: data.playerId });
                    resetGame(); // Reset the game state
                }
            } else if (data.type === 'message') {
                // Log the message in the server terminal
                console.log(`Player ${data.sender} sent message: ${data.message}`);
                // Handle incoming messages and broadcast to other player
                const senderId = data.sender;
                const messageContent = data.message;
                broadcast({ type: 'message', id: messageCounter++, sender: senderId, message: messageContent });
            }
        });

        ws.on('close', function close() {
            console.log(`Player ${playerId} disconnected`);
            delete players[playerId];
            gameEnded = true; // End the game if a player disconnects
            resetGame(); // Reset the game state if a player disconnects
        });

        // Check if there's only one player connected and display a waiting message
        if (Object.keys(players).length === 1) {
            console.log('Waiting for another player...');
        }
    } else {
        ws.send(JSON.stringify({ type: 'reject', message: 'Game lobby is full or the game has ended. Try again later.' }));
        ws.close();
    }
});

function broadcast(data) {
    // Code to broadcast data to all connected players
    Object.values(players).forEach(player => {
        if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(data));
        }
    });
}

console.log('WebSocket server started on port 3000');

// Function to check for a winning condition in tic-tac-toe
function checkForWinner() {
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return true; // Found a winning combination
        }
    }

    return false; // No winning combination found
}

// Function to reset the game state
function resetGame() {
    gameEnded = false;
    board = ['', '', '', '', '', '', '', '', '']; // Reset the board
}
