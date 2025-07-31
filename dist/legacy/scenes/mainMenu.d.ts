export default class MainMenu extends Phaser.Scene {
    constructor();
    preload(): void;
    create(): void;
    gameData: any;
    levelText: Phaser.GameObjects.Text;
    spaceKey: Phaser.Input.Keyboard.Key;
    enterKey: Phaser.Input.Keyboard.Key;
    update(): void;
    startGame(): void;
}
