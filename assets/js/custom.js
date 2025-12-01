document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const resultArea = document.getElementById('resultArea');
  const popup = document.getElementById('popup');
  const popupClose = document.getElementById('popupClose');

  const fields = {
    name: document.getElementById('name'),
    surname: document.getElementById('surname'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    address: document.getElementById('address')
  };

  const ratings = [
    document.getElementById('r1'),
    document.getElementById('r2'),
    document.getElementById('r3')
  ];

  ratings.forEach((r, i) => {
    const out = document.getElementById(r.id + 'Out');
    r.addEventListener('input', () => { out.value = r.value; });
  });

  const validators = {
    name: v => /^[A-Za-zĄČĘĖĮŠŲŪаąčęėįšųūž-яА-Я\-\s]+$/.test(v.trim()),
    surname: v => /^[A-Za-zĄČĘĖĮŠŲŪąčęėįšųūžа-яА-Я\-\s]+$/.test(v.trim()),
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    address: v => v.trim().length > 0,
    phone: v => /^\+370\s6\d{2}\s\d{3}\s\d{2}$/.test(v)
  };

  function setError(field, message) {
    const el = fields[field];
    el.classList.add('invalid');
    const small = form.querySelector(`small.error[data-for="${field}"]`);
    if (small) small.textContent = message;
  }

  function clearError(field) {
    const el = fields[field];
    el.classList.remove('invalid');
    const small = form.querySelector(`small.error[data-for="${field}"]`);
    if (small) small.textContent = '';
  }

  function validateField(field) {
    const value = fields[field].value;
    if (!value.trim()) { setError(field, 'Laukas privalomas'); return false; }
    if (!validators[field](value)) {
      const msgs = {
        name: 'Vardas turi būti sudarytas tik iš raidžių',
        surname: 'Pavardė turi būti sudaryta tik iš raidžių',
        email: 'Neteisingas el. pašto formatas',
        address: 'Įveskite adresą kaip tekstą',
        phone: 'Telefono formatas turi būti +370 6xx xxx xxx'
      };
      setError(field, msgs[field]);
      return false;
    }
    clearError(field);
    return true;
  }

  ['name','surname','email','address'].forEach(f => {
    fields[f].addEventListener('input', () => {
      validateField(f);
      toggleSubmit();
    });
  });

  fields.phone.addEventListener('input', e => {
    const raw = fields.phone.value.replace(/[^0-9]/g, '');
    let formatted = '';ize
    if (raw.startsWith('370')) {
      const body = raw.slice(3);
      formatted = '+370 ' + formatLithuanian(body);
    } else if (raw.startsWith('8')) {
      const body = raw.slice(1);
      formatted = '+370 ' + formatLithuanian(body);
    } else if (raw.startsWith('6')) {
      formatted = '+370 ' + formatLithuanian(raw);
    } else if (raw.length === 0) {
      formatted = '';
    } else {
      formatted = raw;
    }
    fields.phone.value = formatted;
    if (formatted && validators.phone(formatted)) clearError('phone');
    else if (formatted.length > 0) setError('phone', 'Telefono formatas turi būti +370 6xx xxx xxx');

    toggleSubmit();
  });

  function formatLithuanian(digits) {
    const match = digits.match(/^(6?)(\d{0,2})(\d{0,3})(\d{0,3})/);
    if (!match) return digits;
    const part1 = match[1] ? (match[1] + match[2]) : match[2];
    const part2 = match[3] || '';
    const part3 = match[4] || '';
    let out = part1;
    if (part2) out += ' ' + part2;
    if (part3) out += ' ' + part3;
    return out.trim();
  }


  function toggleSubmit() {
    const ok = ['name','surname','email','address','phone'].every(f => validators[f](fields[f].value));
    submitBtn.disabled = !ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    let allOk = true;
    ['name','surname','email','address','phone'].forEach(f => { if (!validateField(f)) allOk = false; });
    if (!allOk) { toggleSubmit(); return; }

    const data = {
      name: fields.name.value.trim(),
      surname: fields.surname.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      address: fields.address.value.trim(),
      ratings: ratings.map(r => Number(r.value))
    };

    console.log('Contact form submitted:', data);

    const avg = (data.ratings.reduce((a,b)=>a+b,0) / data.ratings.length);
    const avgFixed = Math.round(avg * 10) / 10;

    resultArea.innerHTML = `\n      <div class="result-box">\n        Vardas: ${escapeHtml(data.name)}<br>\n        Pavardė: ${escapeHtml(data.surname)}<br>\n        El. paštas: <a href=\"mailto:${escapeAttr(data.email)}\">${escapeHtml(data.email)}</a><br>\n        Tel. Numeris: ${escapeHtml(data.phone)}<br>\n        Vidurkis: ${escapeHtml(data.name)} ${escapeHtml(data.surname)}: ${avgFixed}\n      </div>`;

    showPopup();

  });

  popupClose.addEventListener('click', () => { hidePopup(); });

  function showPopup() {
    popup.classList.remove('hidden');
    popup.setAttribute('aria-hidden', 'false');
  }
  function hidePopup() {
    popup.classList.add('hidden');
    popup.setAttribute('aria-hidden', 'true');
  }

  function escapeHtml(s) {
    return (s+'').replace(/[&<>\\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'\\\\','"':'&quot;',"'":'&#39;'})[c]);
  }
  function escapeAttr(s){ return escapeHtml(s).replace(/\n/g,''); }

  toggleSubmit();
});






const CARD_ICONS = [
    'fa-coffee',
    'fa-camera-retro',
    'fa-anchor',
    'fa-feather-alt',
    'fa-tree',
    'fa-gem',
    'fa-crown',
    'fa-meteor',
    'fa-palette',
    'fa-rocket',
    'fa-bug',
    'fa-sun'
];


let gameState = {
    isGameStarted: false,
    difficulty: 'easy',
    moves: 0,
    matchedPairs: 0,
    cards: [], 
    flippedCards: [], 
    lockBoard: false, 
    totalPairs: 0,
    rows: 0,
    cols: 0,
    timerIntervalId: null,
    startTime: 0,
};

const gameBoard = document.getElementById('gameBoard');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const movesCountSpan = document.getElementById('movesCount');
const matchedPairsCountSpan = document.getElementById('matchedPairsCount');
const winMessage = document.getElementById('winMessage');
const bestEasySpan = document.getElementById('bestEasy');
const bestHardSpan = document.getElementById('bestHard');
const timerDisplay = document.getElementById('timerDisplay');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateStats() {
    movesCountSpan.textContent = gameState.moves;
    matchedPairsCountSpan.textContent = gameState.matchedPairs;
}

function setBoardDimensions(difficulty) {
    if (difficulty === 'easy') {
        gameState.rows = 3;
        gameState.cols = 4;
    } else { // hard
        gameState.rows = 4;
        gameState.cols = 6;
    }
    gameState.totalPairs = (gameState.rows * gameState.cols) / 2;

    gameBoard.className = difficulty === 'easy' ? 'board-easy' : 'board-hard';
}

function generateCards(numPairs) {
    const uniqueIcons = CARD_ICONS.slice(0, numPairs);
    
    let cardSet = [...uniqueIcons, ...uniqueIcons];
    
    shuffle(cardSet);
    
    return cardSet.map((icon, index) => ({
        id: index,
        icon: icon,
        isFlipped: false,
        isMatched: false
    }));
}

function renderBoard() {
    gameBoard.innerHTML = '';

    gameState.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id;
        cardElement.dataset.icon = card.icon;

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.innerHTML = '<i class="fas fa-question"></i>';

        const cardFace = document.createElement('div');
        cardFace.classList.add('card-face');
        cardFace.innerHTML = `<i class="fas ${card.icon}"></i>`;

        cardElement.appendChild(cardBack);
        cardElement.appendChild(cardFace);

        if (card.isFlipped) {
            cardElement.classList.add('flipped');
        }
        if (card.isMatched) {
            cardElement.classList.add('matched');
        }

        cardElement.addEventListener('click', handleCardClick);

        gameBoard.appendChild(cardElement);
    });
}

function startTimer() {
    // Sustabdome bet kokį ankstesnį laikmatį
    stopTimer(); 
    
    gameState.startTime = Date.now();
    
    // Atnaujinti kas sekundę
    gameState.timerIntervalId = setInterval(() => {
        const elapsedTime = Date.now() - gameState.startTime;
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    if (gameState.timerIntervalId) {
        clearInterval(gameState.timerIntervalId);
        gameState.timerIntervalId = null;
    }
}

function resetTimer() {
    stopTimer();
    timerDisplay.textContent = '00:00';
}

function resetGame(shouldRestart = false) {

    gameState.difficulty = difficultySelect.value;

    gameState.moves = 0;
    gameState.matchedPairs = 0;
    gameState.flippedCards = [];
    gameState.lockBoard = false;
    winMessage.classList.add('hidden');
    winMessage.textContent = '';
    
    resetTimer();

    setBoardDimensions(difficultySelect.value);
    gameState.cards = generateCards(gameState.totalPairs);
    renderBoard();


    updateStats();
    
    if (shouldRestart) {
        gameState.isGameStarted = true;
        startButton.disabled = true;
        resetButton.disabled = false;

        startTimer();
    } else {
        gameState.isGameStarted = false;
        startButton.disabled = false;
        resetButton.disabled = true;
    }
}

function handleCardClick(event) {
    if (!gameState.isGameStarted || gameState.lockBoard) return;
    
    const clickedCardElement = event.currentTarget.closest('.card');
    const cardId = parseInt(clickedCardElement.dataset.id);
    const cardData = gameState.cards.find(c => c.id === cardId);

    if (cardData.isFlipped || cardData.isMatched) return;

    cardData.isFlipped = true;
    clickedCardElement.classList.add('flipped');
    gameState.flippedCards.push(cardData);

    if (gameState.flippedCards.length === 2) {
        gameState.lockBoard = true; 
        gameState.moves++;
        updateStats();

        checkForMatch();
    }
}


function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;
    const isMatch = card1.icon === card2.icon;

    if (isMatch) {
        handleMatch(card1.id, card2.id);
    } else {
        handleMismatch(card1.id, card2.id);
    }
}


function handleMatch(id1, id2) {
    gameState.cards.find(c => c.id === id1).isMatched = true;
    gameState.cards.find(c => c.id === id2).isMatched = true;
    gameState.matchedPairs++;

    updateStats();

    document.querySelector(`.card[data-id="${id1}"]`).classList.add('matched');
    document.querySelector(`.card[data-id="${id2}"]`).classList.add('matched');

    gameState.flippedCards = [];
    gameState.lockBoard = false;

    if (gameState.matchedPairs === gameState.totalPairs) {
        showWinMessage();
    }
}


function handleMismatch(id1, id2) {
    const cardElement1 = document.querySelector(`.card[data-id="${id1}"]`);
    const cardElement2 = document.querySelector(`.card[data-id="${id2}"]`);
    
    setTimeout(() => {

        cardElement1.classList.remove('flipped');
        cardElement2.classList.remove('flipped');
        
        gameState.cards.find(c => c.id === id1).isFlipped = false;
        gameState.cards.find(c => c.id === id2).isFlipped = false;

        gameState.flippedCards = [];
        gameState.lockBoard = false;
    }, 1000); 
}


function loadBestScores() {
    const bestEasy = localStorage.getItem('bestEasyScore');
    const bestHard = localStorage.getItem('bestHardScore');

    bestEasySpan.textContent = bestEasy || 'N/A';
    bestHardSpan.textContent = bestHard || 'N/A';
}


function checkAndSaveBestScore() {
    const currentDifficulty = gameState.difficulty;
    const currentScore = gameState.moves;
    const key = `best${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}Score`; // bestEasyScore ar bestHardScore

    const existingBestScore = localStorage.getItem(key);

    if (existingBestScore === null || currentScore < parseInt(existingBestScore)) {
        localStorage.setItem(key, currentScore);
        loadBestScores(); 
        
        winMessage.textContent += ` 🎉 Naujas rekordas ${currentDifficulty} lygiui!`;
    }
}


function showWinMessage() {
    gameState.isGameStarted = false;
    startButton.disabled = true; 

    stopTimer();
    
    winMessage.textContent = `🥳 Laimėjote! Jums prireikė ${gameState.moves} ėjimų.`;
    winMessage.classList.remove('hidden');

    checkAndSaveBestScore();
}


startButton.addEventListener('click', () => {

    resetGame(true);
});


resetButton.addEventListener('click', () => {

    resetGame(true); 
});


difficultySelect.addEventListener('change', () => {

    resetGame(false); 
});


document.addEventListener('DOMContentLoaded', () => {

    resetGame(false); 
});


document.addEventListener('DOMContentLoaded', () => {

    resetGame(false); 
    loadBestScores();
});