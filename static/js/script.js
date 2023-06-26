URL = 'http://127.0.0.1:5002'

let f = ''

let current = '';

let addPipe = true;

let won = false;

const displayCode = document.getElementById('display-code');

const functionType = document.getElementById('function-type');

const allowMultipleCharacters = document.getElementById('allow-multiple-characters');

const language = document.getElementById('language');

allowMultipleCharacters.checked = !!localStorage.getItem('allowMultipleCharacters');

let previousToast = null;

function showToast(message, seconds = 3) {
    const toast = document.createElement('div');

    toast.classList.add('toast');
    toast.textContent = message;

    previousToast?.remove();

    previousToast = toast;

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, seconds * 1000);
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
    if (characterInput.value === '') {
        return;
    }
    if (!allowMultipleCharacters.checked && characterInput.value.length > 1) {
        showToast('must add exactly one character');
        return
    }
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId, character: characterInput.value }));

    fetch(`${URL}/add`, requestOptions)

    characterInput.value = '';
}

function submit() {
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId, password: passwordInput.value, language: language.value }));

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
    const requestOptions = makeRequestOptions(JSON.stringify({ gameId, language: language.value }));

    fetch(`${URL}/current`, requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data['exists'] === false) {
                current = ''
            } else {
                f = data['function'];
                current = data['current'];
            }
        })
}

function loadGame() {
    won = false;

    if (gameId === '') {
        f = '';
        showToast('enter a game id');
        return;
    }

    const requestOptions = makeRequestOptions(JSON.stringify({ gameId, language: language.value }));

    fetch(`${URL}/current`, requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data['exists'] === false) {
                f = ''
                newGame();
            } else {
                showToast('loaded game');
                f = data['function'];
            }
        })
}

function newGame() {
    won = false;

    if (gameId === '') {
        showToast('enter a game id');
        return;
    }

    const requestOptions = makeRequestOptions(JSON.stringify({ gameId, functionType: functionType.value , language: language.value }));

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

    won = false;

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
    console.log(f);
    if (f === '') {
        gameState.innerHTML = '';
        return;
    }
    if (displayCode.checked) {
        gameState.innerHTML = f + (current || '');
    } else {
        gameState.innerHTML = f + hideCharacters(current || '');
    }
    // Coloring not live until I figure out when to uncolor
    if (won) {
        gameState.style.color = 'black';
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

gameState.addEventListener('keydown', async (e) => {
    if (e.key === 'Backspace') {
        e.preventDefault();
        await backspace();
    }
    if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        await addWhitespace(true);
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        await submit();
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        gameState.blur();
    }
})

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

const loadGameButton = document.getElementById('load-game-btn');
loadGameButton.addEventListener('click', async () => {
    await loadGame();
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
        if (e.key === 'm') {
            allowMultipleCharacters.checked = !allowMultipleCharacters.checked;
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
