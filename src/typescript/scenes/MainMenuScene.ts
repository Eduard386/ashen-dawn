import * as Phaser from 'phaser';
import { LegacyBridge } from '../core/bridges/LegacyBridge';

/**
 * Modern TypeScript MainMenuScene - Game entry point
 * Handles game initialization, level display, and world map transition
 */
export class MainMenuScene extends Phaser.Scene {
  private bridge!: LegacyBridge;
  
  // UI Elements
  private background?: Phaser.GameObjects.Image;
  private startButton?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  
  // Input
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'ModernMainMenuScene' });
  }

  preload(): void {
    // Load menu background
    this.load.image('background_menu', 'assets/images/backgrounds/menu/menu.png');
  }

  create(): void {
    console.log('🎮 Modern MainMenuScene initialized with TypeScript services');
    
    // Initialize bridge and game data
    this.bridge = LegacyBridge.getInstance();
    if (!this.bridge.isInitialized()) {
      this.bridge.initialize();
    }

    // Create background
    this.createBackground();
    
    // Create UI elements
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Update display with current player data
    this.updateDisplay();
  }

  update(): void {
    // Update level display in real-time
    this.updateDisplay();
    
    // Handle keyboard input
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startGame();
    }
    
    if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.startGame();
    }
  }

  private createBackground(): void {
    try {
      this.background = this.add.image(0, 0, 'background_menu').setOrigin(0, 0);
    } catch (error) {
      // Fallback if background fails to load
      console.warn('Menu background failed to load, using fallback');
      const graphics = this.add.graphics();
      graphics.fillStyle(0x1a1a1a);
      graphics.fillRect(0, 0, 1024, 600);
      
      // Add title text as fallback
      this.add.text(512, 100, 'ASHEN DAWN', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      this.add.text(512, 160, 'Post-Apocalyptic Survival RPG', {
        fontSize: '18px',
        color: '#cccccc',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    }
  }

  private createUI(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Main start button
    this.startButton = this.add.text(centerX, centerY, 'New Game', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.startGame())
      .on('pointerover', () => this.onButtonHover())
      .on('pointerout', () => this.onButtonOut());

    // Level display
    this.levelText = this.add.text(100, 100, 'Level: 1', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 15, y: 8 }
    });

    // Player stats display
    this.createStatsDisplay();

    // Instructions
    this.instructionText = this.add.text(centerX, centerY + 80, 
      'Press SPACE or ENTER to start\nClick "New Game" to begin', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'monospace',
      align: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // Game controls info
    this.add.text(20, 500, 
      'Controls: Arrow Keys (Move/Aim) | Space (Fire) | Z/X/C/V/B (Medical Items) | Shift (Escape)', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace',
      wordWrap: { width: 980 }
    });
  }

  private createStatsDisplay(): void {
    const services = this.bridge.getServices();
    const player = services.gameState.getPlayer();
    
    if (!player) return;

    const statsX = 100;
    const statsY = 180;

    // Health display
    this.add.text(statsX, statsY, `Health: ${player.health}/${player.maxHealth}`, {
      fontSize: '18px',
      color: player.health > player.maxHealth * 0.5 ? '#00ff00' : 
             player.health > player.maxHealth * 0.25 ? '#ffff00' : '#ff0000',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });

    // Experience display
    this.add.text(statsX, statsY + 30, `Experience: ${player.experience}`, {
      fontSize: '18px',
      color: '#00aaff',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });

    // Current weapon
    this.add.text(statsX, statsY + 60, `Weapon: ${player.currentWeapon}`, {
      fontSize: '16px',
      color: '#ffaa00',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });

    // Current armor
    this.add.text(statsX, statsY + 85, `Armor: ${player.currentArmor}`, {
      fontSize: '16px',
      color: '#ffaa00',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });

    // Quick inventory summary
    this.createInventorySummary(statsX, statsY + 120);
  }

  private createInventorySummary(x: number, y: number): void {
    const services = this.bridge.getServices();
    const player = services.gameState.getPlayer();
    
    if (!player || !player.inventory) return;

    this.add.text(x, y, 'Medical Items:', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 8, y: 3 }
    });

    const medItems = [
      { name: 'First Aid', count: player.inventory.med.first_aid_kit },
      { name: 'Jet', count: player.inventory.med.jet },
      { name: 'Buffout', count: player.inventory.med.buffout },
      { name: 'Mentats', count: player.inventory.med.mentats },
      { name: 'Psycho', count: player.inventory.med.psycho }
    ];

    medItems.forEach((item, index) => {
      const itemY = y + 25 + (index * 18);
      this.add.text(x + 20, itemY, `${item.name}: ${item.count}`, {
        fontSize: '12px',
        color: item.count > 0 ? '#00ff00' : '#666666',
        fontFamily: 'monospace'
      });
    });
  }

  private setupInput(): void {
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  private updateDisplay(): void {
    const playerLevel = this.bridge.getPlayerLevel();
    
    if (this.levelText) {
      this.levelText.setText(`Level: ${playerLevel}`);
    }
  }

  private onButtonHover(): void {
    if (this.startButton) {
      this.startButton.setStyle({
        fontSize: '34px',
        color: '#00ffaa',
        backgroundColor: 'rgba(0,100,0,0.7)'
      });
    }
  }

  private onButtonOut(): void {
    if (this.startButton) {
      this.startButton.setStyle({
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: 'rgba(0,0,0,0.5)'
      });
    }
  }

  private startGame(): void {
    console.log('🚀 Starting game - transitioning to WorldMapScene');
    
    // Ensure game is properly initialized
    const services = this.bridge.getServices();
    services.gameState.saveGame(); // Save current state
    
    // Transition to world map
    this.scene.start('ModernWorldMapScene');
  }

  /**
   * Reset game to default state (for testing or new game)
   */
  public resetGame(): void {
    console.log('🔄 Resetting game to default state');
    
    const services = this.bridge.getServices();
    services.gameState.resetGame();
    
    // Update display
    this.updateDisplay();
    
    // Recreate stats display
    this.scene.restart();
  }

  /**
   * Load saved game state (for continue functionality)
   */
  public loadGame(): void {
    console.log('📂 Loading saved game');
    
    const services = this.bridge.getServices();
    services.gameState.loadGame();
    
    // Update display
    this.updateDisplay();
    
    // Recreate stats display
    this.scene.restart();
  }
}
