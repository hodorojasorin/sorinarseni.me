// terminal.js

document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('[data-terminal="input"]');
    const output = document.querySelector('[data-terminal="output"]');
    const terminal = document.querySelector('[data-terminal="ui"]');
    const timeDisplay = document.getElementById('time');  // Adaugă referința la ora din HTML
    let commandHistory = [];
    let commandIndex = 0;
    let isAdmin = false;  // Variabilă pentru a verifica dacă utilizatorul este logat ca admin

    // Încarcă deadline-urile din localStorage
    let deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];

    // Functie pentru a adăuga output în terminal
    const appendOutput = (command, result, isError = false) => {
        const commandElement = document.createElement('p');
        const resultElement = document.createElement('div');
        
        commandElement.innerHTML = `> <span>${command}</span>`;
        resultElement.innerHTML = result;
        
        if (isError) {
            commandElement.querySelector('span').style.color = 'red';
        }
        
        output.appendChild(commandElement);
        output.appendChild(resultElement);
        terminal.scrollTop = terminal.scrollHeight;  // Scroll la ultima linie
    };

    // Afișează ora
    const updateTime = () => {
        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    };
    setInterval(updateTime, 1000); // Actualizează ora la fiecare secundă

    // Afișează comenzi disponibile pentru help
    const showHelp = () => {
        if (isAdmin) {
            // Comenzi pentru admin
            appendOutput('help', `
1. about - Descriere despre mine
2. contact - Redirecționează la Linktree
3. login - Loghează-te ca admin (User: sarcasm, Parola: asd123)
4. deadline - Afișează deadline-urile tale
5. deadline create "<id> <data> <ora> <descriere>"
6. deadline delete "<id>"
7. exit
`, false);
        } else {
            // Comenzi pentru guest (neautentificat)
            appendOutput('help', `
1. about - Descriere despre mine
2. contact - Redirecționează la Linktree
`, false);
        }
    };

    // Comanda de a curăța terminalul
    const handleCommand = (command) => {
        if (command === 'clear') {
            output.innerHTML = '';
        } else if (command === 'help') {
            showHelp();
        } else if (command === 'about') {
            appendOutput(command, 'Cand o sa-mi apara muza, atunci o sa scriu ceva despre mine.', false);
        } else if (command === 'contact') {
            window.open("https://linktr.ee/sorinarseni", "_blank");  // Redirecționează la Linktree
        } else if (command === 'login' && !isAdmin) {
            appendOutput('login', 'Introdu username-ul + parola.', false);
        } else if (command.startsWith('login ') && !isAdmin) {
            login(command);
        } else if (command === 'exit' && isAdmin) {
            isAdmin = false;  // Ieși din contul admin
            appendOutput(command, 'Ai ieșit din contul admin.', false);
        } else if (!isAdmin && (command === 'deadline' || command.startsWith('deadline create ') || command.startsWith('deadline delete '))) {
            appendOutput(command, 'Nu ai acces la această comandă.', true);
        } else if (command === 'deadline') {
            listDeadlines();
        } else if (command.startsWith('deadline create ')) {
            createDeadline(command);
        } else if (command.startsWith('deadline delete ')) {
            deleteDeadline(command);
        } else {
            appendOutput(command, `Comandă necunoscută: ${command}`, true);
        }
    };

    // Funcția pentru login
    const login = (command) => {
        const parts = command.split(' ');
        const username = parts[1];  // Username-ul este al doilea element
        const password = parts[2];  // Parola este al treilea element
        
        // Verifică dacă userul și parola sunt corecte
        if (username === 'sarcasm' && password === 'asd123') {
            isAdmin = true;
            appendOutput('login', 'Logare reușită! Ai acum acces la comenzile admin.', false);
        } else {
            appendOutput('login', 'Username sau parolă incorecte.', true);
        }
    };

    // Afișează toate deadline-urile
    const listDeadlines = () => {
        if (deadlines.length === 0) {
            appendOutput('deadline', 'Nu ai niciun deadline creat.', false);
            return;
        }

        deadlines.forEach(deadline => {
            const timeRemaining = calculateTimeRemaining(deadline.date, deadline.time);
            appendOutput('deadline', `ID: ${deadline.id} - Data: ${deadline.date} - Ora: ${deadline.time} - Descriere: ${deadline.description}`, false);
        });
    };

    // Creează un nou deadline
    const createDeadline = (command) => {
        const parts = command.split(' ');
        const id = parts[2];  // Identificatorul deadline-ului
        const day = parts[3];  // Ziua
        const month = parts[4]; // Luna
        const year = parts[5]; // Anul
        const date = `${day}/${month}/${year}`; // Formatează data
        const time = parts[6]; // Ora deadline-ului
        const description = parts.slice(7).join(' '); // Descrierea deadline-ului

        const newDeadline = {
            id,
            date,
            time,
            description,
        };

        deadlines.push(newDeadline);
        localStorage.setItem('deadlines', JSON.stringify(deadlines));  // Salvează deadline-urile în localStorage
        appendOutput('deadline create', `Deadline creat cu succes: ID ${id} - ${description}`, false);
    };

    // Șterge un deadline
    const deleteDeadline = (command) => {
        const parts = command.split(' ');
        const id = parts[2];

        const index = deadlines.findIndex(deadline => deadline.id == id);
        if (index === -1) {
            appendOutput('deadline delete', `Deadline cu ID-ul ${id} nu a fost găsit.`, true);
            return;
        }

        deadlines.splice(index, 1);
        localStorage.setItem('deadlines', JSON.stringify(deadlines));  // Actualizează deadline-urile în localStorage
        appendOutput('deadline delete', `Deadline-ul cu ID-ul ${id} a fost șters.`, false);
    };

    // Calculează timpul rămas până la deadline
    const calculateTimeRemaining = (date, time) => {
        const deadlineDate = new Date(`${date} ${time}`);
        const now = new Date();
        const timeDifference = deadlineDate - now;

        if (timeDifference <= 0) {
            return 'Terminat';
        }

        const hours = Math.floor(timeDifference / 1000 / 60 / 60);
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours} ore și ${minutes} minute`;
    };

    // Ascultă pentru comenzi
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            handleCommand(command);
            commandHistory.push(command);
            commandIndex = commandHistory.length;
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            if (commandHistory.length > 0) {
                input.value = commandHistory[commandIndex - 1] || '';
                commandIndex = Math.max(commandIndex - 1, 0);
            }
        } else if (e.key === 'ArrowDown') {
            if (commandHistory.length > 0) {
                input.value = commandHistory[commandIndex + 1] || '';
                commandIndex = Math.min(commandIndex + 1, commandHistory.length);
            }
        }
    });

    // Auto-focus pe input
    terminal.addEventListener('click', () => {
        input.focus();
    });

    // Afișează mesajul de început în terminal
    appendOutput(' ', 'Need some help?, type "help"');

    // Nu mai apelăm listDeadlines automat la reîncărcarea paginii
});
