class Jogo extends Phaser.Scene {
    constructor() {
        super({ key: "Jogo" });
    }

    preload() {
        this.load.atlas('cartasAtlas', 'assets/cartas_atlas.png', 'assets/cartas_atlas.json');
        this.load.json('cartasData', 'assets/Escolhas.json')
    }

    create() {
        this.parametros = {
            lucro: 40,
            funcionarios: 40,
            publico: 40,
            pilares: 40,
        };

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

        nomes.forEach((nome, index) => {
            let x = 150 + index * 150;
            let yBase = 90;

            this.add.rectangle(x, yBase, 30, 100, 0x444444).setOrigin(0.5, 1);

            let barra = this.add.rectangle(x, yBase, 30, this.parametros[nome], cores[index]).setOrigin(0.5, 1);
            this.barras[nome] = barra;

            this.add.text(x, yBase + 10, nome, {
                fontSize: "16px",
                color: "#ffffff",
                fontFamily: "Arial",
                align: "center"
            }).setOrigin(0.5, 0);
        });
    }

    atualizarBarrasStatus() {
        Object.keys(this.parametros).forEach(nome => {
            let valor = Phaser.Math.Clamp(this.parametros[nome], 0, 100);

            this.tweens.add({
                targets: this.barras[nome],
                scaleY: valor / 100,
                duration: 300,
                ease: 'Power2'
            });
            
        });
    }

    exibirCartaAtual() {
        if (this.indiceCartaAtual >= this.cartas.length) {
            console.log("Fim das cartas!");
            return;
        }
    
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


    
        this.containerCarta = this.add.container(400, 350, [carta, retanguloTexto, textoEscolha]);
        this.containerCarta.setSize(240, 360);
        this.containerCarta.setInteractive();
        this.input.setDraggable(this.containerCarta);
    
        this.input.off("drag");
        this.input.off("dragend");
    
        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            if (!this.containerCarta) return;
    
            let deslocamentoX = dragX - 400;
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.rotation = Phaser.Math.Clamp(deslocamentoX * 0.002, -0.3, 0.3);
    
            if (dragX < 300) {
                textoEscolha.setText(`Escolha: ${cartaAtual.opcoes[0].texto}`);
                ajustarRetangulo();
                retanguloTexto.setVisible(true);
                textoEscolha.setVisible(true);
            } else if (dragX > 500) {
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
    
            if (!this.containerCarta) return;
    
            if (gameObject.x < 300) {
                escolha = cartaAtual.opcoes[0];
            } else if (gameObject.x > 500) {
                escolha = cartaAtual.opcoes[1];
            }
    
            if (escolha) {
                this.aplicarEfeitosCarta(escolha.efeitos);
                this.containerCarta.destroy();
                this.containerCarta = null;
                this.indiceCartaAtual++;
                this.exibirCartaAtual();
            } else {
                this.tweens.add({
                    targets: this.containerCarta,
                    x: 400,
                    y: 350,
                    rotation: 0,
                    duration: 200,
                    ease: "Power2",
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
        const multiplicador = 5;
    
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
            lucro: "Sua empresa faliu por falta de dinheiro!",
            funcionarios: "Todos os funcionários pediram demissão!",
            publico: "Seu público perdeu a confiança na marca!",
            pilares: "Seus valores foram destruídos e a empresa entrou em colapso!"
        };
    
        // 🔹 Desativa completamente a carta
        if (this.containerCarta) {
            this.containerCarta.disableInteractive(); // Remove interatividade
            this.containerCarta.setActive(false); // Impede atualizações na carta
            this.tweens.killTweensOf(this.containerCarta); // Cancela animações pendentes
            this.input.off("drag"); // Remove evento de arrastar
            this.input.off("dragend"); // Remove evento de soltar
            this.containerCarta.setDepth(-1); // Move a carta para trás do popup
        }
    
        // 🔹 Cria um fundo invisível para bloquear cliques na carta
        let bloqueioFundo = this.add.rectangle(400, 300, 800, 600, 0x000000, 0)
            .setInteractive()
            .setDepth(998); // 🔹 Esse fundo impede cliques em objetos atrás dele
    
        let fundoPopup = this.add.rectangle(400, 300, 500, 300, 0x000000, 0.8).setDepth(999);
        let textoGameOver = this.add.text(400, 220, "GAME OVER", {
            fontSize: "40px",
            color: "#ff0000",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(999);
    
        let textoMensagem = this.add.text(400, 280, mensagens[parametro], {
            fontSize: "20px",
            color: "#ffffff",
            fontFamily: "Arial",
            align: "center",
            wordWrap: { width: 400 }
        }).setOrigin(0.5).setDepth(999);
    
        let botaoRestart = this.add.text(400, 360, "Tente Novamente", {
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#ff0000",
            fontFamily: "Arial",
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setInteractive().setDepth(999);
    
        botaoRestart.on("pointerdown", () => {
            this.scene.restart(); // 🔄 Reinicia o jogo
        });
    
        this.popupGameOver = this.add.container(0, 0, [bloqueioFundo, fundoPopup, textoGameOver, textoMensagem, botaoRestart]).setDepth(999);
    }
    
    
    
}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Jogo
};

const game = new Phaser.Game(config);
