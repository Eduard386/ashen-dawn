/**
 * Segregated Player Interfaces
 * Following Interface Segregation Principle (ISP)
 * Each interface has a single, focused responsibility
 */

import { AmmoType, MedicalItemType } from '../types/GameTypes';

// Character Core Statistics
export interface ICharacterStats {
  readonly id: string;
  health: number;
  maxHealth: number;
  levelCount: number;
  experience: number;
}

// Character Skills System
export interface ICharacterSkills {
  small_guns: number;
  big_guns: number;
  energy_weapons: number;
  melee_weapons: number;
  pyrotechnics: number;
  lockpick: number;
  science: number;
  repair: number;
  medicine: number;
  barter: number;
  speech: number;
  surviving: number;
}

// Medical Inventory Management
export interface IMedicalInventory {
  first_aid_kit: number;
  jet: number;
  buffout: number;
  mentats: number;
  psycho: number;
}

// Ammunition Inventory Management
export interface IAmmoInventory {
  mm_9: number;
  magnum_44: number;
  mm_12: number;
  mm_5_45: number;
  energy_cell: number;
  frag_grenade: number;
}

// Combined Inventory System
export interface ICharacterInventory {
  med: IMedicalInventory;
  ammo: IAmmoInventory;
}

// Equipment Management
export interface ICharacterEquipment {
  currentWeapon: string;
  currentArmor: string;
  weapons: string[];
}

// Read-only Character Information
export interface ICharacterInfo {
  readonly id: string;
  readonly name?: string;
  readonly level: number;
}

// Health Management Operations
export interface IHealthManager {
  getHealth(): number;
  getMaxHealth(): number;
  updateHealth(newHealth: number): void;
  heal(amount: number): void;
  takeDamage(amount: number): void;
  isDead(): boolean;
  getHealthPercentage(): number;
}

// Experience and Leveling Operations
export interface IExperienceManager {
  getExperience(): number;
  addExperience(amount: number): boolean; // Returns true if leveled up
  getCurrentLevel(): number;
  getRequiredExperience(level: number): number;
  canLevelUp(): boolean;
}

// Skill Management Operations
export interface ISkillManager {
  getSkill(skillName: keyof ICharacterSkills): number;
  setSkill(skillName: keyof ICharacterSkills, value: number): void;
  addSkillPoints(skillName: keyof ICharacterSkills, points: number): void;
  getSkillModifier(skillName: keyof ICharacterSkills): number;
  getAllSkills(): ICharacterSkills;
}

// Inventory Operations
export interface IInventoryManager {
  getMedicalItem(itemType: keyof IMedicalInventory): number;
  addMedicalItem(itemType: keyof IMedicalInventory, amount: number): void;
  useMedicalItem(itemType: keyof IMedicalInventory): boolean;
  
  getAmmo(ammoType: keyof IAmmoInventory): number;
  addAmmo(ammoType: keyof IAmmoInventory, amount: number): void;
  useAmmo(ammoType: keyof IAmmoInventory, amount: number): boolean;
  hasAmmo(ammoType: keyof IAmmoInventory, amount: number): boolean;
}

// Equipment Operations
export interface IEquipmentManager {
  getCurrentWeapon(): string;
  switchWeapon(weaponName: string): boolean;
  addWeapon(weaponName: string): void;
  removeWeapon(weaponName: string): boolean;
  getWeapons(): string[];
  
  getCurrentArmor(): string;
  equipArmor(armorName: string): void;
}

// Combined Player Interface (Composition of segregated interfaces)
export interface IPlayer extends 
  ICharacterStats,
  ICharacterSkills {
  inventory: ICharacterInventory;
  equipment: ICharacterEquipment;
}

// Simplified read-only player data
export interface IPlayerData {
  stats: ICharacterStats;
  skills: ICharacterSkills;
  inventory: ICharacterInventory;
  equipment: ICharacterEquipment;
}

// Player state persistence
export interface IPlayerPersistence {
  save(): Promise<void>;
  load(): Promise<IPlayerData | null>;
  exists(): Promise<boolean>;
  delete(): Promise<void>;
}

// Player factory for different creation scenarios
export interface IPlayerFactory {
  createNewPlayer(name?: string): IPlayer;
  createFromLegacyData(legacyData: any): IPlayer;
  createFromSaveData(saveData: IPlayerData): IPlayer;
}

// Legacy compatibility (for gradual migration)
export interface IPlayerCharacter extends IPlayer {
  // Maintains backward compatibility during migration
}

export {
  // Re-export existing interfaces for backward compatibility
  IInventory,
  IPlayerSkills
} from './IPlayer';

// Type guards for interface validation
export function isCharacterStats(obj: any): obj is ICharacterStats {
  if (!obj || obj === null || obj === undefined) return false;
  return typeof obj.id === 'string' &&
    typeof obj.health === 'number' &&
    typeof obj.maxHealth === 'number' &&
    typeof obj.levelCount === 'number' &&
    typeof obj.experience === 'number';
}

export function isCharacterSkills(obj: any): obj is ICharacterSkills {
  if (!obj || obj === null || obj === undefined) return false;
  const requiredSkills = [
    'small_guns', 'big_guns', 'energy_weapons', 'melee_weapons',
    'pyrotechnics', 'lockpick', 'science', 'repair', 'medicine',
    'barter', 'speech', 'surviving'
  ];
  
  return requiredSkills.every(skill => 
    typeof obj[skill] === 'number' && obj[skill] >= 0
  );
}

export function isInventoryValid(obj: any): obj is ICharacterInventory {
  if (!obj || obj === null || obj === undefined) return false;
  return obj.med && typeof obj.med === 'object' &&
    obj.ammo && typeof obj.ammo === 'object';
}
