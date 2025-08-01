import { ICharacterStats, ICharacterSkills, IMedicalInventory as ISegregatedMedicalInventory, IAmmoInventory as ISegregatedAmmoInventory, ICharacterInventory } from './IPlayerSegregated';
export interface IPlayerSkills extends ICharacterSkills {
}
export interface IMedicalInventory extends ISegregatedMedicalInventory {
}
export interface IAmmoInventory extends ISegregatedAmmoInventory {
}
export interface IInventory extends ICharacterInventory {
}
export interface IPlayerCharacter extends ICharacterStats, ICharacterSkills {
    inventory: ICharacterInventory;
    currentWeapon: string;
    currentArmor: string;
    weapons: string[];
}
export interface IGameStateService {
    getPlayer(): IPlayerCharacter;
    updatePlayer(updates: Partial<IPlayerCharacter>): void;
    resetGame(): void;
    saveGame(): void;
    loadGame(): void;
}
