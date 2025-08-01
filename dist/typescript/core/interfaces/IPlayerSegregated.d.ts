/**
 * Segregated Player Interfaces
 * Following Interface Segregation Principle (ISP)
 * Each interface has a single, focused responsibility
 */
export interface ICharacterStats {
    readonly id: string;
    health: number;
    maxHealth: number;
    levelCount: number;
    experience: number;
}
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
export interface ICharacterInventory {
    med: IMedicalInventory;
    ammo: IAmmoInventory;
}
export interface ICharacterEquipment {
    currentWeapon: string;
    currentArmor: string;
    weapons: string[];
}
export interface ICharacterInfo {
    readonly id: string;
    readonly name?: string;
    readonly level: number;
}
export interface IHealthManager {
    getHealth(): number;
    getMaxHealth(): number;
    updateHealth(newHealth: number): void;
    heal(amount: number): void;
    takeDamage(amount: number): void;
    isDead(): boolean;
    getHealthPercentage(): number;
}
export interface IExperienceManager {
    getExperience(): number;
    addExperience(amount: number): boolean;
    getCurrentLevel(): number;
    getRequiredExperience(level: number): number;
    canLevelUp(): boolean;
}
export interface ISkillManager {
    getSkill(skillName: keyof ICharacterSkills): number;
    setSkill(skillName: keyof ICharacterSkills, value: number): void;
    addSkillPoints(skillName: keyof ICharacterSkills, points: number): void;
    getSkillModifier(skillName: keyof ICharacterSkills): number;
    getAllSkills(): ICharacterSkills;
}
export interface IInventoryManager {
    getMedicalItem(itemType: keyof IMedicalInventory): number;
    addMedicalItem(itemType: keyof IMedicalInventory, amount: number): void;
    useMedicalItem(itemType: keyof IMedicalInventory): boolean;
    getAmmo(ammoType: keyof IAmmoInventory): number;
    addAmmo(ammoType: keyof IAmmoInventory, amount: number): void;
    useAmmo(ammoType: keyof IAmmoInventory, amount: number): boolean;
    hasAmmo(ammoType: keyof IAmmoInventory, amount: number): boolean;
}
export interface IEquipmentManager {
    getCurrentWeapon(): string;
    switchWeapon(weaponName: string): boolean;
    addWeapon(weaponName: string): void;
    removeWeapon(weaponName: string): boolean;
    getWeapons(): string[];
    getCurrentArmor(): string;
    equipArmor(armorName: string): void;
}
export interface IPlayer extends ICharacterStats, ICharacterSkills {
    inventory: ICharacterInventory;
    equipment: ICharacterEquipment;
}
export interface IPlayerData {
    stats: ICharacterStats;
    skills: ICharacterSkills;
    inventory: ICharacterInventory;
    equipment: ICharacterEquipment;
}
export interface IPlayerPersistence {
    save(): Promise<void>;
    load(): Promise<IPlayerData | null>;
    exists(): Promise<boolean>;
    delete(): Promise<void>;
}
export interface IPlayerFactory {
    createNewPlayer(name?: string): IPlayer;
    createFromLegacyData(legacyData: any): IPlayer;
    createFromSaveData(saveData: IPlayerData): IPlayer;
}
export interface IPlayerCharacter extends IPlayer {
}
export { IInventory, IPlayerSkills } from './IPlayer';
export declare function isCharacterStats(obj: any): obj is ICharacterStats;
export declare function isCharacterSkills(obj: any): obj is ICharacterSkills;
export declare function isInventoryValid(obj: any): obj is ICharacterInventory;
