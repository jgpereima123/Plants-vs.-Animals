document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. VARIÁVEIS DO JOGO E ESTADOS INICIAIS
    // -------------------------------------------------------------------------

    let seiva = 100;
    let baseHP = 10;
    let waveNumber = 1;
    let selectedTool = 'none'; // 'shovel', 'pesticide', 'fertilizer', ou 'none'
    let selectedPlant = null; // ID da planta selecionada

    const GRID_SIZE = 5; // 5x5 Grid
    const TILE_SIZE = 80; // Tamanho em pixels para visualização

    // Elementos do DOM (Interface)
    const seivaValueEl = document.getElementById('seiva-value');
    const baseHPEl = document.getElementById('base-hp');
    const waveNumberEl = document.getElementById('wave-number');
    const gridContainer = document.getElementById('grid-container');
    const plantOptionsContainer = document.getElementById('plant-options');
    const toolButtons = document.querySelectorAll('.tool-btn');
    const gameArea = document.getElementById('game-area');

    // Estado do Jogo (Onde as plantas e animais estão)
    const gridState = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

    // Definições de Plantas e Animais
    const PLANTS = {
        'girassol': { name: 'Girassol 🌻', cost: 50, seivaPerTick: 10, hp: 50, symbol: '🌻' },
        'cacto': { name: 'Cacto 🌵', cost: 150, attackDamage: 20, hp: 100, symbol: '🌵' },
        'carnivora': { name: 'Planta Carnívora 🪴', cost: 300, attackDamage: 50, hp: 150, symbol: '🪴' }
    };

    const ENEMIES = [
        { name: 'Coelho 🐇', hp: 30, damage: 1, speed: 1, symbol: '🐇' },
        { name: 'Lobo 🐺', hp: 100, damage: 3, speed: 2, symbol: '🐺' },
        { name: 'Javali 🐗', hp: 200, damage: 5, speed: 1, symbol: '🐗' }
    ];

    // -------------------------------------------------------------------------
    // 2. FUNÇÕES DE UTILIDADE E INTERFACE
    // -------------------------------------------------------------------------

    // Atualiza o display de recursos
    function updateResourceDisplay() {
        seivaValueEl.textContent = seiva;
        baseHPEl.textContent = baseHP;
        waveNumberEl.textContent = waveNumber;

        // Desabilita/habilita botões de plantas
        document.querySelectorAll('.plant-btn').forEach(btn => {
            const plantId = btn.dataset.plant;
            const plantCost = PLANTS[plantId].cost;
            btn.disabled = seiva < plantCost;
        });

        // Desabilita/habilita botões de ferramentas caras
        document.getElementById('tool-pesticide').disabled = seiva < 100;
        document.getElementById('tool-fertilizer').disabled = seiva < 300;
    }

    // Cria os botões de plantas na barra lateral
    function createPlantOptions() {
        plantOptionsContainer.innerHTML = '';
        for (const id in PLANTS) {
            const plant = PLANTS[id];
            const btn = document.createElement('button');
            btn.id = `plant-${id}`;
            btn.className = 'plant-btn';
            btn.dataset.plant = id;
            btn.innerHTML = `${plant.symbol} ${plant.name} - ${plant.cost}💧`;
            btn.addEventListener('click', () => selectPlant(id));
            plantOptionsContainer.appendChild(btn);
        }
    }

    // Cria o grid do jogo (o "Jardim")
    function createGrid() {
        gridContainer.innerHTML = '';
        
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => handleCellClick(row, col));
                gridContainer.appendChild(cell);
            }
        }
    }

    // Função de Seleção de Planta
    function selectPlant(plantId) {
        if (selectedPlant === plantId) {
            selectedPlant = null; // Desseleciona se já estiver selecionado
        } else {
            selectedPlant = plantId;
            selectedTool = 'none'; // Prioriza a plantação sobre a ferramenta
        }
        highlightSelection();
    }

    // Função de Seleção de Ferramenta
    function selectTool(toolId) {
        if (selectedTool === toolId) {
            selectedTool = 'none';
        } else {
            selectedTool = toolId;
            selectedPlant = null; // Prioriza a ferramenta
        }
        highlightSelection();
    }

    // Destaca a planta ou ferramenta selecionada na interface
    function highlightSelection() {
        // Remove destaque de todas as plantas
        document.querySelectorAll('.plant-btn').forEach(btn => {
            btn.style.backgroundColor = '#4db6ac';
            btn.style.border = 'none';
        });

        // Remove destaque de todas as ferramentas
        toolButtons.forEach(btn => {
            btn.style.backgroundColor = '#4db6ac';
            btn.style.border = 'none';
        });

        // Adiciona destaque ao item selecionado
        if (selectedPlant) {
            const btn = document.getElementById(`plant-${selectedPlant}`);
            if (btn) btn.style.border = '3px solid #ff9800'; // Destaque Laranja
        } else if (selectedTool !== 'none') {
            const btn = document.getElementById(`tool-${selectedTool}`);
            if (btn) btn.style.border = '3px solid #ff9800'; // Destaque Laranja
        }
    }

    // -------------------------------------------------------------------------
    // 3. LÓGICA DO JOGO (INTERAÇÃO NO GRID)
    // -------------------------------------------------------------------------

    function handleCellClick(row, col) {
        const cell = gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const item = gridState[row][col];
        
        // Pega o custo da ferramenta do data-cost (se existir)
        let toolCost = 0;
        if (selectedTool !== 'none' && selectedTool !== 'shovel') {
            toolCost = parseInt(document.getElementById(`tool-${selectedTool}`).dataset.cost);
        }


        if (selectedPlant) {
            // Lógica de Plantar
            if (!item) {
                placePlant(row, col, selectedPlant);
                selectedPlant = null; // Limpa a seleção após plantar
                highlightSelection();
            }
        } else if (selectedTool !== 'none') {
            // Lógica da Ferramenta
            
            if (seiva < toolCost) {
                alert('Seiva insuficiente para usar esta ferramenta!');
                selectedTool = 'none'; 
                highlightSelection();
                updateResourceDisplay();
                return;
            }
            
            applyTool(row, col, cell, item, toolCost);
            
        } else if (item && item.type === 'plant') {
            // Lógica de Interação (ex: coletar seiva do girassol)
            if (item.id === 'girassol') {
                collectSeiva(row, col, item);
            }
        }
        updateResourceDisplay();
    }

    function placePlant(row, col, plantId) {
        const plantDef = PLANTS[plantId];
        if (seiva >= plantDef.cost) {
            seiva -= plantDef.cost;
            const newPlant = {
                type: 'plant',
                id: plantId,
                hp: plantDef.hp,
                symbol: plantDef.symbol,
                seivaTimer: 0, // Apenas para Girassol
                attackTimer: 0 // Apenas para Plantas de ataque
            };
            gridState[row][col] = newPlant;
            updateCell(row, col, newPlant);
            console.log(`Plantou ${plantDef.name} em (${row}, ${col})`);
        } else {
            alert('Seiva insuficiente!');
        }
    }

    function applyTool(row, col, cell, item, cost) {
        

        switch (selectedTool) {
            case 'shovel': // Pá (Gratuita) - Remove planta
                if (item && item.type === 'plant') {
                    gridState[row][col] = null;
                    updateCell(row, col, null);
                    console.log('Planta removida com a Pá.');
                    seiva += Math.floor(PLANTS[item.id].cost / 2); // Devolve metade
                }
                break;
            case 'pesticide': // Pesticida - Dano de área (futuro)
                 seiva -= cost;
                // Por enquanto, apenas um alerta visual
                cell.style.backgroundColor = '#ffcdd2';
                setTimeout(() => cell.style.backgroundColor = '#f1f8e9', 500);
                console.log('Pesticida aplicado.');
                break;
            case 'fertilizer': // Fertilizante - Aumenta HP da planta
                 seiva -= cost;
                if (item && item.type === 'plant') {
                    item.hp += 50; // Aumenta HP
                    updateCell(row, col, item);
                    console.log('Fertilizante aplicado. HP aumentado.');
                }
                break;
        }
        selectedTool = 'none'; // Limpa a seleção
        highlightSelection();
    }

    function collectSeiva(row, col, plant) {
        if (plant.id === 'girassol') {
            // Por enquanto, apenas coleta um valor fixo. A geração será no Game Loop.
            seiva += 5;
            // Efeito visual na célula
            const cell = gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.style.border = '3px solid #ffeb3b';
            setTimeout(() => cell.style.border = '1px solid #c8e6c9', 300);
            console.log('Seiva coletada do girassol.');
        }
    }

    // Atualiza a representação visual da célula no DOM
    function updateCell(row, col, item) {
        const cell = gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        cell.innerHTML = '';
        cell.style.backgroundColor = '#f1f8e9'; // Cor de fundo padrão

        if (item) {
            cell.textContent = item.symbol;
            // Exibe a vida como texto pequeno abaixo do símbolo
            const hpText = document.createElement('small');
            hpText.textContent = `${item.hp} HP`;
            hpText.style.position = 'absolute';
            hpText.style.fontSize = '0.7em';
            hpText.style.bottom = '5px';
            hpText.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            hpText.style.borderRadius = '3px';
            cell.appendChild(hpText);

            if (item.type === 'plant') {
                cell.style.color = '#2e8b57'; // Verde
            } else if (item.type === 'enemy') {
                cell.style.color = '#d32f2f'; // Vermelho
            }
        }
    }


    // -------------------------------------------------------------------------
    // 4. INICIALIZAÇÃO DO JOGO
    // -------------------------------------------------------------------------

    // Adiciona event listeners aos botões de ferramenta
    toolButtons.forEach(btn => {
        const toolId = btn.id.replace('tool-', '');
        btn.addEventListener('click', () => selectTool(toolId));
    });

    // Inicia o jogo
    function initGame() {
        createGrid(); // Desenha o tabuleiro
        createPlantOptions(); // Cria os botões da loja
        updateResourceDisplay(); // Atualiza os valores iniciais
        // runGameLoop(); // A lógica do loop principal virá depois
    }

    initGame();
});
