/**
 * Armor Calculator - Single responsibility for armor and defense calculations
 * Handles armor class, damage reduction, resistance calculations
 */
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IEnemy } from '../../interfaces/IEnemy.js';
export interface IArmorInfo {
    armorClass: number;
    damageThreshold: number;
    damageResistance: number;
    name: string;
}
export declare class ArmorCalculator {
    private armorDatabase;
    constructor();
    /**
     * Get player armor class for hit calculations
     */
    getPlayerArmorClass(armorType: string): number;
    /**
     * Get complete armor information
     */
    getArmorInfo(armorType: string): IArmorInfo | null;
    /**
     * Calculate damage reduction from player armor
     */
    calculatePlayerArmorReduction(player: IPlayerCharacter, incomingDamage: number): number;
    /**
     * Get enemy defense values
     */
    getEnemyDefense(enemy: IEnemy): {
        armorClass: number;
        damageThreshold: number;
        damageResistance: number;
    };
    /**
     * Compare armor effectiveness
     */
    compareArmor(armor1: string, armor2: string): {
        better: string;
        acDifference: number;
        protection: 'better' | 'worse' | 'equal';
    };
    /**
     * Initialize armor database
     */
    private initializeArmorDatabase;
}
