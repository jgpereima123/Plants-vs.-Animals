// =========================================================
// VARIÁVEIS DE ESTADO DO JOGO
// =========================================================

let hpMaxInicial = 100;
let hpJogador = hpMaxInicial;
let hpComputador = hpMaxInicial;
let moedas = 0;

// Upgrades da Loja
let danoBonusUpgrade = 0;
let hpBonusUpgrade = 0;
let vacuuDesbloqueado = false;
let escudoLuzCount = 0;

// Desafio Diário
let desafioStatus = {
    tipo: 'Fogo',
    alvo: 'Água',
    necessario: 5,
    progresso: 0,
    concluido: false
};

// =========================================================
// CONFIGURAÇÕES DE ELEMENTOS E DANOS
// =========================================================

const escolhasPC = ['fogo', 'agua', 'planta', 'vento', 'tempestade', 'pedra', 'lava', 'gelo', 'luz', 'vacuo', 'sombra']; 

const emojis = {
    fogo: '🔥 Fogo', agua: '💧 Água', planta: '🌱 Planta', vento: '🌬️ Vento',
    tempestade: '⛈️ Tempestade', pedra: '🪨 Pedra', lava: '🌋 Lava', gelo: '❄️ Gelo',
    luz: '✨ Luz', vacuo: '⚫ Vácuo', sombra: '🌑 Sombra'
};

const DANO_BASE_ELEMENTOS = {
    fogo: 25, agua: 20, planta: 15, vento: 15, tempestade: 30,
    pedra: 20, lava: 35, gelo: 25, luz: 30, vacuo: 40, sombra: 35
};

// =========================================================
// ITENS DA LOJA
// =========================================================

const ITENS_LOJA = [
    { id: 'dano', nome: 'Aumento de Dano (+5)', custo: 50, tipo: 'dano', valor: 5 },
    { id: 'hp', nome: 'Aumento de HP (+25)', custo: 75, tipo: 'hp', valor: 25 },
    { id: 'vacuo', nome: 'Desbloquear Vácuo', custo: 200, tipo: 'desbloqueio', valor: 'vacuo' },
    { id: 'escudo', nome: 'Escudo de Luz (Uso Único)', custo: 30, tipo: 'escudo', valor: 1 }
];

// =========================================================
// FUNÇÕES DE UTILIDADE E INTERFACE
// =========================================================

function atualizarStatus() {
    // Atualiza Barras de HP
    document.getElementById('hp-jogador').style.width = `${(hpJogador / hpMaxInicial) * 100}%`;
    document.getElementById('hp-computador').style.width = `${(hpComputador / hpMaxInicial) * 100}%`;

    // Atualiza Valores Numéricos
    document.getElementById('hp-jogador-valor').textContent = Math.max(0, hpJogador);
    document.getElementById('hp-computador-valor').textContent = Math.max(0, hpComputador);
    document.getElementById('moedas-valor').textContent = moedas;
    
    // Atualiza Status da Loja
    if (document.getElementById('loja-moedas-valor')) {
        document.getElementById('loja-moedas-valor').textContent = moedas;
        document.getElementById('loja-dano-bonus').textContent = danoBonusUpgrade;
        document.getElementById('loja-hp-bonus').textContent = hpBonusUpgrade;
        atualizarItensLoja();
    }
}

function exibirResultado(mensagem) {
    document.getElementById('resultado').textContent = mensagem;
}

function getEscolhaComputador() {
    const elementosDisponiveis = escolhasPC.filter(e => e !== 'vacuo' || vacuuDesbloqueado);
    const indice = Math.floor(Math.random() * elementosDisponiveis.length);
    return elementosDisponiveis[indice];
}

// =========================================================
// FUNÇÃO DE DANO (LÓGICA DO JOGO)
// =========================================================

function calcularDano(atacante, defensor) {
    if (atacante === defensor) {
        return 0; // Empate: Sem dano
    }

    // Regras de Vitória: [ATACANTE, DEFENSOR]
    const regrasVitoria = [
        // FUNDAMENTAIS
        ['fogo', 'planta'], ['fogo', 'gelo'],
        ['agua', 'fogo'], ['agua', 'pedra'],
        ['planta', 'agua'], ['planta', 'pedra'],
        ['vento', 'tempestade'], ['vento', 'planta'],

        // PODER E DESTRUIÇÃO
        ['tempestade', 'agua'], ['tempestade', 'lava'],
        ['pedra', 'vento'], ['pedra', 'lava'],
        ['lava', 'planta'], ['lava', 'gelo'],
        ['gelo', 'vento'], ['gelo', 'tempestade'],

        // LUZ, VÁCUO E SOMBRA (SUPREMAS)
        ['luz', 'tempestade'], ['luz', 'fogo'], ['luz', 'gelo'], ['luz', 'pedra'],
        ['vacuo', 'fogo'], ['vacuo', 'agua'], ['vacuo', 'planta'], ['vacuo', 'vento'], ['vacuo', 'gelo'], ['vacuo', 'lava'], ['vacuo', 'sombra'],
        ['sombra', 'luz'], ['sombra', 'pedra'], ['sombra', 'tempestade'], ['sombra', 'lava'],
    ];

    const atacanteVence = regrasVitoria.some(regra => regra[0] === atacante && regra[1] === defensor);

    if (atacanteVence) {
        // ATACANTE VENCE: Retorna o dano base do elemento
        let dano = DANO_BASE_ELEMENTOS[atacante] || 10;
        return dano; 
    } else {
        // ATACANTE PERDE: Retorna dano negativo (o Defensor venceu)
        let danoDefensor = DANO_BASE_ELEMENTOS[defensor] || 10;
        return -danoDefensor; 
    }
}

// =========================================================
// FUNÇÃO PRINCIPAL DE RODADA
// =========================================================

function jogarRodada(escolhaJogador) {
    if (hpJogador <= 0 || hpComputador <= 0) return;

    const escolhaComputador = getEscolhaComputador();
    
    // 1. Cálculo do Dano Base (retorna dano bruto ou negativo)
    let danoAoComputador = calcularDano(escolhaJogador, escolhaComputador);
    let danoAoJogador = calcularDano(escolhaComputador, escolhaJogador);

    // 2. Aplicação do Bônus de Dano (SÓ no que o Jogador CAUSA)
    if (danoAoComputador > 0) {
        danoAoComputador += danoBonusUpgrade; 
    }

    // 3. Aplicação do Escudo de Luz (Se o PC vencer o jogador)
    let mensagemEscudo = "";
    if (danoAoJogador < 0 && escudoLuzCount > 0) {
        danoAoJogador = 0; // Nenhuma vida perdida
        escudoLuzCount--;
        mensagemEscudo = " Seu Escudo de Luz absorveu o ataque!";
    }

    // 4. Determinação do Resultado
    let resultadoRodada = '';
    let moedasGanhas = 0;

    if (danoAoComputador > 0) {
        resultadoRodada = `VITÓRIA! ${emojis[escolhaJogador]} vence ${emojis[escolhaComputador]}. Causa ${danoAoComputador} de dano!`;
        moedasGanhas = 5;
    } else if (danoAoJogador < 0) {
        let danoCausadoPC = Math.abs(danoAoJogador);
        resultadoRodada = `DERROTA! ${emojis[escolhaComputador]} vence ${emojis[escolhaJogador]}. Você perde ${danoCausadoPC} de HP!`;
        moedasGanhas = 1;
        danoAoJogador = danoCausadoPC; // Converte para positivo para subtrair do HP
    } else {
        resultadoRodada = `EMPATE! ${emojis[escolhaJogador]} anula ${emojis[escolhaComputador]}.`;
        moedasGanhas = 2;
        danoAoJogador = 0; // Garante 0 dano
    }
    
    // 5. Atualização de HP e Moedas
    hpComputador -= Math.max(0, danoAoComputador); 
    hpJogador -= Math.max(0, danoAoJogador);
    moedas += moedasGanhas;

    // 6. Atualiza Interface e Desafio
    document.getElementById('escolha-computador-display').textContent = emojis[escolhaComputador];
    exibirResultado(resultadoRodada + mensagemEscudo + ` Ganha ${moedasGanhas} Moedas.`);
    atualizarStatus();
    verificarFimDeJogo();
    
    // 7. Checagem do Desafio Diário
    if (danoAoComputador > 0 && escolhaJogador === desafioStatus.tipo && escolhaComputador === desafioStatus.alvo) {
        atualizarProgressoDesafio();
    }
}

function verificarFimDeJogo() {
    if (hpJogador <= 0) {
        exibirResultado(`GAME OVER! Você foi derrotado. Atualize para tentar novamente.`);
        desativarBotoes();
    } else if (hpComputador <= 0) {
        exibirResultado(`VITÓRIA FINAL! Você derrotou o Computador! Ganha 50 Moedas Bônus!`);
        moedas += 50;
        atualizarStatus();
        desativarBotoes();
    }
}

function desativarBotoes() {
    document.querySelectorAll('.btn-escolha').forEach(btn => btn.disabled = true);
    document.getElementById('reiniciar-jogo').disabled = false;
}

// =========================================================
// FUNÇÕES DA LOJA
// =========================================================

function atualizarItensLoja() {
    const lojaDiv = document.getElementById('loja-itens');
    lojaDiv.innerHTML = '';

    ITENS_LOJA.forEach(item => {
        // Se Vácuo já desbloqueado, não mostrar novamente
        if (item.id === 'vacuo' && vacuuDesbloqueado) return;

        const div = document.createElement('div');
        div.className = 'item-loja';
        div.innerHTML = `
            <p>${item.nome} (${item.tipo === 'escudo' ? escudoLuzCount : ''})</p>
            <button class="btn-comprar" data-item-id="${item.id}" ${moedas < item.custo ? 'disabled' : ''}>
                Comprar (${item.custo} M.E.)
            </button>
        `;
        lojaDiv.appendChild(div);
    });

    // Adiciona o listener DEPOIS que os botões são criados
    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.onclick = () => comprarItem(btn.getAttribute('data-item-id'));
    });
}

function comprarItem(itemId) {
    const item = ITENS_LOJA.find(i => i.id === itemId);

    if (!item || moedas < item.custo) return;

    moedas -= item.custo;

    switch (item.tipo) {
        case 'dano':
            danoBonusUpgrade += item.valor;
            break;
        case 'hp':
            hpBonusUpgrade += item.valor;
            hpMaxInicial += item.valor; // Aumenta o HP máximo
            hpJogador += item.valor; // Cura para o novo máximo
            break;
        case 'desbloqueio':
            if (item.valor === 'vacuo') {
                vacuuDesbloqueado = true;
                document.getElementById('vacuo').style.display = 'inline-block';
                // Remove o item da loja para não ser comprado novamente
                ITENS_LOJA.find(i => i.id === 'vacuo').id = 'vacuo_comprado'; 
            }
            break;
        case 'escudo':
            escudoLuzCount += item.valor;
            break;
    }

    atualizarStatus();
}

// =========================================================
// FUNÇÕES DO DESAFIO DIÁRIO
// =========================================================

function atualizarInterfaceDesafio() {
    document.getElementById('desafio-texto').textContent = `Vença ${desafioStatus.necessario} rodadas de ${emojis[desafioStatus.tipo]} contra ${emojis[desafioStatus.alvo]}.`;
    document.getElementById('desafio-progresso').textContent = `${desafioStatus.progresso}/${desafioStatus.necessario}`;
    
    const btnResgatar = document.getElementById('resgatar-recompensa');
    if (desafioStatus.progresso >= desafioStatus.necessario && !desafioStatus.concluido) {
        btnResgatar.disabled = false;
    } else {
        btnResgatar.disabled = true;
    }
}

function atualizarProgressoDesafio() {
    if (desafioStatus.progresso < desafioStatus.necessario) {
        desafioStatus.progresso++;
        atualizarInterfaceDesafio();
    }
}

function resgatarRecompensa() {
    if (desafioStatus.progresso >= desafioStatus.necessario && !desafioStatus.concluido) {
        moedas += 100;
        desafioStatus.concluido = true;
        document.getElementById('resgatar-recompensa').disabled = true;
        document.getElementById('resgatar-recompensa').textContent = "Recompensa Resgatada!";
        atualizarStatus();
    }
}

// =========================================================
// INICIALIZAÇÃO E EVENT LISTENERS
// =========================================================

function inicializarBotoes() {
    document.querySelectorAll('.btn-escolha').forEach(btn => {
        btn.onclick = () => jogarRodada(btn.id);
        btn.disabled = false;
    });

    // Loja
    document.getElementById('abrir-loja').onclick = () => {
        document.getElementById('modal-loja').style.display = 'block';
        atualizarStatus(); // Garante que a loja e moedas estão atualizadas
    };
    document.querySelector('#modal-loja .close-btn').onclick = () => {
        document.getElementById('modal-loja').style.display = 'none';
    };

    // Desafio
    document.getElementById('desafio-diario').onclick = () => {
        document.getElementById('modal-desafio').style.display = 'block';
        atualizarInterfaceDesafio();
    };
    document.querySelector('#modal-desafio .close-btn').onclick = () => {
        document.getElementById('modal-desafio').style.display = 'none';
    };
    document.getElementById('resgatar-recompensa').onclick = resgatarRecompensa;

    // Reiniciar Jogo (Mantém upgrades)
    document.getElementById('reiniciar-jogo').onclick = reiniciarJogo;
}

function reiniciarJogo() {
    hpJogador = hpMaxInicial;
    hpComputador = hpMaxInicial;
    document.getElementById('escolha-computador-display').textContent = '?';
    exibirResultado('Escolha seu elemento para começar a luta!');
    inicializarBotoes();
    atualizarStatus();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar ou definir o estado inicial (para este exemplo, definiremos)
    // Se fosse um jogo real, carregaríamos 'moedas', 'danoBonusUpgrade', etc.
    moedas = 10; // Moedas iniciais para começar
    vacuuDesbloqueado = false; 

    // Ocultar Vácuo se não estiver desbloqueado
    if (!vacuuDesbloqueado) {
        document.getElementById('vacuo').style.display = 'none';
    }

    inicializarBotoes();
    atualizarStatus();
    atualizarInterfaceDesafio(); // Configura o desafio pela primeira vez
});