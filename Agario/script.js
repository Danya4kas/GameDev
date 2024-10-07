// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const energyBar = document.getElementById('energyBar');
const startGameButton = document.getElementById('startGameButton');
const scoreboard = document.getElementById('scoreboard');
const playerNicknameInput = document.getElementById('playerNickname');
const startMenu = document.getElementById('startMenu');
// const gameOverMenu = document.getElementById('gameOverMenu'); // Remove this line
// const gameOverMessage = document.getElementById('gameOverMessage'); // Remove this line
// const restartGameButton = document.getElementById('restartGameButton'); // Remove this line
let playerScores = {}; // Declare playerScores here

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Player (cell) object
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: '#ff0000', // Red
  speed: 0.5,
  dx: 0, // Horizontal movement
  dy: 0, // Vertical movement
  energy: 100, // Initial energy
};

// Food objects (small circles)
let food = [];
let lastFoodSpawn = Date.now();
const foodSpawnInterval = 1000; // 1 second

// Enemy objects (small circles)
let enemies = [];
const enemySpeed = 0.2;

// Other player objects (small circles)
let otherPlayers = [];
let lastPlayerSpawn = Date.now();
const playerSpawnInterval = 1000; // 1 second

// Function to create a new enemy
function createEnemy() {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 10,
    color: `hsl(${Math.random() * 360}, 50%, 50%)`, // Random color
    speed: enemySpeed,
    dx: (Math.random() - 0.5) * enemySpeed, // Random horizontal movement
    dy: (Math.random() - 0.5) * enemySpeed, // Random vertical movement
    energy: 100, // Initial energy
  });
}

// Function to create a new other player (with nickname)
function createOtherPlayer() {
  otherPlayers.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 10 + Math.random() * 10, // Random initial radius
    color: `hsl(${Math.random() * 360}, 50%, 50%)`, // Random color
    speed: 0.8, // Increased speed
    dx: (Math.random() - 0.5) * 1.2, // Increased random movement
    dy: (Math.random() - 0.5) * 1.2, // Increased random movement
    energy: 100, // Initial energy
    nickname: generateNickname(), // Generate a random nickname
  });
}

// Function to generate food
function generateFood() {
  food.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 5,
    color: `hsl(${Math.random() * 360}, 50%, 50%)`, // Random color
  });
}

// Function to update player position (mouse control)
function updatePlayer() {
  // Get mouse position relative to canvas
  const mouseX = event.offsetX;
  const mouseY = event.offsetY;

  // Calculate movement direction
  player.dx = (mouseX - player.x) * player.speed;
  player.dy = (mouseY - player.y) * player.speed;

  // Apply movement to player position
  player.x += player.dx;
  player.y += player.dy;

  // Keep player within canvas boundaries
  if (player.x - player.radius < 0) {
    player.x = player.radius;
  }
  if (player.x + player.radius > canvas.width) {
    player.x = canvas.width - player.radius;
  }
  if (player.y - player.radius < 0) {
    player.y = player.radius;
  }
  if (player.y + player.radius > canvas.height) {
    player.y = canvas.height - player.radius;
  }
}

// Function to update food positions (optional: move food randomly)
function updateFood() {
  food.forEach(f => {
    // Implement random movement or respawn logic if needed
    // Example (random movement):
    f.x += (Math.random() - 0.5) * 0.2;
    f.y += (Math.random() - 0.5) * 0.2;
  });
}

// Function to update enemies
function updateEnemies() {
  enemies.forEach((e, index) => {
    // Apply movement to enemy position
    e.x += e.dx;
    e.y += e.dy;

    // Keep enemy within canvas boundaries
    if (e.x - e.radius < 0 || e.x + e.radius > canvas.width) {
      e.dx *= -1; // Reverse horizontal direction
    }
    if (e.y - e.radius < 0 || e.y + e.radius > canvas.height) {
      e.dy *= -1; // Reverse vertical direction
    }

    // Enemy attack (Move towards player)
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.dx = Math.cos(angle) * enemySpeed;
    e.dy = Math.sin(angle) * enemySpeed;
  });
}

// Function to update other players (with random movement)
function updateOtherPlayers() {
  otherPlayers.forEach((p, index) => {
    // Apply random movement to other player position
    p.dx = (Math.random() - 0.5) * 1.2; // Increased random movement
    p.dy = (Math.random() - 0.5) * 1.2; // Increased random movement
    p.x += p.dx;
    p.y += p.dy;

    // Keep other player within canvas boundaries
    if (p.x - p.radius < 0 || p.x + p.radius > canvas.width) {
      p.dx *= -1; // Reverse horizontal direction
    }
    if (p.y - p.radius < 0 || p.y + p.radius > canvas.height) {
      p.dy *= -1; // Reverse vertical direction
    }
  });
}

// Find the closest target for a player (could be another player or enemy)
function findClosestTarget(player) {
  let closestTarget = null;
  let closestDistance = Infinity;

  // Check against other players
  otherPlayers.forEach(p => {
    if (p !== player) {
      const distance = Math.sqrt(
        Math.pow(player.x - p.x, 2) + Math.pow(player.y - p.y, 2)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTarget = p;
      }
    }
  });

  // Check against enemies
  enemies.forEach(e => {
    const distance = Math.sqrt(
      Math.pow(player.x - e.x, 2) + Math.pow(player.y - e.y, 2)
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestTarget = e;
    }
  });

  return closestTarget;
}

// Function to draw the player
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
}

// Function to draw food
function drawFood() {
  food.forEach(f => {
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Function to draw enemies
function drawEnemies() {
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Function to draw other players (with nickname)
function drawOtherPlayers() {
  otherPlayers.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw nickname above the player
    ctx.fillStyle = '#000'; // Black text color
    ctx.font = '12px Arial';
    ctx.fillText(p.nickname, p.x - ctx.measureText(p.nickname).width / 2, p.y - p.radius - 10); // Center the text

    // Draw nickname in the right corner
    ctx.fillText(p.nickname, p.x + p.radius - ctx.measureText(p.nickname).width - 5, p.y - p.radius - 5); // Right corner
  });
}

// Function to handle collisions
function handleCollisions() {
  // Collision with food
  food.forEach((f, index) => {
    const distance = Math.sqrt(
      Math.pow(player.x - f.x, 2) + Math.pow(player.y - f.y, 2)
    );

    if (distance < player.radius + f.radius) {
      // Collision detected!
      player.radius += f.radius / 8; // Increase player size (slower)
      food.splice(index, 1); // Remove food from array
      // Update player score if they are alive
      if (player.energy > 0) {
        playerScores['Player'] = playerScores['Player'] ? playerScores['Player'] + 10 : 10; // Add 10 points
        updateScoreboard();
      }
    }
  });

  // Collision with enemies
  enemies.forEach((e, index) => {
    const distance = Math.sqrt(
      Math.pow(player.x - e.x, 2) + Math.pow(player.y - e.y, 2)
    );

    if (distance < player.radius + e.radius) {
      // Collision detected!
      if (player.radius > e.radius) {
        // Player is larger, it eats the enemy
        player.radius += e.radius / 8; // Increase player size (slower)
        enemies.splice(index, 1);
        // Update player score if they are alive
        if (player.energy > 0) {
          playerScores['Player'] = playerScores['Player'] ? playerScores['Player'] + e.radius : e.radius;
          updateScoreboard();
        }
      } else {
        // Enemy is larger, it eats the player
        // gameOver(); // Game over
      }
    }
  });

  // Collision with other players
  otherPlayers.forEach((p, index) => {
    const distance = Math.sqrt(
      Math.pow(player.x - p.x, 2) + Math.pow(player.y - p.y, 2)
    );

    if (distance < player.radius + p.radius) {
      // Collision detected!
      if (player.radius > p.radius) {
        // Player is larger, it eats the other player
        player.radius += p.radius / 8; // Increase player size (slower)
        otherPlayers.splice(index, 1);
        // Update player score if they are alive
        if (player.energy > 0) {
          playerScores['Player'] = playerScores['Player'] ? playerScores['Player'] + Math.round(p.radius) : Math.round(p.radius);
          updateScoreboard();
        }
      } else {
        // Other player is larger, it eats the player
        // gameOver(); // Game over
      }
    }
  });
}

// Function to start the game
function startGame() {
  // Get the player's nickname from the input field
  const playerNickname = playerNicknameInput.value;

  // Check if the player entered a nickname
  if (playerNickname === "") {
    alert("Будь ласка, введіть нік!");
    return; // Stop further execution
  }

  // Start the game loop
  gameLoop(); 

  // Remove the start button
  startGameButton.remove(); 

  // Set player's starting color randomly
  player.color = `hsl(${Math.random() * 360}, 50%, 50%)`; 

  // Create initial enemies and other players
  for (let i = 0; i < 5; i++) {
    createEnemy();
    createOtherPlayer();
  }

  // Update the scoreboard with the player's nickname
  playerScores[playerNickname] = 0;
  updateScoreboard();

  // Hide the start menu
  startMenu.style.display = 'none'; 
}

// Function to reset the game (updated for scoreboard)
function resetGame() {
  // Reset player
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.radius = 20;
  player.energy = 100;
  player.color = `hsl(${Math.random() * 360}, 50%, 50%)`; 

  // Reset food
  food = [];

  // Reset enemies
  enemies = [];

  // Reset other players
  otherPlayers = [];

  // Reset scoreboard
  playerScores = {};
  updateScoreboard();

  // Create a new start button
  startGameButton = document.createElement('button');
  startGameButton.textContent = 'Старт гри';
  startGameButton.addEventListener('click', startGame);
  document.body.appendChild(startGameButton);

  // Add the player nickname input field back
  document.body.appendChild(playerNicknameInput);
}

// Function to generate a random nickname
function generateNickname() {
  const adjectives = ["Cool", "Brave", "Smart", "Funny", "Fast", "Strong"];
  const nouns = ["Eagle", "Tiger", "Shark", "Dragon", "Robot", "Wizard"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

// Function to update the scoreboard
function updateScoreboard() {
  scoreboard.innerHTML = ''; // Clear the scoreboard
  for (const playerId in playerScores) {
    const score = playerScores[playerId];
    const scoreEntry = document.createElement('div');
    scoreEntry.textContent = `${playerId}: ${score}`;
    scoreboard.appendChild(scoreEntry);
  }
}

// Game loop
function gameLoop() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update food positions (optional: move food randomly)
  updateFood();

  // Update enemies
  updateEnemies();

  // Update other players
  updateOtherPlayers();

  // Draw player
  drawPlayer();

  // Draw food
  drawFood();

  // Draw enemies
  drawEnemies();

  // Draw other players
  drawOtherPlayers();

  // Check for collisions and handle growth
  handleCollisions();

  // Generate food
  if (Date.now() - lastFoodSpawn >= foodSpawnInterval) {
    generateFood();
    lastFoodSpawn = Date.now();
  }

  // Generate new players
  if (Date.now() - lastPlayerSpawn >= playerSpawnInterval) {
    createOtherPlayer();
    lastPlayerSpawn = Date.now();
  }

  // Decrease player radius every 2 seconds
  if (Date.now() % 2000 === 0) {
    player.radius -= 2; // Decrease radius by 2 (adjust this value as needed)
  }

  // Request the next frame
  requestAnimationFrame(gameLoop);
}

// Start the game when the button is clicked
startGameButton.addEventListener('click', startGame);

// Add event listener for mouse movement to update player position
canvas.addEventListener('mousemove', updatePlayer); // Call updatePlayer on mousemove

// Start the game when the Enter key is pressed
playerNicknameInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    startGame();
  }
});