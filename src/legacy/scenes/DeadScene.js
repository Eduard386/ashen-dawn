export default class DeadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DeadScene' });
    }

    preload() {
        this.load.image('death background', 'assets/images/death/death 1.png');
        this.load.audio('death music', ['assets/sounds/death/death.wav']);

    }

    create() {
        this.add.image(0, 0, 'death background').setOrigin(0, 0);
        this.death_music = this.sound.add('death music');
        this.death_music.play()
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        // Проверяем, была ли нажата клавиша "Пробел" или "Enter"
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start('MainMenu'); // Запуск GameScene
        }
    }
}
