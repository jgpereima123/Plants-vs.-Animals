Entendi! Você quer a parte CSS (o style) para colocar no Bloco de Notas, caso você queira salvar os arquivos separadamente.

Aqui está o código completo que estava dentro da tag <style>:

🎨 Código CSS (para style.css)
Se você for salvar este código separadamente, lembre-se de chamá-lo de style.css.

CSS

/* GERAL */
body {
    font-family: 'Arial', sans-serif;
    background-color: #f4f4f9;
    color: #333;
    margin: 0;
    padding: 0;
}

header {
    background-color: #2e8b57;
    color: white;
    padding: 10px 0;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

#game-container {
    display: flex;
    max-width: 1200px;
    margin: 20px auto;
    background-color: #fff;
    border: 1px solid #ddd;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* BARRA LATERAL (LOJA/INVENTÁRIO) */
#sidebar {
    width: 250px;
    padding: 15px;
    background-color: #e0f2f1;
    border-right: 1px solid #ccc;
}

#sidebar h2 {
    color: #00897b;
    border-bottom: 2px solid #00897b;
    padding-bottom: 5px;
    margin-top: 20px;
}

#resource-display {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 15px;
    padding: 5px;
    background-color: #fff;
    border-radius: 4px;
}

#seiva-icon {
    color: #ffc107;
    margin-right: 5px;
}

/* ESTILOS DOS BOTÕES DE FERRAMENTAS E PLANTAS */
.tool-btn, .plant-btn {
    width: 100%;
    padding: 10px;
    margin-bottom: 8px;
    background-color: #4db6ac;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: bold;
    text-align: left;
}

.tool-btn:hover, .plant-btn:hover {
    background-color: #009688;
}

.tool-btn:disabled, .plant-btn:disabled {
    background-color: #b2dfdb;
    cursor: not-allowed;
}

/* ÁREA DO JOGO (JARDIM) */
#game-area {
    flex-grow: 1;
    padding: 20px;
    background-color: #e8f5e9;
}

#game-status {
    background-color: #dcedc8;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
    font-weight: bold;
    text-align: center;
}

/* Grid do Jardim (Onde a ação acontece) */
#grid-container {
    min-height: 500px;
    border: 2px dashed #a5d6a7;
    padding: 10px;
    display: grid; 
    grid-template-columns: repeat(5, 80px); 
    gap: 5px;
    justify-content: center;
}

.grid-cell {
    width: 80px;
    height: 80px;
    border: 1px solid #c8e6c9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2em;
    cursor: pointer;
    position: relative; 
    background-color: #f1f8e9;
}

.grid-cell:hover {
    background-color: #e6eed5;
}
