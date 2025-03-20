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

    
        let retanguloTexto = this.add.graphics();
        retanguloTexto.fillStyle(0x000000, 0.5);
        retanguloTexto.fillRoundedRect(-100, -220, 200, 50, 10);
        retanguloTexto.setVisible(false);
    
        let textoEscolha = this.add.text(0, -195, '', {
            fontSize: "18px",
            color: "#ffffff",
            fontFamily: "Arial",
            align: "center"
        }).setOrigin(0.5, 0.5);
        textoEscolha.setVisible(false);
    
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
                retanguloTexto.setVisible(true);
                textoEscolha.setVisible(true);
            } else if (dragX > 500) {
                textoEscolha.setText(`Escolha: ${cartaAtual.opcoes[1].texto}`);
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
        const multiplicador = 5; // Aumenta o impacto em 50%
    
        for (const [parametro, valor] of Object.entries(efeitos)) {
            if (this.parametros[parametro] !== undefined) {
                this.parametros[parametro] += Math.round(valor * multiplicador);
            }
        }
    
        this.atualizarBarrasStatus();
    
        console.log("Efeitos aplicados:", efeitos);
    }
    
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Jogo
};

const game = new Phaser.Game(config);
