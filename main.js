// =================================================================
// ESTRUTURA E VARIÁVEIS GLOBAIS
// =================================================================

// Variáveis DOM (Elementos HTML)
const seivaValueEl = document.getElementById('seiva-value');
const baseHpEl = document.getElementById('base-hp');
const waveNumberEl = document.getElementById('wave-number');
const gridContainerEl = document.getElementById('grid-container');
const plantOptionsEl = document.getElementById('plant-options');
const toolsContainerEl = document.getElementById('tools-container');

// Variáveis de Estado do Jogo
let gameState = {
    seiva: 100,
    baseHP: 10,
    wave: 1,
    gameLoopInterval: null, 
    grid: [], 
    animais: [], 
    plantas: [], 
    cellSize: 80, 
    rows: 6, 
    cols: 10, 
    selectedPlant: null, 
};

// =================================================================
// DADOS DAS UNIDADES
// =================================================================

// 🌳 Definição das Plantas (apenas as iniciais para teste)
const PLANT_TEMPLATES = {
    girasol: { 
        name: 'Girasol 🌻', type: 'resource', cost: 50, hp: 5, rarity: 'Comum I',
        generateRate: 5000, 
        seivaPerTick: 25,
        attackDamage: 0
    },
    espeto: { 
        name: 'Espeto 🌱', type: 'damage', cost: 100, hp: 10, rarity: 'Comum I',
        attackRate: 1000, 
        attackDamage: 5
    },
    // Aqui virão as outras 50+ plantas!
};

const ANIMAL_TEMPLATES = {
    // Animais serão adicionados quando começarmos o spawn
    coelho: { 
        name: 'Coelho 🐇', hp: 10, speed: 0.5, rarity: 'Comum I', attackDamage: 1
    },
};


// =================================================================
// FUNÇÕES DE INICIALIZAÇÃO E UI
// =================================================================

function updateUI() {
    seivaValueEl.textContent = gameState.seiva;
    baseHpEl.textContent = gameState.baseHP;
    waveNumberEl.textContent = gameState.wave;
}

function createGrid() {
    gridContainerEl.style.display = 'grid';
    gridContainerEl.style.gridTemplateColumns = `repeat(${gameState.cols}, ${gameState.cellSize}px)`;
    gridContainerEl.style.gridTemplateRows = `repeat(${gameState.rows}, ${gameState.cellSize}px)`;
    
    for (let r = 0; r < gameState.rows; r++) {
        gameState.grid[r] = [];
        for (let c = 0; c < gameState.cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            cell.addEventListener('click', handlePlanting);

            gridContainerEl.appendChild(cell);
            
            gameState.grid[r][c] = {
                plant: null, 
                element: cell
            };
        }
    }
}

function renderPlantOptions() {
    plantOptionsEl.innerHTML = '';
    for (const key in PLANT_TEMPLATES) {
        const plantData = PLANT_TEMPLATES[key];
        
        const button = document.createElement('button');
        button.classList.add('plant-btn');
        button.dataset.plantKey = key;
        button.innerHTML = `${plantData.name} (${plantData.cost} 💧) - ${plantData.rarity}`;
        
        button.addEventListener('click', () => {
            selectPlant(key);
        });
        
        plantOptionsEl.appendChild(button);
    }
}

function selectPlant(key) {
    if (gameState.seiva < PLANT_TEMPLATES[key].cost) {
        alert("Seiva insuficiente para comprar " + PLANT_TEMPLATES[key].name);
        return;
    }
    
    gameState.selectedPlant = key;
    console.log(`Planta selecionada: ${PLANT_TEMPLATES[key].name}`);

    // Remove dica anterior e adiciona a nova
    const oldTip = document.getElementById('plant-tip');
    if (oldTip) oldTip.remove();
    toolsContainerEl.insertAdjacentHTML('beforeend', `<p id="plant-tip" style="color:#009688; font-weight:bold;">-> Plantando: ${PLANT_TEMPLATES[key].name}</p>`);
}


// =================================================================
// LÓGICA DO JOGO (Plantio)
// =================================================================

function handlePlanting(event) {
    const cell = event.currentTarget;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (gameState.selectedPlant) {
        const key = gameState.selectedPlant;
        const template = PLANT_TEMPLATES[key];

        if (gameState.grid[row][col].plant === null) {
            if (gameState.seiva >= template.cost) {
                gameState.seiva -= template.cost;

                const newPlant = {
                    ...template, 
                    id: Date.now() + Math.random(),
                    row: row,
                    col: col,
                    currentHp: template.hp,
                    element: document.createElement('span')
                };

                // Renderiza e posiciona
                newPlant.element.textContent = newPlant.name.slice(-2); 
                newPlant.element.classList.add('plant-unit');
                newPlant.element.title = `${newPlant.name} - HP: ${newPlant.currentHp}`;

                cell.appendChild(newPlant.element);

                // Atualiza o estado
                gameState.grid[row][col].plant = newPlant;
                gameState.plantas.push(newPlant);
                
                // Limpa seleção
                gameState.selectedPlant = null;
                const tip = document.getElementById('plant-tip');
                if (tip) tip.remove();

                updateUI();
            }
        }
    }
}


// =================================================================
// INÍCIO DO JOGO
// =================================================================

function initializeGame() {
    updateUI();
    createGrid();
    renderPlantOptions();
    
    // Adiciona CSS que precisa ser injetado pelo JS (relativo ao grid)
    const style = document.createElement('style');
    style.textContent = `
        .grid-cell {
            border: 1px dashed #a5d6a7;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2em;
            cursor: pointer;
            width: ${gameState.cellSize}px; /* Garante o tamanho da célula */
            height: ${gameState.cellSize}px;
        }
        .plant-unit {
            font-size: 2em;
            cursor: default;
        }
    `;
    document.head.appendChild(style);

    console.log("Jogo Plants vs. Animals inicializado!");
    
    // Futuramente: Inicia o loop principal do jogo
}

// Inicia o jogo quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', initializeGame);