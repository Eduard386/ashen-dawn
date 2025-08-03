/**
 * Combat Types and Interfaces
 * Defines the core data structures for the combat system
 */
/**
 * Combat Action Types
 */
export declare enum CombatActionType {
    ATTACK = "attack",
    AIMED_SHOT = "aimed_shot",
    BURST_FIRE = "burst_fire",
    USE_ITEM = "use_item",
    MOVE = "move",
    RELOAD = "reload",
    THROW_GRENADE = "throw_grenade",
    USE_SKILL = "use_skill",
    DEFEND = "defend",
    RUN_AWAY = "run_away"
}
/**
 * Combat Action Interface
 */
export interface ICombatAction {
    /** Action type */
    type: CombatActionType;
    /** Action identifier */
    id: string;
    /** Target position or entity ID (optional) */
    target?: string | {
        x: number;
        y: number;
    };
    /** Item being used (for USE_ITEM actions) */
    itemId?: string;
    /** Item name for display */
    itemName?: string;
    /** Item type (healing, weapon, etc.) */
    itemType?: string;
    /** Effect value for items */
    itemEffectValue?: number;
    /** Weapon being used (for attack actions) */
    weaponId?: string;
    /** Skill being used (for USE_SKILL actions) */
    skillId?: string;
    /** Additional parameters */
    parameters?: Record<string, any>;
}
/**
 * Action Result Interface
 */
export interface IActionResult {
    /** Whether the action succeeded */
    success: boolean;
    /** Damage dealt (negative for healing) */
    damage: number;
    /** Result message */
    message: string;
    /** Special effects applied */
    effects: string[];
    /** Action points consumed */
    actionPointsCost: number;
    /** Critical hit flag */
    isCritical?: boolean;
    /** Additional result data */
    metadata?: Record<string, any>;
}
/**
 * Combat Turn Order
 */
export interface ICombatTurnOrder {
    /** Combatant identifier */
    combatantId: string;
    /** Initiative value */
    initiative: number;
    /** Current action points */
    actionPoints: number;
    /** Maximum action points per turn */
    maxActionPoints: number;
}
/**
 * Combat State
 */
export interface ICombatState {
    /** Combat ID */
    id: string;
    /** Current turn number */
    turnNumber: number;
    /** Turn order */
    turnOrder: ICombatTurnOrder[];
    /** Current active combatant index */
    currentTurnIndex: number;
    /** Combat participants */
    participants: string[];
    /** Whether combat is active */
    isActive: boolean;
    /** Combat start time */
    startTime: number;
    /** Combat end time (if finished) */
    endTime?: number;
}
/**
 * Combat Victory Condition
 */
export interface ICombatVictoryCondition {
    /** Condition type */
    type: 'eliminate_all' | 'survive_turns' | 'reach_position' | 'custom';
    /** Condition parameters */
    parameters: Record<string, any>;
    /** Check if condition is met */
    check(state: ICombatState): boolean;
}
/**
 * Combat Encounter Configuration
 */
export interface ICombatEncounter {
    /** Encounter ID */
    id: string;
    /** Encounter name */
    name: string;
    /** Enemy composition */
    enemies: Array<{
        id: string;
        count: number;
        level?: number;
    }>;
    /** Environment settings */
    environment: {
        terrain: string;
        lighting: string;
        weather: string;
    };
    /** Victory conditions */
    victoryConditions: ICombatVictoryCondition[];
    /** Rewards */
    rewards: {
        experience: number;
        items: Array<{
            id: string;
            quantity: number;
            chance: number;
        }>;
        caps: number;
    };
}
