import { AmmoType, MedicalItemType } from '../types/GameTypes';

export interface IPlayerSkills {
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

export interface IMedicalInventory {
  first_aid_kit: number;
  jet: number;
  buffout: number;
  mentats: number;
  psycho: number;
}

export interface IAmmoInventory {
  mm_9: number;
  magnum_44: number;
  mm_12: number;
  mm_5_45: number;
  energy_cell: number;
  frag_grenade: number;
}

export interface IInventory {
  med: IMedicalInventory;
  ammo: IAmmoInventory;
}

export interface IPlayerCharacter {
  readonly id: string;
  levelCount: number;
  health: number;
  maxHealth: number;  // Removed readonly to allow level up modifications
  experience: number;
  skills: IPlayerSkills;
  currentWeapon: string;
  currentArmor: string;
  weapons: string[];
  inventory: IInventory;
}

// Service interface for managing player state
export interface IGameStateService {
  getPlayer(): IPlayerCharacter;
  updatePlayer(updates: Partial<IPlayerCharacter>): void;
  resetGame(): void;
  saveGame(): void;
  loadGame(): void;
}
