import GameData from "../utils/GameData.js";
export default class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: "MainMenu" });
    }
    preload() {
        this.load.image("background_menu", "assets/images/backgrounds/menu/menu.png");
    }
    create() {
        GameData.init();
        this.gameData = GameData.get();
        this.add.image(0, 0, "background_menu").setOrigin(0, 0);
        let startButton = this.add
            .text(this.cameras.main.centerX, this.cameras.main.centerY, "New game", {
            fill: "#0f0",
        })
            .setInteractive()
            .setOrigin(0.5, 0.5)
            .on("pointerdown", () => {
            this.scene.start("WorldMapScene"); // Запуск GameScene
        });
        this.levelText = this.add.text(100, 100, "Level: " + this.gameData.levelCount, { fontSize: "50px", fill: "#fff" });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        // Здесь может быть другой код для настройки сцены
    }
    update() {
        this.levelText.setText("Level: " + this.gameData.levelCount);
        // Проверяем, была ли нажата клавиша "Пробел" или "Enter"
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.startGame();
        }
    }
    startGame() {
        this.scene.start("WorldMapScene");
    }
}
//# sourceMappingURL=mainMenu.js.map