// Main TypeScript entry point for the game
// Modern asset-optimized game engine
import game from './game.js';
// Export game instance
export default game;
// Services (re-export for convenience)
export { PlayerService, CombatService, WeaponService, EnemyService, GameStateService } from './core/services';
// Asset management
export { AssetLoaderService } from './core/services/AssetLoaderService';
export { GameDataService } from './core/services/GameDataService';
// Scenes
export { LoadingScene } from './scenes/LoadingScene';
export { MainMenuScene } from './scenes/MainMenuScene';
export { WorldMapScene } from './scenes/WorldMapScene';
export { BattleScene } from './scenes/BattleScene';
export { VictoryScene } from './scenes/VictoryScene';
export { DeadScene } from './scenes/DeadScene';
console.log('🎮 Ashen Dawn TypeScript Game Engine Loaded Successfully!');
console.log('🚀 Game starting with optimized asset loading...');
//# sourceMappingURL=index.js.map