/**
 * Extended Combat Interfaces
 * Provides comprehensive interfaces for combat participants
 */
import { ICombatant as BaseICombatant } from '../interfaces/IEnemy';
/**
 * Extended Combat Participant Interface
 */
export interface IExtendedCombatant extends BaseICombatant {
    getName(): string;
    getDisplayName(): string;
    getCurrentAP(): number;
    getMaxAP(): number;
    spendAP(amount: number): boolean;
    restoreAP(amount: number): void;
    getWeaponSkill(): number;
    getWeaponRange(): number;
    getWeaponDamage(): number;
    getDamageBonus(): number;
    getWeaponName(): string;
    getWeaponAmmoType(): string;
    hasAmmo(ammoType: string, amount: number): boolean;
    consumeAmmo(ammoType: string, amount: number): boolean;
    getDefenseValue(): number;
    getArmorClass(): number;
    getDamageThreshold(): number;
    getDamageResistance(): number;
    getSkill(skillName: string): number;
    hasSkill(skillName: string): boolean;
    getSkillBonus(skillName: string): number;
    isAlive(): boolean;
    isConscious(): boolean;
    canAct(): boolean;
    hasStatusEffect(effectName: string): boolean;
    getPosition(): {
        x: number;
        y: number;
    };
    setPosition(x: number, y: number): void;
    getDistanceTo(other: IExtendedCombatant): number;
    hasItem(itemId: string): boolean;
    getItemCount(itemId: string): number;
    useItem(itemId: string): boolean;
    getLevel(): number;
    giveExperience(amount: number): void;
}
/**
 * Combat Participant Factory
 * Creates combat participants from various sources
 */
export interface ICombatantFactory {
    createFromPlayer(playerData: any): IExtendedCombatant;
    createFromEnemy(enemyData: any): IExtendedCombatant;
    createFromNPC(npcData: any): IExtendedCombatant;
}
/**
 * Basic Combat Participant Implementation
 * Provides default implementations for combat interface methods
 */
export declare abstract class BaseCombatant implements IExtendedCombatant {
    protected id: string;
    protected name: string;
    protected health: number;
    protected maxHealth: number;
    protected currentAP: number;
    protected maxAP: number;
    protected position: {
        x: number;
        y: number;
    };
    protected skills: Map<string, number>;
    protected statusEffects: Set<string>;
    protected inventory: Map<string, number>;
    abstract defence: any;
    constructor(id: string, name: string, health: number, maxHealth: number);
    getId(): string;
    getHealth(): number;
    getMaxHealth(): number;
    takeDamage(amount: number): void;
    getSkillValue(skill: string): number;
    getName(): string;
    getDisplayName(): string;
    getCurrentAP(): number;
    getMaxAP(): number;
    spendAP(amount: number): boolean;
    restoreAP(amount: number): void;
    getWeaponSkill(): number;
    getWeaponRange(): number;
    getWeaponDamage(): number;
    getDamageBonus(): number;
    getWeaponName(): string;
    getWeaponAmmoType(): string;
    hasAmmo(ammoType: string, amount: number): boolean;
    consumeAmmo(ammoType: string, amount: number): boolean;
    getDefenseValue(): number;
    getArmorClass(): number;
    getDamageThreshold(): number;
    getDamageResistance(): number;
    getSkill(skillName: string): number;
    hasSkill(skillName: string): boolean;
    getSkillBonus(skillName: string): number;
    setSkill(skillName: string, value: number): void;
    isAlive(): boolean;
    isConscious(): boolean;
    canAct(): boolean;
    hasStatusEffect(effectName: string): boolean;
    addStatusEffect(effectName: string): void;
    removeStatusEffect(effectName: string): void;
    getPosition(): {
        x: number;
        y: number;
    };
    setPosition(x: number, y: number): void;
    getDistanceTo(other: IExtendedCombatant): number;
    hasItem(itemId: string): boolean;
    getItemCount(itemId: string): number;
    useItem(itemId: string): boolean;
    addItem(itemId: string, quantity?: number): void;
    getLevel(): number;
    giveExperience(amount: number): void;
    heal(amount: number): void;
}
