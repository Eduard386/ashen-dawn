import { HitChanceCalculator } from './HitChanceCalculator.js';
import { DamageCalculator } from './DamageCalculator.js';
import { AmmoManager } from './AmmoManager.js';
import { ArmorCalculator } from './ArmorCalculator.js';
import { ExperienceCalculator } from './ExperienceCalculator.js';
import { CombatMessageGenerator } from './CombatMessageGenerator.js';
/**
 * Modern Combat Service using composition and SRP
 * Each component has a single, focused responsibility
 */
export class ModernCombatService {
    constructor() {
        this.hitChanceCalculator = new HitChanceCalculator();
        this.damageCalculator = new DamageCalculator();
        this.ammoManager = new AmmoManager();
        this.armorCalculator = new ArmorCalculator();
        this.experienceCalculator = new ExperienceCalculator();
        this.messageGenerator = new CombatMessageGenerator();
    }
    static getInstance() {
        if (!ModernCombatService.instance) {
            ModernCombatService.instance = new ModernCombatService();
        }
        return ModernCombatService.instance;
    }
    /**
     * Calculate complete player attack with all components
     */
    calculatePlayerAttack(player, weapon, enemy) {
        // Check hit calculation
        const hitCalc = this.hitChanceCalculator.calculateHitChance(player, weapon, enemy);
        if (!hitCalc.isHit) {
            return {
                isHit: false,
                damage: 0,
                isCritical: false,
                remainingHealth: enemy.currentHealth,
                message: this.messageGenerator.generateMissMessage(weapon.name)
            };
        }
        // Calculate damage
        const damageCalc = this.damageCalculator.calculateDamage(weapon, enemy, player);
        const newHealth = Math.max(0, enemy.currentHealth - damageCalc.finalDamage);
        return {
            isHit: true,
            damage: damageCalc.finalDamage,
            isCritical: damageCalc.isCritical,
            remainingHealth: newHealth,
            message: this.messageGenerator.generateAttackMessage(damageCalc, weapon.name)
        };
    }
    /**
     * Calculate enemy attack against player
     */
    calculateEnemyAttack(enemy, player) {
        const hitChance = enemy.attack.hitChance;
        const isHit = Math.random() * 100 < hitChance;
        if (!isHit) {
            return {
                isHit: false,
                damage: 0,
                isCritical: false,
                remainingHealth: player.health,
                message: this.messageGenerator.generateEnemyMissMessage(enemy)
            };
        }
        // Calculate base damage
        const baseDamage = Math.floor(Math.random() * (enemy.attack.damage.max - enemy.attack.damage.min + 1)) + enemy.attack.damage.min;
        // Apply player armor reduction
        const finalDamage = this.armorCalculator.calculatePlayerArmorReduction(player, baseDamage);
        const newHealth = Math.max(0, player.health - finalDamage);
        return {
            isHit: true,
            damage: finalDamage,
            isCritical: false, // Enemies don't crit for now
            remainingHealth: newHealth,
            message: this.messageGenerator.generateEnemyAttackMessage(enemy, finalDamage)
        };
    }
    // Delegation methods for direct access to specialized components
    /**
     * Get hit chance calculation details
     */
    getHitCalculation(player, weapon, enemy) {
        return this.hitChanceCalculator.calculateHitChance(player, weapon, enemy);
    }
    /**
     * Get damage calculation details
     */
    getDamageCalculation(weapon, target, attacker) {
        return this.damageCalculator.calculateDamage(weapon, target, attacker);
    }
    /**
     * Check if player can use weapon
     */
    canUseWeapon(player, weapon) {
        return this.ammoManager.canUseWeapon(player, weapon);
    }
    /**
     * Consume ammo for weapon use
     */
    consumeAmmo(player, weapon) {
        return this.ammoManager.consumeAmmo(player, weapon);
    }
    /**
     * Calculate experience gain from defeating enemy
     */
    calculateExperienceGain(enemy, playerLevel) {
        return this.experienceCalculator.getExperienceGain(enemy, playerLevel);
    }
    /**
     * Generate combat message
     */
    generateCombatMessage(result, weapon, enemy) {
        return this.messageGenerator.generateCombatResultMessage(result, weapon, enemy);
    }
    // Legacy compatibility methods
    /**
     * Legacy hit chance calculation (for backward compatibility)
     */
    calculateHitChance(player, weapon, enemy) {
        return this.hitChanceCalculator.getHitChance(player, weapon, enemy);
    }
    /**
     * Legacy damage calculation (for backward compatibility)
     */
    calculateDamage(weapon, target, attacker) {
        return this.damageCalculator.calculateDamage(weapon, target, attacker);
    }
    // Access to specialized components (for advanced usage)
    /**
     * Get hit chance calculator component
     */
    getHitChanceCalculator() {
        return this.hitChanceCalculator;
    }
    /**
     * Get damage calculator component
     */
    getDamageCalculator() {
        return this.damageCalculator;
    }
    /**
     * Get ammo manager component
     */
    getAmmoManager() {
        return this.ammoManager;
    }
    /**
     * Get armor calculator component
     */
    getArmorCalculator() {
        return this.armorCalculator;
    }
    /**
     * Get experience calculator component
     */
    getExperienceCalculator() {
        return this.experienceCalculator;
    }
    /**
     * Get message generator component
     */
    getMessageGenerator() {
        return this.messageGenerator;
    }
}
//# sourceMappingURL=ModernCombatService.js.map