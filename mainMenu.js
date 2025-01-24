export default class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('background_menu', 'assets/images/backgrounds/menu/menu.png');
    }

    create() {
        // Инициализация объекта данных
        if (!this.registry.has('gameData')) {
            this.registry.set('gameData', {
                levelCount: 1,
                health: 30,
                experience: 0,
                skills: {
                    small_guns: 75,
                    big_guns: 75,
                    energy_weapons: 75,
                    melee_weapons: 75,
                    pyrotechnics: 75,
                    lockpick: 75,
                    science: 75,
                    repair: 75,
                    medcine: 75,
                    barter: 75,
                    speech: 75,
                    surviving: 75
                },
                current_weapon: 'Baseball bat',
                current_armor: 'Leather Jacket',
                weapons: ['Baseball bat', '9mm pistol'],
                med: {
                    first_aid_kit: 0,
                    jet: 0,
                    buffout: 0,
                    mentats: 0,
                    psycho: 0
                },
                ammo: {
                    mm_9: 500,
                    magnum_44: 12,
                    mm_12: 0,
                    mm_5_45: 0,
                    energy_cell: 0,
                    frag_grenade: 0
                },
                enemiesToCreate: [],
                levelLoot: [],
            });
        }
        this.gameData = this.registry.get('gameData');
        this.add.image(0, 0, 'background_menu').setOrigin(0, 0);
        let startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'New game', { fill: '#0f0' })
            .setInteractive()
            .setOrigin(0.5, 0.5)
            .on('pointerdown', () => {
                this.scene.start('WorldMapScene'); // Запуск GameScene
            });
        this.levelText = this.add.text(100, 100, 'Level: ' + this.gameData.levelCount, { fontSize: '50px', fill: '#fff' });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Здесь может быть другой код для настройки сцены
    }

    update() {
        this.levelText.setText('Level: ' + this.gameData.levelCount);
        // Проверяем, была ли нажата клавиша "Пробел" или "Enter"
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.startGame();
        }
    }

    startGame() {
        this.scene.start('WorldMapScene');
    }
}
