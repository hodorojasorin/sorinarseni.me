// terminal.js

document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('[data-terminal="input"]');
    const output = document.querySelector('[data-terminal="output"]');
    const terminal = document.querySelector('[data-terminal="ui"]');
    const timeDisplay = document.getElementById('time');  // Adaugă referința la ora din HTML
    let commandHistory = [];
    let commandIndex = 0;

    // Updatează ora
    const updateTime = () => {
        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    };
    setInterval(updateTime, 1000); // Actualizează ora la fiecare secundă

    // Comanda de a curăța terminalul
    const handleCommand = (command) => {
        if (command === 'clear') {
            output.innerHTML = '';
        } else {
            appendOutput(command, `Command not recognized: ${command}`, true);
        }
    };

    // Funcția pentru a adăuga output-ul
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
});
