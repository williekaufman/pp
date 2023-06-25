URL = 'http://127.0.0.1:5001'

let f = ''

let current = '';

let addPipe = true;

const displayCode = document.getElementById('display-code');

function showToast(message) {
  const toast = document.createElement('div');

  toast.classList.add('toast');
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(function() {
    toast.remove();
  }, 3000);
}


function hideCharacters(string) {
  var result = '';

  for (var i = 0; i < string.length; i++) {
    if (string[i] === ' ' || string[i] === '\t' || string[i] === '\n') {
      result += string[i]; 
    } else {
      result += '*'; 
    }
  }

  return result;
}

function makeRequestOptions(body) {
    return {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body,
    };
}

function addCharacter() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId, character: characterInput.value }));

    fetch(`${URL}/add`, requestOptions)
}

function getCurrent() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId  }));

    fetch(`${URL}/current`, requestOptions)
        .then(response => response.json())
        .then(data => {
            current = data['current'];
        })
    }

function loadGame() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId }));

    fetch(`${URL}/current`, requestOptions)
        .then(response => response.json())
        .then(data => {
            f = data['function'];
        })

    if (f === '') {
        newGame();
    }
}

function newGame() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId }));

    fetch(`${URL}/new_game`, requestOptions)
        .then(response => response.json())
        .then(data => {
            f = data['function'];
        })
}

function clear() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId }));
    fetch(`${URL}/clear`, requestOptions)
}

function addWhitespace(isTab) {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId }));

    if (isTab) {
        fetch(`${URL}/add/tab`, requestOptions)
    } else {
        fetch(`${URL}/add/newline`, requestOptions)
    }
}

function backspace() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId }));

    fetch(`${URL}/delete`, requestOptions)
}

function setGameState() {
    if (f === '') {
        gameState.innerHTML = '';
        return;
    }
    if (displayCode.checked) {
        gameState.innerHTML = f + (current || '');
    } else {
        gameState.innerHTML = f + hideCharacters(current || '');
    }
    gameState.innerHTML += addPipe ? '|' : '';
    addPipe = !addPipe; 
}

const gameState = document.getElementById('game-state');

const gameIdInput = document.getElementById('game-id-text-field');

const characterInput = document.getElementById('character-text-field');

let gameId = '';

gameIdInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        gameId = gameIdInput.value;
        await loadGame();
    }
    if (e.key === 'Escape') {
        gameIdInput.blur();
    }
})

characterInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        await addCharacter();
        characterInput.value = '';
    }
    if (e.key === 'Escape') {
        characterInput.blur();
    }
})

const newGameButton = document.getElementById('new-game-btn');
newGameButton.addEventListener('click', async () => {
    await newGame();
});

const startOverButton = document.getElementById('start-over-btn');
startOverButton.addEventListener('click', async () => {
    await clear();
});    

const newLineButton = document.getElementById('new-line-btn');
newLineButton.addEventListener('click', async () => {
    await addWhitespace(false);
});

const tabButton = document.getElementById('tab-btn');
tabButton.addEventListener('click', async () => {
    await addWhitespace(true);
});

const deleteButton = document.getElementById('delete-btn');
deleteButton.addEventListener('click', async () => {
    await backspace();
});

document.addEventListener('keydown', async (e) => {
    if (!e.altKey) {
        return
    }
    if (e.key === 'n') {
        e.preventDefault();
        await addWhitespace(false);
    }
    if (e.key === 't') {
        e.preventDefault();
        await addWhitespace(true);
    }
    if (e.key === 'd') {
        e.preventDefault();
        await backspace();
    }
    if (e.key === 's') {
        displayCode.checked = !displayCode.checked;
    }
    if (!e.ctrlKey) {
        return
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        await newGame();
    }
    if (e.key === 'c') {
        e.preventDefault();
        await clear();
    }
})

setInterval(getCurrent, 1000)
setInterval(setGameState, 1000)

showToast('Press Alt + S to toggle code visibility');