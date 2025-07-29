import GameData from "../utils/GameData.js";

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: "VictoryScene" });

    // Объект для хранения маппинга лута и соответствующего действия
    this.lootActions = {
      0: { ammoType: "melee", amount: 0 },
      1: { ammoType: "energy_cell", amount: Phaser.Math.Between(2, 6) },
      2: { ammoType: "mm_9", amount: Phaser.Math.Between(4, 8) },
      3: { ammoType: "magnum_44", amount: Phaser.Math.Between(2, 6) },
      4: { ammoType: "frag_grenade", amount: Phaser.Math.Between(3, 5) },
      5: { ammoType: "magnum_44", amount: Phaser.Math.Between(2, 6) },
      6: { ammoType: "energy_cell", amount: Phaser.Math.Between(2, 6) },
      7: { ammoType: "mm_12", amount: Phaser.Math.Between(6, 12) },
      8: { ammoType: "mm_9", amount: Phaser.Math.Between(10, 30) },
      9: { ammoType: "mm_5_45", amount: Phaser.Math.Between(80, 160) },
    };
  }

  preload() {
    this.load.image("victory background", "assets/images/victory/victory.png");
    this.load.audio("victory music", ["assets/sounds/victory/victory.wav"]);

    this.load.image("mm_9", "assets/images/ammo_small/mm_9.png");
    this.load.image("mm_12", "assets/images/ammo_small/mm_12.png");
    this.load.image("magnum_44", "assets/images/ammo_small/magnum_44.png");
    this.load.image("mm_5_45", "assets/images/ammo_small/mm_5_45.png");
    this.load.image(
      "frag_grenade",
      "assets/images/ammo_small/frag_grenade.png"
    );
    this.load.image("energy_cell", "assets/images/ammo_small/energy_cell.png");

    this.armors = [
      "Leather Jacket",
      "Leather Armor",
      "Metal Armor",
      "Combat Armor",
      "Power Armor",
    ];
    this.armors.forEach((armor) => {
      this.load.image(armor, "assets/images/armors/" + armor + ".png");
    });

    this.medcine = ["first_aid_kit", "jet", "buffout", "mentats", "psycho"];
    this.medcine.forEach((med) => {
      this.load.image(med, "assets/images/medcine/colored/" + med + ".png");
    });
  }

  create() {
    this.gameData = GameData.get();
    this.add
      .image(0, 0, "victory background")
      .setOrigin(0, 0)
      .setScrollFactor(0);
    this.victory_music = this.sound.add("victory music");
    this.victory_music.play();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    console.log(this.gameData);

    this.text_params = {
      fontSize: "85px",
      fill: "#000000",
      fontFamily: "Brush Script MT",
      fontWeight: "bold",
    };
    this.text = "Loot items";
    this.lootText = this.add
      .text(512, 140, this.text, this.text_params)
      .setOrigin(0.5, 0.5);

    // Объект для хранения информации о луте
    let lootInfo = {};

    // Обработка лута
    if (this.gameData.armorLoot) {
      const currentIndex = this.armors.indexOf(this.gameData.current_armor);
      const lootIndex = this.armors.indexOf(this.gameData.armorLoot);
      if (lootIndex > currentIndex) {
        this.gameData.current_armor = this.gameData.armorLoot;
      }
      // Броня применяется сразу, но не отображается среди лута
    }

    this.gameData.levelLoot.forEach((loot) => {
      if (loot !== 0) {
        const action = this.lootActions[loot];
        if (action) {
          const { ammoType, amount } = action;
          this.gameData.ammo[ammoType] += amount;
          lootInfo[ammoType] = (lootInfo[ammoType] || 0) + amount;
        }
      }
      // Обработка медикаментов
      const medChance = Phaser.Math.Between(1, 100);
      if (medChance > 75) {
        const medIndex = Phaser.Math.Between(0, this.medcine.length - 1);
        const medName = this.medcine[medIndex];
        this.gameData.med[medName] += 1;
        lootInfo[medName] = (lootInfo[medName] || 0) + 1;
      }
    });

    // Расчеты для отображения лута
    const maxItemsPerRow = 4;
    let totalRows = Math.ceil(Object.keys(lootInfo).length / maxItemsPerRow);
    const itemSize = 100; // Размер элемента
    const gap = 10; // Расстояние между элементами

    // Вычисление размеров и положения фона
    const rectWidth =
      maxItemsPerRow * itemSize + (maxItemsPerRow - 1) * gap + 50;
    const rectHeight = totalRows * itemSize + (totalRows - 1) * gap + 50;
    const rectX = 1024 / 2 - rectWidth / 2 - 25;
    const rectY = 220 - 25;

    // Создание и отрисовка черного прямоугольника
    if (Object.keys(lootInfo).length > 0) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x000000, 0.75);
      graphics.fillRect(rectX, rectY, rectWidth, rectHeight);
    }

    // Отображение лута
    let currentX = rectX + 25;
    let currentY = rectY + 25;
    let itemIndex = 0;

    Object.keys(lootInfo).forEach((item) => {
      // Переход на новую строку
      if (itemIndex % maxItemsPerRow === 0 && itemIndex !== 0) {
        currentY += itemSize + gap;
        currentX = rectX;
      }

      // Отрисовка элементов лута
      this.add
        .sprite(currentX, currentY, item)
        .setOrigin(0, 0)
        .setScrollFactor(0);
      if (lootInfo[item] > 1) {
        this.add
          .text(currentX - 5, currentY - 5, `x${lootInfo[item]}`, {
            fontSize: "22px",
            fill: "#ffffff",
            fontFamily: "Arial",
            fontWeight: "bold",
          })
          .setOrigin(0, 0)
          .setScrollFactor(0);
      }

      currentX += itemSize + gap;
      itemIndex++;
    });

    this.gameData.levelLoot = [];
    this.gameData.armorLoot = null;
    GameData.set(this.gameData);
  }

  update() {
    // Проверяем, была ли нажата клавиша "Пробел" или "Enter"
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.victory_music.stop();
      this.scene.start("WorldMapScene"); // Запуск GameScene
    }
  }
}
