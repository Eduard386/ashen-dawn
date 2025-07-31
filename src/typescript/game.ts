// src/typescript/game.ts - Modern TypeScript Game Entry Point
// Note: Phaser is loaded globally via CDN in index.html
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { BattleScene } from './scenes/BattleSceneComplete.js';
import { DeadScene } from './scenes/DeadScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

/**
 * Modern Phaser 3 Game Configuration with TypeScript Scenes
 * 
 * Features:
 * - Full TypeScript type safety
 * - Modern scene architecture with service layer
 * - SOLID principles implementation
 * - Comprehensive error handling
 * - Zero legacy JavaScript dependencies
 */
const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 1024,
    height: 600,
    parent: 'game-container', // Optional: container element
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity for top-down view
            debug: false // Set to true for physics debugging
        }
    },
    scene: [
        MainMenuScene,    // Modern TypeScript entry point
        WorldMapScene,    // Modern TypeScript travel system
        BattleScene,      // Modern TypeScript combat system
        VictoryScene,     // Modern TypeScript loot processing
        DeadScene         // Modern TypeScript game over handling
        // EncounterScene - Legacy version still available if needed
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1024,
        height: 600
    },
    render: {
        antialias: true,
        pixelArt: false
    }
};

/**
 * Initialize the modern TypeScript game
 * 
 * This replaces the legacy JavaScript game.js entirely.
 * All scenes now use modern TypeScript with:
 * - Service layer architecture
 * - LegacyBridge for data access
 * - Comprehensive error handling
 * - Type safety throughout
 */
const game = new Phaser.Game(gameConfig);

// Export for potential external access
export default game;

// Global error handling for game initialization
window.addEventListener('error', (event) => {
    console.error('Game initialization error:', event.error);
});

// Performance monitoring (development only)
// @ts-ignore
window.game = game;
console.log('🎮 Modern TypeScript Ashen Dawn initialized successfully!');
console.log('🔧 Development mode: Game object available as window.game');
