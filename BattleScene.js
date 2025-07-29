import GameData from './utils/GameData.js';
import enemies from './data/enemies.js';

export default class BattleScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BattleScene' });
        this.soundtrackNames = ['A Traders Life (in NCR)', 'All-Clear Signal (Vault City)', 'Beyond The Canyon (Arroyo)',
            'California Revisited (Worldmap on foot)', 'Khans of New California (in the Den)', 'Moribund World (in Klamath)',
            'My Chrysalis Highwayman (Worldmap with Car)']; // Замените на реальные названия треков
        this.amountOfMainBackgrounds = 1;
        this.armors = [
            { name: 'Leather Jacket', ac: 8, threshold: 0, resistance: 0.2 },
            { name: 'Leather Armor', ac: 15, threshold: 2, resistance: 0.25 },
            { name: 'Metal Armor', ac: 10, threshold: 4, resistance: 0.3 },
            { name: 'Combat Armor', ac: 20, threshold: 5, resistance: 0.4 },
            { name: 'Power Armor', ac: 25, threshold: 12, resistance: 0.4 },
        ];
        this.weapons = [
            { name: 'Baseball bat', skill: 'melee_weapons', type: 'melee', cooldown: 3000, damage: { min: 3, max: 10 }, clip: 1000, shots: 1 },
            { name: 'Laser pistol', skill: 'energy_weapons', type: 'energy_cell', cooldown: 6000, damage: { min: 10, max: 22 }, clip: 12, shots: 1 },
            { name: '9mm pistol', skill: 'small_guns', type: 'mm_9', cooldown: 5000, damage: { min: 10, max: 24 }, clip: 12, shots: 1 },
            { name: '44 Desert Eagle', skill: 'small_guns', type: 'magnum_44', cooldown: 5000, damage: { min: 20, max: 32 }, clip: 8, shots: 1 },
            { name: 'Frag grenade', skill: 'pyrotechnics', type: 'frag_grenade', cooldown: 4000, damage: { min: 20, max: 35 }, clip: 1, shots: 1 },
            { name: '44 Magnum revolver', skill: 'small_guns', type: 'magnum_44', cooldown: 4000, damage: { min: 24, max: 36 }, clip: 6, shots: 1 },
            { name: 'Laser rifle', skill: 'energy_weapons', type: 'energy_cell', cooldown: 5000, damage: { min: 25, max: 50 }, clip: 12, shots: 1 },
            { name: 'Combat shotgun', skill: 'small_guns', type: 'mm_12', cooldown: 6000, damage: { min: 15, max: 25 }, clip: 12, shots: 3 },
            { name: 'SMG', type: 'mm_9', skill: 'small_guns', cooldown: 6000, damage: { min: 5, max: 12 }, clip: 30, shots: 10 },
            { name: 'Minigun', skill: 'big_guns', type: 'mm_5_45', cooldown: 6000, damage: { min: 7, max: 11 }, clip: 40, shots: 40 },
        ];

        this.enemies_all = enemies;

        this.enemies = []
        this.tempLootArmors = []

        // Время последнего выстрела для каждого оружия
        this.lastShotTime = {};
        this.weapons.forEach(weapon => {
            this.lastShotTime[weapon.name] = 0;
        });
        this.heroStatsTexts = [];
        this.isBreathSoundPlaying = false;
        this.isHardBreathSoundPlaying = false;
    }

    preload() {
        for (let i = 1; i <= this.amountOfMainBackgrounds; i++) {
            this.load.image('backgroundMain' + i, 'assets/images/backgrounds/battle/backgroundMain' + i + '.png');
        }
        this.armors.forEach(armor => {
            this.load.image('armor ' + armor.name, 'assets/images/armors/' + armor.name + '.png');
        });
        this.armors_red = ['Leather Jacket', 'Leather Armor', 'Metal Armor', 'Combat Armor', 'Power Armor']
        this.armors_red.forEach(armor => {
            this.load.image('armor red ' + armor, 'assets/images/armors_red/' + armor + '.png');
        });

        this.weapons.forEach(weapon => {
            this.load.image('weapon ' + weapon.name, 'assets/images/weapons/' + weapon.name + '.png');
            this.load.image('hand ' + weapon.name, 'assets/images/hands/' + weapon.name + '.png');
        });
        this.load.image('Raider - Leather Jacket - Baseball bat', 'assets/images/enemies/Raider - Leather Jacket - Baseball bat.png');
        this.load.image('Raider - Leather Jacket - 44 Magnum revolver', 'assets/images/enemies/Raider - Leather Jacket - 44 Magnum revolver.png');
        this.load.image('Raider - Leather Jacket - 9mm pistol', 'assets/images/enemies/Raider - Leather Jacket - 9mm pistol.png');
        this.load.image('Raider - Leather Jacket - 44 Desert Eagle', 'assets/images/enemies/Raider - Leather Jacket - 44 Desert Eagle.png');
        this.load.image('Raider - Leather Jacket - Laser pistol', 'assets/images/enemies/Raider - Leather Jacket - Laser pistol.png');
        this.load.image('Raider - Leather Jacket - SMG', 'assets/images/enemies/Raider - Leather Jacket - SMG.png');
        this.load.image('Raider - Leather Jacket - Frag grenade', 'assets/images/enemies/Raider - Leather Jacket - Frag grenade.png');
        this.load.image('Raider - Leather Jacket - Combat shotgun', 'assets/images/enemies/Raider - Leather Jacket - Combat shotgun.png');
        this.load.image('Raider - Leather Jacket - Laser rifle', 'assets/images/enemies/Raider - Leather Jacket - Laser rifle.png');
        this.load.image('Raider - Leather Jacket - Minigun', 'assets/images/enemies/Raider - Leather Jacket - Minigun.png');
        this.load.image('Raider - Leather Armor - Baseball bat', 'assets/images/enemies/Raider - Leather Armor - Baseball bat.png');
        this.load.image('Raider - Leather Armor - 44 Magnum revolver', 'assets/images/enemies/Raider - Leather Armor - 44 Magnum revolver.png');
        this.load.image('Raider - Leather Armor - 9mm pistol', 'assets/images/enemies/Raider - Leather Armor - 9mm pistol.png');
        this.load.image('Raider - Leather Armor - 44 Desert Eagle', 'assets/images/enemies/Raider - Leather Armor - 44 Desert Eagle.png');
        this.load.image('Raider - Leather Armor - Laser pistol', 'assets/images/enemies/Raider - Leather Armor - Laser pistol.png');
        this.load.image('Raider - Leather Armor - SMG', 'assets/images/enemies/Raider - Leather Armor - SMG.png');
        this.load.image('Raider - Metal Armor - Baseball bat', 'assets/images/enemies/Raider - Metal Armor - Baseball bat.png');
        this.load.image('Raider - Metal Armor - 9mm pistol', 'assets/images/enemies/Raider - Metal Armor - 9mm pistol.png');
        this.load.image('Raider - Metal Armor - 44 Magnum revolver', 'assets/images/enemies/Raider - Metal Armor - 44 Magnum revolver.png');
        this.load.image('Raider - Metal Armor - 44 Desert Eagle', 'assets/images/enemies/Raider - Metal Armor - 44 Desert Eagle.png');
        this.load.image('Raider - Metal Armor - Laser pistol', 'assets/images/enemies/Raider - Metal Armor - Laser pistol.png');
        this.load.image('Raider - Metal Armor - SMG', 'assets/images/enemies/Raider - Metal Armor - SMG.png');

        this.enemies_all.forEach(enemy => {
            enemy.title.forEach(title => {
                this.load.image(title, `assets/images/enemies/${title}.png`);
            });
        });

        this.load.image('crosshair_red', 'assets/images/crosshairs/crosshair_red.png');
        this.load.image('crosshair_green', 'assets/images/crosshairs/crosshair_green.png');
        this.load.image('indicator green', 'assets/images/health_indicators/green.png');
        this.load.image('indicator yellow', 'assets/images/health_indicators/yellow.png');
        this.load.image('indicator red', 'assets/images/health_indicators/red.png');
        this.load.image('blood', 'assets/images/backgrounds/hit/blood.png');
        this.load.image('escape', 'assets/images/escape_button.png');
        this.load.image('mm_9', 'assets/images/ammo_small/mm_9.png');
        this.load.image('mm_12', 'assets/images/ammo_small/mm_12.png');
        this.load.image('magnum_44', 'assets/images/ammo_small/magnum_44.png');
        this.load.image('mm_5_45', 'assets/images/ammo_small/mm_5_45.png');
        this.load.image('frag_grenade', 'assets/images/ammo_small/frag_grenade.png');
        this.load.image('energy_cell', 'assets/images/ammo_small/energy_cell.png');
        this.medcine = ['first_aid_kit', 'jet', 'buffout', 'mentats', 'psycho']
        this.medcine.forEach(med => {
            this.load.image(med, 'assets/images/medcine/colored/' + med + '.png');
        });
        this.medcine.forEach(med => {
            this.load.image(med + ' grey', 'assets/images/medcine/grey/' + med + '.png');
        });
        this.weapons.forEach(weapon => {
            this.load.audio(weapon.name + ' - hit', ['assets/sounds/weapons/' + weapon.name + ' - hit.mp3']);

            // Предположим, что у вас есть до трех звуков промаха для каждого оружия
            for (let j = 1; j <= 3; j++) {
                this.load.audio(weapon.name + ' - miss ' + j, ['assets/sounds/weapons/' + weapon.name + ' - miss '+ j + '.mp3']);
            }
        });
        this.load.audio('breath', 'assets/sounds/breath.mp3');
        this.load.audio('hard breath', 'assets/sounds/hard_breath.mp3');
        this.load.audio('player wounded', 'assets/sounds/player wounded.mp3');

        this.load.audio('Rat - attack', 'assets/sounds/enemies/Rat - attack.mp3');
        this.load.audio('Rat - wounded', 'assets/sounds/enemies/Rat - wounded.mp3');
        this.load.audio('Rat - died', 'assets/sounds/enemies/Rat - died.mp3');
        this.load.audio('Mantis - attack', 'assets/sounds/enemies/Mantis - attack.mp3');
        this.load.audio('Mantis - wounded', 'assets/sounds/enemies/Mantis - wounded.mp3');
        this.load.audio('Mantis - died', 'assets/sounds/enemies/Mantis - died.mp3');
        this.load.audio('Spear - attack', 'assets/sounds/enemies/Spear - attack.mp3');
        this.load.audio('Knife - attack', 'assets/sounds/enemies/Knife - attack.mp3');

        this.load.audio('Tribe man 1 - wounded', 'assets/sounds/enemies/Tribe man 1 - wounded.mp3');
        this.load.audio('Tribe man 2 - wounded', 'assets/sounds/enemies/Tribe man 2 - wounded.mp3');
        this.load.audio('Tribe man 3 - wounded', 'assets/sounds/enemies/Tribe man 3 - wounded.mp3');
        this.load.audio('Tribe man 4 - wounded', 'assets/sounds/enemies/Tribe man 4 - wounded.mp3');
        this.load.audio('Tribe man 1 - died', 'assets/sounds/enemies/Tribe man 1 - died.mp3');
        this.load.audio('Tribe man 2 - died', 'assets/sounds/enemies/Tribe man 2 - died.mp3');
        this.load.audio('Tribe man 3 - died', 'assets/sounds/enemies/Tribe man 3 - died.mp3');
        this.load.audio('Tribe man 4 - died', 'assets/sounds/enemies/Tribe man 4 - died.mp3');
        this.load.audio('Tribe woman 1 - wounded', 'assets/sounds/enemies/Tribe woman 1 - wounded.mp3');
        this.load.audio('Tribe woman 2 - wounded', 'assets/sounds/enemies/Tribe woman 2 - wounded.mp3');
        this.load.audio('Tribe woman 1 - died', 'assets/sounds/enemies/Tribe woman 1 - died.mp3');
        this.load.audio('Tribe woman 2 - died', 'assets/sounds/enemies/Tribe woman 2 - died.mp3');
        this.load.audio('Cannibal man 1 - wounded', 'assets/sounds/enemies/Cannibal man 1 - wounded.mp3');
        this.load.audio('Cannibal man 2 - wounded', 'assets/sounds/enemies/Cannibal man 2 - wounded.mp3');
        this.load.audio('Cannibal man 3 - wounded', 'assets/sounds/enemies/Cannibal man 3 - wounded.mp3');
        this.load.audio('Cannibal man 1 - died', 'assets/sounds/enemies/Cannibal man 1 - died.mp3');
        this.load.audio('Cannibal man 2 - died', 'assets/sounds/enemies/Cannibal man 2 - died.mp3');
        this.load.audio('Cannibal man 3 - died', 'assets/sounds/enemies/Cannibal man 3 - died.mp3');
        this.load.audio('Cannibal woman 1 - wounded', 'assets/sounds/enemies/Cannibal woman 1 - wounded.mp3');
        this.load.audio('Cannibal woman 2 - wounded', 'assets/sounds/enemies/Cannibal woman 2 - wounded.mp3');
        this.load.audio('Cannibal woman 1 - died', 'assets/sounds/enemies/Cannibal woman 1 - died.mp3');
        this.load.audio('Cannibal woman 2 - died', 'assets/sounds/enemies/Cannibal woman 2 - died.mp3');

        this.soundtrackNames.forEach(name => {
            this.load.audio(name, 'assets/sounds/battle_background/' + name + '.mp3');
        });

        this.load.audio('enemy killed', ['assets/sounds/enemy_killed/enemy_killed.mp3']);
        this.load.audio('reloading', ['assets/sounds/reload.mp3']);
        this.load.audio('sip pill', ['assets/sounds/sip_pill.mp3']);

        this.load.image('victory background', 'assets/images/victory/victory.png');
        this.load.audio('victory music', ['assets/sounds/victory/victory.wav']);
    }

    updateItemVisibility(count, item, itemGrey) {
        const isVisible = count > 0;
        item.setVisible(isVisible);
        itemGrey.setVisible(!isVisible);
    }

    playRandomSoundtrack() {
        let randomIndex = Phaser.Math.Between(0, this.soundtrackNames.length - 1);
        this.soundtrack = this.sound.add(this.soundtrackNames[randomIndex]);

        this.soundtrack.play();

        this.soundtrack.once('complete', () => {
            this.playRandomSoundtrack(); // Воспроизведение следующего саундтрека
        });
    }

    updateClipBar() {
        this.clipBar.clear();  // Очищаем предыдущий индикатор

        // Индикатор не отображается для оружия ближнего боя
        if (this.chosenWeapon.type === 'melee') {
            this.clipBar.setVisible(false);
            return;
        }

        this.clipBar.setVisible(true);
        this.clipBar.fillStyle(0x11E100);  // Устанавливаем цвет индикатора (зеленый)

        const clipBlockWidth = 20; // Ширина каждого блока патронов
        const clipBlockSpacing = 2; // Расстояние между блоками
        const clipBlockHeight = 8; // Высота блока патронов
        for (let i = 0; i < this.bullets_in_current_clip; i++) {
            const yPosition = 575 - i * (clipBlockHeight + clipBlockSpacing);
            this.clipBar.fillRect(5, yPosition, clipBlockWidth, clipBlockHeight);
        }
    }

    create() {
        this.cameraSpeed = 5
        this.gameData = GameData.get();
        this.gameData.levelLoot = [];
        this.gameData.armorLoot = null;
        GameData.set(this.gameData);
        this.critical_chance = 10
        // Настройка камеры
        this.playRandomSoundtrack();
        this.cameras.main.setBounds(0, 0, 2048, 600);
        this.cameras.main.scrollX = 512;
        this.physics.world.setBounds(0, 0, 2048, 600);
        // Инициализация клавиатуры
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Добавление клавиши пробела
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.first_aid_kit_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.jet_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.buffout_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.mentats_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
        this.psycho_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

        let randomNumberBackground = Phaser.Math.Between(1, this.amountOfMainBackgrounds);
        this.background = this.add.image(0, 0, 'backgroundMain' + randomNumberBackground).setOrigin(0, 0);

        this.playerHealth = this.gameData.health; // Начальное количество жизней
        this.maxPlayerHealth = this.gameData.health; // Максимальное количество жизней

        this.chosenArmorName = this.gameData.current_armor;
        const foundArmor = this.armors.find(armor => armor.name === this.chosenArmorName);
        this.chosenArmor = JSON.parse(JSON.stringify(foundArmor));
        this.playerRedArmor = this.add.sprite(924, 100, 'armor red ' + this.chosenArmor.name).setScrollFactor(0);
        this.playerArmor = this.add.sprite(924, 100, 'armor ' + this.chosenArmor.name).setScrollFactor(0);

        // Инициализация графического объекта для маски
        this.healthMask = this.make.graphics({ x: 924, y: 100 }).setScrollFactor(0);
        this.healthMask.fillStyle(0xffffff);
        this.healthMask.beginPath();

        // Начальное создание маски
        this.healthMask.fillRect(-this.playerArmor.width / 2, -this.playerArmor.height / 2, this.playerArmor.width, this.playerArmor.height);
        this.healthMask.closePath();
        this.healthMask.fillPath();

        // Применение маски к броне
        this.playerArmor.setMask(this.healthMask.createGeometryMask());


        this.chosenWeaponName = this.gameData.current_weapon;
        const foundWeapon = this.weapons.find(weapon => weapon.name === this.chosenWeaponName);
        this.chosenWeapon = JSON.parse(JSON.stringify(foundWeapon));

        //this.add.sprite(915, 100, 'weapon ' + this.chosenWeapon.name).setScrollFactor(0);

        this.text_params = {fontSize: '22px', fill: '#ffffff', fontFamily: 'Arial', fontWeight: 'bold'}

        // Текст и индикатор перезарядки будут показаны только для оружия с патронами
        if (this.chosenWeapon.type !== 'melee') {
            this.ammoText = this.add.text(30, 495, '', this.text_params);
        }

        // Создание графического объекта для индикатора
        this.clipBar = this.add.graphics().setScrollFactor(0);
        this.soundReload = this.sound.add('reloading');

        if (this.chosenWeapon.type !== 'melee') {
            this.bullets_in_current_clip = 0
            this.reload()
        } else {
            this.bullets_in_current_clip = 0
        }

        // Скрываем индикатор магазина, если оружие ближнего боя
        this.updateClipBar();

        // Создание нового изображения (руки) из другой папки
        this.hand_sprite = this.add.sprite(this.cameras.main.width - 115, this.cameras.main.height - 88, 'hand ' + this.chosenWeapon.name).setScrollFactor(0);

        let enemiesConfig = this.gameData.enemiesToCreate

        enemiesConfig.forEach(name => {
            let enemy = this.createEnemy(name);
            this.enemies.push(enemy);
        });

        this.crosshair_red = this.add.sprite(512, 300, 'crosshair_red').setScrollFactor(0);
        this.crosshair_green = this.add.sprite(512, 300, 'crosshair_green').setScrollFactor(0).setVisible(false);
        // Сохранение исходной позиции прицела
        this.crosshairOriginalY = this.crosshair_red.y;
        this.soundEnemyKilled = this.sound.add('enemy killed');
        this.sip_pill = this.sound.add('sip pill');

        this.escape_button = this.add.sprite(0, 25, 'escape').setOrigin(0, 0).setScrollFactor(0).setVisible(false);
        this.escape_button.x = 512 - this.escape_button.width / 2;
        this.showEscapeButtonTimer();  // Запуск таймера для отображения изображения

        // Make images gray https://pinetools.com/grayscale-image
        // Make images transparent https://www.canva.com/design/play?strategy=element%3Aupload_0f898c74-64cb-484e-803c-1191e0d8c98a&imageKeys=upload_0f898c74-64cb-484e-803c-1191e0d8c98a&ui=eyJEIjp7IkoiOnsiQiI6eyJBPyI6IkEifSwiQyI6dHJ1ZX19LCJBIjp7IkoiOnRydWV9LCJHIjp7IkQiOnsiRCI6eyJBPyI6IkQifX19fQ&height=100&width=100
        this.first_aid_kit_grey = this.add.sprite(20, 490, 'first_aid_kit grey').setOrigin(0, 0).setScrollFactor(0);
        this.jet_grey = this.add.sprite(20, 490, 'jet grey').setOrigin(0, 0).setScrollFactor(0);
        this.buffout_grey = this.add.sprite(20, 490, 'buffout grey').setOrigin(0, 0).setScrollFactor(0);
        this.mentats_grey = this.add.sprite(20, 490, 'mentats grey').setOrigin(0, 0).setScrollFactor(0);
        this.psycho_grey = this.add.sprite(20, 490, 'psycho grey').setOrigin(0, 0).setScrollFactor(0);

        this.first_aid_kit = this.add.sprite(20, 490, 'first_aid_kit').setOrigin(0, 0).setScrollFactor(0).setVisible(false);
        this.jet = this.add.sprite(20, 490, 'jet').setOrigin(0, 0).setScrollFactor(0).setVisible(false);
        this.buffout = this.add.sprite(20, 490, 'buffout').setOrigin(0, 0).setScrollFactor(0).setVisible(false);
        this.mentats = this.add.sprite(20, 490, 'mentats').setOrigin(0, 0).setScrollFactor(0).setVisible(false);
        this.psycho = this.add.sprite(20, 490, 'psycho').setOrigin(0, 0).setScrollFactor(0).setVisible(false);

        // Расчет координат и установка их для картинок
        const screenWidth = 1024;
        const imageWidth = 100; // Замените на фактическую ширину ваших картинок
        const gap = 10; // Расстояние между картинками

        // Вычисляем начальную позицию для первой картинки
        const startX = (screenWidth / 2) - (imageWidth * 2.5) - (gap * 2);

        this.first_aid_kit_grey.x = this.first_aid_kit.x = startX;
        this.jet_grey.x = this.jet.x = startX + imageWidth + gap;
        this.buffout_grey.x = this.buffout.x = startX + (imageWidth + gap) * 2; // Эта картинка будет по центру
        this.mentats_grey.x = this.mentats.x = startX + (imageWidth + gap) * 3;
        this.psycho_grey.x = this.psycho.x = startX + (imageWidth + gap) * 4;

        this.medTexts = {};
        this.medcine.forEach(med => {
            const xPosition = this[med].x + imageWidth - 70; // Расположение текста
            const yPosition = this[med].y;
            this.medTexts[med] = this.add.text(xPosition, yPosition, '', {
                fontSize: '22px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(1, 0).setScrollFactor(0);
        });

        if (this.chosenWeapon.type !== 'melee') {
            this.ammo_sprite = this.add.sprite(25, 495, this.chosenWeapon.type).setOrigin(0, 0).setScrollFactor(0);
            const count = this.gameData.ammo[this.chosenWeapon.type];
            this.ammoText.setText(count > 0 ? `x${count}` : '').setScrollFactor(0);
        }

    }

    update() {
        // Скорость, с которой камера будет перемещаться

        if (this.cursors.left.isDown) {
            this.cameras.main.scrollX -= this.cameraSpeed;
        } else if (this.cursors.right.isDown) {
            this.cameras.main.scrollX += this.cameraSpeed;
        }

        this.enemies.forEach(enemy => {
            // Проверяем, существует ли еще враг и его индикатор здоровья
            if (!enemy.active || !enemy.healthIndicator.active) {
                return; // Пропускаем текущую итерацию цикла, если враг или его индикатор уничтожены
            }
            // Проверяем и обновляем прямоугольник
            if (enemy.rectangle) {
                enemy.rectangle.setPosition(enemy.x - enemy.displayWidth / 2, enemy.y - enemy.displayHeight / 2);
            }
            enemy.healthIndicator.x = enemy.x;
            enemy.healthIndicator.y = enemy.y - 125; // Например, 20 пикселей над врагом
            // Обновление индикатора здоровья
            let healthPercent = enemy.defence.health / enemy.defence.maxHealth;
            if (healthPercent == 1) {
                enemy.healthIndicator.setTexture('indicator green');
            } else if (healthPercent < 1 && healthPercent > 0.5) {
                enemy.healthIndicator.setTexture('indicator yellow');
            } else {
                enemy.healthIndicator.setTexture('indicator red');
            }
        });

        // Breathing when wounded
        if ((this.playerHealth < this.maxPlayerHealth / 2) && (this.playerHealth > this.maxPlayerHealth / 4)) {
            if (!this.isBreathSoundPlaying) {
                console.log('play breath');
                this.breathSound = this.sound.add('breath');
                this.breathSound.play({ loop: true, volume: 1 });
                this.isBreathSoundPlaying = true;
                if (this.hardBreathSound) {
                    this.hardBreathSound.stop();
                    this.isHardBreathSoundPlaying = false;
                }
            }
        } else if (this.playerHealth <= this.maxPlayerHealth / 4 && this.playerHealth >= 0) {
            if (!this.isHardBreathSoundPlaying) {
                console.log('play hard breath');
                this.hardBreathSound = this.sound.add('hard breath');
                this.hardBreathSound.play({ loop: true, volume: 1 });
                this.isHardBreathSoundPlaying = true;
                if (this.breathSound) {
                    this.breathSound.stop();
                    this.isBreathSoundPlaying = false;
                }
            }
        } else if (this.playerHealth >= this.maxPlayerHealth / 2 || this.playerHealth <= 0) {
            if (this.breathSound || this.hardBreathSound) {
                if (this.isBreathSoundPlaying) {
                    this.breathSound.stop();
                    this.isBreathSoundPlaying = false;
                }
                if (this.isHardBreathSoundPlaying) {
                    this.hardBreathSound.stop();
                    this.isHardBreathSoundPlaying = false;
                }
            }
        }

        // Получение положения камеры
        const cameraX = this.cameras.main.scrollX;
        const cameraY = this.cameras.main.scrollY;

        // Обновление прямоугольника прицела
        let crosshairRect = new Phaser.Geom.Rectangle(
            cameraX + this.crosshair_red.x - this.crosshair_red.width / 2,
            cameraY + this.crosshair_red.y - this.crosshair_red.height / 2,
            this.crosshair_red.width,
            this.crosshair_red.height
        );

        if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
            this.switchWeapon(1)
        }
        if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
            this.switchWeapon(-1)
        }

        let currentTime = new Date().getTime();
        let cooldown = this.chosenWeapon.cooldown;

        // Проверяем, готов ли прицел к следующему выстрелу
        if (currentTime - this.lastShotTime[this.chosenWeapon.name] >= cooldown) {
            // Если готов, проверяем пересечение с врагами
            let isIntersecting = this.checkIntersectionWithEnemies();
            if (isIntersecting) {
                this.crosshair_red.setVisible(false);
                this.crosshair_green.setVisible(true);
            } else {
                this.crosshair_green.setVisible(false);
                this.crosshair_red.setVisible(true);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.fireWeapon();
        }

        let toRemove = [];
        this.enemies.forEach((enemy, index) => {
            if (enemy.defence.health <= 0) {
                if (this.cache.audio.exists(`${enemy.name} - died`)) {
                    this.sound.add(`${enemy.name} - died`).play();
                }
                this.gameData.experience += enemy.experience
                if (enemy.weaponIndex !== undefined) {
                    this.gameData.levelLoot.push(enemy.weaponIndex);
                }
                if (enemy.armorName) {
                    this.tempLootArmors.push(enemy.armorName);
                }
                enemy.healthIndicator.destroy();
                enemy.destroy();
                toRemove.push(index);
            }
        });
        // Затем удаляем их в обратном порядке
        for (let i = toRemove.length - 1; i >= 0; i--) {
            this.enemies.splice(toRemove[i], 1);
        }

        this.enemies.forEach(enemy => {
            if (enemy.canAttack && !enemy.isMoving) {
                this.enemyAttack(enemy);
            }
        });

        // hero is dead
        if (this.playerHealth <= 0) {
            GameData.reset();
            let toRemove = [];
            this.enemies.forEach((enemy, index) => {
                enemy.healthIndicator.destroy();
                enemy.destroy();
                toRemove.push(index);
            });
            // Затем удаляем их в обратном порядке
            for (let i = toRemove.length - 1; i >= 0; i--) {
                this.enemies.splice(toRemove[i], 1);
            }
            this.soundtrack.stop()
            if (this.isBreathSoundPlaying) {
                this.breathSound.stop();
                this.isBreathSoundPlaying = false;
            }
            if (this.isHardBreathSoundPlaying) {
                this.hardBreathSound.stop();
                this.isHardBreathSoundPlaying = false;
            }
            this.scene.start('DeadScene');
            return;
        }

        // escape
        if (this.escape_button.visible && Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
            this.gameData.ammo[this.chosenWeapon.type] += this.bullets_in_current_clip
            GameData.set(this.gameData);
            let toRemove = [];
            this.enemies.forEach((enemy, index) => {
                enemy.healthIndicator.destroy();
                enemy.destroy();
                toRemove.push(index);
            });
            // Затем удаляем их в обратном порядке
            for (let i = toRemove.length - 1; i >= 0; i--) {
                this.enemies.splice(toRemove[i], 1);
            }
            this.soundtrack.stop()
            if (this.isBreathSoundPlaying) {
                this.breathSound.stop();
                this.isBreathSoundPlaying = false;
            }
            if (this.isHardBreathSoundPlaying) {
                this.hardBreathSound.stop();
                this.isHardBreathSoundPlaying = false;
            }
            this.scene.start('MainMenu');
            return;
        }

        // if hero killed everyone
        if (this.enemies.length === 0) {
            this.gameData.ammo[this.chosenWeapon.type] += this.bullets_in_current_clip
            this.gameData.levelCount++
            // determine best armor from defeated raiders
            if (this.tempLootArmors.length > 0) {
                const armorOrder = this.armors.map(a => a.name);
                let best = this.tempLootArmors.sort((a, b) => armorOrder.indexOf(b) - armorOrder.indexOf(a))[0];
                this.gameData.armorLoot = best;
            }
            GameData.set(this.gameData);
            let toRemove = [];
            this.enemies.forEach((enemy, index) => {
                enemy.healthIndicator.destroy();
                enemy.destroy();
                toRemove.push(index);
            });
            // Затем удаляем их в обратном порядке
            for (let i = toRemove.length - 1; i >= 0; i--) {
                this.enemies.splice(toRemove[i], 1);
            }
            this.soundtrack.stop()
            if (this.isBreathSoundPlaying) {
                this.breathSound.stop();
                this.isBreathSoundPlaying = false;
            }
            if (this.isHardBreathSoundPlaying) {
                this.hardBreathSound.stop();
                this.isHardBreathSoundPlaying = false;
            }
            this.scene.start('VictoryScene'); // Запуск GameScene
            return;
        }

        this.show_stats()

        this.medcine.forEach(med => {
            const count = this.gameData.med[med];
            this.medTexts[med].setText(count > 0 ? `x${count}` : '');
        });

        this.updateItemVisibility(this.gameData.med.first_aid_kit, this.first_aid_kit, this.first_aid_kit_grey);
        this.updateItemVisibility(this.gameData.med.jet, this.jet, this.jet_grey);
        this.updateItemVisibility(this.gameData.med.buffout, this.buffout, this.buffout_grey);
        this.updateItemVisibility(this.gameData.med.mentats, this.mentats, this.mentats_grey);
        this.updateItemVisibility(this.gameData.med.psycho, this.psycho, this.psycho_grey);

        if (Phaser.Input.Keyboard.JustDown(this.first_aid_kit_key)) {
            this.use_first_aid_kit()
        }
        if (Phaser.Input.Keyboard.JustDown(this.jet_key)) {
            this.use_jet()
        }
        if (Phaser.Input.Keyboard.JustDown(this.buffout_key)) {
            this.use_buffout()
        }
        if (Phaser.Input.Keyboard.JustDown(this.mentats_key)) {
            this.use_mentats()
        }
        if (Phaser.Input.Keyboard.JustDown(this.psycho_key)) {
            this.use_psycho()
        }

    }

    attackEffect(enemy) {
        enemy.setScale(1.1);
        this.time.delayedCall(1000, () => {
            enemy.setScale(1);
        });
    }

    tiltEffect() {
        const tiltDirection = Math.random() < 0.5 ? -1 : 1;
        const maxRotation = 0.05 * tiltDirection; // Максимальный угол наклона

        // Немного увеличиваем масштаб перед наклоном
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.2, // небольшое увеличение масштаба
            duration: 250, // половина времени для увеличения
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Наклон камеры
                this.tweens.add({
                    targets: this.cameras.main,
                    rotation: maxRotation,
                    duration: 250, // 1 секунда для наклона
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        // Возвращение камеры в исходное положение
                        this.tweens.add({
                            targets: this.cameras.main,
                            rotation: 0,
                            zoom: 1, // возвращение к исходному масштабу
                            duration: 250, // 1 секунда для восстановления
                            ease: 'Sine.easeInOut'
                        });
                    }
                });
            }
        });
    }

    bloodSplashEffect() {
        let bloodSplash = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'blood').setDepth(50).setScrollFactor(0);
        this.sound.add(`player wounded`).play();
        // Твин для покраснения фона
        this.tweens.add({
            targets: this.background,
            tint: 0xff0000, // красный цвет
            duration: 375, // половина времени для покраснения
            yoyo: true, // автоматическое возвращение к исходному цвету
            hold: 0, // удержание красного цвета
            onComplete: () => {
                // Убедитесь, что tint сброшен
                this.background.clearTint();
            }
        });

        this.time.delayedCall(750, () => {  // Удаляем изображение через 1 секунду
            bloodSplash.destroy();
        });
    }

    show_stats() {
        const hero_data_text_params = {fontSize: '14px', fill: '#000000', fontFamily: 'Arial', fontWeight: 'bold'}
        // Удаление старых текстовых объектов
        this.heroStatsTexts.forEach(text => text.destroy());
        this.heroStatsTexts = [];

        // Добавление новых текстовых объектов
        this.heroStatsTexts.push(this.add.text(710, 20, `Level ${this.gameData.levelCount}: ${this.gameData.experience}/1000`, hero_data_text_params).setScrollFactor(0));
        this.heroStatsTexts.push(this.add.text(710, 40, `Armor Class: ${this.chosenArmor.ac}`, hero_data_text_params).setScrollFactor(0));
        this.heroStatsTexts.push(this.add.text(710, 60, `Threshold: ${this.chosenArmor.threshold}`, hero_data_text_params).setScrollFactor(0));
        this.heroStatsTexts.push(this.add.text(710, 80, `Resistance: ${Math.round(this.chosenArmor.resistance * 100)}%`, hero_data_text_params).setScrollFactor(0));
        this.heroStatsTexts.push(this.add.text(710, 100, `Damage: ${Math.round(this.chosenWeapon.damage.min)}-${Math.round(this.chosenWeapon.damage.max)}`, hero_data_text_params).setScrollFactor(0));
        this.heroStatsTexts.push(this.add.text(710, 120, `Cooldown: ${this.chosenWeapon.cooldown / 1000}s`, hero_data_text_params).setScrollFactor(0));
        this.heroStatsTexts.push(this.add.text(710, 140, `Critical: ${this.critical_chance}%`, hero_data_text_params).setScrollFactor(0));
    }

    use_first_aid_kit() {
        if (this.gameData.med.first_aid_kit > 0) {
            this.gameData.med.first_aid_kit -= 1
            this.playerHealth += Phaser.Math.Between(10, 20);
            if (this.playerHealth > this.maxPlayerHealth) {
                this.playerHealth = this.maxPlayerHealth;
            }
            this.updateHealthDisplay()
            this.sip_pill.play()
        }
    }

    use_jet() {
        if (this.gameData.med.jet > 0) {
            this.gameData.med.jet -= 1
            console.log('Using jet, cooldown -25%, enemy speed +4s')
            this.chosenWeapon.cooldown *= 0.75
            this.enemies.forEach(enemy => {
                enemy.speed += 4000
            });
            this.sip_pill.play()
        }
    }

    use_buffout() {
        if (this.gameData.med.buffout > 0) {
            this.gameData.med.buffout -= 1
            console.log('Using buffout, damage +25%, resistance + 25%')
            this.chosenWeapon.damage.min *= 1.25
            this.chosenWeapon.damage.max *= 1.25
            this.chosenArmor.threshold += 2
            this.chosenArmor.resistance += 0.25
            this.sip_pill.play()
        }
    }

    use_mentats() {
        if (this.gameData.med.mentats > 0) {
            this.gameData.med.mentats -= 1
            console.log('Using mentats, AC +10, Critical chance +5%')
            this.chosenArmor.ac += 10
            this.critical_chance += 5
            this.sip_pill.play()
        }
    }

    use_psycho() {
        if (this.gameData.med.psycho > 0) {
            this.gameData.med.psycho -= 1
            console.log('Using psycho, damage +25%, resistance + 25%, threshold +1, enemy speed + 2s, hero speed +0.5, AC +5, critical_chance +3%')
            this.chosenWeapon.damage.min *= 1.1
            this.chosenWeapon.damage.max *= 1.1
            this.chosenArmor.threshold += 1
            this.chosenArmor.resistance += 0.1
            this.enemies.forEach(enemy => {
                enemy.speed += 2000
            });
            this.chosenArmor.ac += 5
            this.critical_chance += 3
            this.sip_pill.play()
        }
    }

    // Функция для обновления отображения здоровья
    updateHealthDisplay() {
        // Очистка маски
        this.healthMask.clear();

        // Расчет высоты "здоровья"
        const healthHeight = (this.playerHealth / this.maxPlayerHealth) * this.playerArmor.height;

        // Обновление маски
        this.healthMask.fillStyle(0xffffff, 1); // Цвет не важен
        this.healthMask.fillRect(-this.playerArmor.width / 2, -this.playerArmor.height / 2, this.playerArmor.width, healthHeight);
        this.healthMask.fillPath();
    }

    showEscapeButtonTimer() {
        // Случайное время для отображения
        const delay = Phaser.Math.Between(5000, 10000);

        this.time.delayedCall(delay, () => {
            this.escape_button.setVisible(true);
            this.hideEscapeButtonTimer(); // Скрытие изображения через случайный интервал
        });
    }

    hideEscapeButtonTimer() {
        // Случайное время для скрытия
        const delay = Phaser.Math.Between(2000, 5000);

        this.time.delayedCall(delay, () => {
            this.escape_button.setVisible(false);
            this.showEscapeButtonTimer(); // Повторное отображение изображения через случайный интервал
        });
    }

    switchWeapon(next) {
        if (this.chosenWeapon.type !== 'melee') {
            this.gameData.ammo[this.chosenWeapon.type] += this.bullets_in_current_clip
        }
        this.bullets_in_current_clip = 0
        const currentIndex = this.gameData.weapons.indexOf(this.gameData.current_weapon);
        const nextIndex = (currentIndex + next + this.gameData.weapons.length) % this.gameData.weapons.length;
        this.gameData.current_weapon = this.gameData.weapons[nextIndex];
        const foundWeapon = this.weapons.find(weapon => weapon.name === this.gameData.current_weapon);
        this.chosenWeapon = JSON.parse(JSON.stringify(foundWeapon));
        this.reload();
        this.updateClipBar();

        if (this.hand_sprite) {
            this.hand_sprite.destroy();
        }
        if (this.ammo_sprite) {
            this.ammo_sprite.destroy();
        }
        if (this.ammoText) {
            this.ammoText.destroy();
        }
        this.hand_sprite = this.add.sprite(this.cameras.main.width - 115, this.cameras.main.height - 88, 'hand ' + this.chosenWeapon.name).setScrollFactor(0);
        if (this.chosenWeapon.type !== 'melee') {
            const count = this.gameData.ammo[this.chosenWeapon.type];
            this.ammoText = this.add.text(30, 495, '', this.text_params);
            this.ammoText.setText(count > 0 ? `x${count}` : '').setScrollFactor(0);
            this.ammo_sprite = this.add.sprite(25, 495, this.chosenWeapon.type).setOrigin(0, 0).setScrollFactor(0);
        }

    }

    checkIntersectionWithEnemies() {
        // Получение положения камеры
        const cameraX = this.cameras.main.scrollX;
        const cameraY = this.cameras.main.scrollY;

        // Обновление прямоугольника прицела с учетом положения камеры
        let crosshairRect = new Phaser.Geom.Rectangle(
            cameraX + this.crosshair_red.x - this.crosshair_red.width / 2,
            cameraY + this.crosshair_red.y - this.crosshair_red.height / 2,
            this.crosshair_red.width,
            this.crosshair_red.height
        );

        // Проверка пересечений с каждым врагом
        return this.enemies.some(enemy => {
            if (enemy.rectangle) {
                // Обновляем прямоугольник врага на случай, если он изменил своё положение
                enemy.rectangle.setPosition(enemy.x - enemy.displayWidth / 2, enemy.y - enemy.displayHeight / 2);

                // Проверяем пересечение прицела с прямоугольником врага
                return Phaser.Geom.Intersects.RectangleToRectangle(crosshairRect, enemy.rectangle);
            }

            return false;
        });
    }

    createEnemy(enemy_name) {
        let xPosition = Phaser.Math.Between(512, 1536);
        let speed = Phaser.Math.Between(2000, 3000); // Продолжительность анимации
        let direction = Math.random() > 0.5 ? 1 : -1;
        let moveThreshold = Phaser.Math.Between(200, 600);

        //const enemy_obj = this.enemies_all.find(enemy => enemy.name === enemy_name);
        const enemy_obj = this.enemies_all.find(enemy => enemy.title.includes(enemy_name));
        const unique_enemy_obj = JSON.parse(JSON.stringify(enemy_obj));

        // Parse info for Raiders before creating the sprite
        let weaponIndex;
        let armorName;
        let enemyType;

        if (enemy_name.startsWith('Raider')) {
            const parts = enemy_name.split(' - ');
            armorName = parts[1];
            const weaponName = parts.slice(2).join(' - ');

            const weapon = this.weapons.find(w => w.name === weaponName);
            if (weapon) {
                unique_enemy_obj.attack.weapon = weapon.name;
                unique_enemy_obj.attack.damage = { ...weapon.damage };
                unique_enemy_obj.attack.shots = weapon.shots;
                weaponIndex = this.weapons.indexOf(weapon);
            }

            const armor = this.armors.find(a => a.name === armorName);
            if (armor) {
                unique_enemy_obj.defence.ac = armor.ac;
                unique_enemy_obj.defence.threshold = armor.threshold;
                unique_enemy_obj.defence.resistance = armor.resistance;
            }

            enemyType = 'Raiders';
        }

        let startPosition = Phaser.Math.Clamp(xPosition, 512, 1536);
        let enemy = this.add.image(startPosition, 330, enemy_name);

        enemy.name = enemy_name
        //enemy.title = unique_enemy_obj.title
        enemy.defence = {}
        enemy.defence.maxHealth = unique_enemy_obj.defence.health;
        enemy.defence.health = unique_enemy_obj.defence.health;
        enemy.defence.ac = unique_enemy_obj.defence.ac;
        enemy.defence.threshold = unique_enemy_obj.defence.threshold;
        enemy.defence.resistance = unique_enemy_obj.defence.resistance;
        enemy.healthIndicator = this.add.sprite(xPosition, 280, 'indicator green'); // Предполагается, что начальное здоровье - 100%
        enemy.attack = {}
        enemy.attack.hit_chance = unique_enemy_obj.attack.hit_chance
        enemy.attack.weapon = unique_enemy_obj.attack.weapon
        enemy.attack.damage = {}
        enemy.attack.damage.min = unique_enemy_obj.attack.damage.min
        enemy.attack.damage.max = unique_enemy_obj.attack.damage.max
        enemy.attack.shots = unique_enemy_obj.attack.shots
        enemy.experience = unique_enemy_obj.experience
        enemy.speed = speed;
        enemy.direction = direction;
        enemy.moveThreshold = moveThreshold;

        // Assign raider specific properties if set
        if (weaponIndex !== undefined) {
            enemy.weaponIndex = weaponIndex;
        }
        if (armorName) {
            enemy.armorName = armorName;
        }
        if (enemyType) {
            enemy.enemyType = enemyType;
        }

        // Определите границы движения врага
        let minBound = 512;
        let maxBound = 1536;
        // Функция для запуска Tween анимации
        const startTween = () => {
            enemy.isMoving = true; // Враг начинает движение
            // Рассчитайте конечную позицию с учетом границ
            let targetX = enemy.x + (direction * moveThreshold);
            targetX = Phaser.Math.Clamp(targetX, minBound, maxBound);

            if (!enemy.rectangle) {
                enemy.rectangle = new Phaser.Geom.Rectangle(enemy.x - enemy.displayWidth / 2, enemy.y - enemy.displayHeight / 2, enemy.displayWidth, enemy.displayHeight);
            }

            // Функция для запуска анимации в одном направлении
            const tweenToTarget = () => {
                this.tweens.add({
                    targets: enemy,
                    x: targetX,
                    ease: 'Linear',
                    duration: enemy.speed,
                    onComplete: () => {
                        enemy.isMoving = false; // Враг остановился
                        // После завершения, задержка и запуск анимации обратно
                        this.time.delayedCall(1000, tweenToStart); // 1000 миллисекунд задержки
                    }
                });
            };

            // Функция для возвращения в исходное положение
            const tweenToStart = () => {
                this.tweens.add({
                    targets: enemy,
                    x: startPosition,
                    ease: 'Linear',
                    duration: enemy.speed,
                    onComplete: () => {
                        // Смена направления после завершения анимации
                        enemy.direction *= -1;
                        this.time.delayedCall(1000, tweenToTarget); // 1000 миллисекунд задержки
                    }
                });
            };

            tweenToTarget(); // Начать с анимации к конечной точке
        };
        startTween();

        this.setAttackTimer(enemy);

        return enemy;
    }

    setAttackTimer(enemy) {
        let attackDelay = Phaser.Math.Between(5000, 9000);  // Рандомный интервал между атаками
        this.time.delayedCall(attackDelay, () => {
            enemy.canAttack = true;
        });
    }

    crosshairRect() {
        // Получение положения камеры
        const cameraX = this.cameras.main.scrollX;
        const cameraY = this.cameras.main.scrollY;

        // Возвращение прямоугольника прицела
        return new Phaser.Geom.Rectangle(
            cameraX + this.crosshair_red.x - this.crosshair_red.width / 2,
            cameraY + this.crosshair_red.y - this.crosshair_red.height / 2,
            this.crosshair_red.width,
            this.crosshair_red.height
        );
    }

    enemyAttack(enemy) {
        if (enemy.canAttack) {
            this.attackEffect(enemy);
            let hitChance = Phaser.Math.Between(0, 100); // проверка навыка нападения
            if (hitChance < enemy.attack.hit_chance) {  // если враг папал
                let checkAc = Phaser.Math.Between(0, 100);  // проверка AC игрока
                if (checkAc > this.chosenArmor.ac) { // если AC игрока не помог
                    let totalDamage = 0;
                    for (let i = 0; i < enemy.attack.shots; i++) {
                        totalDamage += Phaser.Math.Between(enemy.attack.damage.min, enemy.attack.damage.max);
                        // Визуализация атаки, звуковые эффекты и т.д.
                        // ...
                    }
                    totalDamage -= this.chosenArmor.threshold; // Вычитаем порог брони
                    totalDamage = Math.max(totalDamage, 0); // Урон не может быть меньше 0
                    totalDamage -= totalDamage * this.chosenArmor.resistance; // Вычитаем сопротивление брони
                    console.log(`You were hit by ${enemy.name} on ${Math.round(totalDamage)}`);
                    this.playerHealth -= Math.round(totalDamage);  // Уменьшение здоровья игрока
                    this.updateHealthDisplay()
                    if (enemy.attack.weapon) {
                        this.sound.play(enemy.attack.weapon + ' - attack');
                    } else {
                        this.sound.play(enemy.name + ' - attack');
                    }

                    // Показываем изображение крови
                    this.tiltEffect();
                    this.bloodSplashEffect();

                    // Duration and intensity of the shake effect
                    const shakeIntensity = 0.01; // Intensity of the shake
                    const shakeDuration = 750; // Duration of the shake
                    this.cameras.main.shake(shakeDuration, shakeIntensity);
                } else {
                    console.log(`You endure damage without consequences.`)
                    this.tiltEffect();
                }
            } else {
                console.log(`${enemy.name} missed.`)
                if (enemy.attack.weapon) {
                    this.sound.play(enemy.attack.weapon + ' - attack');
                } else {
                    this.sound.play(enemy.name + ' - attack');
                }
            }
            enemy.canAttack = false
            this.setAttackTimer(enemy);
        }
    }

    fireWeapon() {
        let isCrosshairGreen = this.crosshair_green.visible;
        let currentTime = new Date().getTime();
        let cooldown = this.chosenWeapon.cooldown;

        if (currentTime - this.lastShotTime[this.chosenWeapon.name] >= cooldown) {
            // Определение, какой враг был поражен
            let enemy_to_hit = this.enemies.find(enemy => {
                if (enemy.rectangle) {
                    return Phaser.Geom.Intersects.RectangleToRectangle(this.crosshairRect(), enemy.rectangle);
                }
                return false;
            });

            if (this.bullets_in_current_clip >= this.chosenWeapon.shots || this.chosenWeapon.type === 'melee') {
                if (this.chosenWeapon.type !== 'melee') {
                    this.bullets_in_current_clip -= this.chosenWeapon.shots;  // уменьшение патронов
                    this.updateClipBar();
                }
                if (enemy_to_hit) {
                    let roll_hit_chance = Phaser.Math.Between(0, 100);
                    if (roll_hit_chance < this.gameData.skills[this.chosenWeapon.skill]) {
                        let totalDamage = 0;
                        for (let i = 0; i < this.chosenWeapon.shots; i++) {
                            let bulletDamage
                            // Проверка на проникновение урона через броню
                            if (Phaser.Math.Between(0, 100) > enemy_to_hit.defence.ac) { // Если преодолена броня
                                bulletDamage = Phaser.Math.Between(this.chosenWeapon.damage.min, this.chosenWeapon.damage.max);
                            } else {
                                console.log(`${enemy_to_hit.name} endures damage without consequences.`)
                                bulletDamage = 0; // Броня полностью поглотила урон
                            }
                            totalDamage += Math.round(bulletDamage);
                            if (totalDamage === 0) {
                                let missSoundNumber = Phaser.Math.Between(1, 3);
                                this.sound.play(this.chosenWeapon.name + ' - miss ' + missSoundNumber);
                            }
                        }
                        if (totalDamage !== 0) {
                            let was_critical_or_not = Phaser.Math.Between(0, 100)
                            if (was_critical_or_not > this.critical_chance) {
                                totalDamage -= enemy_to_hit.defence.threshold; // Вычитаем порог брони
                                totalDamage = Math.max(totalDamage, 0); // Урон не может быть меньше 0
                                totalDamage -= totalDamage * enemy_to_hit.defence.resistance; // Вычитаем сопротивление брони
                                console.log(`${enemy_to_hit.name} was hit for ${Math.round(totalDamage)} hitpoints.`)
                            } else {
                                let roll_critical = Phaser.Math.Between(0, 100)
                                if (roll_critical > 20 && roll_critical < 46) {
                                    totalDamage *= 1.5
                                    console.log(`[Critical Damage x1.5 (Ignores Armor)] ${enemy_to_hit.name} was hit for ${totalDamage}.`);
                                } else if (roll_critical > 45 && roll_critical < 91) {
                                    totalDamage *= 2
                                    console.log(`[Critical Damage x2 (Ignores Armor)] ${enemy_to_hit.name} was hit for ${totalDamage}.`);
                                } else if (roll_critical > 90 && roll_critical < 98) {
                                    totalDamage *= 3
                                    console.log(`[Critical Damage x3 (Ignores Armor)] ${enemy_to_hit.name} was hit for ${totalDamage}.`);
                                } else if (roll_critical > 97) { // Instant Death
                                    totalDamage *= 100; // Множитель урона
                                    console.log(`[Critical Damage (Instant death)] ${enemy_to_hit.name} was hit for ${totalDamage}.`);
                                } else if (roll_critical < 21) {
                                    totalDamage *= 1.5
                                    totalDamage -= enemy_to_hit.defence.threshold;
                                    totalDamage = Math.max(totalDamage, 0);
                                    totalDamage -= totalDamage * enemy_to_hit.defence.resistance;
                                    console.log(`[Critical Damage x1.5] ${enemy_to_hit.name} was hit for ${totalDamage}.`);
                                }
                            }
                            enemy_to_hit.defence.health -= Math.round(totalDamage); // Уменьшение здоровья врага
                            this.sound.play(this.chosenWeapon.name + ' - hit');
                            if (enemy_to_hit.defence.health > 0) {
                                if (this.cache.audio.exists(enemy_to_hit.name + ' - wounded')) {
                                    this.sound.play(enemy_to_hit.name + ' - wounded');
                                }
                            }
                        }
                    } else {
                        let missSoundNumber = Phaser.Math.Between(1, 3);
                        this.sound.play(this.chosenWeapon.name + ' - miss ' + missSoundNumber);
                    }
                } else {
                    let missSoundNumber = Phaser.Math.Between(1, 3);
                    this.sound.play(this.chosenWeapon.name + ' - miss ' + missSoundNumber);
                }

                // Изменение прицела на красный и подъем вверх
                this.crosshair_green.setVisible(false);
                this.crosshair_red.setVisible(true).setY(this.crosshairOriginalY - 150);

                // Запуск анимации для опускания прицела
                this.tweens.add({
                    targets: this.crosshair_red,
                    y: this.crosshairOriginalY,
                    ease: 'Power1',
                    duration: cooldown,
                    onComplete: () => {
                        this.crosshair_green.setVisible(true);
                        this.crosshair_red.setVisible(false);
                    }
                });

                this.lastShotTime[this.chosenWeapon.name] = currentTime;
            } else {
                this.reload()
            }
        }
    }

    reload() {
        if (this.chosenWeapon.type !== 'melee') {
            if (this.gameData.ammo[this.chosenWeapon.type] > 0 && this.gameData.ammo[this.chosenWeapon.type] < this.chosenWeapon.clip ) {
                this.bullets_in_current_clip = this.gameData.ammo[this.chosenWeapon.type]
                this.gameData.ammo[this.chosenWeapon.type] = 0
                this.updateClipBar();
                this.soundReload.play()
                console.log('No bullets in clip! Reloaded as much as could!')
            } else if (this.gameData.ammo[this.chosenWeapon.type] >= this.chosenWeapon.clip) {
                this.bullets_in_current_clip = this.chosenWeapon.clip
                this.gameData.ammo[this.chosenWeapon.type] -= this.chosenWeapon.clip
                this.updateClipBar();
                this.soundReload.play()
                console.log('No bullets in clip! Reloaded full clip!')
            } else {
                console.log('No bullets, cant reload!')
            }
        }
    }
}
