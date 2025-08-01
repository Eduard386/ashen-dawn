/**
 * Segregated Enemy Interfaces
 * Following Interface Segregation Principle (ISP)
 * Separated into stats, behavior, rendering, and AI concerns
 */

import { EnemyType, IDamageRange } from '../types/GameTypes';

// Core Enemy Statistics
export interface IEnemyStats {
  readonly id: string;
  readonly name: string;
  readonly type: EnemyType;
  maxLevel: number;
  currentHealth: number;
  maxHealth: number;
  readonly experienceReward: number;
}

// Enemy Defense Capabilities
export interface IEnemyDefense {
  armorClass: number;
  damageThreshold: number;
  damageResistance: number;
  healthRegeneration?: number;
}

// Enemy Attack Capabilities
export interface IEnemyAttack {
  hitChance: number;
  weapon?: string;
  damage: IDamageRange;
  shots: number;
  attackSpeed: number;
  criticalChance?: number;
}

// Enemy Spawning Configuration
export interface IEnemySpawning {
  minCount: number;
  maxCount: number;
  spawnWeight: number;
  levelRange: { min: number; max: number };
  biome?: string[];
}

// Enemy Visual Representation
export interface IEnemyRendering {
  readonly sprites: string[];
  readonly animations?: string[];
  readonly scale?: number;
  readonly tint?: number;
}

// Enemy AI Behavior
export interface IEnemyBehavior {
  aggressiveness: number;
  intelligence: number;
  movePattern: 'static' | 'patrol' | 'aggressive' | 'defensive';
  specialAbilities?: string[];
}

// Enemy Loot Configuration
export interface IEnemyLoot {
  weapons?: string[];
  armor?: string[];
  ammo?: Record<string, { min: number; max: number }>;
  medical?: Record<string, { min: number; max: number }>;
  dropChance: number;
}

// Health Management for Enemies
export interface IEnemyHealthManager {
  getCurrentHealth(): number;
  getMaxHealth(): number;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  isDead(): boolean;
  getHealthPercentage(): number;
}

// Combat Behavior for Enemies
export interface IEnemyCombatBehavior {
  canAttack(): boolean;
  calculateAttackDamage(): number;
  getHitChance(): number;
  performAttack(): { damage: number; isCritical: boolean };
  onTakeDamage(amount: number): void;
  onDeath(): void;
}

// Enemy Movement and Positioning
export interface IEnemyMovement {
  canMove(): boolean;
  getPosition(): { x: number; y: number };
  setPosition(x: number, y: number): void;
  getMovementSpeed(): number;
}

// Enemy Factory for Different Creation Scenarios
export interface IEnemyFactory {
  createEnemy(template: string, level?: number): IEnemy;
  createFromConfig(config: IEnemyConfig): IEnemy;
  generateRandomEnemy(type: EnemyType, level: number): IEnemy;
  parseRaiderEquipment(name: string): { weapon?: string; armor?: string };
}

// Complete Enemy Configuration
export interface IEnemyConfig {
  stats: IEnemyStats;
  defense: IEnemyDefense;
  attack: IEnemyAttack;
  spawning: IEnemySpawning;
  rendering: IEnemyRendering;
  behavior: IEnemyBehavior;
  loot: IEnemyLoot;
}

// Simplified Enemy Interface (Composition)
export interface IEnemy {
  readonly id: string;
  readonly name: string;
  readonly type: EnemyType;
  stats: IEnemyStats;
  defense: IEnemyDefense;
  attack: IEnemyAttack;
  rendering: IEnemyRendering;
  behavior?: IEnemyBehavior;
  loot?: IEnemyLoot;
}

// Combat Participant Interface
export interface ICombatant {
  getId(): string;
  getHealth(): number;
  getMaxHealth(): number;
  takeDamage(amount: number): void;
  isDead(): boolean;
  getDefenseStats(): IEnemyDefense;
}

// Enemy Group Management
export interface IEnemyGroup {
  readonly id: string;
  enemies: IEnemy[];
  formation: 'line' | 'circle' | 'scattered';
  getAliveEnemies(): IEnemy[];
  getTotalHealth(): number;
  isDefeated(): boolean;
}

// Enemy Spawner Interface
export interface IEnemySpawner {
  spawnEnemies(type: string, level: number, count?: number): IEnemy[];
  spawnGroup(groupConfig: IEnemyGroupConfig): IEnemyGroup;
  canSpawn(type: string, level: number): boolean;
}

export interface IEnemyGroupConfig {
  types: string[];
  level: number;
  minCount: number;
  maxCount: number;
  formation: 'line' | 'circle' | 'scattered';
}

// Legacy compatibility interfaces
export interface IDefenceStats extends IEnemyDefense {
  health: number; // Backward compatibility
}

export interface IAttackStats extends IEnemyAttack {
  // Maintains backward compatibility
}

export interface ISpawnConfig {
  min: number;
  max: number;
}

// Type guards for validation
export function isEnemyStats(obj: any): obj is IEnemyStats {
  if (!obj || obj === null || obj === undefined) return false;
  return typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.maxLevel === 'number' &&
    typeof obj.currentHealth === 'number' &&
    typeof obj.experienceReward === 'number';
}

export function isEnemyDefense(obj: any): obj is IEnemyDefense {
  if (!obj || obj === null || obj === undefined) return false;
  return typeof obj.armorClass === 'number' &&
    typeof obj.damageThreshold === 'number' &&
    typeof obj.damageResistance === 'number';
}

export function isEnemyAttack(obj: any): obj is IEnemyAttack {
  if (!obj || obj === null || obj === undefined) return false;
  return typeof obj.hitChance === 'number' &&
    obj.damage &&
    typeof obj.damage.min === 'number' &&
    typeof obj.damage.max === 'number' &&
    typeof obj.shots === 'number' &&
    typeof obj.attackSpeed === 'number';
}

// Service interface for enemy management
export interface IEnemyService {
  createEnemy(name: string, level?: number): IEnemy;
  generateEnemies(type: string, level: number): IEnemy[];
  parseRaiderEquipment(name: string): { weapon?: string; armor?: string };
}
