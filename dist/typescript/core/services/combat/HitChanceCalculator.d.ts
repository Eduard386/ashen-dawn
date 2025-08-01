/**
 * Hit Chance Calculator - Single responsibility for hit calculations
 * Handles accuracy, weapon modifiers, enemy defense
 */
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IWeapon } from '../../interfaces/IWeapon.js';
import { IEnemy } from '../../interfaces/IEnemy.js';
import { IHitCalculation } from '../../interfaces/ICombatSegregated.js';
export declare class HitChanceCalculator {
    /**
     * Calculate complete hit chance calculation
     */
    calculateHitChance(player: IPlayerCharacter, weapon: IWeapon, enemy: IEnemy): IHitCalculation;
    /**
     * Simple hit chance calculation (legacy compatibility)
     */
    getHitChance(player: IPlayerCharacter, weapon: IWeapon, enemy: IEnemy): number;
    /**
     * Check if attack hits (roll only)
     */
    checkHit(hitChance: number): boolean;
}
