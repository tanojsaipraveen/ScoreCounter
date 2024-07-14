function startGame() {
    const numberOfPlayers = prompt("Enter number of players:");
    if (!numberOfPlayers || isNaN(numberOfPlayers) || numberOfPlayers <= 0) {
        alert("Please enter a valid number of players.");
        return;
    }

    const playerNames = [];
    for (let i = 0; i < numberOfPlayers; i++) {
        let playerName = prompt(`Enter name for Player ${i + 1}:`);
        if (!playerName) {
            playerName = `Player ${i + 1}`;
        }
        playerNames.push(playerName);
    }

    const savedData = localStorage.getItem('gameData');
    document.getElementById("title").style.display = 'inline';
    document.getElementById("finishButton").style.display = 'inline';
    
    if (savedData) {
        
        const { playerNames: savedPlayerNames, data } = JSON.parse(savedData);
        if (arraysEqual(playerNames, savedPlayerNames)) {
            createTable(playerNames, data);
        } else {
            createTable(playerNames, null);
        }
    } else {
        createTable(playerNames, null);
    }

    document.getElementById('startButton').style.display = 'none';
    document.getElementById('startdiv').style.height = '0vh';
    document.getElementById('maintitle').style.display = 'none';
    
}

function createTable(playerNames, data) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.setAttribute('id', 'dynamicTable');
    table.setAttribute('border', '1');
    tableContainer.appendChild(table);

    const headerRow = document.createElement('tr');
    const indexHeader = document.createElement('th');
    indexHeader.innerText = '#';
    headerRow.appendChild(indexHeader);

    for (let playerName of playerNames) {
        const th = document.createElement('th');
        th.innerText = playerName;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    if (data) {
        for (let row of data) {
            addRow(tbody, row.index, row.scores);
        }
    } else {
        addRow(tbody, 1, new Array(playerNames.length).fill(''));
    }

    const tfoot = document.createElement('tfoot');
    const sumRow = document.createElement('tr');
    const totalFooter = document.createElement('td');
    totalFooter.innerText = 'Total';
    sumRow.appendChild(totalFooter);

    for (let i = 0; i < playerNames.length; i++) {
        const td = document.createElement('td');
        const sumCell = document.createElement('span');
        sumCell.setAttribute('id', `sumPlayer${i}`);
        sumCell.innerText = '0';
        td.appendChild(sumCell);
        sumRow.appendChild(td);
    }
    tfoot.appendChild(sumRow);
    table.appendChild(tfoot);

    tableContainer.appendChild(table);

    updateSums(); // Update sums initially
}

function addRow(tbody, index, scores) {
    const newRow = document.createElement('tr');

    const indexCell = document.createElement('td');
    indexCell.innerText = index;
    newRow.appendChild(indexCell);

    for (let score of scores) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-cell';
        input.pattern = '\\d*';
        input.addEventListener('input', function(event) {
            this.value = this.value.replace(/\D/g, '');
        });

        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                moveToNextCell(this);
            }
        });

        input.value = score;
        cell.appendChild(input);
        newRow.appendChild(cell);
    }

    tbody.appendChild(newRow);

    newRow.addEventListener('input', function(event) {
        if (event.target.classList.contains('input-cell')) {
            validateInputs(event.target);
        }
    });
}

function moveToNextCell(currentInput) {
    const inputs = document.querySelectorAll('.input-cell');
    const currentIndex = Array.prototype.indexOf.call(inputs, currentInput);
    const nextInput = inputs[currentIndex + 1];

    if (nextInput) {
        nextInput.focus();
    }
}

function validateInputs(input) {
    const row = input.parentNode.parentNode;
    const inputs = row.getElementsByClassName('input-cell');
    let allValid = true;

    for (let input of inputs) {
        const value = input.value.trim();
        if (value === '' || isNaN(value) || !Number.isInteger(Number(value))) {
            allValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    }

    if (allValid && row === row.parentNode.lastElementChild) {
        const table = document.getElementById('dynamicTable');
        const tbody = table.getElementsByTagName('tbody')[0];
        const index = tbody.getElementsByTagName('tr').length + 1;
        addRow(tbody, index, new Array(inputs.length).fill(''));
    }

    updateSums();
}

// Function to update sums in the footer
function updateSums() {
    const table = document.getElementById('dynamicTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');
    const footerCells = table.getElementsByTagName('tfoot')[0].getElementsByTagName('td');
    const playerCount = document.getElementById('dynamicTable').rows[0].cells.length - 1;

    // Initialize array to hold player sums
    let sums = new Array(playerCount).fill(0);

    // Iterate through each row (excluding header and footer)
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('input');
        
        // Iterate through each cell in the row
        for (let j = 0; j < playerCount; j++) {
            const input = cells[j]; // Get input element
            const value = input ? parseFloat(input.value) || 0 : 0; // Parse cell value as float, default to 0 if NaN or input doesn't exist
            sums[j] += value; // Add cell value to corresponding sum
        }
    }

    // Update footer cells with calculated sums rounded to nearest integer
    for (let k = 0; k < playerCount; k++) {
        footerCells[k + 1].innerText = Math.round(sums[k]); // Display sum rounded to nearest integer
    }

    // Save data to local storage
    saveData();
}

// Function to save data to local storage
function saveData() {
    const table = document.getElementById('dynamicTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');
    const playerCount = document.getElementById('dynamicTable').rows[0].cells.length - 1;

    // Prepare data array
    const data = [];

    // Iterate through each row (excluding header and footer)
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('input');
        const row = {
            index: i + 1, // Use loop index for row index
            scores: []
        };

        // Iterate through each cell in the row
        for (let j = 0; j < playerCount; j++) { // Iterate from 0 to playerCount-1
            const input = cells[j]; // Get input element
            const value = input ? input.value.trim() : ''; // Get input value or empty string if input doesn't exist
            row.scores.push(value); // Add score to row array
        }

        data.push(row); // Add row object to data array
    }

    // Prepare gameData object
    const gameData = {
        playerNames: getPlayerNames(),
        data: data
    };

    // Save to local storage
    localStorage.setItem('gameData', JSON.stringify(gameData));
}


function getPlayerNames() {
    const table = document.getElementById('dynamicTable');
    const headerRow = table.rows[0];
    const playerNames = [];

    for (let i = 1; i < headerRow.cells.length; i++) {
        playerNames.push(headerRow.cells[i].innerText);
    }

    return playerNames;
}

function clearData() {
    localStorage.removeItem('gameData');
    location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', startGame);

    const savedData = localStorage.getItem('gameData');
    if (savedData) {
        const { playerNames, data } = JSON.parse(savedData);
        createTable(playerNames, data);
        startButton.style.display = 'none';
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('startdiv').style.height = '0vh';
        document.getElementById('maintitle').style.display = 'none';
        document.getElementById("title").style.display = 'inline';
        document.getElementById("finishButton").style.display = 'inline';
    }
    
});

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
