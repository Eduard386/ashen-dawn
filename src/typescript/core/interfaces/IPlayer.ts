import { AmmoType, MedicalItemType } from '../types/GameTypes';
// Import segregated interfaces
import { 
  ICharacterStats, 
  ICharacterSkills, 
  IMedicalInventory as ISegregatedMedicalInventory,
  IAmmoInventory as ISegregatedAmmoInventory,
  ICharacterInventory,
  ICharacterEquipment
} from './IPlayerSegregated';

// Legacy compatibility interfaces - delegating to segregated interfaces
export interface IPlayerSkills extends ICharacterSkills {}

export interface IMedicalInventory extends ISegregatedMedicalInventory {}
export interface IAmmoInventory extends ISegregatedAmmoInventory {}
export interface IInventory extends ICharacterInventory {}

// Legacy player interface for backward compatibility - flat structure
export interface IPlayerCharacter extends ICharacterStats, ICharacterSkills {
  // Flatten inventory
  inventory: ICharacterInventory;
  // Flatten equipment
  currentWeapon: string;
  currentArmor: string;
  weapons: string[];
}

// Service interface for managing player state
export interface IGameStateService {
  getPlayer(): IPlayerCharacter;
  updatePlayer(updates: Partial<IPlayerCharacter>): void;
  resetGame(): void;
  saveGame(): void;
  loadGame(): void;
}
