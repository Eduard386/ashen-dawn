export class CombatMessageGenerator {
    /**
     * Generate attack message based on damage calculation
     */
    generateAttackMessage(damageCalc, weaponName) {
        if (damageCalc.isCritical) {
            return `💥 Critical hit with ${weaponName}! ${damageCalc.finalDamage} damage!`;
        }
        else {
            return `🎯 Hit with ${weaponName} for ${damageCalc.finalDamage} damage.`;
        }
    }
    /**
     * Generate miss message
     */
    generateMissMessage(weaponName) {
        const missMessages = [
            '❌ You missed!',
            '❌ Your shot went wide!',
            '❌ You failed to connect!',
            '❌ The attack missed its mark!'
        ];
        if (weaponName) {
            const weaponMissMessages = [
                `❌ Your ${weaponName} missed!`,
                `❌ The ${weaponName} failed to hit!`,
                `❌ You couldn't land the ${weaponName} attack!`
            ];
            missMessages.push(...weaponMissMessages);
        }
        return missMessages[Math.floor(Math.random() * missMessages.length)];
    }
    /**
     * Generate enemy attack message
     */
    generateEnemyAttackMessage(enemy, damage, isCritical = false) {
        const weapon = enemy.attack.weapon || 'claws';
        if (isCritical) {
            return `💥 ${enemy.name} lands a critical hit with ${weapon}! ${damage} damage!`;
        }
        else {
            return `🗡️ ${enemy.name} attacks with ${weapon} for ${damage} damage!`;
        }
    }
    /**
     * Generate enemy miss message
     */
    generateEnemyMissMessage(enemy) {
        const weapon = enemy.attack.weapon || 'attack';
        const missMessages = [
            `❌ ${enemy.name} missed!`,
            `❌ ${enemy.name}'s ${weapon} misses you!`,
            `❌ You dodge ${enemy.name}'s attack!`,
            `❌ ${enemy.name} fails to connect!`
        ];
        return missMessages[Math.floor(Math.random() * missMessages.length)];
    }
    /**
     * Generate death message
     */
    generateDeathMessage(enemy) {
        const deathMessages = [
            `💀 ${enemy.name} has been defeated!`,
            `☠️ You killed the ${enemy.name}!`,
            `🏆 ${enemy.name} falls to your attack!`,
            `⚰️ The ${enemy.name} is dead!`
        ];
        return deathMessages[Math.floor(Math.random() * deathMessages.length)];
    }
    /**
     * Generate armor block message
     */
    generateArmorBlockMessage(armorType, damageBlocked) {
        return `🛡️ Your ${armorType} absorbs ${damageBlocked} damage!`;
    }
    /**
     * Generate ammo depletion message
     */
    generateOutOfAmmoMessage(weaponName, ammoType) {
        return `🔫 Out of ${ammoType} for ${weaponName}!`;
    }
    /**
     * Generate reload message
     */
    generateReloadMessage(weaponName) {
        return `🔄 Reloading ${weaponName}...`;
    }
    /**
     * Generate complete combat result message
     */
    generateCombatResultMessage(result, weapon, enemy) {
        if (!result.isHit) {
            return this.generateMissMessage(weapon?.name);
        }
        if (result.isCritical) {
            return `💥 Critical hit! ${result.damage} damage! ${enemy?.name || 'Enemy'} health: ${result.remainingHealth}`;
        }
        return `🎯 Hit for ${result.damage} damage! ${enemy?.name || 'Enemy'} health: ${result.remainingHealth}`;
    }
    /**
     * Generate experience gain message
     */
    generateExperienceMessage(experienceGained, enemy) {
        return `⭐ Gained ${experienceGained} experience from defeating ${enemy.name}!`;
    }
    /**
     * Generate level up message
     */
    generateLevelUpMessage(newLevel) {
        return `🎉 Level up! You are now level ${newLevel}!`;
    }
}
//# sourceMappingURL=CombatMessageGenerator.js.map