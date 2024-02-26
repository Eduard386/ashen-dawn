export default class WorldMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldMapScene' });
        this.popupActive = false;
        this.selectedButton = 'Yes'; // По умолчанию выбрана кнопка "No"
        this.distanceTraveled = 0;
        this.popupDistanceThreshold = Phaser.Math.Between(50, 150);
        this.soundtrackNames = ['A Traders Life (in NCR)', 'All-Clear Signal (Vault City)', 'Beyond The Canyon (Arroyo)',
            'California Revisited (Worldmap on foot)', 'Khans of New California (in the Den)', 'Moribund World (in Klamath)',
            'My Chrysalis Highwayman (Worldmap with Car)']; // Замените на реальные названия треков
        this.enemies_all = [
            {
                name: 'Rat', type: 'creature',
                defence: { health: 6, ac: 6, threshold: 0, resistance: 0 },
                attack: { hit_chance: 40, damage: { min: 2, max: 2 }, shots: 1 },
                amount: { min: 6, max: 10 }, experience: 25, title: ['Rat']
            },
            {
                name: 'Mantis', type: 'creature',
                defence: { health: 25, ac: 13, threshold: 0, resistance: 0.2 },
                attack: { hit_chance: 50, damage: { min: 5, max: 8 }, shots: 1 },
                amount: { min: 1, max: 4 }, experience: 50, title: ['Mantis']
            },
            {
                name: 'Tribe', type: 'human',
                defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
                attack: { hit_chance: 60, weapon: 'Spear', damage: { min: 3, max: 10 }, shots: 1 },
                amount: { min: 2, max: 4 }, experience: 50,
                title: ['Tribe man 1', 'Tribe man 2', 'Tribe man 3', 'Tribe man 4',
                    'Tribe woman 1', 'Tribe woman 2']
            },
            {
                name: 'Cannibals', type: 'human',
                defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
                attack: { hit_chance: 60, weapon: 'Knife', damage: { min: 1, max: 6 }, shots: 1 },
                amount: { min: 2, max: 4 }, experience: 50,
                title: ['Cannibal man 1', 'Cannibal man 2', 'Cannibal man 3',
                    'Cannibal woman 1', 'Cannibal woman 2']
            },
        ]
    }

    preload() {
        this.soundtrackNames.forEach(name => {
            this.load.audio(name, 'assets/sounds/battle_background/' + name + '.mp3');
        });
        this.load.image('worldMap', 'assets/images/map.png');
        this.load.image('playerMarker', 'assets/images/marker.png');
        this.load.image('yes', 'assets/images/yes.png');
        this.load.image('no', 'assets/images/no.png');
    }

    create() {
        this.gameData = this.registry.get('gameData');
        this.initializeEncounterMap();
        this.playRandomSoundtrack();
        this.map = this.add.image(0, 0, 'worldMap').setOrigin(0, 0);

        // Создание объекта Graphics для рисования линий
        const lines = this.add.graphics({ lineStyle: { width: 1, color: 0x000000 } });

        // Рисование горизонтальных и вертикальных линий
        for (let i = 0; i <= 2000; i += 100) {
            // Горизонтальные линии
            lines.lineBetween(0, i, 2000, i);
            // Вертикальные линии
            lines.lineBetween(i, 0, i, 2000);
        }

        // Создание маркера игрока
        const markerPosition = this.gameData.markerPosition || { x: 25, y: 25 };
        this.playerMarker = this.add.image(markerPosition.x, markerPosition.y, 'playerMarker').setOrigin(0.5, 0.5);

        // Установка границ мира
        this.physics.world.bounds.width = 2000;
        this.physics.world.bounds.height = 2000;

        // Конфигурация камеры
        this.cameras.main.setSize(1024, 600);
        this.cameras.main.setBounds(0, 0, 2000, 2000);

        // Контроллеры для управления маркером
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.createPopup();
    }

    update() {
        if (!this.popupActive) {
            this.handleMovement();
            this.checkForPopup();
        } else {
            this.handlePopupInput();
        }
    }

    initializeEncounterMap() {
        this.encounterMap = {
            'A20': [
                { enemy: 'Rat', probability: 0.5 },
                { enemy: 'Mantis', probability: 0.5 }
                // Другие возможные встречи для квадрата A1
            ],
            // Определения для других квадратов...
            'B20': [
                { enemy: 'Tribe', probability: 0.8 },
                { enemy: 'Cannibals', probability: 0.2 }
                // Другие возможные встречи для квадрата T20
            ]
            // Определения для всех квадратов сетки...
        };
    }

    weightedRandom(choices) {
        const sum = choices.reduce((acc, choice) => acc + choice.probability * 100, 0);
        let random = Math.random() * sum;

        for (let choice of choices) {
            random -= choice.probability * 100;
            if (random < 0) {
                return choice.enemy;
            }
        }
    }

    getEncounter(square) {
        const possibleEncounters = this.encounterMap[square];
        //if (!possibleEncounters) return null; // Если нет встреч для данного квадрата
        if (!possibleEncounters) return this.weightedRandom(this.encounterMap['A20']);
        return this.weightedRandom(possibleEncounters);
    }

    // Функция для определения текущего квадрата маркера
    getCurrentSquare(x, y) {
        const column = Math.floor(x / 100); // 0...19
        const row = Math.floor(y / 100); // 0...19
        const columnLetter = String.fromCharCode(65 + column); // A...T
        const rowNumber = 20 - row; // 1...20 (сверху вниз)
        return `${columnLetter}${rowNumber}`;
    }

    playRandomSoundtrack() {
        let randomIndex = Phaser.Math.Between(0, this.soundtrackNames.length - 1);
        this.soundtrack = this.sound.add(this.soundtrackNames[randomIndex]);

        this.soundtrack.play();

        this.soundtrack.once('complete', () => {
            this.playRandomSoundtrack(); // Воспроизведение следующего саундтрека
        });
    }

    handleMovement() {
        const speed = 1;
        let cameraFollow = false;
        const mapWidth = 2000;
        const mapHeight = 2000;
        let moved = false;

        if (this.cursors.left.isDown && this.playerMarker.x > 0) {
            this.playerMarker.x -= speed;
            cameraFollow = true;
            moved = true;
        } else if (this.cursors.right.isDown && this.playerMarker.x < mapWidth) {
            this.playerMarker.x += speed;
            cameraFollow = true;
            moved = true;
        }

        if (this.cursors.up.isDown && this.playerMarker.y > 0) {
            this.playerMarker.y -= speed;
            cameraFollow = true;
            moved = true;
        } else if (this.cursors.down.isDown && this.playerMarker.y < mapHeight) {
            this.playerMarker.y += speed;
            cameraFollow = true;
            moved = true;
        }

        // Если маркер двигался, обновляем положение камеры и расстояние
        if (cameraFollow) {
            const cameraHalfWidth = this.cameras.main.width / 2;
            const cameraHalfHeight = this.cameras.main.height / 2;

            if (this.playerMarker.x > cameraHalfWidth && this.playerMarker.x < (2000 - cameraHalfWidth)) {
                this.cameras.main.scrollX = this.playerMarker.x - cameraHalfWidth;
            }

            if (this.playerMarker.y > cameraHalfHeight && this.playerMarker.y < (2000 - cameraHalfHeight)) {
                this.cameras.main.scrollY = this.playerMarker.y - cameraHalfHeight;
            }
            if (moved) {
                this.distanceTraveled += speed;
                this.checkForPopup();
            }
        }
    }

    createPopup(text) {
        const cameraCenterX = this.cameras.main.width / 2;
        const cameraCenterY = this.cameras.main.height / 2;

        // Создание фона для всплывающего окна
        this.popupBackground = this.add.graphics({ x: cameraCenterX, y: cameraCenterY })
            .fillStyle(0x000000, 0.75) // Черный цвет с полупрозрачностью
            .fillRect(-150, -100, 300, 200); // Относительные координаты
        this.popupBackground.setScrollFactor(0);

        // Добавление текста
        this.popupText = this.add.text(cameraCenterX, cameraCenterY - 50, text, {
            fontSize: '16px',
            fill: '#0f0'
        }).setOrigin(0.5);
        this.popupText.setScrollFactor(0);

        // Добавление кнопок
        this.yesButton = this.add.image(cameraCenterX - 50, cameraCenterY + 50, 'yes').setInteractive();
        this.yesButton.setScrollFactor(0);
        this.noButton = this.add.image(cameraCenterX + 50, cameraCenterY + 50, 'no').setInteractive();
        this.noButton.setScrollFactor(0);

        // Скрытие элементов всплывающего окна
        this.hidePopup();
    }

    showPopup(hasNoButton) {
        let result = this.getLevelConfig(this.gameData.levelCount);
        this.gameData.enemiesToCreate = result[1];
        //this.registry.set('gameData', this.gameData);
        console.log(`You encounter ${result[0]}.`);
        console.log(`A imenno ${result[1]}.`);

        this.createPopup(`You encounter ${result[0]}.`);
        this.popupBackground.visible = true;
        this.popupText.visible = true;
        this.yesButton.visible = true;

        if (hasNoButton) {
            this.noButton.visible = true;
            this.yesButton.setPosition(this.cameras.main.width / 2 - 50, this.cameras.main.height / 2 + 50);
            this.noButton.setPosition(this.cameras.main.width / 2 + 50, this.cameras.main.height / 2 + 50);
            this.selectedButton = 'No'; // Стартовая активная кнопка
        } else {
            this.noButton.visible = false;
            this.yesButton.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50);
            this.selectedButton = 'Yes'; // Единственная активная кнопка
        }

        this.popupActive = true;
    }

    hidePopup() {
        // Устанавливаем элементы всплывающего окна невидимыми
        this.popupBackground.visible = false;
        this.popupText.visible = false;
        this.yesButton.visible = false;
        this.noButton.visible = false;

        // Деактивируем всплывающее окно
        this.popupActive = false;

        // Возобновляем движение или взаимодействие вне всплывающего окна
        // (здесь можно добавить дополнительный код, если необходимо)
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
                this.gameData.markerPosition = { x: this.playerMarker.x, y: this.playerMarker.y };
                if (['Rat', 'Mantis', 'Cannibals'].includes(this.chosenEnemy.name)) {
                    this.scene.start('BattleScene');
                } else {
                    this.scene.start('EncounterScene');
                }

            } else if (this.selectedButton === 'No') {
                this.hidePopup();
            }
        }
    }

    checkForPopup() {
        if (this.distanceTraveled >= this.popupDistanceThreshold && !this.popupActive) {
            const randomChance = Phaser.Math.Between(1, 100);
            const survivingSkill = this.registry.get('gameData').skills.surviving;

            if (randomChance <= survivingSkill) {
                this.showPopup(true);  // Если случайное число меньше или равно навыку surviving, показываем обычный popup
            } else {
                this.showPopup(false);  // Если больше, показываем popup без кнопки No
            }

            this.distanceTraveled = 0;
            this.popupDistanceThreshold = Phaser.Math.Between(50, 150);
        }
    }

    getLevelConfig(player_level) {
        let enemiesToCreate = [];

        const currentSquare = this.getCurrentSquare(this.playerMarker.x, this.playerMarker.y);
        console.log(currentSquare); // Выведет выбранного врага для квадрата A20
        const encounter = this.getEncounter(currentSquare);
        console.log(encounter); // Выведет выбранного врага для квадрата A20

        this.chosenEnemy = this.enemies_all.filter(enemy => enemy.name === encounter)[0];
        let numberOfEnemies = Phaser.Math.Between(this.chosenEnemy.amount.min, this.chosenEnemy.amount.max);

        // Генерируем врагов
        for (let i = 0; i < numberOfEnemies; i++) {
            const randomIndex = Math.floor(Math.random() * this.chosenEnemy.title.length);
            const item = this.chosenEnemy.title[randomIndex];
            enemiesToCreate.push(item);
        }

        return [this.chosenEnemy.name, enemiesToCreate];
    }

}
