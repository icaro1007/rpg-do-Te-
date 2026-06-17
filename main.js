let deckJ1 = []; let maoJ1 = [];
let deckJ2 = []; let maoJ2 = [];
let turnoAtivo = 1; 
let jogoIniciado = false;
let ultimaCartaOponente = null; 
let ultimaCartaJogador = null;  
let ctrlV = {}; 
let bonusUnidao = {}; // Guarda o bônus atual de cada Unidão no campo
let goblinJaAtacouNesteTurno = {}; // Registra se o Goblin já fez o primeiro ataque da rodada
let goblinAtaquesGanhos = {};      // Guarda quais Goblins específicos ganharam o ataque extra
let ultimoIdQueAtacou = null;      // Guarda o ID da última carta que desferiu um ataque
let suportePreparado = null; // Guarda o nome da arma engatilhada
let idItemNaMao = null;      // Guarda o ID da carta na mão para destruí-la depois
let modoRouboGoblin = false;
let idGoblinLadrao = null;
let bloqueioNecro = {}; // Guarda as cartas do Necromante e quantos turnos faltam para liberar
let pocaoVeluxAtiva = {}; // Guarda quais cartas beberam a Velux nesta rodada
let modoTraicao = false;
let idTraidor = null;
let escudoGuerreiro = {}; // Guarda quais Guerreiros estão com o escudo ativo
let modoAlvoBarril = false;
let modoAlvoBarrilInimigo = false;
let idBarrilAtivo = null;
let alvosDoBarril = {}; // Guarda { idDoBarril: idDoAlvo }
let barrilJaImpactou = {}; // Guarda { idDoBarril: true } se já deu o dano de impacto

// 🚨 NOVIDADE: A lista de suportes/poções agora fica no topo do código!
let suportesReais = [
    "besta", "recuperida", "velux", "pocaotraicao", 
    "adiv", "pocaogelo", "escudo_item", "cavalotroia", "fogueira"
];

function narrar(mensagem) {
    document.getElementById("painel-narrador").innerText = mensagem;
}

function obterModoCartaAliada() {
    if (modoTraicao) return "executar-traicao";
    if (modoLadrao && turnoAtivo === 1 && faseLadrao === 2) return "roubo-beneficio";
    if (modoLadrao && turnoAtivo === 2 && faseLadrao === 1) return "roubo-prejuizo";
    if (modoAtaqueInimigo) return "ataque-inimigo";
    if (modoCura) return "cura";
    if (modoRouboGoblin) return "roubo-goblin";
    if (suportePreparado !== null) return "suporte";
    return "ataque-normal";
}

function obterModoCartaInimiga() {
    if (modoTraicao) return "executar-traicao";
    if (modoLadrao && turnoAtivo === 1 && faseLadrao === 1) return "roubo-prejuizo";
    if (modoLadrao && turnoAtivo === 2 && faseLadrao === 2) return "roubo-beneficio";
    if (modoCuraInimigo) return "cura-inimiga";
    if (modoRouboGoblin) return "roubo-goblin";
    if (suportePreparado !== null) return "suporte";
    return "receber-ataque";
}

function iniciarJogo() {
    deckJ1 = []; maoJ1 = [];
    deckJ2 = []; maoJ2 = [];

    let deckTropaJ1 = []; let deckSuporteJ1 = [];
    let deckTropaJ2 = []; let deckSuporteJ2 = [];

    bancoDeCartas.forEach(carta => {
        for(let i = 0; i < carta.qtd; i++) {
            let instJ1 = { ...carta, idUnico: carta.id + "_" + i };
            let instJ2 = { ...carta, idUnico: carta.id + "_inimigo_" + i };
            
            if (suportesReais.includes(carta.id)) {
                deckSuporteJ1.push(instJ1);
                deckSuporteJ2.push(instJ2);
            } else {
                deckTropaJ1.push(instJ1);
                deckTropaJ2.push(instJ2);
            }
        }
    });

    deckTropaJ1.sort(() => Math.random() - 0.5);
    deckSuporteJ1.sort(() => Math.random() - 0.5);
    deckTropaJ2.sort(() => Math.random() - 0.5);
    deckSuporteJ2.sort(() => Math.random() - 0.5);

    maoJ1.push(deckSuporteJ1.pop());
    for(let i = 0; i < 4; i++) maoJ1.push(deckTropaJ1.pop());
    
    maoJ2.push(deckSuporteJ2.pop());
    for(let i = 0; i < 4; i++) maoJ2.push(deckTropaJ2.pop());

    deckJ1 = [...deckTropaJ1, ...deckSuporteJ1].sort(() => Math.random() - 0.5);
    deckJ2 = [...deckTropaJ2, ...deckSuporteJ2].sort(() => Math.random() - 0.5);

    maoJ1.sort(() => Math.random() - 0.5);
    maoJ2.sort(() => Math.random() - 0.5);

    let divMaoJ1 = document.getElementById("mao-j1");
    divMaoJ1.innerHTML = "<h3>Sua Mão</h3>"; 
    maoJ1.forEach(cartaComprada => {
        divMaoJ1.innerHTML += criarHTMLCarta(cartaComprada, "jogarCarta", "carta-aliada", true);
    });

    let divMaoJ2 = document.getElementById("mao-j2");
    divMaoJ2.innerHTML = "<h3>Mão do Oponente</h3>"; 
    maoJ2.forEach(cartaComprada => {
        divMaoJ2.innerHTML += criarHTMLCarta(cartaComprada, "jogarCartaInimigo", "carta-inimiga-espera", false);
    });
}

function rolarDado() {
    let dadoTela = document.getElementById("dado-tela");
    let textoTurno = document.getElementById("texto-turno");
    let painelNarrador = document.getElementById("painel-narrador");
    
    dadoTela.style.animation = 'none';
    setTimeout(() => dadoTela.style.animation = '', 10);

    if (!jogoIniciado) {
        let dadoJ1 = Math.floor(Math.random() * 6) + 1;
        let dadoJ2 = Math.floor(Math.random() * 6) + 1;

        if (dadoJ1 > dadoJ2) {
            dadoTela.innerText = `🎲 ${dadoJ1} x ${dadoJ2}`;
            textoTurno.innerText = "Sua Vez!";
            textoTurno.style.color = "#2ecc71"; 
            painelNarrador.innerText = "Você tirou um número maior e começa jogando!";
            turnoAtivo = 1; 
            jogoIniciado = true; 
        } 
        else if (dadoJ2 > dadoJ1) {
            dadoTela.innerText = `🎲 ${dadoJ1} x ${dadoJ2}`;
            textoTurno.innerText = "Vez do Oponente!";
            textoTurno.style.color = "#e74c3c"; 
            painelNarrador.innerText = "O oponente tirou um número maior e começa!";
            turnoAtivo = 2; 
            jogoIniciado = true; 
        }
    } else {
        let resultado = Math.floor(Math.random() * 6) + 1;
        dadoTela.innerText = "🎲 " + resultado;
        painelNarrador.innerText = `O dado rolou um ${resultado}.`;
    }
}

function passarTurno() {
    if (ultimoIdQueAtacou && goblinAtaquesGanhos[ultimoIdQueAtacou] === true) {
        goblinAtaquesGanhos[ultimoIdQueAtacou] = false; 
        narrar("🔥 PASSIVA: O Goblin ganhou o direito de atacar mais uma vez nesta rodada!");
        return; 
    }

    if (ultimoIdQueAtacou && pocaoVeluxAtiva[ultimoIdQueAtacou] === true) {
        pocaoVeluxAtiva[ultimoIdQueAtacou] = false; 
        narrar("⚡ EFEITO VELUX: Na velocidade da luz! A carta que acabou de atacar tem direito a MAIS UM ATAQUE agora!");
        return; 
    }
    
    goblinJaAtacouNesteTurno = {};
    goblinAtaquesGanhos = {};
    ultimoIdQueAtacou = null;
    
    turnoAtivo = (turnoAtivo === 1) ? 2 : 1;
    modoAtaque = false;
    modoAtaqueInimigo = false;
    danoPreparado = 0;
    danoInimigoPreparado = 0;

    modoAtaque = false;
    modoAtaqueInimigo = false;
    danoPreparado = 0;
    danoInimigoPreparado = 0;
    
    // 👇 ADICIONA ESTAS 3 LINHAS AQUI:
    modoAlvoBarril = false;
    modoAlvoBarrilInimigo = false;
    idBarrilAtivo = null;

    let containerTurno = document.getElementById("texto-turno");
    if (containerTurno) {
        if (turnoAtivo === 1) {
            containerTurno.innerText = "Sua Vez!";
            containerTurno.style.color = "#2ecc71"; 
        } else {
            containerTurno.innerText = "Vez do Oponente!";
            containerTurno.style.color = "#e74c3c"; 
        }
    }

    if (turnoAtivo === 1) narrar("🔵 Seu turno começou! Planeje bem seus ataques.");
    else narrar("🔴 Turno do Oponente iniciado! Prepare-se para defender.");

    // --- MALDIÇÃO DO BARRIL DE GOBLINS (Dano por rodada) ---
    Object.keys(alvosDoBarril).forEach(idBarril => {
        let pacoteBarril = document.getElementById("pacote-" + idBarril);
        let idAlvo = alvosDoBarril[idBarril];
        let pacoteAlvo = document.getElementById("pacote-" + idAlvo);

        if (!pacoteBarril || !pacoteAlvo) {
            delete alvosDoBarril[idBarril];
            return;
        }

        let txtVida = document.getElementById("vida-" + idBarril);
        let txtDano = document.getElementById("dano-" + idBarril); // 🚀 PEGA O DANO DA CARTA

        if (txtVida) {
            let vidaBarril = parseFloat(txtVida.innerText);
            let buffDano = txtDano ? parseFloat(txtDano.innerText) : 0; // Se tiver Besta, vai ser 1
            
            // 🚀 SOMA O BUFF AQUI (Ex: (3 * 0.25) + 1 da Besta = 1.75)
            let danoTotal = (vidaBarril * 0.25) + buffDano; 
            
            let isInimigo = pacoteAlvo.closest("#campo-j2") !== null;
            aplicarDanoDireto("pacote-" + idAlvo, danoTotal, isInimigo);
            narrar(` Os Goblins do Barril atacaram o alvo causando ${danoTotal} de dano extra no fim do turno!`);
        }
    });

    if (typeof atualizarTodosUnidoes === "function") atualizarTodosUnidoes();
}

function invocarToken(idBaseCarta, idCampo) {
    let cartaBase = bancoDeCartas.find(c => c.id === idBaseCarta);
    if (!cartaBase) return;
    
    let idUnico = idBaseCarta + "-" + Math.floor(Math.random() * 10000);
    let novaCarta = { ...cartaBase, idUnico: idUnico };
    
    let ehAliado = idCampo === "campo-j1";
    let html = criarHTMLCarta(novaCarta, ehAliado ? "jogarCarta" : "jogarCartaInimigo", ehAliado ? "carta-aliada" : "carta-inimiga", ehAliado);
    
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = html.trim();
    let pacoteNovo = tempDiv.firstChild;
    
    document.getElementById(idCampo).appendChild(pacoteNovo);

    let img = pacoteNovo.querySelector("img");
    img.removeAttribute("onclick");
    
    img.onclick = function() {
        let idDoPacote = "pacote-" + idUnico;
        let idSemPacote = idUnico;
        
        if (modoLadrao === true && turnoAtivo === 1 && faseLadrao === 1 && !ehAliado) aplicarRouboPrejuizo(idDoPacote);
        else if (modoLadrao === true && turnoAtivo === 1 && faseLadrao === 2 && ehAliado) aplicarRouboBeneficio(idDoPacote);
        else if (modoLadrao === true && turnoAtivo === 2 && faseLadrao === 1 && ehAliado) aplicarRouboPrejuizo(idDoPacote);
        else if (modoLadrao === true && turnoAtivo === 2 && faseLadrao === 2 && !ehAliado) aplicarRouboBeneficio(idDoPacote);
        else if (modoAlvoBarril === true && !ehAliado) aplicarAlvoBarril(idDoPacote);
        else if (modoCura === true && ehAliado) aplicarCuraAliada(idDoPacote);
        else if (modoCuraInimigo === true && !ehAliado) aplicarCuraInimiga(idDoPacote);
        else if (modoAtaqueInimigo === true && ehAliado) aplicarDanoInimigo(idDoPacote);
        else if (modoRouboGoblin === true && !ehAliado) aplicarRouboDanoGoblin(idDoPacote);
        else if (suportePreparado !== null) {
            if (ehAliado && !idItemNaMao.includes("inimigo")) equiparSuporte(idSemPacote);
            else if (!ehAliado && idItemNaMao.includes("inimigo")) equiparSuporte(idSemPacote);
            else narrar("Ação inválida para este suporte!");
        }
        else if (ehAliado) iniciarAtaque(novaCarta.nome, idUnico);
        else receberAtaque("vida-" + idSemPacote, idDoPacote);
    };
    
    let divAcoes = pacoteNovo.querySelector("div[id^='acoes-']");
    if (divAcoes) divAcoes.style.display = "block";

    atualizarTodosUnidoes();
}

function jogarCarta(idDoPacote) {
    if (typeof idDoPacote !== "string") return;

    let pacoteCarta = document.getElementById(idDoPacote);
    if (!pacoteCarta) return; 

    let idSemPacote = idDoPacote.replace("pacote-", "");
    let estaNaMao = pacoteCarta.parentElement && pacoteCarta.parentElement.id.includes("mao");
    
    let nomeDaCartaHtml = pacoteCarta.querySelector(".nome-carta").innerText.trim(); 
    let textoBusca = nomeDaCartaHtml.toLowerCase();

    // 🚨 ROTA 1: ITENS E POÇÕES
    if (textoBusca.includes("besta")) return ativarSuporte("Besta", idSemPacote);
    if (textoBusca.includes("velux") || textoBusca.includes("veluz")) return ativarSuporte("Velux", idSemPacote);
    if (textoBusca.includes("adiv")) return ativarSuporte("Adiv", idSemPacote);
    if (textoBusca.includes("recuperida")) return ativarSuporte("Recuperida", idSemPacote);
    if (textoBusca.includes("traição") || textoBusca.includes("traicao")) return ativarSuporte("Traicao", idSemPacote);

    // 🚨 ROTA 2: CRIATURAS NORMAIS
    if (estaNaMao) {
        if (bloqueioNecro[idSemPacote] && bloqueioNecro[idSemPacote] > 0) return narrar("⏳ FADIGA! Esta carta precisa descansar.");
        
        document.getElementById("campo-j1").appendChild(pacoteCarta);
        narrar("Você invocou uma criatura no campo!");
    }

    let cartaBase = bancoDeCartas.find(c => c.nome === nomeDaCartaHtml);
    if (cartaBase) ultimaCartaJogador = cartaBase;

    let imagem = pacoteCarta.querySelector("img");
    imagem.removeAttribute("onclick"); 
    
    imagem.onclick = function() {
        if (modoTraicao === true) executarTraicao(idDoPacote);
        else if (modoLadrao === true && turnoAtivo === 1 && faseLadrao === 2) aplicarRouboBeneficio(idDoPacote);
        else if (modoLadrao === true && turnoAtivo === 2 && faseLadrao === 1) aplicarRouboPrejuizo(idDoPacote);
        else if (modoAtaqueInimigo === true) aplicarDanoInimigo(idDoPacote);
        else if (modoCura === true) aplicarCuraAliada(idDoPacote);
        else if (modoRouboGoblin === true) aplicarRouboDanoGoblin(idDoPacote);
        else if (modoAlvoBarril === true) aplicarAlvoBarril(idDoPacote);
        else if (suportePreparado !== null) { 
            equiparSuporte(idSemPacote);
        } else {
            iniciarAtaque(nomeDaCartaHtml, idSemPacote);
        }
    };

    imagem.style.cursor = "pointer";

    let divAcoes = pacoteCarta.querySelector("div[id^='acoes-']");
    if (divAcoes) divAcoes.style.display = "block"; 
   
    let cartaParaPassiva = { nome: nomeDaCartaHtml, passivaAtivada: false };
    if (typeof verificarPassivaNecromante === "function") verificarPassivaNecromante(cartaParaPassiva, true); 

    atualizarTodosUnidoes();
}

function jogarCartaInimigo(idDoPacote) {
    if (typeof idDoPacote !== "string") return;

    let pacoteCarta = document.getElementById(idDoPacote);
    if (!pacoteCarta) return;

    let idSemPacote = idDoPacote.replace("pacote-", "");
    let estaNaMao = pacoteCarta.parentElement && pacoteCarta.parentElement.id.includes("mao");
    
    let nomeDaCartaHtml = pacoteCarta.querySelector(".nome-carta").innerText.trim();
    let textoBusca = nomeDaCartaHtml.toLowerCase();

    // 🚨 ROTA 1: ITENS E POÇÕES
    if (textoBusca.includes("besta")) return ativarSuporte("Besta", idSemPacote);
    if (textoBusca.includes("velux") || textoBusca.includes("veluz")) return ativarSuporte("Velux", idSemPacote);
    if (textoBusca.includes("adiv")) return ativarSuporte("Adiv", idSemPacote);
    if (textoBusca.includes("recuperida")) return ativarSuporte("Recuperida", idSemPacote);
    if (textoBusca.includes("traição") || textoBusca.includes("traicao")) return ativarSuporte("Traicao", idSemPacote);

    // 🚨 ROTA 2: CRIATURAS INIMIGAS
    if (estaNaMao) {
        if (bloqueioNecro[idSemPacote] && bloqueioNecro[idSemPacote] > 0) return narrar("⏳ FADIGA! A carta precisa descansar.");

        document.getElementById("campo-j2").appendChild(pacoteCarta);
        narrar("O Oponente invocou uma criatura no campo!");
    }
    
    pacoteCarta.className = "carta-inimiga";

    let cartaBase = bancoDeCartas.find(c => c.nome === nomeDaCartaHtml);
    if (cartaBase) ultimaCartaOponente = cartaBase;

    let imagem = pacoteCarta.querySelector("img");
    imagem.removeAttribute("onclick");
    
    imagem.onclick = function() {
        let idSemPacoteLocal = idDoPacote.replace("pacote-", "");
        
        if (modoTraicao === true) executarTraicao(idDoPacote);
        else if (modoLadrao === true && turnoAtivo === 1 && faseLadrao === 1) aplicarRouboPrejuizo(idDoPacote);
        else if (modoLadrao === true && turnoAtivo === 2 && faseLadrao === 2) aplicarRouboBeneficio(idDoPacote);
        else if (modoCuraInimigo === true) aplicarCuraInimiga(idDoPacote);
        else if (modoRouboGoblin === true) aplicarRouboDanoGoblin(idDoPacote); 
        else if (modoAlvoBarril === true) aplicarAlvoBarril(idDoPacote);   
        else if (suportePreparado !== null) {
            equiparSuporte(idSemPacoteLocal);
        } else {
            receberAtaque("vida-" + idSemPacoteLocal, idDoPacote);
        }
    };
    
    let divAcoes = pacoteCarta.querySelector("div[id^='acoes-']");
    if (divAcoes) divAcoes.style.display = "block";
   
    let cartaParaPassiva = { nome: nomeDaCartaHtml, passivaAtivada: false };
    if (typeof verificarPassivaNecromante === "function") verificarPassivaNecromante(cartaParaPassiva, false); 

    atualizarTodosUnidoes();
}

function criarHTMLCarta(carta, funcaoJogar, classeCss, ehAliado) {
    let btnCura = (carta.nome === 'Curandeiro') ? `<button onclick="iniciarCura('${carta.idUnico}')" style="background-color: green; color: white; width: 100%; margin-bottom: 2px; cursor: pointer;">Curar 💚</button>` : '';
    let btnCuraInimigo = (carta.nome === 'Curandeiro') ? `<button onclick="iniciarCuraInimigo('${carta.idUnico}')" style="background-color: green; color: white; width: 100%; margin-bottom: 2px; cursor: pointer;">Curar Oponente 💚</button>` : '';
    let btnEspecial = (carta.nome === 'Necromante' || carta.nome === 'Ork' || carta.nome === 'Curandeiro' || carta.nome === 'Ctrl C' || carta.nome === 'Ctrl V' || carta.nome === 'Cavaleiro das Trevas' || carta.nome === 'Goblin' || carta.nome === 'Trio de Goblin' || carta.nome === 'Barril de Goblin' || carta.nome === 'Guerreiro') ? `<button onclick="usarHabilidade('${carta.nome}', '${carta.idUnico}', this)" style="background-color: purple; color: white; width: 100%; margin-bottom: 2px; cursor: pointer;">Especial 🔮</button>` : '';
    let btnLadrao = (carta.nome === 'Ladrão') ? `<button onclick="usarPassivaLadrao('${carta.idUnico}', this)" style="background-color: #f1c40f; color: black; font-weight: bold; width: 100%; margin-bottom: 2px; cursor: pointer;">Passiva 💰</button>` : '';
    let btnCtrlC = (carta.nome === 'Ctrl C' || carta.nome === 'Ctrl V') ? `<button onclick="usarPassivaCtrlC('${carta.idUnico}', this)" style="background-color: #34495e; color: white; font-weight: bold; width: 100%; margin-bottom: 2px; cursor: pointer;">Passiva 📋</button>` : '';

    let botoes = ehAliado ? `
        ${btnCtrlC}
        ${btnCura}
        <button onclick="iniciarAtaque('${carta.nome}', '${carta.idUnico}')" style="padding: 5px; width: 100%; margin-bottom: 2px; cursor: pointer;">Atacar ⚔️</button>
        ${btnEspecial}
        ${btnLadrao}
    ` : `
        ${btnCtrlC}
        ${btnCuraInimigo}
        <button onclick="inimigoAtacar('${carta.idUnico}')" style="padding: 5px; background-color: darkred; color: white; width: 100%; margin-bottom: 2px; cursor: pointer;">Atacar ⚔️</button>
        ${btnEspecial}
        ${btnLadrao}
    `;

    return `
        <div id="pacote-${carta.idUnico}" class="${classeCss}">
            <span class="nome-carta">${carta.nome}</span>
            <img src="${carta.img}" alt="${carta.nome}" onclick="${funcaoJogar}('pacote-${carta.idUnico}')">
            
            <div class="status-container">
                <span class="status-vida">❤️ <span id="vida-${carta.idUnico}">${carta.vida}</span></span>
                <span class="status-ataque">⚔️ <span id="dano-${carta.idUnico}">${carta.dano}</span></span>
            </div>

            <div id="acoes-${carta.idUnico}" style="display: none; margin-top: 10px; width: 100%;">${botoes}</div>
        </div>
    `;
}

function iniciarAtaque(nomeCarta, idUnico) {
    modoAlvoBarril = false; // 🚀 Cancela qualquer mira do barril se clicar noutro ataque

    if (suportePreparado !== null) {
        equiparSuporte(idUnico);
        return; 
    }

    if (turnoAtivo !== 1) return narrar("Ainda não é o seu turno de atacar!");

    let cartaAtacante = bancoDeCartas.find(c => c.nome === nomeCarta);
    if (cartaAtacante) ultimaCartaJogador = cartaAtacante;
    
    let campoInimigo = document.getElementById("campo-j2");
    let inimigosNoCampo = Array.from(campoInimigo.getElementsByClassName("carta-inimiga"));
    if (inimigosNoCampo.length === 0) return narrar("Não há inimigos no campo para atacar!");

    let danoBase = parseFloat(document.getElementById("dano-" + idUnico).innerText);
    let vidaAtual = parseFloat(document.getElementById("vida-" + idUnico).innerText);
    danoPreparado = danoBase;
    ultimoIdQueAtacou = idUnico;

    // 📦 ATIVAÇÃO DO BARRIL (SEU LADO)
    if (nomeCarta.includes('Barril de Goblin')) {
        modoAlvoBarril = true; 
        idBarrilAtivo = idUnico;
        return narrar("📦 Você ativou o Barril! Clique na carta do OPONENTE que vai receber os goblins!");
    }

    if (nomeCarta === 'Trio de Goblin') {
        if (vidaAtual >= 5) { danoPreparado = 2; narrar("⚔️ O Trio de Goblin está completo e ataca com 2 de dano!"); } 
        else if (vidaAtual >= 3) { danoPreparado = 1; narrar("⚔️ Um goblin caiu! Os dois restantes atacam com 1 de dano."); } 
        else { danoPreparado = 1; }
    }

    let ageComoGoblin = (nomeCarta === 'Goblin') || (nomeCarta === 'Trio de Goblin' && vidaAtual <= 2);
    if (ageComoGoblin) {
        let nomeTexto = (nomeCarta === 'Trio de Goblin') ? 'Último Goblin do Trio' : 'Goblin';
        if (!goblinJaAtacouNesteTurno[idUnico]) {
            goblinJaAtacouNesteTurno[idUnico] = true;
            let dado = Math.floor(Math.random() * 6) + 1;
            document.getElementById("dado-tela").innerText = "🎲 " + dado;
            if (dado === 2) {
                let escolha = confirm(`🎲 PASSIVA DO ${nomeTexto.toUpperCase()}! Você tirou 2 no dado!\n\n[ OK ] = Dar 4 de dano de uma só vez neste alvo.\n[ CANCELAR ] = Dar apenas 2 de dano agora e ganhar um Ataque Extra livre.`);
                if (escolha) { danoPreparado = 4; goblinAtaquesGanhos[idUnico] = false; narrar(`🎲 O ${nomeTexto} concentrou força! Causará 4 de dano num golpe único e passará a vez!`); } 
                else { goblinAtaquesGanhos[idUnico] = true; danoPreparado = 2; narrar(`🎲 O ${nomeTexto} ativou a agilidade! Dará 2 de dano agora e terá direito a mais um ataque!`); }
            } else { goblinAtaquesGanhos[idUnico] = false; narrar(`🎲 O ${nomeTexto} tirou ${dado}. Apenas um ataque normal de ${danoPreparado} de dano.`); }
        }
    }

    if (nomeCarta === 'Arqueiro') {
        let dado = Math.floor(Math.random() * 6) + 1;
        document.getElementById("dado-tela").innerText = "🎲 " + dado;
        if (dado >= 1 && dado <= 3) { danoPreparado += 1; narrar(`🎯 Arqueiro tirou ${dado}. Dano +1 (Total: ${danoPreparado})!`); } 
        else if (dado >= 4 && dado <= 6) { danoPreparado += 3; narrar(`🎯 Arqueiro atirador de elite (${dado})! Dano +3 (Total: ${danoPreparado})!`); }
    }

    if (nomeCarta === 'Cavaleiro das Trevas') {
        let danoArea = 2; let alvosMaximos = 1;
        if (typeof cavaleiroAtivado !== 'undefined' && cavaleiroAtivado[idUnico]) { danoArea = 5; alvosMaximos = 3; } 
        else if (inimigosNoCampo.length >= 2) { danoArea = 3; alvosMaximos = 2; }
        let alvos = inimigosNoCampo.slice(0, alvosMaximos);
        narrar(`⚔️ O Cavaleiro das Trevas atacou ${alvos.length} inimigo(s) causando ${danoArea} de dano em cada!`);
        alvos.forEach(pacoteInimigo => aplicarDanoDireto(pacoteInimigo.id, danoArea, false));
        passarTurno();
        if (typeof atualizarTodosUnidoes === "function") atualizarTodosUnidoes();
        return; 
    }
    
    modoAtaque = true; 
    narrar(`Você preparou um ataque de ${danoPreparado} de dano! Clique no inimigo que deseja acertar.`);
}

function receberAtaque(idVidaAlvo, idPacoteAlvo) {
    if (modoAtaque === true) {
        
        // 🛡️ NOVO: BLOQUEIO DO GUERREIRO ANTES DE TOMAR DANO
        // 🛡️ NOVO: BLOQUEIO DO GUERREIRO ANTES DE TOMAR DANO
        let idPuro = idPacoteAlvo.replace("pacote-", ""); 
        if (escudoGuerreiro[idPuro]) {
            narrar(`🛡️ BLANG! O escudo do Guerreiro Inimigo bloqueou o ataque e QUEBROU!`);
            
            delete escudoGuerreiro[idPuro]; // 💥 Quebra o escudo após o primeiro hit!
            
            modoAtaque = false; 
            danoPreparado = 0; 
            passarTurno(); 
            return; 
        }

        // --- CÓDIGO ORIGINAL CONTINUA NORMALMENTE ABAIXO ---
        let textoVida = document.getElementById(idVidaAlvo);
        let vidaAtual = parseInt(textoVida.innerText) - danoPreparado;
        textoVida.innerText = vidaAtual; 

        if (vidaAtual <= 0) {
            let pacote = document.getElementById(idPacoteAlvo);
            let nomeDestaCarta = pacote.querySelector(".nome-carta").innerText;

            narrar("BUM! O alvo inimigo foi DESTRUÍDO!");
            pacote.remove();

            if (nomeDestaCarta === "Ork") {
                let qtd = orkBuffado[idPuro] ? 3 : 2; 
                narrar(`💀 PASSIVA: O Ork Inimigo morreu e invocou ${qtd} Goblins!`);
                
                for (let i = 0; i < qtd; i++) {
                    invocarToken("goblin", "campo-j2"); // Inimigo sempre nasce no j2
                }
            }
        } else {
            narrar("Pow! O alvo tomou " + danoPreparado + " de dano!");
        }
        
        modoAtaque = false; 
        danoPreparado = 0; 
        passarTurno(); 
    } else {
        narrar("Você precisa clicar no botão 'Atacar' primeiro!");
    }

    atualizarTodosUnidoes();
}

function inimigoAtacar(idUnico) {
    modoAlvoBarril = false;        // 🚀 Desbloqueia o ataque normal do oponente
    modoAlvoBarrilInimigo = false;

    if (suportePreparado !== null) {
        equiparSuporte(idUnico);
        return;
    }

    if (turnoAtivo !== 2) return narrar("Ainda não é o turno do Oponente atacar!");
    
    let pacoteInimigo = document.getElementById("pacote-" + idUnico);
    let nomeCartaInimiga = pacoteInimigo.querySelector(".nome-carta").innerText;
    let cartaAtacanteInimigo = bancoDeCartas.find(c => c.nome === nomeCartaInimiga);
    if (cartaAtacanteInimigo) ultimaCartaOponente = cartaAtacanteInimigo;

    let campoAliado = document.getElementById("campo-j1");
    let aliadosNoCampo = Array.from(campoAliado.getElementsByClassName("carta-aliada"));
    if (aliadosNoCampo.length === 0) return narrar("Você não tem cartas no campo para o oponente atacar!");

    let danoLido = parseFloat(document.getElementById("dano-" + idUnico).innerText);
    let vidaAtual = parseFloat(document.getElementById("vida-" + idUnico).innerText);
    danoInimigoPreparado = danoLido;
    ultimoIdQueAtacou = idUnico;

    // 📦 ATIVAÇÃO DO BARRIL (LADO DO INIMIGO)
    if (nomeCartaInimiga.includes('Barril de Goblin')) {
        modoAlvoBarril = true; 
        idBarrilAtivo = idUnico;
        return narrar("📦 O Oponente ativou o Barril! Clique na SUA carta que vai receber os goblins!");
    }

    if (nomeCartaInimiga === 'Trio de Goblin') {
        if (vidaAtual >= 5) { danoInimigoPreparado = 2; narrar("⚔️ O Trio de Goblin inimigo ataca com 2 de dano!"); } 
        else if (vidaAtual >= 3) { danoInimigoPreparado = 1; narrar("⚔️ Um goblin inimigo caiu! Os dois restantes atacam com 1 de dano."); } 
        else { danoInimigoPreparado = 1; }
    }

    let ageComoGoblin = (nomeCartaInimiga === 'Goblin') || (nomeCartaInimiga === 'Trio de Goblin' && vidaAtual <= 2);
    if (ageComoGoblin) {
        let nomeTexto = (nomeCartaInimiga === 'Trio de Goblin') ? 'Último Goblin do Trio inimigo' : 'Goblin inimigo';
        if (!goblinJaAtacouNesteTurno[idUnico]) {
            goblinJaAtacouNesteTurno[idUnico] = true;
            let dado = Math.floor(Math.random() * 6) + 1;
            document.getElementById("dado-tela").innerText = "🎲 " + dado;
            if (dado === 2) {
                let qtdAliados = aliadosNoCampo.length;
                if (qtdAliados === 1) { danoInimigoPreparado = 4; goblinAtaquesGanhos[idUnico] = false; narrar(`🎲 O ${nomeTexto} tirou 2 e concentrou 4 de dano brutal!`); } 
                else { goblinAtaquesGanhos[idUnico] = true; danoInimigoPreparado = 2; narrar(`🎲 O ${nomeTexto} tirou 2! Atacará com 2 de dano e fará mais um ataque!`); }
            } else { goblinAtaquesGanhos[idUnico] = false; narrar(`🎲 O ${nomeTexto} tirou ${dado}. Ataque normal.`); }
        }
    }

    if (nomeCartaInimiga === 'Arqueiro') {
        let dado = Math.floor(Math.random() * 6) + 1;
        document.getElementById("dado-tela").innerText = "🎲 " + dado;
        if (dado >= 1 && dado <= 3) { danoInimigoPreparado += 1; } 
        else if (dado >= 4 && dado <= 6) { danoInimigoPreparado += 3; }
    }

    if (nomeCartaInimiga === 'Cavaleiro das Trevas') {
        let danoArea = 2; let alvosMaximos = 1;
        if (typeof cavaleiroAtivado !== 'undefined' && cavaleiroAtivado[idUnico]) { danoArea = 5; alvosMaximos = 3; } 
        else if (aliadosNoCampo.length >= 2) { danoArea = 3; alvosMaximos = 2; }
        let alvos = aliadosNoCampo.slice(0, alvosMaximos);
        narrar(`⚔️ O Cavaleiro das Trevas inimigo atacou ${alvos.length} de suas cartas causando ${danoArea} de dano em cada!`);
        alvos.forEach(pacoteAliado => aplicarDanoDireto(pacoteAliado.id, danoArea, true));
        passarTurno();
        if (typeof atualizarTodosUnidoes === "function") atualizarTodosUnidoes();
        return;
    }
    
    modoAtaqueInimigo = true; 
    if (aliadosNoCampo.length === 1) aplicarDanoInimigo(aliadosNoCampo[0].id);
    else narrar(`O Oponente preparou um ataque de ${danoInimigoPreparado} de dano! Clique na SUA carta que vai receber o ataque.`);
}

function aplicarDanoInimigo(idPacoteAlvo) {

    // 🛡️ NOVO: BLOQUEIO DO GUERREIRO ANTES DE TOMAR DANO
    let idPuro = idPacoteAlvo.replace("pacote-", ""); 
    if (escudoGuerreiro[idPuro]) {
        narrar(`🛡️ BLANG! O seu Guerreiro defendeu o ataque inimigo, mas o escudo QUEBROU!`);
        
        delete escudoGuerreiro[idPuro]; // 💥 Quebra o escudo após o primeiro hit!
        
        modoAtaqueInimigo = false; 
        danoInimigoPreparado = 0;
        passarTurno(); 
        return; 
    }

    // --- CÓDIGO ORIGINAL CONTINUA NORMALMENTE ABAIXO ---
    let idVida = idPacoteAlvo.replace("pacote-", "vida-");
    let textoVida = document.getElementById(idVida);
    let vidaAtual = parseFloat(textoVida.innerText) - danoInimigoPreparado;
    textoVida.innerText = vidaAtual;

    if (vidaAtual <= 0) {
        let pacote = document.getElementById(idPacoteAlvo);
        let nomeDestaCarta = pacote.querySelector(".nome-carta").innerText;

        narrar("Sua carta foi DESTRUÍDA pelo oponente!");
        pacote.remove();

       if (nomeDestaCarta === "Ork") {
            let qtd = orkBuffado[idPuro] ? 3 : 2; 
            narrar(`💀 PASSIVA: O seu Ork morreu e invocou ${qtd} Goblins!`);
            
            for (let i = 0; i < qtd; i++) {
                invocarToken("goblin", "campo-j1"); // Seu Ork sempre nasce no j1
            }
        }
    } else {
        narrar(`Sua carta sofreu ${danoInimigoPreparado} de dano!`);
    }

    modoAtaqueInimigo = false; 
    danoInimigoPreparado = 0;
    passarTurno(); 

    atualizarTodosUnidoes();
}
function atualizarTodosUnidoes() {
    let campoJ1 = document.getElementById("campo-j1");
    let campoJ2 = document.getElementById("campo-j2");
    if (campoJ1) atualizarUnidoesNoCampo(campoJ1);
    if (campoJ2) atualizarUnidoesNoCampo(campoJ2);
}

function atualizarUnidoesNoCampo(campoHTML) {
    let todasAsCartas = Array.from(campoHTML.querySelectorAll("div[id^='pacote-']"));
    
    let unidoes = todasAsCartas.filter(pacote => {
        let nome = pacote.querySelector(".nome-carta").innerText;
        return nome === "Unidão" || nome === "Ctrl V (Unidão)";
    });
    
    let outrasCartas = todasAsCartas.filter(pacote => {
        let nome = pacote.querySelector(".nome-carta").innerText;
        return nome !== "Unidão" && nome !== "Ctrl V (Unidão)";
    });

    // 1. Acha o MAIOR dano entre as outras cartas
    let maiorDano = 0;
    outrasCartas.forEach(pacote => {
        let idUnico = pacote.id.replace("pacote-", "");
        let spanDano = document.getElementById("dano-" + idUnico);
        if (spanDano) {
            let dano = parseInt(spanDano.innerText) || 0; // Garante que é número
            if (dano > maiorDano) maiorDano = dano;
        }
    });

    // 2. Aplica o bónus ao Unidão
    unidoes.forEach(pacote => {
        let idUnico = pacote.id.replace("pacote-", "");
        let spanDano = document.getElementById("dano-" + idUnico);
        
        if (spanDano) {
            // O dano base da carta Unidão é 1. Somamos o maiorDano encontrado.
            let novoDano = 1 + maiorDano; 
            spanDano.innerText = novoDano;
            
            // Opcional: Salva no objeto para referência se precisares depois
            bonusUnidao[idUnico] = novoDano;
        }
    });
}
function aplicarDanoDireto(idPacoteAlvo, dano, isInimigo) {
    let idPuro = idPacoteAlvo.replace("pacote-", "");
    let txtVida = document.getElementById("vida-" + idPuro);
    if (!txtVida) return;

    let vidaAtual = parseFloat(txtVida.innerText) - dano;
    txtVida.innerText = vidaAtual;

    if (vidaAtual <= 0) {
        let pacote = document.getElementById(idPacoteAlvo);
        if (!pacote) return;
        let nomeDestaCarta = pacote.querySelector(".nome-carta").innerText;
        pacote.remove();
        
        if (nomeDestaCarta === "Ork") {
            let qtd = orkBuffado[idPuro] ? 3 : 2;
            narrar(`💀 PASSIVA: O Ork morreu e invocou ${qtd} Goblins!`);
            let campoDestino = isInimigo ? "campo-j1" : "campo-j2";
            for (let i = 0; i < qtd; i++) invocarToken("goblin", campoDestino);
        }
    }
}
function obterCartasAdjacentes(idPacoteAlvo) {
    let pacote = document.getElementById(idPacoteAlvo);
    if (!pacote) return [];
    
    let campo = pacote.parentElement;
    let cartas = Array.from(campo.querySelectorAll("div[id^='pacote-']"));
    let index = cartas.indexOf(pacote);
    let adjacentes = [];
    
    if (index > 0) adjacentes.push(cartas[index - 1]);
    if (index < cartas.length - 1) adjacentes.push(cartas[index + 1]);
    
    return adjacentes;
}

function aplicarAlvoBarril(idPacoteAlvo) {
    let pacoteAlvo = document.getElementById(idPacoteAlvo);
    let pacoteBarril = document.getElementById("pacote-" + idBarrilAtivo);
    
    // 👇 SE ALGO CORRER MAL, DESLIGA A MIRA PARA NÃO ENCRAVAR O JOGO!
    if (!pacoteAlvo || !pacoteBarril) {
        modoAlvoBarril = false;
        modoAlvoBarrilInimigo = false;
        return;
    }
    // Descobre de qual lado está o Barril e de qual lado está o Alvo
    let ladoBarril = pacoteBarril.closest("#campo-j1") ? "j1" : "j2";
    let ladoAlvo = pacoteAlvo.closest("#campo-j1") ? "j1" : "j2";

    // Impede o Barril de atacar as cartas do próprio time
    if (ladoBarril === ladoAlvo) {
        return narrar("❌ Escolha uma carta do campo oposto para o Barril atacar!");
    }

    let nomeAlvo = pacoteAlvo.querySelector(".nome-carta").innerText;
    let isInimigoParaOJogo = (ladoAlvo === "j2"); 

    // Desliga a mira
    modoAlvoBarril = false;
    modoAlvoBarrilInimigo = false;

    let idBarrilPuro = idBarrilAtivo;
    let idAlvoPuro = idPacoteAlvo.replace("pacote-", "");
    
    alvosDoBarril[idBarrilPuro] = idAlvoPuro; 

    narrar(`🎯 Os Goblins do Barril focaram-se em [${nomeAlvo}]!`);

    // LÊ O DANO EXTRA (BUFFS DA BESTA, UNIDÃO, ETC)
    let txtDanoBarril = document.getElementById("dano-" + idBarrilPuro);
    let buffDano = txtDanoBarril ? parseFloat(txtDanoBarril.innerText) : 0;

    // DANO DE IMPACTO
    if (!barrilJaImpactou[idBarrilPuro]) {
        barrilJaImpactou[idBarrilPuro] = true;
        
        let danoImpacto = 1 + buffDano; 
        
        let vizinhos = obterCartasAdjacentes(idPacoteAlvo);
        vizinhos.forEach(vizinho => {
            aplicarDanoDireto(vizinho.id, danoImpacto, isInimigoParaOJogo);
        });
        narrar(`💥 BUM! O primeiro impacto do Barril causou ${danoImpacto} de dano nas cartas adjacentes ao alvo!`);
    }

    idBarrilAtivo = null;
    passarTurno(); 
}
function equiparSuporte(idAlvo) {
    if (!suportePreparado) return; 

    let pacoteAlvo = document.getElementById("pacote-" + idAlvo);
    if (!pacoteAlvo) return;
    
    let nomeAlvo = pacoteAlvo.querySelector(".nome-carta").innerText.trim();
    let danoElemento = document.getElementById("dano-" + idAlvo);
    let danoAtual = 0;
    if (danoElemento) danoAtual = parseFloat(danoElemento.innerText);

    // --- REGRA DA BESTA ---
    if (suportePreparado === 'Besta') {
        let bonus = (nomeAlvo === 'Arqueiro') ? 2 : 1;
        if (danoElemento) danoElemento.innerText = danoAtual + bonus;
        
        let itemNaMao = document.getElementById("pacote-" + idItemNaMao);
        if (itemNaMao) itemNaMao.remove();
        
        narrar(`🏹 A Besta foi equipada em [${nomeAlvo}]! O dano base subiu para ${danoAtual + bonus}.`);
        suportePreparado = null;
    }

    // --- REGRA DA VELUX ---
    if (suportePreparado === 'Velux') {
        pocaoVeluxAtiva[idAlvo] = true;
        
        let itemNaMao = document.getElementById("pacote-" + idItemNaMao);
        if (itemNaMao) itemNaMao.remove();
        
        narrar(`⚡ Poção Velux derramada sobre [${nomeAlvo}]! Segundo ataque liberado imediatamente!`);
        suportePreparado = null;
    }

    // --- REGRA DA ADIV ---
    if (suportePreparado === 'Adiv') {
        let itemNaMao = document.getElementById("pacote-" + idItemNaMao);
        if (itemNaMao) itemNaMao.remove();
        
        narrar(`🧪 Splash! A poção Adiv foi atirada em [${nomeAlvo}], causando 1 de dano direto!`);
        
        let isInimigo = pacoteAlvo.closest("#campo-j2") !== null;
        aplicarDanoDireto("pacote-" + idAlvo, 1, isInimigo);
        suportePreparado = null;
    }

    // --- REGRA DA RECUPERIDA ---
    if (suportePreparado === 'Recuperida') {
        let itemNaMao = document.getElementById("pacote-" + idItemNaMao);
        if (!itemNaMao) return;
        
        let quemJogou = itemNaMao.parentElement ? itemNaMao.parentElement.id : "";
        let alvoNoCampo1 = pacoteAlvo.closest("#campo-j1") !== null;
        let alvoNoCampo2 = pacoteAlvo.closest("#campo-j2") !== null;
        
        if ((quemJogou.includes("j1") && !alvoNoCampo1) || (quemJogou.includes("j2") && !alvoNoCampo2)) {
            return narrar("❌ Alvo inválido! A poção Recuperida só pode ser usada em cartas ALIADAS. Escolha outra carta.");
        }

        let vidaElemento = document.getElementById("vida-" + idAlvo);
        if (vidaElemento) {
            let vidaAtual = parseInt(vidaElemento.innerText);
            let novaVida = vidaAtual + 1; 
            
            vidaElemento.innerText = novaVida;
            narrar(`💚 Recuperida ativada! [${nomeAlvo}] ganhou +1 de vida! (Vida Atual: ${novaVida})`);
            
            itemNaMao.remove();
            suportePreparado = null;
        }
    } 

    // --- REGRA DA TRAIÇÃO (PASSO 1: Escolher o Traidor) ---
    if (suportePreparado === 'Traicao') {
        let itemNaMao = document.getElementById("pacote-" + idItemNaMao);
        if (!itemNaMao) return;

        let quemJogou = itemNaMao.parentElement ? itemNaMao.parentElement.id : "";
        let alvoNoCampo1 = pacoteAlvo.closest("#campo-j1") !== null;
        let alvoNoCampo2 = pacoteAlvo.closest("#campo-j2") !== null;

        // Se a poção saiu da tua mão (j1), só podes atirar num inimigo (j2)
        if (quemJogou.includes("j1") && !alvoNoCampo2) {
            return narrar("❌ Alvo inválido! Deves atirar a Poção da Traição numa carta do INIMIGO.");
        }
        // Se a poção saiu da mão do oponente (j2), ele só pode atirar numa carta TUA (j1)
        if (quemJogou.includes("j2") && !alvoNoCampo1) {
            return narrar("❌ Alvo inválido! O Oponente deve atirar a Poção da Traição numa carta SUA.");
        }

        modoTraicao = true;
        idTraidor = idAlvo;
        
        narrar(`🗡️ [${nomeAlvo}] bebeu a Poção da Traição! Agora CLICA num parceiro dele para sofrer o ataque!`);
        itemNaMao.remove();
        suportePreparado = null; // Limpa para evitar bugs no próximo clique
    }
}

function ativarSuporte(nomeOriginal, idItem) {
    suportePreparado = nomeOriginal;
    idItemNaMao = idItem;
    
    if (nomeOriginal === 'Besta') {
        narrar(`⚡ AÇÃO RÁPIDA: Besta engatilhada! Clique na IMAGEM de uma tropa na arena.`);
    } else if (nomeOriginal === 'Velux') {
        narrar(`✨ Poção Velux preparada! Pode ser usada a qualquer momento!`);
    } else if (nomeOriginal === 'Adiv') {
        narrar(`🧪 Splash! Poção Adiv engatilhada! Clique em QUALQUER carta na arena para tirar 1 de vida.`);
    } else if (nomeOriginal === 'Recuperida') {
        narrar(`🧪 MODO CURA: Poção Recuperida engatilhada! Clique na imagem de uma criatura ALIADA para curar 1 de vida.`);
    } else if (nomeOriginal === 'Traicao') {
        narrar(`🧪 Poção da Traição engatilhada! Clique em uma carta INIMIGA para ela se voltar contra o próprio time.`);
    }
}
function executarTraicao(idAlvoPacote) {
    let pacoteTraidor = document.getElementById("pacote-" + idTraidor);
    let pacoteVitima = document.getElementById(idAlvoPacote);
    
    if (!pacoteTraidor || !pacoteVitima) {
        modoTraicao = false;
        idTraidor = null;
        return;
    }
    
    let idVitima = idAlvoPacote.replace("pacote-", "");
    if (idTraidor === idVitima) return narrar("❌ O traidor não pode esfaquear a si mesmo! Escolha outra carta do lado dele.");

    // Descobre em qual lado da arena cada um está (j1 ou j2)
    let ladoTraidor = pacoteTraidor.closest("#campo-j1") ? "j1" : "j2";
    let ladoVitima = pacoteVitima.closest("#campo-j1") ? "j1" : "j2";
    
    // A vítima TEM que ser parceira do traidor
    if (ladoTraidor !== ladoVitima) {
        return narrar("❌ O alvo precisa ser um ALIADO do traidor (estar do mesmo lado da arena)!");
    }

    let nomeTraidor = pacoteTraidor.querySelector(".nome-carta").innerText.trim();
    let nomeVitima = pacoteVitima.querySelector(".nome-carta").innerText.trim();
    
    let danoElemento = document.getElementById("dano-" + idTraidor);
    let danoDoTraidor = danoElemento ? parseFloat(danoElemento.innerText) : 0;
    
    narrar(`🗡️ TRAIÇÃO! [${nomeTraidor}] esfaqueou seu próprio parceiro [${nomeVitima}] causando ${danoDoTraidor} de dano! Turno encerrado!`);
    
    // Aplica o dano
    let isInimigo = (ladoVitima === "j2");
    aplicarDanoDireto(idAlvoPacote, danoDoTraidor, isInimigo);

    // Finaliza e desliga o modo traição
    modoTraicao = false;
    idTraidor = null;

    // 🔥 AQUI ESTÁ A MÁGICA: Passa o turno automaticamente após a traição!
    passarTurno();
}

window.onload = function() {
    iniciarJogo();
};