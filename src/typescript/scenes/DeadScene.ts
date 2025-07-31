// Note: Phaser is loaded globally via CDN in index.html
import { GameDataService } from '../core/services/GameDataService.js';

/**
 * Modern TypeScript DeadScene - Game over screen
 * Handles player death, score display, and game restart
 * Now using pure TypeScript GameDataService instead of LegacyBridge
 */
export class DeadScene extends Phaser.Scene {
  private gameDataService!: GameDataService;
  
  // Audio
  private deathMusic?: Phaser.Sound.BaseSound;
  
  // UI Elements
  private background?: Phaser.GameObjects.Image;
  private gameOverText?: Phaser.GameObjects.Text;
  private statsText?: Phaser.GameObjects.Text;
  private restartText?: Phaser.GameObjects.Text;
  
  // Input
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'DeadScene' });
  }

  preload(): void {
    // Load death assets
    this.load.image('death_background', 'assets/images/death/death 1.png');
    this.load.audio('death_music', 'assets/sounds/death/death.wav');
  }

  create(data?: { cause?: string; finalStats?: any }): void {
    console.log('💀 Modern DeadScene initialized - Game Over', data);
    
    // FORCEFULLY stop ALL sounds from previous scenes including breathing sounds
    this.sound.stopAll();
    
    // Additional forced stop for specific sounds that might persist
    try {
      const breathSound = this.sound.get('breath');
      const hardBreathSound = this.sound.get('hard_breath');
      if (breathSound) {
        breathSound.stop();
        breathSound.destroy();
      }
      if (hardBreathSound) {
        hardBreathSound.stop();
        hardBreathSound.destroy();
      }
    } catch (error) {
      // Ignore if sounds don't exist
    }
    
    // Stop all sounds from previous scenes (breathing, battle sounds, etc.)
    this.sound.stopAll();
    
    // Initialize GameDataService
    this.gameDataService = GameDataService.getInstance();
    this.gameDataService.init();

    // Store death data
    if (data) {
      (this as any).deathData = data;
    }

    // Create background
    this.createBackground();
    
    // Play death music
    this.playDeathMusic();
    
    // Display game over information
    this.displayGameOverInfo();
    
    // Setup input
    this.setupInput();
    
    // Process game over (reset progress)
    this.processGameOver();
  }

  update(): void {
    // Handle restart inputs
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.restartGame();
    }
    
    if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.restartGame();
    }
  }

  private createBackground(): void {
    try {
      this.background = this.add.image(0, 0, 'death_background').setOrigin(0, 0);
    } catch (error) {
      // Fallback if background fails to load
      console.warn('Death background failed to load, using fallback');
      const graphics = this.add.graphics();
      graphics.fillStyle(0x330000);
      graphics.fillRect(0, 0, 1024, 600);
      
      // Add skull symbol as fallback
      this.add.text(512, 150, '💀', {
        fontSize: '120px',
        color: '#ffffff'
      }).setOrigin(0.5);
    }
  }

  private playDeathMusic(): void {
    try {
      this.deathMusic = this.sound.add('death_music');
      this.deathMusic.play();
    } catch (error) {
      console.warn('Death music failed to load');
    }
  }

  private displayGameOverInfo(): void {
    const gameData = this.gameDataService.get();
    
    // Main game over text
    this.gameOverText = this.add.text(512, 200, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Death message
    this.add.text(512, 280, 'You have fallen in the wasteland...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Display final stats using gameData
    this.displayFinalStats(gameData);

    // Display death cause if available
    const deathData = (this as any).deathData;
    if (deathData && deathData.cause) {
      this.displayCauseOfDeath(deathData.cause);
    }

    // Instructions for restart
    this.add.text(512, 500, 'Press SPACE to restart the game', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
  }

  private displayFinalStats(gameData: any): void {
    const statsX = 512;
    const statsY = 350;

    // Create stats background
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.8);
    graphics.fillRoundedRect(statsX - 200, statsY - 50, 400, 120, 10);
    
    // Border
    graphics.lineStyle(2, 0xff0000, 0.8);
    graphics.strokeRoundedRect(statsX - 200, statsY - 50, 400, 120, 10);

    // Final Stats
    this.add.text(statsX, statsY - 30, 'Final Statistics', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(statsX, statsY, `Level Reached: ${gameData.levelCount}`, {
      fontSize: '16px',
      color: '#ffaa00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(statsX, statsY + 20, `Experience Gained: ${gameData.experience}`, {
      fontSize: '16px',
      color: '#ffaa00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(statsX, statsY + 40, `Best Weapon: ${gameData.current_weapon}`, {
      fontSize: '16px',
      color: '#ffaa00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  private setupInput(): void {
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  private processGameOver(): void {
    console.log('💀 Processing game over - resetting progress');
    
    // Reset game to default state
    this.gameDataService.reset();
    this.gameDataService.save();
  }

  private restartGame(): void {
    console.log('🔄 Restarting game - returning to main menu');
    
    // Stop death music
    if (this.deathMusic) {
      this.deathMusic.stop();
    }
    
    // Stop all sounds to prevent any overlap
    this.sound.stopAll();
    
    // Return to main menu (game is already reset)
    this.scene.start('MainMenu');
  }

  /**
   * Initialize death scene with specific death data
   */
  public initializeDeathScene(deathData?: {
    cause: string;
    finalStats: any;
  }): void {
    if (deathData) {
      (this as any).deathData = deathData;
    }
  }

  /**
   * Display cause of death if provided
   */
  private displayCauseOfDeath(cause: string): void {
    this.add.text(512, 320, `Cause: ${cause}`, {
      fontSize: '18px',
      color: '#ff6666',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
  }
}
