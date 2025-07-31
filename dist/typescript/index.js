// Main TypeScript entry point for the game
// This bridges the legacy JavaScript code with new TypeScript services
import { LegacyBridge } from './core/bridges/LegacyBridge.js';
// Services (re-export for convenience)
export { PlayerService, CombatService, WeaponService, EnemyService, GameStateService } from './core/services';
// Battle System and Scenes
export { BattleLogic } from './core/BattleLogic';
// export { BattleScene } from './scenes/BattleScene';
// export { WorldMapScene } from './scenes/WorldMapScene';
export { MainMenuScene } from './scenes/MainMenuScene';
// Bridge
export { LegacyBridge };
/**
 * Initialize the TypeScript game services
 * This function should be called from the legacy JavaScript code
 */
export function initializeGameServices(legacyGameData) {
    console.log('🚀 Initializing TypeScript Game Services...');
    const bridge = LegacyBridge.getInstance();
    bridge.initialize(legacyGameData);
    console.log('✅ TypeScript services ready!');
    console.log('📊 Services available:', {
        player: '✓ Player management & stats',
        weapons: '✓ Weapon database & mechanics',
        enemies: '✓ Enemy spawning & AI',
        combat: '✓ Advanced combat calculations',
        gameState: '✓ Save/load & state management'
    });
    return bridge;
}
/**
 * Global initialization for browser environment
 */
if (typeof window !== 'undefined') {
    // Make TypeScript services available globally
    window.GameServices = {
        initializeGameServices,
        LegacyBridge
    };
    console.log('🎮 Game TypeScript services loaded and available globally');
}
//# sourceMappingURL=index.js.map