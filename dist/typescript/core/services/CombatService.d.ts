import { ICombatResult, IDamageCalculation } from '../interfaces/ICombat.js';
import { IPlayerCharacter } from '../interfaces/IPlayer.js';
import { IWeapon } from '../interfaces/IWeapon.js';
import { IEnemy } from '../interfaces/IEnemy.js';
/**
 * Combat Service - Handles all combat calculations and mechanics
 * Implements SOLID principles for battle system
 */
export declare class CombatService {
    private static instance;
    private constructor();
    static getInstance(): CombatService;
    /**
     * Calculate player attack against enemy
     */
    calculatePlayerAttack(player: IPlayerCharacter, weapon: IWeapon, enemy: IEnemy): ICombatResult;
    /**
     * Calculate enemy attack against player
     */
    calculateEnemyAttack(enemy: IEnemy, player: IPlayerCharacter): ICombatResult;
    /**
     * Calculate hit chance for player attack
     */
    calculateHitChance(player: IPlayerCharacter, weapon: IWeapon, enemy: IEnemy): number;
    /**
     * Calculate damage with armor and resistance
     */
    calculateDamage(weapon: IWeapon, target: IEnemy, attacker?: IPlayerCharacter): IDamageCalculation;
    /**
     * Check if player can use weapon (has ammo)
     */
    canUseWeapon(player: IPlayerCharacter, weapon: IWeapon): boolean;
    /**
     * Use ammo for weapon attack
     */
    consumeAmmo(player: IPlayerCharacter, weapon: IWeapon): boolean;
    /**
     * Calculate experience gained from defeating enemy
     */
    calculateExperienceGain(enemy: IEnemy, playerLevel: number): number;
    private rollDamage;
    private getPlayerArmorClass;
    private generateAttackMessage;
}
