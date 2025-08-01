/**
 * Combat Message Generator - Single responsibility for combat messaging
 * Handles attack messages, miss messages, critical hit messages
 */
import { IDamageCalculation } from '../../interfaces/ICombatSegregated.js';
import { ICombatResult } from '../../interfaces/ICombatSegregated.js';
import { IWeapon } from '../../interfaces/IWeapon.js';
import { IEnemy } from '../../interfaces/IEnemy.js';
export declare class CombatMessageGenerator {
    /**
     * Generate attack message based on damage calculation
     */
    generateAttackMessage(damageCalc: IDamageCalculation, weaponName: string): string;
    /**
     * Generate miss message
     */
    generateMissMessage(weaponName?: string): string;
    /**
     * Generate enemy attack message
     */
    generateEnemyAttackMessage(enemy: IEnemy, damage: number, isCritical?: boolean): string;
    /**
     * Generate enemy miss message
     */
    generateEnemyMissMessage(enemy: IEnemy): string;
    /**
     * Generate death message
     */
    generateDeathMessage(enemy: IEnemy): string;
    /**
     * Generate armor block message
     */
    generateArmorBlockMessage(armorType: string, damageBlocked: number): string;
    /**
     * Generate ammo depletion message
     */
    generateOutOfAmmoMessage(weaponName: string, ammoType: string): string;
    /**
     * Generate reload message
     */
    generateReloadMessage(weaponName: string): string;
    /**
     * Generate complete combat result message
     */
    generateCombatResultMessage(result: ICombatResult, weapon?: IWeapon, enemy?: IEnemy): string;
    /**
     * Generate experience gain message
     */
    generateExperienceMessage(experienceGained: number, enemy: IEnemy): string;
    /**
     * Generate level up message
     */
    generateLevelUpMessage(newLevel: number): string;
}
