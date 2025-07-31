// Note: Phaser is loaded globally via CDN in index.html
import { GameDataService } from '../core/services/GameDataService.js';
/**
 * Modern TypeScript MainMenuScene - Game entry point
 * Handles game initialization, level display, and world map transition
 * Now using pure TypeScript GameDataService instead of LegacyBridge
 */
export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }
    preload() {
        // Load menu background
        this.load.image('background_menu', 'assets/images/backgrounds/menu/menu.png');
    }
    create() {
        console.log('🎮 Modern MainMenuScene initialized with TypeScript services');
        // Initialize GameDataService
        this.gameDataService = GameDataService.getInstance();
        this.gameDataService.init();
        // Create background
        this.createBackground();
        // Create UI elements
        this.createUI();
        // Create stats display
        this.createStatsDisplay();
        // Setup input
        this.setupInput();
        // Update display
        this.updateUI();
    }
    createBackground() {
        // Full screen background
        this.background = this.add.image(512, 384, 'background_menu');
        this.background.setScale(1024 / this.background.width, 768 / this.background.height);
    }
    createUI() {
        // Game title
        this.add.text(512, 150, 'ASHEN DAWN', {
            fontSize: '72px',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        // Subtitle
        this.add.text(512, 220, 'A Post-Nuclear Adventure', {
            fontSize: '24px',
            color: '#cccccc',
            fontFamily: 'monospace',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        // Start button
        this.startButton = this.add.text(512, 350, 'START ADVENTURE', {
            fontSize: '32px',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        // Make start button interactive
        this.startButton.setInteractive({ useHandCursor: true });
        this.startButton.on('pointerdown', () => this.startGame());
        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ color: '#ffff00' });
        });
        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ color: '#00ff00' });
        });
        // Instructions
        this.instructionText = this.add.text(512, 420, 'Press SPACE or ENTER to start', {
            fontSize: '18px',
            color: '#aaaaaa',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        // Level display
        this.levelText = this.add.text(512, 280, '', {
            fontSize: '20px',
            color: '#ffaa00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    createStatsDisplay() {
        const gameData = this.gameDataService.get();
        const statsX = 100;
        const statsY = 180;
        // Health display
        this.healthText = this.add.text(statsX, statsY, `Health: ${gameData.health}`, {
            fontSize: '18px',
            color: gameData.health > 20 ? '#00ff00' :
                gameData.health > 10 ? '#ffff00' : '#ff0000',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        });
        // Experience display
        const currentLevel = this.gameDataService.calculateLevel();
        const currentExp = gameData.experience;
        const requiredExp = this.gameDataService.getRequiredExperience(currentLevel + 1);
        this.experienceText = this.add.text(statsX, statsY + 30, `Level: ${currentLevel} (${currentExp}/${requiredExp})`, {
            fontSize: '18px',
            color: '#00aaff',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        });
        // Weapon display
        this.add.text(statsX, statsY + 60, `Weapon: ${gameData.current_weapon}`, {
            fontSize: '18px',
            color: '#ffaa00',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        });
        // Armor display
        this.add.text(statsX, statsY + 90, `Armor: ${gameData.current_armor}`, {
            fontSize: '18px',
            color: '#aaaaaa',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        });
    }
    setupInput() {
        this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
    updateUI() {
        const currentLevel = this.gameDataService.calculateLevel();
        this.levelText?.setText(`Current Level: ${currentLevel}`);
    }
    update() {
        // Check for input
        if ((this.spaceKey?.isDown || this.enterKey?.isDown)) {
            this.startGame();
        }
    }
    startGame() {
        console.log('🌍 Starting world map from MainMenu');
        // Save current game state
        this.gameDataService.save();
        // Transition to WorldMap
        this.scene.start('WorldMap');
    }
}
//# sourceMappingURL=MainMenuScene.js.map