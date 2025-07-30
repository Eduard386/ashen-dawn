// Core game types
export type SceneName = 'MainMenu' | 'WorldMapScene' | 'EncounterScene' | 'BattleScene' | 'VictoryScene' | 'DeadScene';

export type WeaponSkillType = 'small_guns' | 'big_guns' | 'energy_weapons' | 'melee_weapons' | 'pyrotechnics';

export type SkillType = 'small_guns' | 'big_guns' | 'energy_weapons' | 'melee_weapons' | 'pyrotechnics' | 
  'lockpick' | 'science' | 'repair' | 'medicine' | 'barter' | 'speech' | 'surviving';

export type AmmoType = 'mm_9' | 'magnum_44' | 'mm_12' | 'mm_5_45' | 'energy_cell' | 'frag_grenade' | 'melee';

export type EnemyType = 'creature' | 'human';

export type MedicalItemType = 'first_aid_kit' | 'jet' | 'buffout' | 'mentats' | 'psycho';

export interface IDamageRange {
  readonly min: number;
  readonly max: number;
}

export interface CombatResult {
  damage: number;
  isCritical: boolean;
  isHit: boolean;
  finalDamage: number;
}

export interface LootReward {
  weapons: string[];
  armor?: string;
  ammo: Record<AmmoType, number>;
  medical: Record<MedicalItemType, number>;
  experience: number;
}
