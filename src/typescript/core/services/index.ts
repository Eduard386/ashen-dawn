// Export all services for easy importing
export { PlayerService } from './PlayerService';
export { CombatService } from './CombatService';
export { WeaponService } from './WeaponService';
export { EnemyService } from './EnemyService';
export { GameStateService } from './GameStateService';
export { GameDataService } from './GameDataService';
export { AssetLoaderService } from './AssetLoaderService';

// Re-export interfaces for convenience
export type { IPlayerCharacter, IPlayerSkills, IInventory } from '../interfaces/IPlayer';
export type { IWeapon } from '../interfaces/IWeapon';
export type { IEnemy } from '../interfaces/IEnemy';
export type { ICombatResult, IDamageCalculation } from '../interfaces/ICombat';

// Re-export types
export type { 
  SceneName, 
  SkillType, 
  WeaponSkillType, 
  AmmoType, 
  EnemyType, 
  MedicalItemType,
  IDamageRange,
  CombatResult,
  LootReward
} from '../types/GameTypes';
