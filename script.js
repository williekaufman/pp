URL = 'http://127.0.0.1:5001'

let f = ''

let current = '';

let addPipe = true;

let won = false;

const displayCode = document.getElementById('display-code');

const functionType = document.getElementById('function-type');

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

  if (result.length > 0) {
    result = result.slice(0, -1) + string[string.length - 1];
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
    if (!localStorage.getItem('allowMultipleCharacters') && characterInput.value.length != 1) {
        showToast('must add exactly one character');
        return
    }
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId, character: characterInput.value }));

    fetch(`${URL}/add`, requestOptions)
    
    characterInput.value = '';
}

function submit() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId, password: passwordInput.value }));

    fetch(`${URL}/submit`, requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data['won'] === true) {
                won = true;
                showToast('you win!');
            } else {
                won = false;
                showToast(`${data['message']}`);
            }
        })
}

function getCurrent() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId  }));

    fetch(`${URL}/current`, requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data['exists'] === false) {
                current = ''
            }
            current = data['current'];
        })
    }

function loadGame() {
    if (gameId === '') {
        showToast('enter a game id');
        return;
    }

    const requestOptions = makeRequestOptions(JSON.stringify({ gameId }));

    fetch(`${URL}/current`, requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data['exists'] === false) {
                f = ''
                newGame();
            } else {
                f = data['function'];
            }
        })
}

function newGame() {
    if (gameId === '') {
        showToast('enter a game id');
        return;
    }

    const requestOptions = makeRequestOptions(JSON.stringify({ gameId , functionType: functionType.value }));

    fetch(`${URL}/new_game`, requestOptions)
        .then(response => response.json())
        .then(data => {
            f = data['function'];
        })

    showToast('new game');
}

function clear() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId }));
    fetch(`${URL}/clear`, requestOptions)

    showToast('cleared');
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
    if (won) {
        gameState.style.color = 'green';
    } else {
        gameState.style.color = 'black';
    }
    gameState.innerHTML += addPipe ? '|' : '';
    addPipe = !addPipe; 
}

const gameState = document.getElementById('game-state');

const gameIdInput = document.getElementById('game-id-text-field');

const characterInput = document.getElementById('character-text-field');

const passwordInput = document.getElementById('password-text-field');

passwordInput.value = localStorage.getItem('pairProgrammingPassword') || '';

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
    }
    if (e.key === 'Escape') {
        characterInput.blur();
    }
})

passwordInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        localStorage.setItem('pairProgrammingPassword', passwordInput.value);
    }
    if (e.key === 'Escape') {  
        passwordInput.blur();
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

const addCharacterButton = document.getElementById('add-character-btn');
addCharacterButton.addEventListener('click', async () => {
    await addCharacter();
});

document.addEventListener('keydown', async (e) => {
    if (e.altKey && !e.ctrlKey) {
        if (e.key === 'Enter') {
            e.preventDefault();
            await submit();
        }
        if (e.key === 'c') {
            e.preventDefault();
            await clear();
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
        if (e.key === 'p') {
            passwordInput.focus();
        }
        if (e.key === 'g') {
            gameIdInput.focus();
        }
        if (e.key === 'a') {
            characterInput.focus();
        }
    }
    if (e.altKey && e.ctrlKey) {
        if (e.key === 'n') {
            e.preventDefault();
            await newGame();
        }
        if (e.key === 'c') {
            e.preventDefault();
            await clear();
        }
    }
})

setInterval(function () {
    getCurrent();
    setGameState();
}, 500)
