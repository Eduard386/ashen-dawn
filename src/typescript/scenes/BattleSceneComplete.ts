import { LegacyBridge } from '../core/bridges/LegacyBridge.js';

/**
 * Complete Legacy BattleScene - Exact functionality from legacy JS
 * All assets, sounds, weapon switching, combat mechanics restored
 */
export class BattleScene extends Phaser.Scene {
  private bridge!: LegacyBridge;
  private gameData: any;
  
  // Legacy data structures
  private soundtrackNames = [
    "A Traders Life (in NCR)",
    "All-Clear Signal (Vault City)",
    "Beyond The Canyon (Arroyo)",
    "California Revisited (Worldmap on foot)",
    "Khans of New California (in the Den)",
    "Moribund World (in Klamath)",
    "My Chrysalis Highwayman (Worldmap with Car)",
  ];
  
  private weapons = [
    { name: "Baseball bat", skill: "melee_weapons", type: "melee", cooldown: 3000, damage: { min: 3, max: 10 }, clip: 1000, shots: 1 },
    { name: "Laser pistol", skill: "energy_weapons", type: "energy_cell", cooldown: 6000, damage: { min: 10, max: 22 }, clip: 12, shots: 1 },
    { name: "9mm pistol", skill: "small_guns", type: "mm_9", cooldown: 5000, damage: { min: 10, max: 24 }, clip: 12, shots: 1 },
    { name: "44 Desert Eagle", skill: "small_guns", type: "magnum_44", cooldown: 5000, damage: { min: 20, max: 32 }, clip: 8, shots: 1 },
    { name: "Frag grenade", skill: "pyrotechnics", type: "frag_grenade", cooldown: 4000, damage: { min: 20, max: 35 }, clip: 1, shots: 1 },
    { name: "44 Magnum revolver", skill: "small_guns", type: "magnum_44", cooldown: 4000, damage: { min: 24, max: 36 }, clip: 6, shots: 1 },
    { name: "Combat shotgun", skill: "small_guns", type: "mm_12", cooldown: 6000, damage: { min: 15, max: 25 }, clip: 12, shots: 3 },
    { name: "SMG", type: "mm_9", skill: "small_guns", cooldown: 800, damage: { min: 5, max: 12 }, clip: 30, shots: 10 },
  ];
  
  private armors = [
    { name: "Leather Jacket", ac: 8, threshold: 0, resistance: 0.2 },
    { name: "Leather Armor", ac: 15, threshold: 2, resistance: 0.25 },
    { name: "Metal Armor", ac: 10, threshold: 4, resistance: 0.3 },
    { name: "Combat Armor", ac: 20, threshold: 5, resistance: 0.4 },
    { name: "Power Armor", ac: 25, threshold: 12, resistance: 0.4 },
  ];
  
  private enemies_all = [
    {
      name: 'Mantis', type: 'creature',
      defence: { health: 25, ac: 13, threshold: 0, resistance: 0.2 },
      attack: { hit_chance: 50, damage: { min: 5, max: 8 }, shots: 1 },
      amount: { min: 1, max: 4 }, experience: 50, title: ['Mantis']
    },
    {
      name: 'Cannibals', type: 'human',
      defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
      attack: { hit_chance: 60, weapon: 'Knife', damage: { min: 1, max: 6 }, shots: 1 },
      amount: { min: 2, max: 4 }, experience: 50,
      title: ['Cannibal man 1', 'Cannibal man 2', 'Cannibal man 3', 'Cannibal woman 1', 'Cannibal woman 2']
    },
    {
      name: 'Raiders', type: 'human',
      defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
      attack: { hit_chance: 60 },
      amount: { min: 1, max: 4 }, experience: 75,
      title: [
        'Raider - Leather Jacket - Baseball bat',
        'Raider - Leather Jacket - 44 Magnum revolver',
        'Raider - Leather Jacket - 9mm pistol',
        'Raider - Leather Jacket - 44 Desert Eagle',
        'Raider - Leather Jacket - Laser pistol',
        'Raider - Leather Jacket - SMG',
        'Raider - Leather Jacket - Combat shotgun',
        'Raider - Leather Armor - Baseball bat',
        'Raider - Leather Armor - 44 Magnum revolver',
        'Raider - Leather Armor - 9mm pistol',
        'Raider - Leather Armor - 44 Desert Eagle',
        'Raider - Leather Armor - Laser pistol',
        'Raider - Leather Armor - SMG',
        'Raider - Leather Armor - Combat shotgun',
      ]
    }
  ];

  // UI Elements
  private background!: Phaser.GameObjects.Image;
  private playerArmor!: Phaser.GameObjects.Sprite;
  private playerRedArmor!: Phaser.GameObjects.Sprite;
  private healthMask!: Phaser.GameObjects.Graphics;
  private hand_sprite!: Phaser.GameObjects.Sprite;
  private crosshair_red!: Phaser.GameObjects.Sprite;
  private crosshair_green!: Phaser.GameObjects.Sprite;
  private escape_button!: Phaser.GameObjects.Sprite;
  
  // Stats display elements
  private healthText!: Phaser.GameObjects.Text;
  private weaponStatsText!: Phaser.GameObjects.Text;
  private armorStatsText!: Phaser.GameObjects.Text;
  
  // Medical items
  private first_aid_kit!: Phaser.GameObjects.Sprite;
  private first_aid_kit_grey!: Phaser.GameObjects.Sprite;
  private jet!: Phaser.GameObjects.Sprite;
  private jet_grey!: Phaser.GameObjects.Sprite;
  private buffout!: Phaser.GameObjects.Sprite;
  private buffout_grey!: Phaser.GameObjects.Sprite;
  private mentats!: Phaser.GameObjects.Sprite;
  private mentats_grey!: Phaser.GameObjects.Sprite;
  private psycho!: Phaser.GameObjects.Sprite;
  private psycho_grey!: Phaser.GameObjects.Sprite;
  
  // Game state
  private chosenWeapon: any;
  private chosenArmor: any;
  private playerHealth: number = 0;
  private maxPlayerHealth: number = 0;
  private bullets_in_current_clip: number = 0;
  private enemies: any[] = [];
  private enemySprites: Phaser.GameObjects.Sprite[] = [];
  private enemyHealthIndicators: Phaser.GameObjects.Sprite[] = [];
  private lastShotTime: { [key: string]: number } = {};
  private isDead: boolean = false;
  private isVictoryTriggered: boolean = false;
  
  // Pre-calculated stable loot
  private victoryLoot: {
    weapon: string;
    ammoType: string;
    ammoAmount: number;
    medical: string;
    medAmount: number;
  } | null = null;
  
  // Audio
  private soundtrack: any;
  private breathSound: any;
  private hardBreathSound: any;
  private isBreathSoundPlaying: boolean = false;
  private isHardBreathSoundPlaying: boolean = false;
  
  // Ammo display
  private ammoText: any;
  private clipBar: any;
  
  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private tabKey!: Phaser.Input.Keyboard.Key;
  private qKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private medical_keys: any = {};

  constructor() {
    super({ key: 'BattleScene' });
  }

  preload(): void {
    // Battle backgrounds
    this.load.image("backgroundMain1", "assets/images/backgrounds/battle/backgroundMain1.png");
    
    // Armors
    this.armors.forEach((armor) => {
      this.load.image("armor " + armor.name, "assets/images/armors/" + armor.name + ".png");
      this.load.image("armor red " + armor.name, "assets/images/armors_red/" + armor.name + ".png");
    });

    // Weapons and hands
    this.weapons.forEach((weapon) => {
      this.load.image("weapon " + weapon.name, "assets/images/weapons/" + weapon.name + ".png");
      this.load.image("hand " + weapon.name, "assets/images/hands/" + weapon.name + ".png");
    });

    // All enemies
    this.enemies_all.forEach((enemy) => {
      enemy.title.forEach((title) => {
        console.log(`🖼️ Loading enemy image: ${title}`);
        this.load.image(title, `assets/images/enemies/${title}.png`);
      });
    });

    // UI elements
    this.load.image("crosshair_red", "assets/images/crosshairs/crosshair_red.png");
    this.load.image("crosshair_green", "assets/images/crosshairs/crosshair_green.png");
    this.load.image("indicator green", "assets/images/health_indicators/green.png");
    this.load.image("indicator yellow", "assets/images/health_indicators/yellow.png");
    this.load.image("indicator red", "assets/images/health_indicators/red.png");
    this.load.image("blood", "assets/images/backgrounds/hit/blood.png");
    this.load.image("escape", "assets/images/escape_button.png");
    // Victory images
    this.load.image("victory_bg", "assets/images/victory/victory.png");
    
    // Victory sounds  
    this.load.audio("victory_sound", "assets/sounds/victory/victory.wav");

    // Ammo
    this.load.image("mm_9", "assets/images/ammo_small/mm_9.png");
    this.load.image("mm_12", "assets/images/ammo_small/mm_12.png");
    this.load.image("magnum_44", "assets/images/ammo_small/magnum_44.png");
    this.load.image("mm_5_45", "assets/images/ammo_small/mm_5_45.png");
    this.load.image("frag_grenade", "assets/images/ammo_small/frag_grenade.png");
    this.load.image("energy_cell", "assets/images/ammo_small/energy_cell.png");

    // Medical items
    const medicine = ["first_aid_kit", "jet", "buffout", "mentats", "psycho"];
    medicine.forEach((med) => {
      this.load.image(med, "assets/images/medcine/colored/" + med + ".png");
      this.load.image(med + " grey", "assets/images/medcine/grey/" + med + ".png");
    });

    // Audio - Weapon sounds
    this.weapons.forEach((weapon) => {
      this.load.audio(weapon.name + " - hit", `assets/sounds/weapons/${weapon.name} - hit.mp3`);
      // Multiple miss sounds
      for (let j = 1; j <= 3; j++) {
        this.load.audio(weapon.name + " - miss " + j, `assets/sounds/weapons/${weapon.name} - miss ${j}.mp3`);
      }
    });

    // Audio - General sounds
    this.load.audio("breath", "assets/sounds/breath.mp3");
    this.load.audio("hard_breath", "assets/sounds/hard_breath.mp3");
    this.load.audio("player wounded", "assets/sounds/player wounded.mp3");
    this.load.audio("reloading", "assets/sounds/reload.mp3");
    this.load.audio("sip pill", "assets/sounds/sip_pill.mp3");

    // Audio - Enemy sounds
    this.load.audio("Mantis - attack", "assets/sounds/enemies/Mantis - attack.mp3");
    this.load.audio("Mantis - wounded", "assets/sounds/enemies/Mantis - wounded.mp3");
    this.load.audio("Mantis - died", "assets/sounds/enemies/Mantis - died.mp3");
    
    // Cannibal sounds
    for (let i = 1; i <= 3; i++) {
      this.load.audio(`Cannibal man ${i} - wounded`, `assets/sounds/enemies/Cannibal man ${i} - wounded.mp3`);
      this.load.audio(`Cannibal man ${i} - died`, `assets/sounds/enemies/Cannibal man ${i} - died.mp3`);
    }
    for (let i = 1; i <= 2; i++) {
      this.load.audio(`Cannibal woman ${i} - wounded`, `assets/sounds/enemies/Cannibal woman ${i} - wounded.mp3`);
      this.load.audio(`Cannibal woman ${i} - died`, `assets/sounds/enemies/Cannibal woman ${i} - died.mp3`);
    }

    // Battle background music
    this.soundtrackNames.forEach((name) => {
      this.load.audio(name, "assets/sounds/battle_background/" + name + ".mp3");
    });
  }

  create(data: { enemyType?: string; enemies?: string[] } = {}): void {
    // Initialize bridge
    this.bridge = LegacyBridge.getInstance();
    if (!this.bridge.isInitialized()) {
      this.bridge.initialize();
    }
    this.gameData = this.bridge.getGameData();

    // Reset scene-specific flags
    this.isDead = false;
    this.isVictoryTriggered = false;
    this.isBreathSoundPlaying = false;
    this.isHardBreathSoundPlaying = false;

    // Camera setup
    this.cameras.main.setBounds(0, 0, 2048, 600);
    this.cameras.main.scrollX = 512;
    this.physics.world.setBounds(0, 0, 2048, 600);

    // Initialize input
    this.setupInput();

    // Create background
    this.createBackground();

    // Setup player
    this.setupPlayerStats();
    this.setupWeapon();

    // Setup enemies
    this.setupEnemies(data);

    // Pre-calculate victory loot to prevent changing
    this.generateVictoryLoot();

    // Setup UI
    this.setupCrosshairs();
    this.setupEscapeButton();
    
    // Setup escape button interactivity
    this.escape_button.setInteractive();
    this.escape_button.on('pointerdown', () => {
      this.handleEscapeButtonClick();
    });
    
    this.setupMedicalItems();
    this.setupAmmoDisplay();
    this.setupStatsDisplay();

    // Start battle music
    this.playRandomSoundtrack();

    // Initialize breathing sounds
    this.breathSound = this.sound.add("breath");
    this.hardBreathSound = this.sound.add("hard_breath");

    console.log('⚔️ Complete Legacy BattleScene loaded successfully!');
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.tabKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // Medical keys
    this.medical_keys.first_aid_kit = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.medical_keys.jet = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.medical_keys.buffout = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.medical_keys.mentats = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.V);
    this.medical_keys.psycho = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B);

    // ESC to return
    this.input.keyboard!.on('keydown-ESC', () => {
      this.stopAllSounds();
      this.scene.start('WorldMapScene');
    });
    
    // SHIFT to return (legacy control)
    this.input.keyboard!.on('keydown-SHIFT', () => {
      this.stopAllSounds();
      this.scene.start('WorldMapScene');
    });
  }

  private stopAllSounds(): void {
    // Stop all audio to prevent sounds continuing across scenes
    this.sound.stopAll();
    
    if (this.soundtrack) {
      this.soundtrack.stop();
      this.soundtrack.destroy();
      this.soundtrack = null;
    }
    if (this.isBreathSoundPlaying && this.breathSound) {
      this.breathSound.stop();
      this.breathSound.destroy();
      this.isBreathSoundPlaying = false;
    }
    if (this.isHardBreathSoundPlaying && this.hardBreathSound) {
      this.hardBreathSound.stop();
      this.hardBreathSound.destroy();
      this.isHardBreathSoundPlaying = false;
    }
    
    console.log("🔇 All sounds forcefully stopped and destroyed");
  }

  private createBackground(): void {
    try {
      this.background = this.add.image(0, 0, "backgroundMain1").setOrigin(0, 0);
    } catch (error) {
      this.add.rectangle(1024, 300, 2048, 600, 0x333333).setOrigin(0.5);
    }
  }

  private setupPlayerStats(): void {
    this.playerHealth = this.gameData.health;
    this.maxPlayerHealth = this.gameData.health;
    this.chosenArmor = this.armors.find(a => a.name === this.gameData.current_armor) || this.armors[0];

    // Armor display at exact legacy position
    try {
      this.playerRedArmor = this.add.sprite(924, 100, "armor red " + this.chosenArmor.name).setScrollFactor(0);
      this.playerArmor = this.add.sprite(924, 100, "armor " + this.chosenArmor.name).setScrollFactor(0);

      // Health mask
      this.healthMask = this.make.graphics({ x: 924, y: 100 }).setScrollFactor(0);
      this.updateHealthMask();
      this.playerArmor.setMask(this.healthMask.createGeometryMask());
    } catch (error) {
      console.warn("Armor not found:", this.chosenArmor.name);
    }
  }

  private setupWeapon(): void {
    this.chosenWeapon = this.weapons.find(w => w.name === this.gameData.current_weapon) || this.weapons[0];
    this.updateWeaponDisplay();
    this.updateAmmoDisplay();
    
    // Initialize shot timers
    this.weapons.forEach(weapon => {
      this.lastShotTime[weapon.name] = 0;
    });
  }

  private updateWeaponDisplay(): void {
    if (this.hand_sprite) this.hand_sprite.destroy();

    try {
      this.hand_sprite = this.add.sprite(
        this.cameras.main.width - 115,
        this.cameras.main.height - 88,
        "hand " + this.chosenWeapon.name
      ).setScrollFactor(0);
    } catch (error) {
      console.warn("Hand weapon not found:", this.chosenWeapon.name);
    }

    // Setup ammo
    if (this.chosenWeapon.type !== "melee") {
      this.bullets_in_current_clip = this.gameData.ammo[this.chosenWeapon.type] || 0;
    }
    
    this.updateAmmoDisplay();
  }

  private updateAmmoDisplay(): void {
    // Remove old ammo display
    if (this.ammoText) this.ammoText.destroy();
    if (this.clipBar) this.clipBar.destroy();

    if (this.chosenWeapon.type !== "melee") {
      // Ammo count text
      const ammoCount = this.gameData.ammo[this.chosenWeapon.type] || 0;
      this.ammoText = this.add.text(70, 500, `x${ammoCount}`, {
        fontSize: "22px", color: "#ffffff", fontFamily: "Arial"
      }).setScrollFactor(0);

      // Clip bar (simple rectangle for now)
      this.clipBar = this.add.graphics().setScrollFactor(0);
      this.updateClipBar();
    }
  }

  private updateClipBar(): void {
    if (!this.clipBar || this.chosenWeapon.type === "melee") return;

    this.clipBar.clear();
    // Legacy dimensions - matching exact legacy proportions but wider sections
    const barWidth = 12;   // Made wider from 6 to 12
    const barHeight = 100; // Tall like legacy  
    const x = 190; // Position next to ammo text
    const y = 490; // Start from bottom area
    
    // Background (empty ammo) - dark gray border
    this.clipBar.fillStyle(0x444444);
    this.clipBar.fillRect(x, y, barWidth, barHeight);
    
    // Fill based on ammo in clip (from bottom up)
    if (this.bullets_in_current_clip > 0) {
      const fillHeight = (this.bullets_in_current_clip / this.chosenWeapon.clip) * barHeight;
      // Simple green fill like legacy
      this.clipBar.fillStyle(0x00aa00);
      this.clipBar.fillRect(x, y + barHeight - fillHeight, barWidth, fillHeight);
    }
    
    // No border to match legacy simplicity
  }

  private setupEnemies(data: any): void {
    const enemiesToCreate = data.enemies || this.gameData.enemiesToCreate || [];
    this.enemies = [];
    this.enemySprites = [];
    this.enemyHealthIndicators = [];

    enemiesToCreate.forEach((enemyName: string, index: number) => {
      // Find enemy data
      let enemyType: any = null;
      this.enemies_all.forEach(group => {
        if (group.title.includes(enemyName)) {
          enemyType = group;
        }
      });

      const startX = 800 + (index * 200);
      const enemy = {
        name: enemyName,
        health: enemyType ? enemyType.defence.health : 30,
        maxHealth: enemyType ? enemyType.defence.health : 30,
        x: startX,
        y: 300, // Вернули на исходное место
        movementSpeed: 30,
        direction: Math.random() > 0.5 ? 1 : -1,
        isMoving: false,
        canAttack: true,
        speed: 4000, // Movement tween duration
        moveThreshold: 150, // How far they move
        startPosition: startX
      };
      
      this.enemies.push(enemy);

      try {
        const enemySprite = this.add.sprite(enemy.x, enemy.y, enemyName);
        enemySprite.setOrigin(0.5);
        this.enemySprites.push(enemySprite);
        
        // Add health indicator above enemy (raised higher)
        const healthIndicator = this.add.sprite(enemy.x, enemy.y - 80, "indicator green");
        healthIndicator.setScale(0.5); // Smaller indicator
        this.enemyHealthIndicators.push(healthIndicator);
        
        // Add enemy movement
        this.startEnemyMovement(enemySprite, enemy, index);
        
        console.log(`💀 Enemy loaded: ${enemyName}`);
      } catch (error) {
        console.warn(`Enemy sprite not found: ${enemyName}`);
        const fallback = this.add.rectangle(enemy.x, enemy.y, 80, 120, 0xff0000);
        this.enemySprites.push(fallback as any);
        
        // Fallback health indicator (raised higher)
        const healthIndicator = this.add.rectangle(enemy.x, enemy.y - 80, 20, 8, 0x00ff00);
        this.enemyHealthIndicators.push(healthIndicator as any);
      }
    });
  }

  private startEnemyMovement(sprite: Phaser.GameObjects.Sprite, enemy: any, index: number): void {
    // Add initial delay based on index
    this.time.delayedCall(index * 1000, () => {
      this.createMovementLoop(sprite, enemy);
    });
  }

  private createMovementLoop(sprite: Phaser.GameObjects.Sprite, enemy: any): void {
    if (!sprite.active) return;

    enemy.isMoving = true;
    
    // Calculate target position within bounds (512 to 1536)
    let targetX = enemy.startPosition + (enemy.direction * enemy.moveThreshold);
    targetX = Phaser.Math.Clamp(targetX, 512, 1536);

    // Move to target
    this.tweens.add({
      targets: sprite,
      x: targetX,
      duration: enemy.speed,
      ease: 'Linear',
      onComplete: () => {
        enemy.isMoving = false;
        // Pause, then return
        this.time.delayedCall(1000, () => {
          if (sprite.active) {
            this.tweens.add({
              targets: sprite,
              x: enemy.startPosition,
              duration: enemy.speed,
              ease: 'Linear',
              onComplete: () => {
                // Change direction and repeat
                enemy.direction *= -1;
                enemy.canAttack = true;
                this.time.delayedCall(2000, () => {
                  if (sprite.active) {
                    this.createMovementLoop(sprite, enemy);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  private setupCrosshairs(): void {
    this.crosshair_red = this.add.sprite(512, 300, "crosshair_red").setScrollFactor(0);
    this.crosshair_green = this.add.sprite(512, 300, "crosshair_green").setScrollFactor(0).setVisible(false);
  }

  private setupEscapeButton(): void {
    this.escape_button = this.add.sprite(512, 25, "escape").setOrigin(0.5, 0).setScrollFactor(0).setVisible(false);
    
    // Schedule escape button to appear periodically
    this.time.addEvent({
      delay: Phaser.Math.Between(10000, 20000), // Appear every 10-20 seconds
      callback: this.showEscapeButton,
      callbackScope: this,
      loop: true
    });
  }

  private showEscapeButton(): void {
    if (!this.isDead && !this.isVictoryTriggered) {
      this.escape_button.setVisible(true);
      
      // Hide after 5 seconds if not clicked
      this.time.delayedCall(5000, () => {
        if (this.escape_button) {
          this.escape_button.setVisible(false);
        }
      });
    }
  }

  private handleEscapeButtonClick(): void {
    if (this.escape_button.visible) {
      console.log("🏃 Escaping from battle!");
      this.escape_button.setVisible(false);
      
      // Stop all sounds
      this.stopAllSounds();
      
      // Return to world map
      this.scene.start("WorldMapScene");
    }
  }

  private setupMedicalItems(): void {
    const screenWidth = 1024;
    const imageWidth = 100;
    const gap = 10;
    const startX = screenWidth / 2 - imageWidth * 2.5 - gap * 2;
    const y = 490;

    // Medical items setup
    this.first_aid_kit_grey = this.add.sprite(startX, y, "first_aid_kit grey").setOrigin(0, 0).setScrollFactor(0);
    this.jet_grey = this.add.sprite(startX + imageWidth + gap, y, "jet grey").setOrigin(0, 0).setScrollFactor(0);
    this.buffout_grey = this.add.sprite(startX + (imageWidth + gap) * 2, y, "buffout grey").setOrigin(0, 0).setScrollFactor(0);
    this.mentats_grey = this.add.sprite(startX + (imageWidth + gap) * 3, y, "mentats grey").setOrigin(0, 0).setScrollFactor(0);
    this.psycho_grey = this.add.sprite(startX + (imageWidth + gap) * 4, y, "psycho grey").setOrigin(0, 0).setScrollFactor(0);

    this.first_aid_kit = this.add.sprite(startX, y, "first_aid_kit").setOrigin(0, 0).setScrollFactor(0).setVisible(false);
    this.jet = this.add.sprite(startX + imageWidth + gap, y, "jet").setOrigin(0, 0).setScrollFactor(0).setVisible(false);
    this.buffout = this.add.sprite(startX + (imageWidth + gap) * 2, y, "buffout").setOrigin(0, 0).setScrollFactor(0).setVisible(false);
    this.mentats = this.add.sprite(startX + (imageWidth + gap) * 3, y, "mentats").setOrigin(0, 0).setScrollFactor(0).setVisible(false);
    this.psycho = this.add.sprite(startX + (imageWidth + gap) * 4, y, "psycho").setOrigin(0, 0).setScrollFactor(0).setVisible(false);
  }

  private setupAmmoDisplay(): void {
    if (this.chosenWeapon.type !== "melee") {
      try {
        this.add.sprite(25, 495, this.chosenWeapon.type).setOrigin(0, 0).setScrollFactor(0);
        const count = this.gameData.ammo[this.chosenWeapon.type] || 0;
        this.add.text(70, 500, count > 0 ? `x${count}` : "0", {
          fontSize: "22px", color: "#ffffff", fontFamily: "Arial"
        }).setScrollFactor(0);
      } catch (error) {
        console.warn("Ammo sprite not found:", this.chosenWeapon.type);
      }
    }
  }

  private setupStatsDisplay(): void {
    // Единообразные стили для всех Stats
    const textStyle = {
      fontSize: "16px",
      color: "#ffffff", 
      fontFamily: "Arial"
    };

    // Player stats - единый блок без визуальных разделений
    let yPos = 60;
    
    // Level and Health (primary stats) - используем единый стиль
    this.add.text(780, yPos, `LVL: ${this.gameData.levelCount || 1} (${this.gameData.experience || 0})`, textStyle).setScrollFactor(0);
    yPos += 20; // Уменьшили промежуток
    
    this.healthText = this.add.text(780, yPos, `HP: ${this.playerHealth}/${this.maxPlayerHealth}`, textStyle).setScrollFactor(0);
    yPos += 20; // Уменьшили промежуток
    
    // Armor stats - единый стиль, убрали большой промежуток
    this.armorStatsText = this.add.text(780, yPos, 
      `AC: ${this.chosenArmor.ac}\nDT: ${this.chosenArmor.threshold}\nDR: ${Math.round(this.chosenArmor.resistance * 100)}%`, textStyle).setScrollFactor(0);
    yPos += 65; // Уменьшили промежуток (было 70)
    
    // Weapon stats - единый стиль, убрали большой промежуток
    const critChance = this.gameData.critical_chance || 5;
    this.weaponStatsText = this.add.text(780, yPos,
      `${this.chosenWeapon.name}\nDMG: ${this.chosenWeapon.damage.min}-${this.chosenWeapon.damage.max}\nCooldown: ${this.chosenWeapon.cooldown}ms\nCrit: ${critChance}%`, textStyle).setScrollFactor(0);
    yPos += 65; // Уменьшили промежуток (было 80)
    
    // Experience - единый стиль, убрали большой промежуток
    this.add.text(780, yPos, `EXP: ${this.gameData.experience || 0}`, textStyle).setScrollFactor(0);
  }

  private updateStatsDisplay(): void {
    // Единообразный стиль для обновлений (белый текст, 16px)
    const textStyle = {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "Arial"
    };

    // Update health display
    if (this.healthText) {
      this.healthText.setStyle(textStyle);
      this.healthText.setText(`HP: ${this.playerHealth}/${this.maxPlayerHealth}`);
    }
    
    // Update armor stats (if affected by medical items)
    if (this.armorStatsText) {
      this.armorStatsText.setStyle(textStyle);
      this.armorStatsText.setText(
        `AC: ${this.chosenArmor.ac}\nDT: ${this.chosenArmor.threshold}\nDR: ${Math.round(this.chosenArmor.resistance * 100)}%`
      );
    }
    
    // Update weapon stats - единый стиль
    if (this.weaponStatsText) {
      this.weaponStatsText.setStyle(textStyle);
      const critChance = this.gameData.critical_chance || 5;
      this.weaponStatsText.setText(
        `${this.chosenWeapon.name}\nDMG: ${this.chosenWeapon.damage.min}-${this.chosenWeapon.damage.max}\nCooldown: ${this.chosenWeapon.cooldown}ms\nCrit: ${critChance}%`
      );
    }
  }

  private playRandomSoundtrack(): void {
    try {
      const randomTrack = Phaser.Math.RND.pick(this.soundtrackNames);
      if (this.cache.audio.exists(randomTrack)) {
        this.soundtrack = this.sound.add(randomTrack);
        this.soundtrack.play({ loop: true, volume: 0.3 });
      }
    } catch (error) {
      console.warn("Battle music not available");
    }
  }

  update(): void {
    // Camera movement
    const cameraSpeed = 5;
    if (this.cursors.left.isDown) {
      this.cameras.main.scrollX -= cameraSpeed;
    } else if (this.cursors.right.isDown) {
      this.cameras.main.scrollX += cameraSpeed;
    }

    // Weapon switching - UP/DOWN arrows
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.switchWeapon(1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.switchWeapon(-1);
    }

    // Alternative weapon switching - Q/E keys
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      this.switchWeapon(-1);
    } else if (Phaser.Input.Keyboard.JustDown(this.eKey) || Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      this.switchWeapon(1);
    }

    // Combat cooldown check and crosshair color
    this.updateCrosshairTargeting();

    // Combat
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performAttack();
    }

    // Medical items
    this.handleMedicalInputs();
    this.updateMedicalItemVisibility();

    // Health-based breathing sounds
    this.updateBreathingSounds();

    // Update enemy positions and attacks
    this.updateEnemies();
  }

  private updateCrosshairTargeting(): void {
    const currentTime = Date.now();
    const cooldown = this.chosenWeapon.cooldown || 1000;
    
    // Check if weapon is ready
    if (currentTime - this.lastShotTime[this.chosenWeapon.name] >= cooldown) {
      // Check if crosshair is over an enemy
      const isTargeting = this.checkCrosshairTargeting();
      if (isTargeting) {
        this.crosshair_red.setVisible(false);
        this.crosshair_green.setVisible(true);
      } else {
        this.crosshair_green.setVisible(false);
        this.crosshair_red.setVisible(true);
      }
    } else {
      // Weapon on cooldown
      this.crosshair_green.setVisible(false);
      this.crosshair_red.setVisible(true);
    }
  }

  private checkCrosshairTargeting(): boolean {
    const crosshairX = this.cameras.main.scrollX + 512;
    const crosshairY = 300;
    
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemySprites[i] && this.enemySprites[i].active) {
        const enemy = this.enemies[i];
        const distance = Phaser.Math.Distance.Between(crosshairX, crosshairY, enemy.x, enemy.y);
        if (distance < 80) { // Within targeting range
          return true;
        }
      }
    }
    return false;
  }

  private updateBreathingSounds(): void {
    const healthPercent = this.playerHealth / this.maxPlayerHealth;
    
    if (healthPercent <= 0.3 && !this.isHardBreathSoundPlaying) {
      // Critical health - hard breathing
      if (this.isBreathSoundPlaying) {
        this.breathSound.stop();
        this.isBreathSoundPlaying = false;
      }
      try {
        this.hardBreathSound.play({ loop: true, volume: 0.5 });
        this.isHardBreathSoundPlaying = true;
      } catch (error) {}
    } else if (healthPercent <= 0.6 && !this.isBreathSoundPlaying && !this.isHardBreathSoundPlaying) {
      // Low health - normal breathing
      try {
        this.breathSound.play({ loop: true, volume: 0.3 });
        this.isBreathSoundPlaying = true;
      } catch (error) {}
    } else if (healthPercent > 0.6) {
      // Good health - stop breathing sounds
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

  private updateEnemies(): void {
    // Update enemy positions and health indicators
    this.enemies.forEach((enemy, index) => {
      if (this.enemySprites[index] && this.enemySprites[index].active) {
        enemy.x = this.enemySprites[index].x;
        enemy.y = this.enemySprites[index].y;
        
        // Update health indicator position (raised higher)
        if (this.enemyHealthIndicators[index] && this.enemyHealthIndicators[index].active) {
          this.enemyHealthIndicators[index].x = enemy.x;
          this.enemyHealthIndicators[index].y = enemy.y - 80;
          
          // Update health indicator color based on health percentage
          const healthPercent = enemy.health / enemy.maxHealth;
          if (healthPercent > 0.6) {
            // Healthy - green
            this.enemyHealthIndicators[index].setTexture("indicator green");
          } else if (healthPercent > 0.3) {
            // Wounded - yellow
            this.enemyHealthIndicators[index].setTexture("indicator yellow");
          } else {
            // Severely wounded - red
            this.enemyHealthIndicators[index].setTexture("indicator red");
          }
        }
        
        // Enemy attacks
        if (enemy.canAttack && !enemy.isMoving && Math.random() < 0.01) { // 1% chance per frame
          this.enemyAttack(enemy, index);
        }
      }
    });

    // Check for victory condition
    if (this.enemies.length === 0) {
      this.victory();
    }
  }

  private enemyAttack(enemy: any, index: number): void {
    const hitChance = enemy.attack?.hit_chance || 50;
    const isHit = Math.random() * 100 < hitChance;
    
    console.log(`👹 ${enemy.name} attacks! Hit: ${isHit}`);
    
    if (isHit) {
      const damage = Math.floor(Math.random() * 10) + 5; // Simple damage
      this.playerHealth -= damage;
      console.log(`💔 Player takes ${damage} damage! HP: ${this.playerHealth}`);
      
      // Play wounded sound
      try {
        this.sound.play("player wounded", { volume: 0.6 });
      } catch (error) {}
      
      // Visual effect
      this.cameras.main.shake(200, 0.01);
      
      this.updateHealthMask();
      
      // Check death
      if (this.playerHealth <= 0) {
        this.playerDeath();
      }
    }
    
    // Play enemy attack sound
    this.playEnemySound(enemy.name, "attack");
    
    enemy.canAttack = false;
    this.time.delayedCall(3000, () => {
      enemy.canAttack = true;
    });
  }

  private playEnemySound(enemyName: string, action: string): void {
    const soundKey = `${enemyName} - ${action}`;
    try {
      if (this.cache.audio.exists(soundKey)) {
        this.sound.play(soundKey, { volume: 0.5 });
      }
    } catch (error) {
      console.log(`Enemy sound not available: ${soundKey}`);
    }
  }

  private switchWeapon(direction: number): void {
    // Find available weapons (have ammo or are melee)
    const availableWeapons = this.weapons.filter(weapon => {
      if (weapon.type === "melee") return true;
      return (this.gameData.ammo[weapon.type] || 0) > 0;
    });

    if (availableWeapons.length === 0) {
      console.log("❌ No weapons available!");
      return;
    }

    const currentIndex = availableWeapons.findIndex(w => w.name === this.chosenWeapon.name);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = availableWeapons.length - 1;
    if (newIndex >= availableWeapons.length) newIndex = 0;
    
    this.chosenWeapon = availableWeapons[newIndex];
    this.gameData.current_weapon = this.chosenWeapon.name;
    this.updateWeaponDisplay();
    this.updateStatsDisplay(); // Update weapon stats display
    
    try {
      this.sound.play("reloading", { volume: 0.5 });
    } catch (error) {
      // Fallback
    }
    
    console.log(`🔄 Switched to: ${this.chosenWeapon.name}`);
  }

  private performAttack(): void {
    const currentTime = Date.now();
    const cooldown = this.chosenWeapon.cooldown || 1000;
    
    // Check cooldown
    if (currentTime - this.lastShotTime[this.chosenWeapon.name] < cooldown) {
      console.log("⏰ Weapon on cooldown!");
      return;
    }
    
    console.log(`⚔️ Attacking with ${this.chosenWeapon.name}!`);
    
    // Check ammo for ranged weapons
    if (this.chosenWeapon.type !== "melee") {
      if (this.bullets_in_current_clip <= 0) {
        console.log("🔄 Reloading...");
        this.reload();
        return;
      }
      this.bullets_in_current_clip--;
      this.updateClipBar();
    }

    // Update last shot time
    this.lastShotTime[this.chosenWeapon.name] = currentTime;

    // Calculate damage
    const damage = Phaser.Math.Between(this.chosenWeapon.damage.min, this.chosenWeapon.damage.max);
    
    // Find target enemy
    let targetEnemy = null;
    let minDistance = Infinity;
    const crosshairX = this.cameras.main.scrollX + 512;
    const crosshairY = 300;
    
    this.enemies.forEach((enemy, index) => {
      if (this.enemySprites[index] && this.enemySprites[index].active) {
        const distance = Phaser.Math.Distance.Between(crosshairX, crosshairY, enemy.x, enemy.y);
        if (distance < minDistance && distance < 80) {
          minDistance = distance;
          targetEnemy = { enemy, sprite: this.enemySprites[index], index };
        }
      }
    });

    if (targetEnemy) {
      // Hit enemy
      targetEnemy.enemy.health -= damage;
      console.log(`💥 Hit ${targetEnemy.enemy.name} for ${damage} damage! HP: ${targetEnemy.enemy.health}`);
      
      // Visual effect
      targetEnemy.sprite.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        if (targetEnemy.sprite.active) {
          targetEnemy.sprite.clearTint();
        }
      });

      // Play hit sound
      this.playWeaponSound("hit");
      this.playEnemySound(targetEnemy.enemy.name, "wounded");

      // Check if enemy died
      if (targetEnemy.enemy.health <= 0) {
        console.log(`💀 ${targetEnemy.enemy.name} defeated!`);
        this.playEnemySound(targetEnemy.enemy.name, "died");
        
        targetEnemy.sprite.destroy();
        
        // Remove health indicator
        if (this.enemyHealthIndicators[targetEnemy.index]) {
          this.enemyHealthIndicators[targetEnemy.index].destroy();
          this.enemyHealthIndicators.splice(targetEnemy.index, 1);
        }
        
        this.enemies.splice(targetEnemy.index, 1);
        this.enemySprites.splice(targetEnemy.index, 1);
        
        // Add experience
        this.gameData.experience += 50;
      }
    } else {
      // Miss
      console.log("💨 Attack missed!");
      this.playWeaponSound("miss");
    }
  }

  private playWeaponSound(type: "hit" | "miss"): void {
    try {
      if (type === "hit") {
        const hitSound = `${this.chosenWeapon.name} - hit`;
        if (this.cache.audio.exists(hitSound)) {
          this.sound.play(hitSound, { volume: 0.7 });
        }
      } else {
        const missSound = `${this.chosenWeapon.name} - miss ${Phaser.Math.Between(1, 3)}`;
        if (this.cache.audio.exists(missSound)) {
          this.sound.play(missSound, { volume: 0.5 });
        }
      }
    } catch (error) {
      console.log(`Weapon sound not available: ${this.chosenWeapon.name} - ${type}`);
    }
  }

  private reload(): void {
    if (this.chosenWeapon.type === "melee") return;
    
    const ammoType = this.chosenWeapon.type;
    const availableAmmo = this.gameData.ammo[ammoType] || 0;
    
    if (availableAmmo > 0) {
      const ammoNeeded = this.chosenWeapon.clip;
      const ammoToLoad = Math.min(availableAmmo, ammoNeeded);
      
      this.bullets_in_current_clip = ammoToLoad;
      this.gameData.ammo[ammoType] -= ammoToLoad;
      
      console.log(`🔄 Reloaded ${ammoToLoad} rounds`);
      
      try {
        this.sound.play("reloading", { volume: 0.6 });
      } catch (error) {}
      
      this.updateAmmoDisplay();
    } else {
      console.log("❌ No ammo available!");
    }
  }

  private victory(): void {
    if (this.isVictoryTriggered) return; // Prevent multiple victory calls
    this.isVictoryTriggered = true;
    
    console.log("🎉 Victory! All enemies defeated!");
    
    // FORCEFULLY stop all sounds before transitioning
    this.sound.stopAll();
    
    // Stop and destroy all individual sounds
    if (this.soundtrack) {
      this.soundtrack.stop();
      this.soundtrack.destroy();
      this.soundtrack = null;
    }
    if (this.isBreathSoundPlaying && this.breathSound) {
      this.breathSound.stop();
      this.breathSound.destroy();
      this.isBreathSoundPlaying = false;
    }
    if (this.isHardBreathSoundPlaying && this.hardBreathSound) {
      this.hardBreathSound.stop();
      this.hardBreathSound.destroy();
      this.isHardBreathSoundPlaying = false;
    }
    
    // Play victory sound ONCE
    try {
      const victorySound = this.sound.add("victory_sound");
      victorySound.play({ volume: 0.8 });
    } catch (error) {
      console.log("Victory sound not available");
    }
    
    // Clear screen for victory display
    try {
      this.add.image(512, 300, "victory_bg").setScrollFactor(0);
    } catch (error) {
      // Fallback background
      this.add.rectangle(512, 300, 1024, 600, 0x001100).setScrollFactor(0);
    }
    
    // Victory title
    this.add.text(512, 80, 'VICTORY!', {
      fontSize: '48px',
      color: '#00ff00'
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Experience gained
    const expGained = 150; // Fixed amount per victory
    this.gameData.experience += expGained;
    this.add.text(512, 140, `Experience Gained: +${expGained}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Loot section
    this.add.text(512, 200, 'LOOT FOUND:', {
      fontSize: '28px',
      color: '#ffff00'
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Use pre-calculated STABLE loot
    if (!this.victoryLoot) {
      console.error("No victory loot generated!");
      return;
    }
    
    // Display loot with weapon icons
    let lootY = 260;
    
    // Weapon loot
    try {
      this.add.image(400, lootY, "weapon " + this.victoryLoot.weapon).setScrollFactor(0).setScale(0.8);
    } catch (error) {
      // Fallback icon
      this.add.rectangle(400, lootY, 40, 40, 0x888888).setScrollFactor(0);
    }
    this.add.text(450, lootY, `${this.victoryLoot.weapon}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0, 0.5).setScrollFactor(0);
    
    lootY += 40;
    
    // Ammo loot
    try {
      this.add.image(400, lootY, this.victoryLoot.ammoType).setScrollFactor(0);
    } catch (error) {
      // Fallback icon
      this.add.rectangle(400, lootY, 30, 30, 0x666666).setScrollFactor(0);
    }
    this.add.text(450, lootY, `${this.victoryLoot.ammoAmount} rounds`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0, 0.5).setScrollFactor(0);
    
    lootY += 40;
    
    // Medical item loot
    try {
      this.add.image(400, lootY, this.victoryLoot.medical).setScrollFactor(0).setScale(0.6);
    } catch (error) {
      this.add.rectangle(400, lootY, 25, 25, 0x00aa00).setScrollFactor(0);
    }
    this.add.text(450, lootY, `${this.victoryLoot.medAmount}x ${this.victoryLoot.medical.replace('_', ' ')}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0, 0.5).setScrollFactor(0);
    
    // Add loot to inventory
    if (!this.gameData.weapons.includes(this.victoryLoot.weapon)) {
      this.gameData.weapons.push(this.victoryLoot.weapon);
    }
    this.gameData.ammo[this.victoryLoot.ammoType] = (this.gameData.ammo[this.victoryLoot.ammoType] || 0) + this.victoryLoot.ammoAmount;
    this.gameData.med[this.victoryLoot.medical] = (this.gameData.med[this.victoryLoot.medical] || 0) + this.victoryLoot.medAmount;    // Continue prompt
    this.add.text(512, 450, 'Press SPACE to continue traveling', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Input handling
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('WorldMapScene');
    });
    
    // Auto continue after delay
    this.time.delayedCall(10000, () => {
      if (this.scene.isActive()) {
        this.scene.start('WorldMapScene');
      }
    });
  }

  private playerDeath(): void {
    if (this.isDead) return; // Prevent multiple death calls
    this.isDead = true;
    
    console.log("💀 Player died!");
    
    // FORCEFULLY stop all sounds immediately
    this.sound.stopAll();
    
    // Additional forced stop and destroy for persistent breathing sounds
    if (this.soundtrack) {
      this.soundtrack.stop();
      this.soundtrack.destroy();
      this.soundtrack = null;
    }
    if (this.isBreathSoundPlaying && this.breathSound) {
      this.breathSound.stop();
      this.breathSound.destroy();
      this.isBreathSoundPlaying = false;
    }
    if (this.isHardBreathSoundPlaying && this.hardBreathSound) {
      this.hardBreathSound.stop();
      this.hardBreathSound.destroy();
      this.isHardBreathSoundPlaying = false;
    }
    
    // Clear the screen with death background
    this.add.rectangle(512, 300, 1024, 600, 0x000000).setScrollFactor(0);
    
    // Add death image if available
    try {
      this.add.image(512, 300, "death 1").setScrollFactor(0);
    } catch (error) {
      // Fallback to text
      this.add.text(512, 250, 'YOU DIED', {
        fontSize: '48px',
        color: '#ff0000'
      }).setOrigin(0.5).setScrollFactor(0);
      
      this.add.text(512, 320, 'Press ESC to return to main menu', {
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0);
    }
    
    // Allow manual return to menu
    this.input.keyboard!.once('keydown-ESC', () => {
      this.bridge.getGameData().health = 30; // Reset health
      this.scene.start('MainMenuScene');
    });
    
    // Auto return after delay
    this.time.delayedCall(5000, () => {
      if (this.scene.isActive()) {
        this.bridge.getGameData().health = 30; // Reset health
        this.scene.start('MainMenuScene');
      }
    });
  }

  private handleMedicalInputs(): void {
    if (Phaser.Input.Keyboard.JustDown(this.medical_keys.first_aid_kit)) {
      this.useMedicalItem('first_aid_kit', 25);
    }
    if (Phaser.Input.Keyboard.JustDown(this.medical_keys.jet)) {
      this.useMedicalItem('jet', 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.medical_keys.buffout)) {
      this.useMedicalItem('buffout', 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.medical_keys.mentats)) {
      this.useMedicalItem('mentats', 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.medical_keys.psycho)) {
      this.useMedicalItem('psycho', 0);
    }
  }

  private useMedicalItem(itemName: string, healAmount: number): void {
    if (this.gameData.med[itemName] > 0) {
      this.gameData.med[itemName]--;
      console.log(`💊 Used ${itemName}`);
      
      // Play medical sound effect
      try {
        this.sound.play("sip pill", { volume: 0.3 });
      } catch (error) {
        console.warn("Could not play medical sound");
      }
      
      // Apply medical effects
      switch (itemName) {
        case 'first_aid_kit':
          // Heal health
          if (this.playerHealth < this.maxPlayerHealth) {
            this.playerHealth = Math.min(this.maxPlayerHealth, this.playerHealth + healAmount);
            this.updateHealthMask();
            this.updateStatsDisplay(); // Update displayed health
          }
          break;
          
        case 'jet':
          // Increase critical chance temporarily
          this.gameData.critical_chance = (this.gameData.critical_chance || 5) + 10;
          console.log(`🎯 Critical chance increased to ${this.gameData.critical_chance}%`);
          this.updateStatsDisplay(); // Update displayed crit chance
          break;
          
        case 'buffout':
          // Increase damage resistance temporarily
          if (this.chosenArmor) {
            this.chosenArmor.resistance = Math.min(0.9, this.chosenArmor.resistance + 0.2);
            console.log(`🛡️ Damage resistance increased to ${Math.round(this.chosenArmor.resistance * 100)}%`);
            this.updateStatsDisplay(); // Update displayed DR
          }
          break;
          
        case 'mentats':
          // Increase critical chance (different from jet)
          this.gameData.critical_chance = (this.gameData.critical_chance || 5) + 5;
          console.log(`🧠 Critical chance increased to ${this.gameData.critical_chance}%`);
          this.updateStatsDisplay(); // Update displayed crit chance
          break;
          
        case 'psycho':
          // Increase weapon damage temporarily
          this.chosenWeapon.damage.min += 5;
          this.chosenWeapon.damage.max += 5;
          console.log(`💀 Weapon damage increased: ${this.chosenWeapon.damage.min}-${this.chosenWeapon.damage.max}`);
          this.updateStatsDisplay(); // Update displayed weapon damage
          break;
      }
    }
  }

  private updateMedicalItemVisibility(): void {
    const medData = this.gameData.med;
    
    this.updateItemVisibility(medData.first_aid_kit, this.first_aid_kit, this.first_aid_kit_grey);
    this.updateItemVisibility(medData.jet, this.jet, this.jet_grey);
    this.updateItemVisibility(medData.buffout, this.buffout, this.buffout_grey);
    this.updateItemVisibility(medData.mentats, this.mentats, this.mentats_grey);
    this.updateItemVisibility(medData.psycho, this.psycho, this.psycho_grey);
  }

  private updateItemVisibility(count: number, item: Phaser.GameObjects.Sprite, itemGrey: Phaser.GameObjects.Sprite): void {
    if (count > 0) {
      item.setVisible(true);
      itemGrey.setVisible(false);
    } else {
      item.setVisible(false);
      itemGrey.setVisible(true);
    }
  }

  private updateHealthMask(): void {
    if (this.healthMask && this.playerArmor) {
      this.healthMask.clear();
      this.healthMask.fillStyle(0xffffff);
      this.healthMask.beginPath();
      this.healthMask.fillRect(
        -this.playerArmor.width / 2,
        -this.playerArmor.height / 2,
        this.playerArmor.width,
        this.playerArmor.height * (this.playerHealth / this.maxPlayerHealth)
      );
      this.healthMask.closePath();
      this.healthMask.fillPath();
    }
  }

  private generateVictoryLoot(): void {
    // Generate STABLE loot based on current game state (won't change on re-render)
    const seed = this.gameData.experience + this.gameData.levelCount * 13 + this.enemies.length * 7;
    Phaser.Math.RND.sow([seed]);
    
    const weaponLoot = ['9mm pistol', 'Combat shotgun', 'Laser pistol', '44 Magnum revolver'];
    const ammoTypes = ['mm_9', 'mm_12', 'energy_cell', 'magnum_44'];
    const medicalItems = ['first_aid_kit', 'jet', 'buffout'];
    
    this.victoryLoot = {
      weapon: Phaser.Math.RND.pick(weaponLoot),
      ammoType: Phaser.Math.RND.pick(ammoTypes),
      ammoAmount: Phaser.Math.Between(30, 80),
      medical: Phaser.Math.RND.pick(medicalItems),
      medAmount: Phaser.Math.Between(1, 3)
    };
    
    console.log("Pre-generated victory loot:", this.victoryLoot);
  }
}
