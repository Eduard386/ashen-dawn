// Note: Phaser is loaded globally via CDN in index.html
import { LegacyBridge } from '../core/bridges/LegacyBridge.js';

/**
 * Modern TypeScript VictoryScene - Post-battle loot and rewards
 * Handles experience gain, loot distribution, and armor upgrades
 */
export class VictoryScene extends Phaser.Scene {
  private bridge!: LegacyBridge;
  
  // Audio
  private victoryMusic?: Phaser.Sound.BaseSound;
  
  // UI Elements
  private background?: Phaser.GameObjects.Image;
  private lootText?: Phaser.GameObjects.Text;
  private experienceText?: Phaser.GameObjects.Text;
  private continueText?: Phaser.GameObjects.Text;
  
  // Input
  private spaceKey?: Phaser.Input.Keyboard.Key;
  
  // Loot configuration
  private readonly lootActions = {
    0: { ammoType: 'melee', amount: 0 },
    1: { ammoType: 'energy_cell', amount: () => Phaser.Math.Between(2, 6) },
    2: { ammoType: 'mm_9', amount: () => Phaser.Math.Between(4, 8) },
    3: { ammoType: 'magnum_44', amount: () => Phaser.Math.Between(2, 6) },
    4: { ammoType: 'frag_grenade', amount: () => Phaser.Math.Between(3, 5) },
    5: { ammoType: 'magnum_44', amount: () => Phaser.Math.Between(2, 6) },
    6: { ammoType: 'energy_cell', amount: () => Phaser.Math.Between(2, 6) },
    7: { ammoType: 'mm_12', amount: () => Phaser.Math.Between(6, 12) },
    8: { ammoType: 'mm_9', amount: () => Phaser.Math.Between(10, 30) },
    9: { ammoType: 'mm_5_45', amount: () => Phaser.Math.Between(80, 160) }
  };
  
  private readonly armors = [
    'Leather Jacket',
    'Leather Armor', 
    'Metal Armor',
    'Combat Armor',
    'Power Armor'
  ];
  
  private readonly medicalItems = [
    'first_aid_kit',
    'jet',
    'buffout',
    'mentats',
    'psycho'
  ];

  constructor() {
    super({ key: 'VictoryScene' });
  }

  preload(): void {
    // Load victory assets (matching BattleScene naming)
    // Always load to ensure availability
    console.log('📦 VictoryScene preload started...');
    this.load.image('victory_bg', 'assets/images/victory/victory.png');
    
    if (!this.cache.audio.exists('victory_sound')) {
      this.load.audio('victory_sound', 'assets/sounds/victory/victory.wav');
    }

    // Load ammo icons
    this.load.image('mm_9', 'assets/images/ammo_small/mm_9.png');
    this.load.image('mm_12', 'assets/images/ammo_small/mm_12.png');
    this.load.image('magnum_44', 'assets/images/ammo_small/magnum_44.png');
    this.load.image('mm_5_45', 'assets/images/ammo_small/mm_5_45.png');
    this.load.image('frag_grenade', 'assets/images/ammo_small/frag_grenade.png');
    this.load.image('energy_cell', 'assets/images/ammo_small/energy_cell.png');

    // Load armor icons
    this.armors.forEach((armor) => {
      this.load.image(armor, `assets/images/armors/${armor}.png`);
    });

    // Load medical item icons
    this.medicalItems.forEach((med) => {
      this.load.image(med, `assets/images/medcine/colored/${med}.png`);
    });
  }

  create(): void {
    console.log('🏆 Modern VictoryScene initialized with TypeScript services');
    
    // FORCEFULLY stop all sounds from previous scenes
    this.sound.stopAll();
    
    // Additional forced stop for specific breathing sounds that might persist
    try {
      const breathSound = this.sound.get('breath');
      const hardBreathSound = this.sound.get('hard_breath');
      if (breathSound) breathSound.stop();
      if (hardBreathSound) hardBreathSound.stop();
      
      // Stop enemy death sounds that might be playing
      const enemyDeathSounds = [
        'Mantis - died', 'Cannibal man 1 - died', 'Cannibal man 2 - died', 
        'Cannibal man 3 - died', 'Cannibal woman 1 - died', 'Cannibal woman 2 - died'
      ];
      enemyDeathSounds.forEach(soundKey => {
        try {
          const sound = this.sound.get(soundKey);
          if (sound) sound.stop();
        } catch (e) {
          // Ignore if sound doesn't exist
        }
      });
    } catch (error) {
      // Ignore if sounds don't exist
    }
    
    // Initialize bridge
    this.bridge = LegacyBridge.getInstance();
    if (!this.bridge.isInitialized()) {
      this.bridge.initialize();
    }

    // Create background
    this.createBackground();
    
    // Play victory music
    this.playVictoryMusic();
    
    // Process loot and rewards
    this.processLootAndRewards();
    
    // Setup input
    this.setupInput();
  }

  update(): void {
    // Handle space key to continue
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.continueTraveling();
    }
  }

  private createBackground(): void {
    console.log('🖼️ Attempting to create victory background...');
    
    // Check if texture exists
    if (!this.textures.exists('victory_bg')) {
      console.warn('❌ victory_bg texture not found, creating fallback');
      this.createFallbackBackground();
      return;
    }
    
    try {
      console.log('✅ victory_bg texture found, creating image...');
      this.background = this.add.image(0, 0, 'victory_bg') // Fixed to match preload
        .setOrigin(0, 0)
        .setScrollFactor(0);
      console.log('🏆 Victory background loaded successfully');
    } catch (error) {
      console.warn('❌ Victory background failed to load, using fallback:', error);
      this.createFallbackBackground();
    }
  }

  private createFallbackBackground(): void {
    // Fallback if background fails to load
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2a4a3a);
    graphics.fillRect(0, 0, 1024, 600);
    
    // Add victory text
    this.add.text(512, 100, 'VICTORY!', {
      fontSize: '72px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private playVictoryMusic(): void {
    // Add small delay to ensure previous sounds are stopped
    this.time.delayedCall(200, () => {
      try {
        this.victoryMusic = this.sound.add('victory_sound'); // Fixed to match preload
        this.victoryMusic.play({ loop: true, volume: 0.5 }); // Added loop and volume
        console.log('🎵 Victory music started playing');
      } catch (error) {
        console.warn('Victory music failed to load:', error);
      }
    });
  }

  private processLootAndRewards(): void {
    const services = this.bridge.getServices();
    const gameState = services.gameState;
    
    // Get battle results from game state
    const battleData = this.getBattleResults();
    
    // Process experience gain
    this.processExperienceGain(battleData.experienceGained);
    
    // Process loot from defeated enemies
    const lootInfo = this.processLoot(battleData.enemyLoot);
    
    // Process armor upgrades
    this.processArmorUpgrade(battleData.armorLoot);
    
    // Display results
    this.displayResults(lootInfo, battleData.experienceGained);
    
    // Clear battle data
    this.clearBattleData();
  }

  private getBattleResults(): any {
    // This would normally come from battle scene data
    // For now, simulate some loot based on player level
    const services = this.bridge.getServices();
    const playerLevel = this.bridge.getPlayerLevel();
    
    // Generate random loot based on level
    const enemyCount = Phaser.Math.Between(1, 4);
    const experienceGained = enemyCount * 50; // 50 XP per enemy
    
    // Generate weapon loot
    const enemyLoot = [];
    for (let i = 0; i < enemyCount; i++) {
      const weaponIndex = Phaser.Math.Between(0, 9);
      enemyLoot.push(weaponIndex);
    }
    
    // Chance for armor upgrade
    const armorLoot = Phaser.Math.Between(1, 100) <= 20 ? 
      this.armors[Phaser.Math.Between(0, this.armors.length - 1)] : null;
    
    return {
      experienceGained,
      enemyLoot,
      armorLoot
    };
  }

  private processExperienceGain(experienceGained: number): void {
    const services = this.bridge.getServices();
    const player = services.gameState.getPlayer();
    
    if (!player) return;
    
    // Add experience
    player.experience += experienceGained;
    
    // Check for level up (every 1000 XP)
    const newLevel = Math.floor(player.experience / 1000) + 1;
    if (newLevel > player.levelCount) {
      player.levelCount = newLevel;
      player.maxHealth += 10; // +10 max health per level
      player.health = player.maxHealth; // Heal to full on level up
      
      console.log(`🆙 Level up! Now level ${newLevel}`);
    }
    
    // Save the updated player data
    services.gameState.saveGame();
  }

  private processLoot(enemyLoot: number[]): Record<string, number> {
    const services = this.bridge.getServices();
    const player = services.gameState.getPlayer();
    
    if (!player || !player.inventory) return {};
    
    const lootInfo: Record<string, number> = {};
    
    enemyLoot.forEach((weaponIndex) => {
      if (weaponIndex !== 0) { // Skip melee weapons (no ammo)
        const action = this.lootActions[weaponIndex as keyof typeof this.lootActions];
        if (action && action.ammoType !== 'melee') {
          const amount = typeof action.amount === 'function' ? action.amount() : action.amount;
          const ammoType = action.ammoType as keyof typeof player.inventory.ammo;
          
          // Add ammo to inventory
          if (player.inventory.ammo[ammoType] !== undefined) {
            player.inventory.ammo[ammoType] += amount;
            lootInfo[ammoType] = (lootInfo[ammoType] || 0) + amount;
          }
        }
      }
      
      // 25% chance for medical loot per enemy
      const medChance = Phaser.Math.Between(1, 100);
      if (medChance <= 25) {
        const medIndex = Phaser.Math.Between(0, this.medicalItems.length - 1);
        const medName = this.medicalItems[medIndex] as keyof typeof player.inventory.med;
        
        if (player.inventory.med[medName] !== undefined) {
          player.inventory.med[medName] += 1;
          lootInfo[medName] = (lootInfo[medName] || 0) + 1;
        }
      }
    });
    
    return lootInfo;
  }

  private processArmorUpgrade(armorLoot: string | null): void {
    if (!armorLoot) return;
    
    const services = this.bridge.getServices();
    const player = services.gameState.getPlayer();
    
    if (!player) return;
    
    const currentArmorIndex = this.armors.indexOf(player.currentArmor);
    const lootArmorIndex = this.armors.indexOf(armorLoot);
    
    // Only upgrade if new armor is better
    if (lootArmorIndex > currentArmorIndex) {
      player.currentArmor = armorLoot;
      console.log(`🛡️ Armor upgraded to ${armorLoot}`);
    }
  }

  private displayResults(lootInfo: Record<string, number>, experienceGained: number): void {
    // Title text
    this.lootText = this.add.text(512, 140, 'Victory Rewards', {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Experience gained
    this.experienceText = this.add.text(512, 200, `Experience Gained: +${experienceGained}`, {
      fontSize: '24px',
      color: '#00aa00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Display loot items
    this.displayLootItems(lootInfo);

    // Continue instruction
    this.continueText = this.add.text(512, 550, 'Press SPACE to continue traveling', {
      fontSize: '18px',
      color: '#333333',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private displayLootItems(lootInfo: Record<string, number>): void {
    const lootKeys = Object.keys(lootInfo);
    if (lootKeys.length === 0) {
      this.add.text(512, 350, 'No items found', {
        fontSize: '20px',
        color: '#666666',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      return;
    }

    // Horizontal layout configuration
    const itemSize = 64; // Fixed size for all items (width and height)
    const gap = 20; // Gap between items
    const startY = 280; // Y position for items
    
    // Calculate total width and starting X position
    const totalWidth = lootKeys.length * itemSize + (lootKeys.length - 1) * gap;
    const startX = 512 - totalWidth / 2;
    
    // Display each looted item horizontally
    lootKeys.forEach((item, index) => {
      const itemX = startX + index * (itemSize + gap);
      
      try {
        // Draw item sprite with fixed size
        const itemSprite = this.add.sprite(itemX + itemSize / 2, startY + itemSize / 2, item)
          .setOrigin(0.5, 0.5)
          .setScrollFactor(0)
          .setDisplaySize(itemSize, itemSize); // Fixed size for consistency

        // Draw quantity if > 1 (top-right corner)
        if (lootInfo[item] > 1) {
          this.add.text(itemX + itemSize - 5, startY - 5, `x${lootInfo[item]}`, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 3, y: 1 }
          }).setOrigin(1, 0);
        }

        // Item title below the item, centered
        this.add.text(itemX + itemSize / 2, startY + itemSize + 8, item, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'Arial',
          align: 'center',
          wordWrap: { width: itemSize + 10 }
        }).setOrigin(0.5, 0);

      } catch (error) {
        // Fallback rectangle if sprite fails
        const graphics = this.add.graphics();
        graphics.fillStyle(0x666666);
        graphics.fillRect(itemX, startY, itemSize, itemSize);
        
        // Fallback text
        this.add.text(itemX + itemSize / 2, startY + itemSize / 2, item, {
          fontSize: '10px',
          color: '#ffffff',
          fontFamily: 'Arial',
          align: 'center',
          wordWrap: { width: itemSize - 10 }
        }).setOrigin(0.5, 0.5);

        // Title below fallback
        this.add.text(itemX + itemSize / 2, startY + itemSize + 8, `${item}: ${lootInfo[item]}`, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'Arial',
          align: 'center'
        }).setOrigin(0.5, 0);
      }
    });
  }

  private setupInput(): void {
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private continueTraveling(): void {
    console.log('🗺️ Returning to world map');
    
    // Stop victory music
    if (this.victoryMusic) {
      this.victoryMusic.stop();
    }
    
    // Transition back to world map
    this.scene.start('WorldMapScene');
  }

  private clearBattleData(): void {
    // Clear any temporary battle data
    const services = this.bridge.getServices();
    services.gameState.clearEncounterData();
  }

  /**
   * Process victory with specific battle data (called from BattleScene)
   */
  public processVictory(battleResults: {
    experienceGained: number;
    enemyLoot: number[];
    armorLoot?: string;
  }): void {
    // Store battle results for processing
    (this as any).battleResults = battleResults;
  }
}
