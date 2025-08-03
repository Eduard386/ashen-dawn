/**
 * Combat Extension System
 * Implements Open/Closed Principle for combat mechanics
 */

import { 
  IStrategy, 
  AbstractStrategy, 
  IStrategyContext, 
  StrategyContext,
  IFactory,
  RegistryFactory,
  IEventListener,
  AbstractEventListener,
  IEvent,
  BaseEvent
} from '../extensions';

import { 
  ICombatAction, 
  CombatActionType, 
  IActionResult 
} from './CombatTypes';

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
export class AttackActionStrategy extends AbstractStrategy<ICombatActionInput, IActionResult> implements ICombatActionStrategy {
  constructor() {
    super(
      'attack_strategy',
      'Standard attack action strategy',
      100 // High priority for basic attacks
    );
  }

  public getSupportedActionTypes(): CombatActionType[] {
    return [CombatActionType.ATTACK, CombatActionType.AIMED_SHOT];
  }

  public canHandle(input: ICombatActionInput): boolean {
    return this.getSupportedActionTypes().includes(input.action.type);
  }

  public canPerformAction(input: ICombatActionInput): boolean {
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

  public calculateSuccessProbability(input: ICombatActionInput): number {
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

  public getActionRequirements(input: ICombatActionInput): ICombatActionRequirements {
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

  public async execute(input: ICombatActionInput): Promise<IActionResult> {
    const probability = this.calculateSuccessProbability(input);
    const isHit = input.context.rng() < probability;
    
    const result: IActionResult = {
      success: isHit,
      damage: isHit ? this.calculateDamage(input) : 0,
      message: this.generateMessage(input, isHit),
      effects: [],
      actionPointsCost: this.getActionRequirements(input).actionPoints
    };
    
    return result;
  }

  private calculateDistance(attacker: IExtendedCombatant, target: IExtendedCombatant): number {
    // Use the built-in distance calculation
    return attacker.getDistanceTo(target);
  }

  private calculateEnvironmentalModifier(environment: ICombatEnvironment): number {
    let modifier = 0;
    
    // Lighting modifiers
    switch (environment.lighting) {
      case 'bright': modifier += 10; break;
      case 'normal': modifier += 0; break;
      case 'dim': modifier -= 10; break;
      case 'dark': modifier -= 20; break;
    }
    
    // Weather modifiers
    switch (environment.weather) {
      case 'clear': modifier += 0; break;
      case 'rain': modifier -= 5; break;
      case 'fog': modifier -= 15; break;
      case 'storm': modifier -= 10; break;
    }
    
    return modifier;
  }

  private calculateDamage(input: ICombatActionInput): number {
    const baseDamage = input.attacker.getWeaponDamage();
    const damageBonus = input.attacker.getDamageBonus();
    
    // Random damage variance (80% to 120% of base)
    const variance = 0.8 + (input.context.rng() * 0.4);
    
    return Math.floor((baseDamage + damageBonus) * variance);
  }

  private generateMessage(input: ICombatActionInput, isHit: boolean): string {
    const attackerName = input.attacker.getName();
    const targetName = input.target?.getName() || 'unknown target';
    const weaponName = input.attacker.getWeaponName();
    
    if (isHit) {
      return `${attackerName} hits ${targetName} with ${weaponName}!`;
    } else {
      return `${attackerName} misses ${targetName} with ${weaponName}.`;
    }
  }
}

/**
 * Healing Action Strategy
 */
export class HealActionStrategy extends AbstractStrategy<ICombatActionInput, IActionResult> implements ICombatActionStrategy {
  constructor() {
    super(
      'heal_strategy',
      'Healing action strategy',
      80
    );
  }

  public getSupportedActionTypes(): CombatActionType[] {
    return [CombatActionType.USE_ITEM]; // Assuming healing items
  }

  public canHandle(input: ICombatActionInput): boolean {
    return input.action.type === CombatActionType.USE_ITEM && 
           input.action.itemType === 'healing';
  }

  public canPerformAction(input: ICombatActionInput): boolean {
    const requirements = this.getActionRequirements(input);
    return input.attacker.getCurrentAP() >= requirements.actionPoints;
  }

  public calculateSuccessProbability(input: ICombatActionInput): number {
    // Healing items generally have high success rate
    return 0.9;
  }

  public getActionRequirements(input: ICombatActionInput): ICombatActionRequirements {
    return {
      actionPoints: 3,
      minRange: 0,
      maxRange: 0, // Self-use only
    };
  }

  public async execute(input: ICombatActionInput): Promise<IActionResult> {
    const healAmount = this.calculateHealAmount(input);
    
    const result: IActionResult = {
      success: true,
      damage: -healAmount, // Negative damage = healing
      message: `${input.attacker.getName()} uses ${input.action.itemName} and recovers ${healAmount} health.`,
      effects: ['heal'],
      actionPointsCost: 3
    };
    
    return result;
  }

  private calculateHealAmount(input: ICombatActionInput): number {
    // Base healing from item + first aid skill bonus
    const baseHeal = input.action.itemEffectValue || 25;
    const skillBonus = Math.floor(input.attacker.getSkill('first_aid') * 0.1);
    
    return baseHeal + skillBonus;
  }
}

/**
 * Combat Action Factory
 */
export class CombatActionFactory extends RegistryFactory<ICombatActionStrategy> {
  constructor() {
    super();
    
    // Register default strategies
    this.register('attack', () => new AttackActionStrategy());
    this.register('heal', () => new HealActionStrategy());
  }
  
  public createStrategyForAction(actionType: CombatActionType): ICombatActionStrategy | undefined {
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

  public async handleEvent(event: IEvent): Promise<void> {
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

  private handleActionExecuted(event: IEvent): void {
    const { action, result, attacker } = event.data;
    console.log(`Combat Action: ${attacker.getName()} performed ${action.type} - ${result.success ? 'Success' : 'Failed'}`);
  }

  private handleDamageDealt(event: IEvent): void {
    const { attacker, target, damage } = event.data;
    console.log(`Damage: ${attacker.getName()} dealt ${damage} damage to ${target.getName()}`);
  }

  private handleTurnStarted(event: IEvent): void {
    const { combatant, turnNumber } = event.data;
    console.log(`Turn ${turnNumber}: ${combatant.getName()}'s turn`);
  }

  private handleCombatEnded(event: IEvent): void {
    const { result, participants } = event.data;
    console.log(`Combat ended: ${result.victory ? 'Victory' : 'Defeat'}`);
  }
}

/**
 * Combat Strategy Context Manager
 * Manages different combat strategies and their selection
 */
export class CombatStrategyManager {
  private actionContext: IStrategyContext<ICombatActionInput, IActionResult>;
  private actionFactory: CombatActionFactory;

  constructor() {
    this.actionContext = new StrategyContext<ICombatActionInput, IActionResult>();
    this.actionFactory = new CombatActionFactory();
    
    this.initializeStrategies();
  }

  public async executeAction(input: ICombatActionInput): Promise<IActionResult> {
    return await this.actionContext.execute(input);
  }

  public addActionStrategy(strategy: ICombatActionStrategy): void {
    this.actionContext.addStrategy(strategy);
  }

  public getAvailableStrategies(): ICombatActionStrategy[] {
    return this.actionContext.getStrategies() as ICombatActionStrategy[];
  }

  public getStrategiesForAction(actionType: CombatActionType): ICombatActionStrategy[] {
    return this.getAvailableStrategies().filter(strategy => 
      strategy.getSupportedActionTypes().includes(actionType)
    );
  }

  private initializeStrategies(): void {
    // Add default strategies
    this.actionContext.addStrategy(new AttackActionStrategy());
    this.actionContext.addStrategy(new HealActionStrategy());
  }
}

/**
 * Combat Events
 */
export class CombatActionEvent extends BaseEvent {
  constructor(
    action: ICombatAction,
    result: IActionResult,
    attacker: IExtendedCombatant,
    target?: IExtendedCombatant
  ) {
    super(
      'combat.action.executed',
      { action, result, attacker, target },
      'CombatService'
    );
  }
}

export class CombatDamageEvent extends BaseEvent {
  constructor(attacker: IExtendedCombatant, target: IExtendedCombatant, damage: number) {
    super(
      'combat.damage.dealt',
      { attacker, target, damage },
      'CombatService'
    );
  }
}

export class CombatTurnEvent extends BaseEvent {
  constructor(combatant: IExtendedCombatant, turnNumber: number) {
    super(
      'combat.turn.started',
      { combatant, turnNumber },
      'CombatService'
    );
  }
}

/**
 * Extension Point Registration
 * Register combat-related extension points with the global extension manager
 */
export function registerCombatExtensionPoints(): void {
  // This would be called during system initialization
  // Implementation depends on the ExtensionManager being available
}

// Re-export types from CombatParticipant for convenience
export { IExtendedCombatant, BaseCombatant } from './CombatParticipant';
