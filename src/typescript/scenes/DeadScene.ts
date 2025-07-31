// Note: Phaser is loaded globally via CDN in index.html
import { GameDataService } from '../core/services/GameDataService.js';
import { AssetLoaderService } from '../core/services/AssetLoaderService.js';

/**
 * Modern TypeScript DeadScene - Game over screen with legacy assets
 * Handles player death, score display, and game restart
 * Uses EXACT legacy death background and music
 */
export class DeadScene extends Phaser.Scene {
  private gameDataService!: GameDataService;
  private assetLoader!: AssetLoaderService;
  private deathMusic?: Phaser.Sound.BaseSound;
  
  constructor() {
    super({ key: 'DeadScene' });
  }

  preload(): void {
    // Try to use preloaded assets first, otherwise load them
    const deathBgKey = 'death_background';
    const deathMusicKey = 'death_music';
    
    if (!this.textures.exists(deathBgKey)) {
      this.load.image(deathBgKey, 'assets/images/death/death 1.png');
    }
    if (!this.cache.audio.exists(deathMusicKey)) {
      this.load.audio(deathMusicKey, ['assets/sounds/death/death.wav']);
    }
    
    console.log('💀 DeadScene: Loading legacy death assets');
  }

  create(): void {
    console.log('💀 DeadScene created with legacy assets');
    
    this.gameDataService = GameDataService.getInstance();
    this.assetLoader = AssetLoaderService.getInstance();
    
    // EXACT legacy death background
    try {
      this.add.image(0, 0, 'death_background').setOrigin(0, 0);
    } catch (error) {
      // Fallback if asset not available
      this.cameras.main.setBackgroundColor("#220000");
      this.add.text(512, 200, "YOU DIED", { fontSize: "64px", color: "#ff0000" }).setOrigin(0.5);
    }
    
    // EXACT legacy death music
    try {
      this.deathMusic = this.sound.add('death_music');
      this.deathMusic.play();
    } catch (error) {
      console.warn("Death music not available");
    }
    
    // EXACT legacy restart instruction (but better positioned)
    this.add.text(512, 500, "Press SPACE to restart", { 
      fontSize: "24px", 
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // EXACT legacy input handling
    this.input.keyboard!.addKey('SPACE').on('down', () => {
      // Stop death music before restart
      if (this.deathMusic) {
        this.deathMusic.stop();
      }
      
      // Reset game data (EXACT legacy behavior)
      this.gameDataService.reset();
      this.scene.start('MainMenu');
    });
  }
}
