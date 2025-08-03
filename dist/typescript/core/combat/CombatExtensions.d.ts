/**
 * Combat Extension System
 * Implements Open/Closed Principle for combat mechanics
 */
import { IStrategy, AbstractStrategy, RegistryFactory, AbstractEventListener, IEvent, BaseEvent } from '../extensions';
import { ICombatAction, CombatActionType, IActionResult } from './CombatTypes';
import { IExtendedCombatant } from './CombatParticipant';
/**
 * Combat Action Strategy Interface
 * Defines how different combat actions are executed
 */
export interface ICombatActionStrategy extends IStrategy<ICombatActionInput, IActionResult> {
    /** Get supported combat action types */
    getSupportedActionTypes(): CombatActionType[];
    /** Calculate action success probability */
    calculateSuccessProbability(input: ICombatActionInput): number;
    /** Get action requirements (AP, ammo, etc.) */
    getActionRequirements(input: ICombatActionInput): ICombatActionRequirements;
    /** Validate if action can be performed */
    canPerformAction(input: ICombatActionInput): boolean;
}
/**
 * Combat Action Input
 */
export interface ICombatActionInput {
    /** The combat action to execute */
    action: ICombatAction;
    /** The attacker performing the action */
    attacker: IExtendedCombatant;
    /** The target of the action (if applicable) */
    target?: IExtendedCombatant;
    /** Additional context data */
    context: ICombatContext;
}
/**
 * Combat Context
 */
export interface ICombatContext {
    /** Turn number */
    turnNumber: number;
    /** Environmental factors */
    environment: ICombatEnvironment;
    /** Active combat modifiers */
    modifiers: ICombatModifier[];
    /** Random number generator */
    rng: () => number;
}
/**
 * Combat Environment
 */
export interface ICombatEnvironment {
    /** Lighting conditions */
    lighting: 'bright' | 'normal' | 'dim' | 'dark';
    /** Weather conditions */
    weather: 'clear' | 'rain' | 'fog' | 'storm';
    /** Terrain type */
    terrain: 'open' | 'urban' | 'forest' | 'mountain' | 'desert';
    /** Cover availability */
    coverAvailable: boolean;
    /** Distance modifier */
    distanceModifier: number;
}
/**
 * Combat Modifier
 */
export interface ICombatModifier {
    /** Modifier ID */
    id: string;
    /** Modifier name */
    name: string;
    /** Affected attributes */
    affects: string[];
    /** Modifier value */
    value: number;
    /** Modifier type */
    type: 'bonus' | 'penalty' | 'multiplier';
    /** Duration in turns (-1 for permanent) */
    duration: number;
}
/**
 * Action Requirements
 */
export interface ICombatActionRequirements {
    /** Action points required */
    actionPoints: number;
    /** Minimum range */
    minRange: number;
    /** Maximum range */
    maxRange: number;
    /** Ammunition required */
    ammunition?: {
        type: string;
        amount: number;
    };
    /** Minimum stats required */
    minimumStats?: {
        [statName: string]: number;
    };
    /** Special requirements */
    specialRequirements?: string[];
}
/**
 * Attack Action Strategy
 */
export declare class AttackActionStrategy extends AbstractStrategy<ICombatActionInput, IActionResult> implements ICombatActionStrategy {
    constructor();
    getSupportedActionTypes(): CombatActionType[];
    canHandle(input: ICombatActionInput): boolean;
    canPerformAction(input: ICombatActionInput): boolean;
    calculateSuccessProbability(input: ICombatActionInput): number;
    getActionRequirements(input: ICombatActionInput): ICombatActionRequirements;
    execute(input: ICombatActionInput): Promise<IActionResult>;
    private calculateDistance;
    private calculateEnvironmentalModifier;
    private calculateDamage;
    private generateMessage;
}
/**
 * Healing Action Strategy
 */
export declare class HealActionStrategy extends AbstractStrategy<ICombatActionInput, IActionResult> implements ICombatActionStrategy {
    constructor();
    getSupportedActionTypes(): CombatActionType[];
    canHandle(input: ICombatActionInput): boolean;
    canPerformAction(input: ICombatActionInput): boolean;
    calculateSuccessProbability(input: ICombatActionInput): number;
    getActionRequirements(input: ICombatActionInput): ICombatActionRequirements;
    execute(input: ICombatActionInput): Promise<IActionResult>;
    private calculateHealAmount;
}
/**
 * Combat Action Factory
 */
export declare class CombatActionFactory extends RegistryFactory<ICombatActionStrategy> {
    constructor();
    createStrategyForAction(actionType: CombatActionType): ICombatActionStrategy | undefined;
}
/**
 * Combat Event Listener
 * Handles combat-related events for logging, effects, etc.
 */
export declare class CombatEventListener extends AbstractEventListener {
    constructor();
    handleEvent(event: IEvent): Promise<void>;
    private handleActionExecuted;
    private handleDamageDealt;
    private handleTurnStarted;
    private handleCombatEnded;
}
/**
 * Combat Strategy Context Manager
 * Manages different combat strategies and their selection
 */
export declare class CombatStrategyManager {
    private actionContext;
    private actionFactory;
    constructor();
    executeAction(input: ICombatActionInput): Promise<IActionResult>;
    addActionStrategy(strategy: ICombatActionStrategy): void;
    getAvailableStrategies(): ICombatActionStrategy[];
    getStrategiesForAction(actionType: CombatActionType): ICombatActionStrategy[];
    private initializeStrategies;
}
/**
 * Combat Events
 */
export declare class CombatActionEvent extends BaseEvent {
    constructor(action: ICombatAction, result: IActionResult, attacker: IExtendedCombatant, target?: IExtendedCombatant);
}
export declare class CombatDamageEvent extends BaseEvent {
    constructor(attacker: IExtendedCombatant, target: IExtendedCombatant, damage: number);
}
export declare class CombatTurnEvent extends BaseEvent {
    constructor(combatant: IExtendedCombatant, turnNumber: number);
}
/**
 * Extension Point Registration
 * Register combat-related extension points with the global extension manager
 */
export declare function registerCombatExtensionPoints(): void;
export { IExtendedCombatant, BaseCombatant } from './CombatParticipant';
