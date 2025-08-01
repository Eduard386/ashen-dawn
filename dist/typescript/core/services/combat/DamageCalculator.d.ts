/**
 * Damage Calculator - Single responsibility for damage calculations
 * Handles base damage, critical hits, skill bonuses, armor mitigation
 */
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IWeapon } from '../../interfaces/IWeapon.js';
import { IEnemy } from '../../interfaces/IEnemy.js';
import { IDamageCalculation } from '../../interfaces/ICombatSegregated.js';
export declare class DamageCalculator {
    /**
     * Calculate complete damage calculation
     */
    calculateDamage(weapon: IWeapon, target: IEnemy, attacker?: IPlayerCharacter): IDamageCalculation;
    /**
     * Calculate skill modifier for damage
     */
    private calculateSkillModifier;
    /**
     * Roll damage between min and max
     */
    private rollDamage;
    /**
     * Calculate critical hit damage
     */
    calculateCritical(baseDamage: number, criticalChance: number): {
        damage: number;
        isCritical: boolean;
    };
    /**
     * Apply armor mitigation
     */
    applyArmorMitigation(damage: number, threshold: number, resistance: number): number;
}
