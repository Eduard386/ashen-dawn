/**
 * Combat Extension System
 * Implements Open/Closed Principle for combat mechanics
 */
import { AbstractStrategy, StrategyContext, RegistryFactory, AbstractEventListener, BaseEvent } from '../extensions';
import { CombatActionType } from './CombatTypes';
/**
 * Attack Action Strategy
 */
export class AttackActionStrategy extends AbstractStrategy {
    constructor() {
        super('attack_strategy', 'Standard attack action strategy', 100 // High priority for basic attacks
        );
    }
    getSupportedActionTypes() {
        return [CombatActionType.ATTACK, CombatActionType.AIMED_SHOT];
    }
    canHandle(input) {
        return this.getSupportedActionTypes().includes(input.action.type);
    }
    canPerformAction(input) {
        const requirements = this.getActionRequirements(input);
        const attacker = input.attacker;
        // Check action points
        if (attacker.getCurrentAP() < requirements.actionPoints) {
            return false;
        }
        // Check range
        if (input.target) {
            const distance = this.calculateDistance(attacker, input.target);
            if (distance < requirements.minRange || distance > requirements.maxRange) {
                return false;
            }
        }
        // Check ammunition
        if (requirements.ammunition) {
            // Implementation would check if attacker has required ammo
            // For now, assume check passes
        }
        return true;
    }
    calculateSuccessProbability(input) {
        const attacker = input.attacker;
        const target = input.target;
        const context = input.context;
        if (!target) {
            return 0;
        }
        // Base skill
        let baseChance = attacker.getWeaponSkill();
        // Apply environmental modifiers
        baseChance += this.calculateEnvironmentalModifier(context.environment);
        // Apply combat modifiers
        for (const modifier of context.modifiers) {
            if (modifier.affects.includes('accuracy')) {
                baseChance += modifier.value;
            }
        }
        // Apply target's defense
        baseChance -= target.getDefenseValue();
        // Clamp between 5% and 95%
        return Math.max(0.05, Math.min(0.95, baseChance / 100));
    }
    getActionRequirements(input) {
        const baseAP = input.action.type === CombatActionType.AIMED_SHOT ? 6 : 4;
        return {
            actionPoints: baseAP,
            minRange: 1,
            maxRange: input.attacker.getWeaponRange(),
            ammunition: {
                type: input.attacker.getWeaponAmmoType(),
                amount: 1
            }
        };
    }
    async execute(input) {
        const probability = this.calculateSuccessProbability(input);
        const isHit = input.context.rng() < probability;
        const result = {
            success: isHit,
            damage: isHit ? this.calculateDamage(input) : 0,
            message: this.generateMessage(input, isHit),
            effects: [],
            actionPointsCost: this.getActionRequirements(input).actionPoints
        };
        return result;
    }
    calculateDistance(attacker, target) {
        // Use the built-in distance calculation
        return attacker.getDistanceTo(target);
    }
    calculateEnvironmentalModifier(environment) {
        let modifier = 0;
        // Lighting modifiers
        switch (environment.lighting) {
            case 'bright':
                modifier += 10;
                break;
            case 'normal':
                modifier += 0;
                break;
            case 'dim':
                modifier -= 10;
                break;
            case 'dark':
                modifier -= 20;
                break;
        }
        // Weather modifiers
        switch (environment.weather) {
            case 'clear':
                modifier += 0;
                break;
            case 'rain':
                modifier -= 5;
                break;
            case 'fog':
                modifier -= 15;
                break;
            case 'storm':
                modifier -= 10;
                break;
        }
        return modifier;
    }
    calculateDamage(input) {
        const baseDamage = input.attacker.getWeaponDamage();
        const damageBonus = input.attacker.getDamageBonus();
        // Random damage variance (80% to 120% of base)
        const variance = 0.8 + (input.context.rng() * 0.4);
        return Math.floor((baseDamage + damageBonus) * variance);
    }
    generateMessage(input, isHit) {
        const attackerName = input.attacker.getName();
        const targetName = input.target?.getName() || 'unknown target';
        const weaponName = input.attacker.getWeaponName();
        if (isHit) {
            return `${attackerName} hits ${targetName} with ${weaponName}!`;
        }
        else {
            return `${attackerName} misses ${targetName} with ${weaponName}.`;
        }
    }
}
/**
 * Healing Action Strategy
 */
export class HealActionStrategy extends AbstractStrategy {
    constructor() {
        super('heal_strategy', 'Healing action strategy', 80);
    }
    getSupportedActionTypes() {
        return [CombatActionType.USE_ITEM]; // Assuming healing items
    }
    canHandle(input) {
        return input.action.type === CombatActionType.USE_ITEM &&
            input.action.itemType === 'healing';
    }
    canPerformAction(input) {
        const requirements = this.getActionRequirements(input);
        return input.attacker.getCurrentAP() >= requirements.actionPoints;
    }
    calculateSuccessProbability(input) {
        // Healing items generally have high success rate
        return 0.9;
    }
    getActionRequirements(input) {
        return {
            actionPoints: 3,
            minRange: 0,
            maxRange: 0, // Self-use only
        };
    }
    async execute(input) {
        const healAmount = this.calculateHealAmount(input);
        const result = {
            success: true,
            damage: -healAmount, // Negative damage = healing
            message: `${input.attacker.getName()} uses ${input.action.itemName} and recovers ${healAmount} health.`,
            effects: ['heal'],
            actionPointsCost: 3
        };
        return result;
    }
    calculateHealAmount(input) {
        // Base healing from item + first aid skill bonus
        const baseHeal = input.action.itemEffectValue || 25;
        const skillBonus = Math.floor(input.attacker.getSkill('first_aid') * 0.1);
        return baseHeal + skillBonus;
    }
}
/**
 * Combat Action Factory
 */
export class CombatActionFactory extends RegistryFactory {
    constructor() {
        super();
        // Register default strategies
        this.register('attack', () => new AttackActionStrategy());
        this.register('heal', () => new HealActionStrategy());
    }
    createStrategyForAction(actionType) {
        // Find strategy that supports this action type
        for (const type of this.getSupportedTypes()) {
            const strategy = this.create(type);
            if (strategy.getSupportedActionTypes().includes(actionType)) {
                return strategy;
            }
        }
        return undefined;
    }
}
/**
 * Combat Event Listener
 * Handles combat-related events for logging, effects, etc.
 */
export class CombatEventListener extends AbstractEventListener {
    constructor() {
        super([
            'combat.action.executed',
            'combat.damage.dealt',
            'combat.turn.started',
            'combat.ended'
        ], 50);
    }
    async handleEvent(event) {
        switch (event.type) {
            case 'combat.action.executed':
                this.handleActionExecuted(event);
                break;
            case 'combat.damage.dealt':
                this.handleDamageDealt(event);
                break;
            case 'combat.turn.started':
                this.handleTurnStarted(event);
                break;
            case 'combat.ended':
                this.handleCombatEnded(event);
                break;
        }
    }
    handleActionExecuted(event) {
        const { action, result, attacker } = event.data;
        console.log(`Combat Action: ${attacker.getName()} performed ${action.type} - ${result.success ? 'Success' : 'Failed'}`);
    }
    handleDamageDealt(event) {
        const { attacker, target, damage } = event.data;
        console.log(`Damage: ${attacker.getName()} dealt ${damage} damage to ${target.getName()}`);
    }
    handleTurnStarted(event) {
        const { combatant, turnNumber } = event.data;
        console.log(`Turn ${turnNumber}: ${combatant.getName()}'s turn`);
    }
    handleCombatEnded(event) {
        const { result, participants } = event.data;
        console.log(`Combat ended: ${result.victory ? 'Victory' : 'Defeat'}`);
    }
}
/**
 * Combat Strategy Context Manager
 * Manages different combat strategies and their selection
 */
export class CombatStrategyManager {
    constructor() {
        this.actionContext = new StrategyContext();
        this.actionFactory = new CombatActionFactory();
        this.initializeStrategies();
    }
    async executeAction(input) {
        return await this.actionContext.execute(input);
    }
    addActionStrategy(strategy) {
        this.actionContext.addStrategy(strategy);
    }
    getAvailableStrategies() {
        return this.actionContext.getStrategies();
    }
    getStrategiesForAction(actionType) {
        return this.getAvailableStrategies().filter(strategy => strategy.getSupportedActionTypes().includes(actionType));
    }
    initializeStrategies() {
        // Add default strategies
        this.actionContext.addStrategy(new AttackActionStrategy());
        this.actionContext.addStrategy(new HealActionStrategy());
    }
}
/**
 * Combat Events
 */
export class CombatActionEvent extends BaseEvent {
    constructor(action, result, attacker, target) {
        super('combat.action.executed', { action, result, attacker, target }, 'CombatService');
    }
}
export class CombatDamageEvent extends BaseEvent {
    constructor(attacker, target, damage) {
        super('combat.damage.dealt', { attacker, target, damage }, 'CombatService');
    }
}
export class CombatTurnEvent extends BaseEvent {
    constructor(combatant, turnNumber) {
        super('combat.turn.started', { combatant, turnNumber }, 'CombatService');
    }
}
/**
 * Extension Point Registration
 * Register combat-related extension points with the global extension manager
 */
export function registerCombatExtensionPoints() {
    // This would be called during system initialization
    // Implementation depends on the ExtensionManager being available
}
// Re-export types from CombatParticipant for convenience
export { BaseCombatant } from './CombatParticipant';
//# sourceMappingURL=CombatExtensions.js.map