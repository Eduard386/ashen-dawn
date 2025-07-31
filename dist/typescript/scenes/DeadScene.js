// Note: Phaser is loaded globally via CDN in index.html
import { LegacyBridge } from '../core/bridges/LegacyBridge.js';
/**
 * Modern TypeScript DeadScene - Game over screen
 * Handles player death, score display, and game restart
 */
export class DeadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DeadScene' });
    }
    preload() {
        // Load death assets
        this.load.image('death_background', 'assets/images/death/death 1.png');
        this.load.audio('death_music', 'assets/sounds/death/death.wav');
    }
    create() {
        console.log('💀 Modern DeadScene initialized - Game Over');
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
        }
        catch (error) {
            // Ignore if sounds don't exist
        }
        // Stop all sounds from previous scenes (breathing, battle sounds, etc.)
        this.sound.stopAll();
        // Initialize bridge
        this.bridge = LegacyBridge.getInstance();
        if (!this.bridge.isInitialized()) {
            this.bridge.initialize();
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
    update() {
        // Handle restart inputs
        if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.restartGame();
        }
        if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.restartGame();
        }
    }
    createBackground() {
        try {
            this.background = this.add.image(0, 0, 'death_background').setOrigin(0, 0);
        }
        catch (error) {
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
    playDeathMusic() {
        try {
            this.deathMusic = this.sound.add('death_music');
            this.deathMusic.play();
        }
        catch (error) {
            console.warn('Death music failed to load');
        }
    }
    displayGameOverInfo() {
        const services = this.bridge.getServices();
        const player = services.gameState.getPlayer();
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
        // Display final stats if player exists
        if (player) {
            this.displayFinalStats(player);
        }
        // Restart instructions
        this.restartText = this.add.text(512, 520, 'Press SPACE or ENTER to return to Main Menu\nYour progress will be reset to Level 1', {
            fontSize: '18px',
            color: '#cccccc',
            fontFamily: 'monospace',
            align: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5);
    }
    displayFinalStats(player) {
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
        this.add.text(statsX, statsY, `Level Reached: ${player.levelCount}`, {
            fontSize: '16px',
            color: '#ffaa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        this.add.text(statsX, statsY + 20, `Experience Gained: ${player.experience}`, {
            fontSize: '16px',
            color: '#ffaa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        this.add.text(statsX, statsY + 40, `Best Weapon: ${player.currentWeapon}`, {
            fontSize: '16px',
            color: '#ffaa00',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
    }
    setupInput() {
        this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
    processGameOver() {
        console.log('💀 Processing game over - resetting progress');
        // Reset game to default state
        const services = this.bridge.getServices();
        services.gameState.resetGame();
        // Clear any encounter data
        services.gameState.clearEncounterData();
        // Save the reset state
        services.gameState.saveGame();
    }
    restartGame() {
        console.log('🔄 Restarting game - returning to main menu');
        // Stop death music
        if (this.deathMusic) {
            this.deathMusic.stop();
        }
        // Return to main menu (game is already reset)
        this.scene.start('MainMenu');
    }
    /**
     * Initialize death scene with specific death data
     */
    initializeDeathScene(deathData) {
        if (deathData) {
            this.deathData = deathData;
        }
    }
    /**
     * Display cause of death if provided
     */
    displayCauseOfDeath(cause) {
        this.add.text(512, 320, `Cause: ${cause}`, {
            fontSize: '18px',
            color: '#ff6666',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);
    }
}
//# sourceMappingURL=DeadScene.js.map