import enemies from './data/enemies.js';

export default class WorldMapScene extends Phaser.Scene {
    constructor() {
        
        super({ key: 'WorldMapScene' });

        // Флаги и состояние
        this.popupActive = false;
        this.selectedButton = 'Yes'; // По умолчанию выбрана кнопка "No"
        
        // Саундтреки
        this.soundtrackNames = [
            'A Traders Life (in NCR)',
            'All-Clear Signal (Vault City)',
            'Beyond The Canyon (Arroyo)',
            'California Revisited (Worldmap on foot)',
            'Khans of New California (in the Den)',
            'Moribund World (in Klamath)',
            'My Chrysalis Highwayman (Worldmap with Car)',
        ];

        this.enemies_all = enemies;
    }

    preload() {
        this.soundtrackNames.forEach(name => {
            this.load.audio(name, 'assets/sounds/battle_background/' + name + '.mp3');
        });
        this.load.audio('travel', 'assets/psychobilly.mp3');

        this.load.video('road', 'assets/road.mp4'); 
        this.load.image('yes', 'assets/images/yes.png');
        this.load.image('no', 'assets/images/no.png');
    }

    create() {
        this.gameData = this.registry.get('gameData');
        this.playRandomSoundtrack();
        //this.map = this.add.image(0, 0, 'road').setOrigin(0, 0);

        const video = this.add.video(0, 0, 'road')
        .setOrigin(0)               // Начало координат в левом верхнем углу
        //.setDisplaySize(1024, 600); // Растянуть на весь размер вашей сцены
        video.play(true);  // true = зациклить

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Готовим всплывающее окно (модалку), но сразу скрываем
        this.createPopup();

        // Запускаем таймер, который через n..m секунд покажет модалку
        this.startRandomEncounterTimer();
    }

    update() {
        if (this.popupActive) {
            this.handlePopupInput();
        }
    }

    playRandomSoundtrack() {
        //let randomIndex = Phaser.Math.Between(0, this.soundtrackNames.length - 1);
        //this.soundtrack = this.sound.add(this.soundtrackNames[randomIndex]);
        this.soundtrack = this.sound.add('travel');

        this.soundtrack.play();

        this.soundtrack.once('complete', () => {
            this.playRandomSoundtrack(); // Воспроизведение следующего саундтрека
        });
    }

    // ===== Таймер появления модалки =====
    startRandomEncounterTimer() {
        // Пусть n=5, m=15 секунд (пример)
        const n = 3;
        const m = 6;

        this.time.addEvent({
            delay: Phaser.Math.Between(n * 1000, m * 1000),
            callback: () => {
                if (!this.popupActive) {
                    // Допустим, шанс зависит от скилла "surviving"
                    const survivingSkill = this.gameData?.skills?.surviving || 0;
                    const randomChance = Phaser.Math.Between(1, 100);

                    if (randomChance <= survivingSkill) {
                        this.showPopup(true);
                    } else {
                        this.showPopup(false);
                    }
                }
                // Снова запускаем таймер, чтобы периодически вызывать модалку
                this.startRandomEncounterTimer();
            },
            loop: false
        });
    }

    createPopup(text = '') {
        const cameraCenterX = this.cameras.main.width / 2;
        const cameraCenterY = this.cameras.main.height / 2;

        // Фон модалки
        this.popupBackground = this.add.graphics({ x: cameraCenterX, y: cameraCenterY })
            .fillStyle(0x000000, 0.75)
            .fillRect(-150, -100, 300, 200);
        this.popupBackground.setScrollFactor(0);

        // Текст
        this.popupText = this.add.text(cameraCenterX, cameraCenterY - 50, text, {
            fontSize: '16px',
            fill: '#0f0'
        }).setOrigin(0.5);
        this.popupText.setScrollFactor(0);

        // Кнопки
        this.yesButton = this.add.image(cameraCenterX - 50, cameraCenterY + 50, 'yes').setInteractive();
        this.yesButton.setScrollFactor(0);

        this.noButton = this.add.image(cameraCenterX + 50, cameraCenterY + 50, 'no').setInteractive();
        this.noButton.setScrollFactor(0);

        // Сразу скрываем
        this.hidePopup();
    }

    showPopup(hasNoButton) {
        // Генерируем врагов
        let [enemyName, enemiesToCreate] = this.getLevelConfig(this.gameData?.levelCount);
        this.gameData.enemiesToCreate = enemiesToCreate;  // Сохраняем в gameData
        console.log(`You encounter ${enemyName}.`, enemiesToCreate);

        // Обновляем текст
        this.popupText.setText(`You encounter ${enemyName}.`);

        // Показываем фон/текст
        this.popupBackground.visible = true;
        this.popupText.visible = true;
        this.yesButton.visible = true;

        if (hasNoButton) {
            this.noButton.visible = true;
            // Разносим кнопки
            this.yesButton.setPosition(this.cameras.main.width / 2 - 50, this.cameras.main.height / 2 + 50);
            this.noButton.setPosition(this.cameras.main.width / 2 + 50, this.cameras.main.height / 2 + 50);
            this.selectedButton = 'No';
        } else {
            // Если нет кнопки "No"
            this.noButton.visible = false;
            this.yesButton.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50);
            this.selectedButton = 'Yes';
        }

        this.popupActive = true;
    }

    hidePopup() {
        this.popupBackground.visible = false;
        this.popupText.visible = false;
        this.yesButton.visible = false;
        this.noButton.visible = false;
        this.popupActive = false;
    }

    handlePopupInput() {
        if (this.noButton.visible) {
            if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.selectedButton = 'No';
                this.yesButton.setScale(1);
                this.noButton.setScale(1.5);
            } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                this.selectedButton = 'Yes';
                this.yesButton.setScale(1.5);
                this.noButton.setScale(1);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (this.selectedButton === 'Yes') {
                if (this.soundtrack) {
                    this.soundtrack.stop();
                }
                if (['Rat', 'Mantis', 'Cannibals', 'Raiders'].includes(this.chosenEnemy.name)) {
                    this.scene.start('BattleScene');
                } else {
                    this.scene.start('EncounterScene');
                }

            } else if (this.selectedButton === 'No') {
                this.hidePopup();
            }
        }
    }

    // ===== Логика определения, каких врагов генерировать =====
    getLevelConfig(player_level) {
        let enemiesToCreate = [];

        // Выбираем случайного врага
        this.chosenEnemy = Phaser.Utils.Array.GetRandom(this.enemies_all);

        let numberOfEnemies = Phaser.Math.Between(
            this.chosenEnemy.amount.min,
            this.chosenEnemy.amount.max
        );

        // Собираем список имен
        for (let i = 0; i < numberOfEnemies; i++) {
            const randomIndex = Math.floor(Math.random() * this.chosenEnemy.title.length);
            enemiesToCreate.push(this.chosenEnemy.title[randomIndex]);
        }

        return [this.chosenEnemy.name, enemiesToCreate];
    }

}
