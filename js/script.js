// References to HTML elements
const initialPopup = document.getElementById('initial-popup');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const puzzleContainer = document.getElementById('puzzle-container');
const previewButton = document.getElementById('preview-button');
const completionPopup = document.getElementById('completion-popup');
const quoteText = document.getElementById('quote-text');
const closeCompletionPopup = document.getElementById('close-completion-popup');
const previewModal = document.getElementById('preview-modal');
const closePreviewModal = document.getElementById('close-preview-modal');
const previewImage = document.getElementById('preview-image');

// Constants for grid size
const GRID_SIZE = 3; // 3x3 grid
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

// Variables
let tiles = [];
let emptyTileIndex = TILE_COUNT - 1; // Last tile is empty
let imagesArray = [
    'images/image1.jpg',
    'images/image2.jpg',
    'images/image3.jpg',
    'images/image4.jpg',
    'images/image5.jpg',
    'images/image6.jpg',
    'images/image7.jpg',
    'images/image8.jpg'
];
let currentImage = '';

// Motivational quotes
let quotesArray = [
    "Believe you can and you're halfway there.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Stay focused and never give up.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it."
];

// Initialize the game
function init() {
    // Event listener for the start button
    startButton.addEventListener('click', startGame);

    // Event listener for closing completion popup
    closeCompletionPopup.addEventListener('click', () => {
        completionPopup.style.display = 'none';
    });

    // Event listener for closing preview modal
    closePreviewModal.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == previewModal) {
            previewModal.style.display = 'none';
        }
        if (e.target == completionPopup) {
            completionPopup.style.display = 'none';
        }
    });

    // Event listener for keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);

    // Event listener for the preview button
    previewButton.addEventListener('click', showPreview);
}

// Handle keydown events for keyboard shortcuts
function handleKeyDown(event) {
    // Only proceed if the game has started
    if (gameContainer.style.display === 'block') {
        // Check if Ctrl + Shift + K (or Command + Shift + K on Mac) is pressed
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'k') {
            event.preventDefault(); // Prevent default action if any
            skipPuzzle();
        }
    }
}

// Function to skip the puzzle
function skipPuzzle() {
    // Set tiles array to the solved state
    for (let i = 0; i < TILE_COUNT; i++) {
        tiles[i] = i;
    }
    emptyTileIndex = TILE_COUNT - 1;
    renderTiles();

    // Show the completion popup after a brief delay
    setTimeout(showCompletionPopup, 500);
}

// Start the game after clicking "Yes"
function startGame() {
    initialPopup.style.display = 'none';
    gameContainer.style.display = 'block';
    setupGame();
}

// Setup the game
function setupGame() {
    selectRandomImage();
    createTiles();
    shuffleTiles(); // Shuffle the tiles after creating them
    renderTiles();
}

// Select a random image from the array
function selectRandomImage() {
    const randomIndex = Math.floor(Math.random() * imagesArray.length);
    currentImage = imagesArray[randomIndex];
    previewImage.src = currentImage;
}

// Create tile numbers in order
function createTiles() {
    tiles = [];
    for (let i = 0; i < TILE_COUNT; i++) {
        tiles.push(i);
    }
}

// Render tiles in the DOM
function renderTiles() {
    puzzleContainer.innerHTML = '';
    const tileSize = puzzleContainer.clientWidth / GRID_SIZE; // Calculate tile size dynamically
    tiles.forEach((tileNumber, index) => {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        tileElement.style.width = `${tileSize}px`;
        tileElement.style.height = `${tileSize}px`;

        // Corrected condition to check if the current index is the empty tile
        if (index === emptyTileIndex) {
            tileElement.classList.add('hidden');
        } else {
            const row = Math.floor(tileNumber / GRID_SIZE);
            const col = tileNumber % GRID_SIZE;

            // Set the background image
            tileElement.style.backgroundImage = `url('${currentImage}')`;

            // Set the background size
            tileElement.style.backgroundSize = `${puzzleContainer.clientWidth}px ${puzzleContainer.clientHeight}px`;

            // Calculate and set the background position
            tileElement.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;

            // Add tile number
            const tileNum = document.createElement('div');
            tileNum.classList.add('tile-number');
            tileNum.textContent = tileNumber + 1;
            tileElement.appendChild(tileNum);
        }

        tileElement.addEventListener('click', () => moveTile(index));
        puzzleContainer.appendChild(tileElement);
    });
}

// Shuffle the tiles
function shuffleTiles() {
    for (let i = 0; i < 1000; i++) {
        const movableTiles = getMovableTiles();
        const randomTile = movableTiles[Math.floor(Math.random() * movableTiles.length)];
        swapTiles(randomTile, emptyTileIndex);
        emptyTileIndex = randomTile; // Update emptyTileIndex after swapping
    }
}

// Get indices of tiles that can move into the empty space
function getMovableTiles() {
    const movable = [];
    const emptyRow = Math.floor(emptyTileIndex / GRID_SIZE);
    const emptyCol = emptyTileIndex % GRID_SIZE;

    // Possible directions: up, down, left, right
    const directions = [
        { row: emptyRow - 1, col: emptyCol }, // Up
        { row: emptyRow + 1, col: emptyCol }, // Down
        { row: emptyRow, col: emptyCol - 1 }, // Left
        { row: emptyRow, col: emptyCol + 1 }  // Right
    ];

    directions.forEach((pos) => {
        if (pos.row >= 0 && pos.row < GRID_SIZE && pos.col >= 0 && pos.col < GRID_SIZE) {
            const index = pos.row * GRID_SIZE + pos.col;
            movable.push(index);
        }
    });

    return movable;
}

// Move tile if adjacent to empty space
function moveTile(index) {
    if (getMovableTiles().includes(index)) {
        swapTiles(index, emptyTileIndex);
        emptyTileIndex = index;
        renderTiles();

        if (isSolved()) {
            setTimeout(showCompletionPopup, 500);
        }
    } else {
        // Optional: Provide visual feedback for invalid move
        const tileElements = puzzleContainer.children;
        tileElements[index].classList.add('invalid-move');
        setTimeout(() => {
            tileElements[index].classList.remove('invalid-move');
        }, 500);
    }
}

// Swap tiles in the array
function swapTiles(index1, index2) {
    [tiles[index1], tiles[index2]] = [tiles[index2], tiles[index1]];
}

// Check if the puzzle is solved
function isSolved() {
    for (let i = 0; i < TILE_COUNT; i++) {
        if (tiles[i] !== i) return false;
    }
    return true;
}

// Show completion popup with a random quote
function showCompletionPopup() {
    const randomQuoteIndex = Math.floor(Math.random() * quotesArray.length);
    quoteText.textContent = quotesArray[randomQuoteIndex];
    completionPopup.style.display = 'block';
}

// Show preview of the image
function showPreview() {
    previewModal.style.display = 'block';
}

// Initialize the game on page load
window.onload = init;
