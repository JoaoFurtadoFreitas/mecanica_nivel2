class Jogo extends Phaser.Scene {
    constructor() {
        super({ key: "Jogo" });
    }

    preload() {
        this.load.atlas('cartasAtlas', 'assets/cartas_atlas.png', 'assets/cartas_atlas.json');
        this.load.json('cartasData', 'assets/Escolhas.json')
        this.load.image('fundo', 'assets/fundo.png'); // Altere o caminho se necessário

    }

    create() {
        this.parametros = {
            lucro: 40,
            funcionarios: 40,
            publico: 40,
            pilares: 40,
        };

        const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

         // 🔹 Adiciona a imagem de fundo
    this.add.image(centerX, centerY, 'fundo').setDisplaySize(window.innerWidth, window.innerHeight);

    // 🔹 Retângulo central para os elementos do jogo
    let fundoJogo = this.add.rectangle(centerX, centerY, 650, window.innerHeight, 0x222222, 0.8);
    fundoJogo.setDepth(1); // Mantém no fundo

    // 🔹 Retângulo onde ficarão as barras de parâmetros
    let fundoBarras = this.add.rectangle(centerX, 63, 650, 150, 0x111111, 0.8);
    fundoBarras.setDepth(2);

        this.criarBarrasStatus();

        console.log("Carregando cartas do JSON...");
        this.cartasData = this.cache.json.get('cartasData');
        this.cartasData = this.cartasData.cartas;
        
      
        console.log("Cartas carregadas:", this.cartasData);

        // Gera uma lista de 50 cartas dinamicamente
        this.cartas = Array.from({ length: 50 }, (_, i) => i + 1);
       
        this.indiceCartaAtual = 0;

        

        // Embaralha as cartas do JSON
        this.cartas = Phaser.Utils.Array.Shuffle(this.cartasData);
        

        this.exibirCartaAtual();

    }

    criarBarrasStatus() {
        this.barras = {};
        const nomes = ["lucro", "funcionarios", "publico", "pilares"];
        const cores = [0x00ff00, 0xffcc00, 0x00aaff, 0xff3333];
    
        const espacamento = 150; // Espaço entre as barras
        const larguraTotal = (nomes.length - 1) * espacamento;
        const centerX = this.cameras.main.width / 2;
        const yBase = 100; // Posição vertical das barras
    
        nomes.forEach((nome, index) => {
            let x = centerX - larguraTotal / 2 + index * espacamento; // Calcula a posição centralizada
    
            this.add.rectangle(x, yBase, 30, 100, 0x444444).setOrigin(0.5, 1).setDepth(2);
    
            let barra = this.add.rectangle(x, yBase, 30, this.parametros[nome], cores[index]).setOrigin(0.5, 1).setDepth(2);
            this.barras[nome] = barra;
    
            this.add.text(x, yBase + 10, nome, {
                fontSize: "16px",
                color: "#ffffff",
                fontFamily: "Arial",
                align: "center"
            }).setOrigin(0.5, 0).setDepth(2);
        });
    }
    

    atualizarBarrasStatus() {
        Object.keys(this.parametros).forEach(nome => {
            let valor = Phaser.Math.Clamp(this.parametros[nome], 0, 100); // Mantém entre 0 e 100
    
            let alturaMaxima = 100; // Altura máxima da barra
            let novaAltura = (valor / 100) * alturaMaxima; // Calcula a altura proporcional
    
            this.tweens.add({
                targets: this.barras[nome],
                displayHeight: novaAltura, // Alterando a altura correta
                y: 100, // Mantém a base fixa no fundo
                duration: 300,
                ease: "Power2"
            });
    
            console.log(`Parâmetro ${nome}: ${valor} | Altura ajustada: ${novaAltura}`);
        });
    }
    
    
    
    exibirCartaAtual() {
        if (this.indiceCartaAtual >= this.cartas.length) {
            console.log("Fim das cartas!");
            return;
        }
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
    
        const cartaAtual = this.cartas[this.indiceCartaAtual];
        console.log(`Exibindo carta: ${cartaAtual.descricao}`);


        console.log(` Exibindo carta ${this.indiceCartaAtual + 1}:`, cartaAtual);

    
        let carta = this.add.sprite(0, 0, 'cartasAtlas', cartaAtual.id).setScale(0.6);

        let larguraTexto = 280; // Largura máxima do texto
        let alturaMinima = 50;  // Altura mínima do fundo
        let padding = 10;       // Espaço extra ao redor do texto

    
        let retanguloTexto = this.add.graphics();
        retanguloTexto.fillStyle(0x000000, 0.5);
        retanguloTexto.fillRoundedRect(-150, -210, 300, 100, 10);
        retanguloTexto.setVisible(false);
    
        let textoEscolha = this.add.text(0, -180, '', {
            fontSize: "18px",
            color: "#ffffff",
            fontFamily: "Arial",
            align: "center",
            wordWrap: { width: larguraTexto, useAdvancedWrap: true },
        }).setOrigin(0.5, 0.5);
        textoEscolha.setVisible(false);

        function ajustarRetangulo() {
            let alturaTexto = textoEscolha.height;
            let novaAltura = Math.max(alturaMinima, alturaTexto + 2 * padding);
            
            retanguloTexto.clear();
            retanguloTexto.fillStyle(0x000000, 0.5);
            retanguloTexto.fillRoundedRect(-larguraTexto / 2 - padding, -210, larguraTexto + 2 * padding, novaAltura, 5);
        }


    
        this.containerCarta = this.add.container(centerX, centerY+40, [carta, retanguloTexto, textoEscolha]).setDepth(3).setScale(0.9);
        this.containerCarta.setSize(240, 360);
        this.containerCarta.setInteractive();
        this.input.setDraggable(this.containerCarta);
    
        this.input.off("drag");
        this.input.off("dragend");
    
        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            if (!this.containerCarta) return;
        
            const limiteEsquerda = this.cameras.main.width * 0.4;
            const limiteDireita = this.cameras.main.width * 0.6;
            const limiteSuperior = this.cameras.main.height * 0.59;
            const limiteInferior = this.cameras.main.height * 0.58;
        
            // Mantém a carta dentro dos limites da caixa
            let novoX = Phaser.Math.Clamp(dragX, limiteEsquerda, limiteDireita);
            let novoY = Phaser.Math.Clamp(dragY, limiteSuperior, limiteInferior);
        
            let deslocamentoX = novoX - centerX;
            let rotacao = Phaser.Math.Clamp(deslocamentoX * 0.002, -0.25, 0.25);
        
            gameObject.x = novoX;
            gameObject.y = novoY;
            gameObject.rotation = rotacao;
        
            if (novoX < centerX - 100) {
                textoEscolha.setText(`Escolha: ${cartaAtual.opcoes[0].texto}`);
                ajustarRetangulo();
                retanguloTexto.setVisible(true);
                textoEscolha.setVisible(true);
            } else if (novoX > centerX + 100) {
                textoEscolha.setText(`Escolha: ${cartaAtual.opcoes[1].texto}`);
                ajustarRetangulo();
                retanguloTexto.setVisible(true);
                textoEscolha.setVisible(true);
            } else {
                retanguloTexto.setVisible(false);
                textoEscolha.setVisible(false);
            }
        });
        
        
        this.input.on("dragend", (pointer, gameObject) => {
            let escolha = null;
            let limiteEscolha = 100; // Distância mínima para validar a escolha
        
            if (!this.containerCarta) return;
        
            if (gameObject.x < centerX - limiteEscolha) {
                escolha = cartaAtual.opcoes[0];
            } else if (gameObject.x > centerX + limiteEscolha) {
                escolha = cartaAtual.opcoes[1];
            }
        
            if (escolha) {
                // 🔹 Adiciona um efeito de rotação ao soltar para confirmar a escolha
                this.aplicarEfeitosCarta(escolha.efeitos);
                let anguloFinal = escolha === cartaAtual.opcoes[0] ? -0.1 : 0.1;
                let destinoX = escolha === cartaAtual.opcoes[0] ? -50 : this.cameras.main.width + 50;
        
                this.tweens.add({
                    targets: this.containerCarta,
                    x: destinoX,
                    rotation: anguloFinal,
                    alpha: 0,
                    duration: 400,
                    ease: "Power2",
                    onComplete: () => {
                        this.containerCarta.destroy();
                        this.containerCarta = null;
                        this.indiceCartaAtual++;
                        this.exibirCartaAtual();
                    }
                });
            } else {
                // 🔹 Se soltar no centro, volta suavemente para posição original
                this.tweens.add({
                    targets: this.containerCarta,
                    x: centerX,
                    y: centerY+40,
                    rotation: 0,
                    alpha: 1,
                    duration: 400,
                    ease: "Back.Out",
                    onComplete: () => {
                        if (this.containerCarta) {
                            retanguloTexto.setVisible(false);
                            textoEscolha.setVisible(false);
                        }
                    }
                });
            }
        });
        
    }
    

    aplicarEfeitosCarta(efeitos) {
        const multiplicador = 3;
    
        for (const [parametro, valor] of Object.entries(efeitos)) {
            if (this.parametros[parametro] !== undefined) {
                this.parametros[parametro] += Math.round(valor * multiplicador);
                this.parametros[parametro] = Phaser.Math.Clamp(this.parametros[parametro], 0, 100);
            }
        }
    
        this.atualizarBarrasStatus();

         // Verifica se algum parâmetro atingiu 0 ou 100
    for (const parametro in this.parametros) {
        if (this.parametros[parametro] === 0 || this.parametros[parametro] === 100) {
            this.exibirPopupGameOver(parametro);
            return; // Para o jogo aqui
        }
    }
    
        console.log("Efeitos aplicados:", efeitos);
    }

    exibirPopupGameOver(parametro) {
        let mensagens = {
            lucro: {
                0: "Sua empresa faliu por falta de dinheiro!",
                100: "Você acumulou uma fortuna imensa, mas a ganância destruiu a empresa!"
            },
            funcionarios: {
                0: "Todos os funcionários pediram demissão! A empresa parou de funcionar.",
                100: "Seus funcionários tomaram controle da empresa e você foi substituído!"
            },
            publico: {
                0: "Seu público perdeu completamente a confiança na marca!",
                100: "Você virou um fenômeno, mas a popularidade extrema gerou problemas!"
            },
            pilares: {
                0: "Seus valores foram destruídos e a empresa entrou em colapso!",
                100: "Você se tornou tão rígido nos valores que a empresa ficou engessada e faliu!"
            }
        };
    
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        let valorParametro = this.parametros[parametro];
        let estadoFinal = valorParametro === 0 ? 0 : 100;
        let mensagemFinal = mensagens[parametro][estadoFinal];
    
        // 🔹 Desativa completamente a carta
        if (this.containerCarta) {
            this.containerCarta.disableInteractive();
            this.containerCarta.setActive(false);
            this.tweens.killTweensOf(this.containerCarta);
            this.input.off("drag");
            this.input.off("dragend");
            this.containerCarta.setDepth(-1);
        }
    
        // 🔹 Cria um fundo invisível para bloquear cliques na carta
        let bloqueioFundo = this.add.rectangle(centerX, centerY, 800, 600, 0x000000, 0)
            .setInteractive()
            .setDepth(998);
    
        let fundoPopup = this.add.rectangle(centerX, centerY, 500, 300, 0x000000, 0.8).setDepth(999);
        let textoGameOver = this.add.text(centerX, centerY-80, "Choco,", {
            fontSize: "40px",
            color: "#ff0000",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(999);
    
        let textoMensagem = this.add.text(centerX, centerY-20, mensagemFinal, {
            fontSize: "20px",
            color: "#ffffff",
            fontFamily: "Arial",
            align: "center",
            wordWrap: { width: 400 }
        }).setOrigin(0.5).setDepth(999);
    
        let botaoRestart = this.add.text(centerX, centerY+60, "Tente Novamente", {
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#ff0000",
            fontFamily: "Arial",
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setInteractive().setDepth(999);
    
        botaoRestart.on("pointerdown", () => {
            this.scene.restart();
        });
    
        this.popupGameOver = this.add.container(0, 0, [bloqueioFundo, fundoPopup, textoGameOver, textoMensagem, botaoRestart]).setDepth(999);
    }
    
    
    
    
}


const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: Jogo
};


const game = new Phaser.Game(config);

// Ajustar tamanho ao redimensionar a janela
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
