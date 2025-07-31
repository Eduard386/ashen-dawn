import { LegacyBridge } from './core/bridges/LegacyBridge.js';
export { PlayerService, CombatService, WeaponService, EnemyService, GameStateService } from './core/services';
export { BattleLogic } from './core/BattleLogic';
export { MainMenuScene } from './scenes/MainMenuScene';
export type { IPlayerCharacter, IPlayerSkills, IInventory, IWeapon, IEnemy, ICombatResult, IDamageCalculation } from './core/services';
export type { SceneName, SkillType, WeaponSkillType, AmmoType, EnemyType, MedicalItemType, IDamageRange, CombatResult, LootReward } from './core/services';
export { LegacyBridge };
/**
 * Initialize the TypeScript game services
 * This function should be called from the legacy JavaScript code
 */
export declare function initializeGameServices(legacyGameData?: any): LegacyBridge;
