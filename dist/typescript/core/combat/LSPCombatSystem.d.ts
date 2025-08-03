/**
 * LSP-Compliant Combat System
 * Demonstrates Liskov Substitution Principle with polymorphic combat entities
 */
/**
 * Combat Result Interface
 * Standardized result format for all combat operations
 */
export interface ICombatResult {
    /** Success status of the operation */
    readonly success: boolean;
    /** Damage dealt (if applicable) */
    readonly damage: number;
    /** Critical hit flag */
    readonly critical: boolean;
    /** Status effects applied */
    readonly statusEffects: string[];
    /** Combat message */
    readonly message: string;
    /** Additional metadata */
    readonly metadata: Record<string, any>;
}
/**
 * Combat Status Interface
 * Standardized status information for combat entities
 */
export interface ICombatStatus {
    /** Current health points */
    readonly health: number;
    /** Maximum health points */
    readonly maxHealth: number;
    /** Combat readiness flag */
    readonly canAct: boolean;
    /** Active status effects */
    readonly statusEffects: string[];
    /** Combat statistics */
    readonly stats: {
        readonly strength: number;
        readonly defense: number;
        readonly agility: number;
        readonly accuracy: number;
    };
}
/**
 * Combat Action Interface
 * Standardized action format for combat operations
 */
export interface ICombatAction {
    /** Action type identifier */
    readonly type: string;
    /** Action intensity/power */
    readonly intensity: number;
    /** Target specification */
    readonly target?: any;
    /** Action metadata */
    readonly metadata: Record<string, any>;
}
/**
 * Abstract Base Combat Entity
 *
 * LSP Contract:
 * - All subclasses must be substitutable for this base class
 * - Methods must honor the same preconditions and postconditions
 * - Behavioral contracts must be preserved
 */
export declare abstract class CombatEntity {
    protected _health: number;
    protected _maxHealth: number;
    protected _statusEffects: string[];
    protected _stats: {
        strength: number;
        defense: number;
        agility: number;
        accuracy: number;
    };
    constructor(maxHealth: number, stats: ICombatStatus['stats']);
    /**
     * Perform an attack action
     *
     * LSP Contract:
     * - Precondition: target must be a valid CombatEntity, this entity must be alive
     * - Postcondition: returns valid ICombatResult, may modify target's health
     * - Invariant: this entity's state remains valid
     */
    abstract attack(target: CombatEntity): ICombatResult;
    /**
     * Take damage from an attack
     *
     * LSP Contract:
     * - Precondition: damage must be non-negative
     * - Postcondition: health is reduced by at most the damage amount
     * - Invariant: health never goes below 0
     */
    takeDamage(damage: number): ICombatResult;
    /**
     * Check if entity is alive
     *
     * LSP Contract:
     * - Postcondition: returns true if health > 0, false otherwise
     * - Pure function: no side effects
     */
    isAlive(): boolean;
    /**
     * Get current combat status
     *
     * LSP Contract:
     * - Postcondition: returns valid ICombatStatus with current state
     * - Pure function: no side effects
     */
    getStatus(): ICombatStatus;
    /**
     * Apply a status effect
     *
     * LSP Contract:
     * - Precondition: effect must be a valid string
     * - Postcondition: effect is added to statusEffects if not already present
     */
    applyStatusEffect(effect: string): void;
    /**
     * Remove a status effect
     *
     * LSP Contract:
     * - Precondition: effect must be a valid string
     * - Postcondition: effect is removed from statusEffects if present
     */
    removeStatusEffect(effect: string): void;
    /**
     * Heal the entity
     *
     * LSP Contract:
     * - Precondition: healAmount must be non-negative
     * - Postcondition: health is increased by at most healAmount, never exceeds maxHealth
     * - Invariant: health <= maxHealth
     */
    heal(healAmount: number): ICombatResult;
    /**
     * Get entity name for display purposes
     * Abstract method that subclasses must implement
     */
    abstract getName(): string;
    /**
     * Check if this entity can perform the given action
     *
     * LSP Contract:
     * - Precondition: action must be a valid ICombatAction
     * - Postcondition: returns boolean indicating action validity
     * - Pure function: no side effects
     */
    canPerformAction(action: ICombatAction): boolean;
    /**
     * Get the entity's effective stats considering status effects
     *
     * LSP Contract:
     * - Postcondition: returns modified stats based on current status effects
     * - Pure function: no side effects
     */
    getEffectiveStats(): ICombatStatus['stats'];
    /**
     * Calculate damage for an attack action
     * Protected method for subclasses to use in attack implementations
     *
     * LSP Contract:
     * - Precondition: action must be valid attack action
     * - Postcondition: returns non-negative damage value
     */
    protected calculateDamage(action: ICombatAction): number;
    /**
     * Calculate hit chance for an attack action
     * Protected method for subclasses to use in attack implementations
     *
     * LSP Contract:
     * - Precondition: target must be valid CombatEntity, action must be valid
     * - Postcondition: returns value between 0 and 1
     */
    protected calculateHitChance(target: CombatEntity, action: ICombatAction): number;
    /**
     * Determine if an attack is critical
     * Protected method for subclasses to use in attack implementations
     *
     * LSP Contract:
     * - Postcondition: returns boolean based on random chance
     */
    protected isCriticalHit(): boolean;
}
/**
 * Player Combat Entity Implementation
 * Must maintain LSP compliance with CombatEntity
 */
export declare class PlayerCombatant extends CombatEntity {
    private playerName;
    private experience;
    private level;
    constructor(playerName: string, maxHealth: number, stats: ICombatStatus['stats']);
    getName(): string;
    /**
     * Player attack implementation
     * Maintains LSP contract with potential for critical hits and experience gain
     */
    attack(target: CombatEntity): ICombatResult;
    /**
     * Player-specific method: gain experience
     * Doesn't break LSP as it's an additional capability
     */
    gainExperience(amount: number): void;
    getLevel(): number;
    getExperience(): number;
}
/**
 * Enemy Combat Entity Implementation
 * Must maintain LSP compliance with CombatEntity
 */
export declare class EnemyCombatant extends CombatEntity {
    private enemyType;
    private aggressionLevel;
    private rewardExp;
    constructor(enemyType: string, maxHealth: number, stats: ICombatStatus['stats'], aggressionLevel?: number, rewardExp?: number);
    getName(): string;
    /**
     * Enemy attack implementation
     * Maintains LSP contract with AI-driven behavior
     */
    attack(target: CombatEntity): ICombatResult;
    /**
     * Enemy-specific method: get reward experience
     * Doesn't break LSP as it's an additional capability
     */
    getRewardExperience(): number;
    /**
     * Enemy-specific method: increase aggression
     * Doesn't break LSP as it's an additional capability
     */
    increaseAggression(amount: number): void;
}
/**
 * NPC Combat Entity Implementation
 * Must maintain LSP compliance with CombatEntity
 */
export declare class NPCCombatant extends CombatEntity {
    private npcName;
    private faction;
    private isHostile;
    constructor(npcName: string, faction: string, maxHealth: number, stats: ICombatStatus['stats'], isHostile?: boolean);
    getName(): string;
    /**
     * NPC attack implementation
     * Maintains LSP contract with faction-based behavior
     */
    attack(target: CombatEntity): ICombatResult;
    /**
     * NPC-specific method: set hostility
     * Doesn't break LSP as it's an additional capability
     */
    setHostile(hostile: boolean): void;
    getFaction(): string;
    getIsHostile(): boolean;
}
