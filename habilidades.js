let orkBuffado = {}; 
let modoCura = false;
let idCurandeiroAtivo = "";
let buffCuraCurandeiro = 0;       
let modoAtaqueCurandeiro = false;  
let modoCuraInimigo = false;
let buffCuraCurandeiroInimigo = 0;
let modoAtaqueCurandeiroInimigo = false;
let modoLadrao = false;
let faseLadrao = 0; 
let tipoRouboLadrao = ""; 
let ladroesQueJaRoubaram = {}; 
let cavaleiroAtivado = {}; // Guarda quais Cavaleiros conseguiram o bônus permanente

function iniciarCura(idUnicoCurandeiro) {
    modoCura = true;
    idCurandeiroAtivo = idUnicoCurandeiro;
    narrar("💚 Modo Cura Ativado! Clique em uma de suas cartas no campo para curá-la.");
}

function aplicarCuraAliada(idDoPacote) {
    let idPuro = idDoPacote.replace("pacote-", "");
    let nomeCarta = document.getElementById(idDoPacote).querySelector(".nome-carta").innerText;
    
    let cartaOriginal = bancoDeCartas.find(c => c.nome === nomeCarta);
    if (!cartaOriginal) return;

    let maxVida = cartaOriginal.vida;
    let valorCura = maxVida / 2; 

    let txtVida = document.getElementById("vida-" + idPuro);
    let vidaAtual = parseFloat(txtVida.innerText);
    
    let novaVida = Math.min(maxVida, vidaAtual + valorCura);
    txtVida.innerText = novaVida;

    let msgBuff = "";
    if (buffCuraCurandeiro > 0) {
        let txtDano = document.getElementById("dano-" + idPuro);
        let danoAtual = parseFloat(txtDano.innerText);
        txtDano.innerText = danoAtual + buffCuraCurandeiro;
        msgBuff = ` e recebeu +${buffCuraCurandeiro} de ataque permanentemente!`;
        buffCuraCurandeiro = 0; 
    }

    narrar(`💚 ${nomeCarta} foi curado em +${valorCura} de vida${msgBuff}. Como você curou, seu turno acabou.`);
    
    modoCura = false;
    idCurandeiroAtivo = "";
    passarTurno();

    atualizarTodosUnidoes();
}

function iniciarCuraInimigo(idUnicoCurandeiro) {
    modoCuraInimigo = true;
    narrar("💚 Modo Cura Ativado! O Oponente deve clicar numa carta dele para curar.");
}

function aplicarCuraInimiga(idDoPacote) {
    let idPuro = idDoPacote.replace("pacote-", "");
    let nomeCarta = document.getElementById(idDoPacote).querySelector(".nome-carta").innerText;
    
    let cartaOriginal = bancoDeCartas.find(c => c.nome === nomeCarta);
    if (!cartaOriginal) return;

    let maxVida = cartaOriginal.vida;
    let valorCura = maxVida / 2;

    let txtVida = document.getElementById("vida-" + idPuro);
    let vidaAtual = parseFloat(txtVida.innerText);
    
    let novaVida = Math.min(maxVida, vidaAtual + valorCura);
    txtVida.innerText = novaVida;

    let msgBuff = "";
    if (buffCuraCurandeiroInimigo > 0) {
        let txtDano = document.getElementById("dano-" + idPuro);
        let danoAtual = parseFloat(txtDano.innerText);
        txtDano.innerText = danoAtual + buffCuraCurandeiroInimigo;
        msgBuff = ` e recebeu +${buffCuraCurandeiroInimigo} de ataque permanentemente!`;
        buffCuraCurandeiroInimigo = 0; 
    }

    narrar(`💚 ${nomeCarta} do Oponente foi curado em +${valorCura} de vida${msgBuff}. O turno dele acabou.`);
    
    modoCuraInimigo = false;
    passarTurno();

    atualizarTodosUnidoes();
}

function usarHabilidade(nome, idUnico, botao) {
    let dadoTela = document.getElementById("dado-tela");

    if (nome === 'Necromante') {
        let resultadoDado = Math.floor(Math.random() * 6) + 1;
        
        dadoTela.style.animation = 'none';
        setTimeout(() => dadoTela.style.animation = '', 10);
        dadoTela.innerText = "🎲 " + resultadoDado;

        let ehAliado = botao.closest('#campo-j1') || botao.closest('#mao-j1') || botao.closest('.carta-aliada'); 
        
        let idMao = ehAliado ? "mao-j1" : "mao-j2";
        let idCampo = ehAliado ? "campo-j1" : "campo-j2";
        
        let maoHTML = document.getElementById(idMao);
        let campoHTML = document.getElementById(idCampo);

        if (resultadoDado >= 3 && resultadoDado <= 5) {
            // LÓGICA INFALÍVEL: Pega as cartas direto do HTML da mão (elas têm o ID começando com pacote-necro_)
            let cartasInvocadasNoHTML = Array.from(maoHTML.querySelectorAll('div[id^="pacote-necro_"]'));

            if (cartasInvocadasNoHTML.length > 0) {
                let danoExtra = 0;

                cartasInvocadasNoHTML.forEach(pacoteCarta => {
                    // Move a carta fisicamente para a arena
                    campoHTML.appendChild(pacoteCarta);
                    
                    // Libera os botões de ação dela
                    let divAcoes = pacoteCarta.querySelector("div[id^='acoes-']");
                    if (divAcoes) divAcoes.style.display = "block";
                    
                    // Ajusta a classe para aliado ou inimigo
                    pacoteCarta.className = ehAliado ? "carta-aliada" : "carta-inimiga";
                    
                    // Lê o dano da carta direto da tela
                    let idDaCarta = pacoteCarta.id.replace("pacote-", "");
                    let elemDano = document.getElementById("dano-" + idDaCarta);
                    if (elemDano) {
                        danoExtra += parseFloat(elemDano.innerText);
                    }

                    // 🚨 NOVIDADE AQUI: Se a carta trazida for OUTRO Necromante, ativa a passiva dele automaticamente!
                    let nomeDestaCarta = pacoteCarta.querySelector(".nome-carta").innerText;
                    if (nomeDestaCarta === 'Necromante') {
                        verificarPassivaNecromante({nome: "Necromante", passivaAtivada: false}, ehAliado);
                    }
                });

                let danoTotal = 1 + danoExtra;
                narrar(`🔮 SUCESSO! Dado: ${resultadoDado}. As cartas saltaram da mão para a arena! Causaram ${danoTotal} de dano!`);
            } else {
                narrar(`🔮 SUCESSO! Dado: ${resultadoDado}. Porém as cartas invocadas já não estão na mão! Causou 1 de dano.`);
            }
        } else {
            narrar(`❌ FALHOU! O dado deu ${resultadoDado}. As cartas continuam na mão.`);
        }
        
        botao.style.display = "none"; 
        if (typeof atualizarTodosUnidoes === "function") atualizarTodosUnidoes();
        return; // SEM PASSAR O TURNO!
    }
    
    if (nome === 'Ork') {
        let resultadoDado = Math.floor(Math.random() * 6) + 1;
        
        dadoTela.style.animation = 'none';
        setTimeout(() => dadoTela.style.animation = '', 10);
        dadoTela.innerText = "🎲 " + resultadoDado;

        if (resultadoDado === 1) {
            orkBuffado[idUnico] = true; 
            narrar(`🔮 SUCESSO! Dado: 1. O Ork entrou em fúria! Se morrer, invocará 3 Goblins.`);
        } else {
            narrar(`❌ FALHOU! Dado: ${resultadoDado}. O Ork não se enfureceu.`);
        }
        
        botao.style.display = "none"; 
        return; // SEM PASSAR O TURNO!
    }
    
    if (nome === 'Curandeiro') {
        let ehAliado = botao.closest('#campo-j1') || botao.closest('#mao-j1') || botao.closest('.carta-aliada');
        
        let dado1 = Math.floor(Math.random() * 6) + 1;
        let dado2 = Math.floor(Math.random() * 6) + 1;

        dadoTela.style.animation = 'none';
        setTimeout(() => dadoTela.style.animation = '', 10);
        dadoTela.innerText = `🎲 Dado 1: ${dado1} | Dado 2: ${dado2}`;

        let ehImpar = (dado1 % 2 !== 0);
        let deuBuff = (dado2 === 1 || dado2 === 3);

        let msgDano = "";
        if (ehImpar) {
            let spanDano = document.getElementById("dano-" + idUnico);
            let danoAtual = parseFloat(spanDano.innerText);
            spanDano.innerText = danoAtual + 1;
            msgDano = ehAliado ? "💥 Dado 1 ÍMPAR! Seu Curandeiro ganhou +1 de Ataque." : "💥 Dado 1 ÍMPAR! O Curandeiro Inimigo ganhou +1 de Ataque.";
        } else {
            msgDano = "❌ Dado 1 foi PAR (Sem ganho de ataque).";
        }

        let msgBuff = "";
        if (deuBuff) {
            if (ehAliado) buffCuraCurandeiro = 0.5;
            else buffCuraCurandeiroInimigo = 0.5;
            msgBuff = "✨ Dado 2 foi 1 ou 3! A próxima cura dará +0.5 de bônus.";
        } else {
            msgBuff = "❌ Dado 2 não foi 1 nem 3.";
        }

        narrar(`🔮 Habilidade Curandeiro: ${msgDano} ${msgBuff}`);
        botao.style.display = "none";
        return; // SEM PASSAR O TURNO!
    }

    if (nome === "Ctrl C" || nome === "Ctrl V") {
        let dadosCopia = ctrlV[idUnico];
        if (!dadosCopia) return narrar("Erro: Não encontrei os dados da carta copiada!");
        
        // 🚨 CORREÇÃO: Esconde o botão do Ctrl para ele não ser usado várias vezes
        botao.style.display = "none";
        
        let nomeCopiado = dadosCopia.nomeOriginal;
        narrar(`🔮 O ${nome} ativou a habilidade copiada de [${nomeCopiado}]!`);
        
        // Dispara a habilidade real que ele copiou
        usarHabilidade(nomeCopiado, idUnico, botao);
        
        // Após 2.5 segundos, rola o dado extra da própria carta
        setTimeout(() => {
            let dadoBonus = Math.floor(Math.random() * 6) + 1;
            let dadoTela = document.getElementById("dado-tela");
            
            dadoTela.style.animation = 'none';
            setTimeout(() => dadoTela.style.animation = '', 10);
            dadoTela.innerText = "🎲 " + dadoBonus;
            
            if (dadoBonus === 3) {
                let elemDano = document.getElementById("dano-" + idUnico);
                let danoAtual = parseInt(elemDano.innerText);
                elemDano.innerText = danoAtual + 1;
                narrar(`🎯 Dado bônus do ${nome} tirou 3! Ganhou +1 de Dano permanentemente!`);
            } else {
                narrar(`🎲 Dado bônus do ${nome} tirou ${dadoBonus}. Sem bônus de dano extra.`);
            }
        }, 2500); 
        
        return; // SEM PASSAR O TURNO!
    }

    // --- HABILIDADE DO CAVALEIRO DAS TREVAS ---
    if (nome === 'Cavaleiro das Trevas') {
        let ehAliado = botao.closest(".carta-aliada") !== null;
        
        if (cavaleiroAtivado[idUnico]) {
            return narrar("A habilidade deste Cavaleiro já está ativada com poder máximo!");
        }
        
        botao.style.display = "none"; // Some com o botão pra não clicar de novo
        
        narrar("Rolando o dado para despertar o Cavaleiro (precisa de 5)...");
        
        setTimeout(() => {
            let dado = Math.floor(Math.random() * 6) + 1;
            document.getElementById("dado-tela").innerText = "🎲 " + dado;
            
            if (dado === 5) {
                cavaleiroAtivado[idUnico] = true;
                let elemDano = document.getElementById("dano-" + idUnico);
                if (elemDano) elemDano.innerText = "5"; 
                narrar("MÁXIMO PODER! O Cavaleiro das Trevas despertou e agora dá 5 de dano em até 3 cartas!");
            } else {
                narrar(`Tirou ${dado}. A habilidade falhou.`);
            }
            
            if (typeof atualizarTodosUnidoes === "function") atualizarTodosUnidoes();
        }, 1200);
        return; // SEM PASSAR O TURNO!
    }
    
    // --- REGRA DO TRIO DE GOBLIN ---
    if (nome === "Trio de Goblin") {
        let vidaAtual = parseFloat(document.getElementById("vida-" + idUnico).innerText);
        if (vidaAtual > 2) {
            return narrar("❌ O Trio de Goblin só pode usar a habilidade especial quando restar apenas 1 Goblin (2 ou menos de vida)!");
        } else {
            narrar("🔥 Restou apenas um! O último do Trio ativou a habilidade do Goblin!");
            nome = "Goblin"; // Truque: Muda o nome para Goblin, assim o código dele cai direto no bloco do Goblin logo abaixo!
        }
    }
    // --- HABILIDADE DO GOBLIN ---
    if (nome === 'Goblin') {
        let dado = Math.floor(Math.random() * 6) + 1;
        document.getElementById("dado-tela").innerText = "🎲 " + dado;

        if (dado === 1 || dado === 2) {
            narrar(`💰 SUCESSO! Dado: ${dado}. O Goblin preparou o roubo! Clique em uma carta INIMIGA na arena para roubar 1 de DANO.`);
            modoRouboGoblin = true;
            idGoblinLadrao = idUnico; // Guarda quem é o Goblin que vai receber o dano
        } else {
            narrar(`❌ FALHOU! Tirou ${dado}. O Goblin tentou roubar, mas tropeçou e foi pego.`);
        }

        botao.style.display = "none";
        return; // Habilidade não passa o turno!
    }
    // --- HABILIDADE DO GUERREIRO ---
    if (nome === 'Guerreiro') {
        let dado = Math.floor(Math.random() * 6) + 1; // Rola o dado de 1 a 6
        
        let dadoTela = document.getElementById("dado-tela");
        dadoTela.style.animation = 'none';
        setTimeout(() => dadoTela.style.animation = '', 10);
        dadoTela.innerText = "🎲 " + dado;
        
        if (dado >= 1 && dado <= 4) {
            escudoGuerreiro[idUnico] = true;
            narrar(`🛡️ SUCESSO! O Guerreiro rolou ${dado} e ergueu o seu escudo impenetrável para esta rodada!`);
        } else {
            narrar(`🎲 FALHA... O Guerreiro rolou ${dado} e o escudo encravou.`);
        }
        
        // Bloqueia o botão para ser de Uso Único
        botao.style.display = "none";
        return; // Ação rápida, não passa o turno!
    }
    // --- HABILIDADE: BARRIL DE GOBLINS ---
    if (nome.includes('Barril de Goblin')) { // 🚀 .includes FAZ O CTRL V FUNCIONAR!
        let idAlvo = alvosDoBarril[idUnico];
        if (!idAlvo) return narrar("Este Barril precisa atacar e focar um alvo primeiro!");

        // 🚀 LÊ O DANO EXTRA (BUFFS DA BESTA, UNIDÃO, ETC)
        let txtDano = document.getElementById("dano-" + idUnico);
        let buffDano = txtDano ? parseFloat(txtDano.innerText) : 0;

        let dado = Math.floor(Math.random() * 6) + 1;
        
        let dadoTela = document.getElementById("dado-tela");
        dadoTela.style.animation = 'none';
        setTimeout(() => dadoTela.style.animation = '', 10);
        dadoTela.innerText = "🎲 " + dado;
        
        if (dado === 3) {
            let danoHabilidade = 1.5 + buffDano; // 🚀 SOMA O BUFF AQUI (0.5 + 1 da Besta = 1.5)
            
            let vizinhos = obterCartasAdjacentes("pacote-" + idAlvo);
            vizinhos.forEach(vizinho => {
                let isInimigo = vizinho.closest("#campo-j2") !== null;
                aplicarDanoDireto(vizinho.id, danoHabilidade, isInimigo);
            });
            narrar(`🎲 SUCESSO! Tirou 3! O Barril causou +${danoHabilidade} de dano nos vizinhos do alvo focado!`);
        } else {
            narrar(`🎲 FALHA! Tirou ${dado}. A habilidade não ativou.`);
        }
        
        botao.style.display = "none";
        return; 
    }
}
// --- PASSIVA DO NECROMANTE (CORREÇÃO DE ERRO) ---
function verificarPassivaNecromante(carta, ehAliado) {
    // Verifica se a carta que acabou de entrar no campo é o Necromante
    if (carta.nome === "Necromante" && !carta.passivaAtivada) {
        narrar("💀 O Necromante entrou na arena com sua aura sombria!");
        carta.passivaAtivada = true;
        let maoArray = ehAliado ? maoJ1 : maoJ2; 
        let idMaoHTML = ehAliado ? "mao-j1" : "mao-j2";
        let funcaoJogar = ehAliado ? "jogarCarta" : "jogarCartaInimigo";
        let classeCss = ehAliado ? "carta-aliada" : "carta-inimiga-espera"; 
        
        let divMao = document.getElementById(idMaoHTML);

        let suportesReais = [
            "besta", "recuperida", "velux", "pocaotraicao", 
            "adiv", "pocaogelo", "escudo_item", "cavalotroia", "fogueira"
        ];

        let bancoDeTropas = bancoDeCartas.filter(c => !suportesReais.includes(c.id));

        for (let i = 0; i < 2; i++) {
            let indexSorteado = Math.floor(Math.random() * bancoDeTropas.length);
            let cartaSorteada = bancoDeTropas[indexSorteado];

            let novaCarta = {
                ...cartaSorteada, 
                idUnico: 'necro_' + Math.random().toString(36).substr(2, 9),
                invocadaPor: 'Necromante' 
            };

            // 🚨 NOVIDADE AQUI: A carta recebe 2 turnos de bloqueio (O seu e o do oponente = 1 rodada completa)
            bloqueioNecro[novaCarta.idUnico] = 2; 

            let htmlDaCarta = criarHTMLCarta(novaCarta, funcaoJogar, classeCss, ehAliado);
            if (divMao) {
                divMao.insertAdjacentHTML('beforeend', htmlDaCarta);
            }
        }
    }
}

function usarPassivaLadrao(idUnico, botao) {
    let ehAliado = botao.closest('#campo-j1') || botao.closest('#mao-j1');

    if (ladroesQueJaRoubaram[idUnico]) {
        return narrar("❌ Este Ladrão já usou sua passiva neste turno!");
    }

    let dadoTela = document.getElementById("dado-tela");
    let resultadoDado = Math.floor(Math.random() * 6) + 1;

    dadoTela.style.animation = 'none';
    setTimeout(() => dadoTela.style.animation = '', 10);
    dadoTela.innerText = "🎲 " + resultadoDado;

    ladroesQueJaRoubaram[idUnico] = true; 

    if (resultadoDado === 1 || resultadoDado === 3) {
        modoLadrao = true;
        faseLadrao = 1;
        tipoRouboLadrao = "vida";
        narrar(`💰 Ladrão tirou ${resultadoDado}! Clique em uma carta INIMIGA do campo para roubar 1 de VIDA.`);
    } else if (resultadoDado === 4 || resultadoDado === 6) {
        modoLadrao = true;
        faseLadrao = 1;
        tipoRouboLadrao = "dano";
        narrar(`💰 Ladrão tirou ${resultadoDado}! Clique em uma carta INIMIGA do campo para roubar 1 de DANO.`);
    } else {
        narrar(`❌ O Ladrão rolou ${resultadoDado}. O plano de roubo falhou e a chance foi gasta!`);
    }
}

function aplicarRouboPrejuizo(idPacoteAlvo) {
    let idPuro = idPacoteAlvo.replace("pacote-", "");
    
    if (tipoRouboLadrao === "vida") {
        let txtVida = document.getElementById("vida-" + idPuro);
        let vidaAtual = parseFloat(txtVida.innerText);
        txtVida.innerText = vidaAtual - 1;
        
        narrar("💰 Alvo surrupiado! Agora clique em uma carta SUA na arena para entregar +1 de VIDA.");
        
        if (vidaAtual - 1 <= 0) {
            let pacote = document.getElementById(idPacoteAlvo);
            let nomeDestaCarta = pacote.querySelector(".nome-carta").innerText;
            let campoAlvo = pacote.closest("#campo-j2") ? "campo-j2" : "campo-j1";
            pacote.remove();
            if (nomeDestaCarta === "Ork") {
                let qtd = orkBuffado[idPuro] ? 3 : 2;
                narrar(`💀 PASSIVA: O Ork morreu devido ao roubo e invocou ${qtd} Goblins!`);
                for (let i = 0; i < qtd; i++) invocarToken("goblin", campoAlvo);
            }
        }
    } else if (tipoRouboLadrao === "dano") {
        let txtDano = document.getElementById("dano-" + idPuro);
        let danoAtual = parseFloat(txtDano.innerText);
        txtDano.innerText = Math.max(0, danoAtual - 1); 
        narrar("💰 Alvo surrupiado! Agora clique em uma carta SUA na arena para entregar +1 de DANO.");
    }
    
    faseLadrao = 2; 

    atualizarTodosUnidoes();
}

function aplicarRouboBeneficio(idPacoteAliado) {
    let idPuro = idPacoteAliado.replace("pacote-", "");
    let nomeCarta = document.getElementById(idPacoteAliado).querySelector(".nome-carta").innerText;
    
    if (tipoRouboLadrao === "vida") {
        let txtVida = document.getElementById("vida-" + idPuro);
        let vidaAtual = parseFloat(txtVida.innerText);
        txtVida.innerText = vidaAtual + 1;
        narrar(`💰 Sucesso total! +1 de VIDA transferido para ${nomeCarta}. Agora você pode Atacar ou Curar!`);
    } else if (tipoRouboLadrao === "dano") {
        let txtDano = document.getElementById("dano-" + idPuro);
        let danoAtual = parseFloat(txtDano.innerText);
        txtDano.innerText = danoAtual + 1;
        narrar(`💰 Sucesso total! +1 de DANO transferido para ${nomeCarta}. Agora você pode Atacar ou Curar!`);
    }

    modoLadrao = false;
    faseLadrao = 0;
    tipoRouboLadrao = "";

    atualizarTodosUnidoes();
}
function aplicarRouboDanoGoblin(idPacoteAlvo) {
    let idPuroAlvo = idPacoteAlvo.replace("pacote-", "");
    let txtDanoAlvo = document.getElementById("dano-" + idPuroAlvo);

    if (!txtDanoAlvo) return; 

    let danoAtualAlvo = parseFloat(txtDanoAlvo.innerText);

    if (danoAtualAlvo > 0) {
        // 1. Tira 1 de dano do alvo clicado
        txtDanoAlvo.innerText = danoAtualAlvo - 1;
        
        // 2. Entrega 1 de dano para o Goblin que ativou o poder
        let txtDanoGoblin = document.getElementById("dano-" + idGoblinLadrao);
        if (txtDanoGoblin) {
            txtDanoGoblin.innerText = parseFloat(txtDanoGoblin.innerText) + 1;
        }

        narrar("💰 Roubo concluído! O Goblin roubou 1 de dano do alvo!");
    } else {
        narrar("Essa carta já tem 0 de dano! O Goblin não conseguiu roubar nada.");
    }

    // Limpa a mira para você voltar a jogar normalmente
    modoRouboGoblin = false;
    idGoblinLadrao = null;

    if (typeof atualizarTodosUnidoes === "function") atualizarTodosUnidoes();
}

function usarPassivaCtrlC(idUnico, botao) {
    let pacote = document.getElementById("pacote-" + idUnico);
    let ehAliado = pacote.classList.contains("carta-aliada");
    
    let nomeDaCartaAtual = pacote.querySelector(".nome-carta").innerText; 
    let cartaAlvo = ehAliado ? ultimaCartaOponente : ultimaCartaJogador;
    
    if (!cartaAlvo) {
        return narrar("Nenhuma carta válida foi jogada pelo oponente ainda para ser copiada!");
    }
    
    let novaVida = Math.max(1, cartaAlvo.vida - 1);
    let novoDano = Math.max(1, cartaAlvo.dano - 1);
    
    document.getElementById("vida-" + idUnico).innerText = novaVida;
    document.getElementById("dano-" + idUnico).innerText = novoDano;
    
    ctrlV[idUnico] = {
        nomeOriginal: cartaAlvo.nome,
        ehAliado: ehAliado
    };
    
    narrar(`📋 Cópia concluída! Seu ${nomeDaCartaAtual} copiou [${cartaAlvo.nome}] com atributos reduzidos em 1.`);
    // Se copiou um Necromante, puxa as 2 tropas na mesma hora!
    if (cartaAlvo.nome === "Necromante") {
        narrar(`✨ PASSIVA COPIADA! O ${nomeDaCartaAtual} forçou a magia do Necromante e invocou 2 tropas da sua mão!`);
        verificarPassivaNecromante({nome: "Necromante", passivaAtivada: false}, ehAliado);
    }
    
    let divAcoes = pacote.querySelector("div[id^='acoes-']");
    
    let botaoAtaque = ehAliado ? 
        `<button onclick="iniciarAtaque('${cartaAlvo.nome}', '${idUnico}')" style="padding: 5px; width: 100%; margin-bottom: 2px; cursor: pointer;">Atacar ⚔️</button>` :
        `<button onclick="inimigoAtacar('${idUnico}')" style="padding: 5px; background-color: darkred; color: white; width: 100%; margin-bottom: 2px; cursor: pointer;">Atacar ⚔️</button>`;
    
    let btnEspecial = `<button onclick="usarHabilidade('${nomeDaCartaAtual}', '${idUnico}', this)" style="background-color: purple; color: white; width: 100%; margin-bottom: 2px; cursor: pointer;">Especial 🔮</button>`;
    
    let botoesExtras = "";
    if (cartaAlvo.nome === "Curandeiro") {
        botoesExtras = ehAliado ? 
            `<button onclick="iniciarCura('${idUnico}')" style="background-color: green; color: white; width: 100%; margin-bottom: 2px; cursor: pointer;">Curar 💚</button>` : 
            `<button onclick="iniciarCuraInimigo('${idUnico}')" style="background-color: green; color: white; width: 100%; margin-bottom: 2px; cursor: pointer;">Curar Oponente 💚</button>`;
    }
    if (cartaAlvo.nome === "Ladrão") {
        botoesExtras = `<button onclick="usarPassivaLadrao('${idUnico}', this)" style="background-color: gold; font-weight: bold; width: 100%; margin-bottom: 2px; cursor: pointer;">Passiva 💰</button>`;
    }

    divAcoes.innerHTML = `
        ${botaoAtaque}
        ${btnEspecial}
        ${botoesExtras}
    `;
}