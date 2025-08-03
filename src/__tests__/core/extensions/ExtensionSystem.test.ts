/**
 * Extension System Tests
 * Tests for the Open/Closed Principle infrastructure
 */

import {
  PluginManager,
  BasePlugin,
  EventBus,
  BaseEvent,
  AbstractEventListener,
  RegistryFactory,
  StrategyContext,
  AbstractStrategy,
  ExtensionManager,
  GlobalExtensionManager
} from '../../../typescript/core/extensions';

import {
  CombatStrategyManager,
  AttackActionStrategy,
  HealActionStrategy,
  CombatActionFactory,
  ICombatActionInput,
  IExtendedCombatant,
  BaseCombatant
} from '../../../typescript/core/combat/CombatExtensions';

import { CombatActionType, IActionResult, ICombatAction } from '../../../typescript/core/combat/CombatTypes';

// Test Plugin Implementation
class TestPlugin extends BasePlugin {
  private initCallCount = 0;
  private destroyCallCount = 0;

  constructor() {
    super('test-plugin', 'Test Plugin', '1.0.0', 'A plugin for testing');
  }

  protected async onInitialize(): Promise<void> {
    this.initCallCount++;
  }

  protected async onDestroy(): Promise<void> {
    this.destroyCallCount++;
  }

  public getInitCallCount(): number {
    return this.initCallCount;
  }

  public getDestroyCallCount(): number {
    return this.destroyCallCount;
  }
}

// Test Event Listener
class TestEventListener extends AbstractEventListener {
  private handledEvents: string[] = [];

  constructor() {
    super(['test.event', 'test.other'], 10);
  }

  public async handleEvent(event: any): Promise<void> {
    this.handledEvents.push(event.type);
  }

  public getHandledEvents(): string[] {
    return [...this.handledEvents];
  }

  public clearHandled(): void {
    this.handledEvents = [];
  }
}

// Test Strategy
class TestStrategy extends AbstractStrategy<string, string> {
  constructor(name: string, priority: number = 0) {
    super(name, `Test strategy: ${name}`, priority);
  }

  public async execute(input: string): Promise<string> {
    return `Processed: ${input} by ${this.name}`;
  }

  public canHandle(input: string): boolean {
    return input.startsWith('test');
  }
}

// Test Combatant
class TestCombatant extends BaseCombatant {
  constructor(id: string, name: string) {
    super(id, name, 100, 100);
    
    // Set up some test skills
    this.setSkill('small_guns', 75);
    this.setSkill('strength', 60);
    this.setSkill('first_aid', 50);
    
    // Add some test items
    this.addItem('stimpak', 3);
    this.addItem('9mm_ammo', 50);
  }

  public get defence() {
    return {
      armorClass: 5,
      damageThreshold: 2,
      damageResistance: 10,
      health: this.getHealth(), // Required by IDefenceStats
      healthRegeneration: 1
    };
  }

  public getWeaponSkill(): number {
    return this.getSkill('small_guns');
  }

  public getWeaponDamage(): number {
    return 15; // Pistol damage
  }

  public getWeaponName(): string {
    return '9mm Pistol';
  }

  public getWeaponAmmoType(): string {
    return '9mm_ammo';
  }

  public getWeaponRange(): number {
    return 15;
  }
}

describe('Extension System - OCP Implementation', () => {
  describe('Plugin System', () => {
    let pluginManager: PluginManager;
    let testPlugin: TestPlugin;

    beforeEach(() => {
      pluginManager = new PluginManager();
      testPlugin = new TestPlugin();
    });

    it('should register and initialize plugins', async () => {
      pluginManager.register(testPlugin);
      
      expect(pluginManager.hasPlugin('test-plugin')).toBe(true);
      expect(testPlugin.getInitCallCount()).toBe(0);
      
      await pluginManager.initializeAll();
      
      expect(testPlugin.getInitCallCount()).toBe(1);
      expect(testPlugin.isInitialized()).toBe(true);
    });

    it('should handle plugin dependencies', async () => {
      const dependentPlugin = new class extends BasePlugin {
        constructor() {
          super('dependent', 'Dependent Plugin', '1.0.0', 'Depends on test-plugin', ['test-plugin']);
        }
        
        protected async onInitialize(): Promise<void> {
          // Implementation
        }
        
        protected async onDestroy(): Promise<void> {
          // Implementation
        }
      }();

      pluginManager.register(testPlugin);
      pluginManager.register(dependentPlugin);

      // Should initialize test-plugin first, then dependent
      await pluginManager.initializeAll();

      expect(testPlugin.isInitialized()).toBe(true);
      expect(dependentPlugin.isInitialized()).toBe(true);
    });

    it('should detect circular dependencies', () => {
      const plugin1 = new class extends BasePlugin {
        constructor() {
          super('plugin1', 'Plugin 1', '1.0.0', 'Plugin 1', ['plugin2']);
        }
        protected async onInitialize(): Promise<void> {}
        protected async onDestroy(): Promise<void> {}
      }();

      const plugin2 = new class extends BasePlugin {
        constructor() {
          super('plugin2', 'Plugin 2', '1.0.0', 'Plugin 2', ['plugin1']);
        }
        protected async onInitialize(): Promise<void> {}
        protected async onDestroy(): Promise<void> {}
      }();

      pluginManager.register(plugin1);
      pluginManager.register(plugin2);

      expect(async () => {
        await pluginManager.initializeAll();
      }).rejects.toThrow('Circular dependency detected');
    });

    it('should properly shutdown plugins', async () => {
      pluginManager.register(testPlugin);
      await pluginManager.initializeAll();
      
      expect(testPlugin.isInitialized()).toBe(true);
      
      await pluginManager.destroyAll();
      
      expect(testPlugin.getDestroyCallCount()).toBe(1);
    });
  });

  describe('Event System', () => {
    let eventBus: EventBus;
    let testListener: TestEventListener;

    beforeEach(() => {
      eventBus = new EventBus();
      testListener = new TestEventListener();
    });

    it('should subscribe and handle events', async () => {
      eventBus.subscribe(testListener);
      
      const testEvent = new BaseEvent('test.event', { data: 'test' }, 'TestSource');
      await eventBus.emit(testEvent);
      
      expect(testListener.getHandledEvents()).toContain('test.event');
    });

    it('should respect event listener priorities', async () => {
      const highPriorityListener = new class extends AbstractEventListener {
        public executionOrder: number = -1;
        private static counter = 0;

        constructor() {
          super(['priority.test'], 100);
        }

        public async handleEvent(event: any): Promise<void> {
          this.executionOrder = ++((this.constructor as any).counter);
        }
      }();

      const lowPriorityListener = new class extends AbstractEventListener {
        public executionOrder: number = -1;
        private static counter = 0;

        constructor() {
          super(['priority.test'], 1);
        }

        public async handleEvent(event: any): Promise<void> {
          this.executionOrder = ++((highPriorityListener.constructor as any).counter);
        }
      }();

      eventBus.subscribe(lowPriorityListener);
      eventBus.subscribe(highPriorityListener);

      const event = new BaseEvent('priority.test', {}, 'TestSource');
      await eventBus.emit(event);

      expect(highPriorityListener.executionOrder).toBeLessThan(lowPriorityListener.executionOrder);
    });

    it('should support cancellable events', async () => {
      const cancellingListener = new class extends AbstractEventListener {
        constructor() {
          super(['cancellable.test'], 100);
        }

        public async handleEvent(event: any): Promise<void> {
          event.cancel();
        }
      }();

      const secondListener = new class extends AbstractEventListener {
        public wasExecuted = false;

        constructor() {
          super(['cancellable.test'], 50);
        }

        public async handleEvent(event: any): Promise<void> {
          this.wasExecuted = true;
        }
      }();

      eventBus.subscribe(cancellingListener);
      eventBus.subscribe(secondListener);

      const event = new BaseEvent('cancellable.test', {}, 'TestSource', true);
      await eventBus.emit(event);

      expect(event.isCancelled()).toBe(true);
      expect(secondListener.wasExecuted).toBe(false);
    });

    it('should dispatch events with convenience method', async () => {
      eventBus.subscribe(testListener);
      
      await eventBus.dispatch('test.event', { message: 'hello' }, 'DispatchTest');
      
      expect(testListener.getHandledEvents()).toContain('test.event');
    });
  });

  describe('Factory System', () => {
    let factory: RegistryFactory<string>;

    beforeEach(() => {
      factory = new RegistryFactory<string>();
    });

    it('should register and create instances', () => {
      factory.register('test', () => 'Test Instance');
      
      expect(factory.canCreate('test')).toBe(true);
      expect(factory.create('test')).toBe('Test Instance');
    });

    it('should handle registration priorities', () => {
      factory.registerWithOptions({
        type: 'priority-test',
        creator: () => 'Low Priority',
        priority: 1
      });

      factory.registerWithOptions({
        type: 'priority-test',
        creator: () => 'High Priority',
        priority: 10
      });

      expect(factory.create('priority-test')).toBe('High Priority');
    });

    it('should track supported types', () => {
      factory.register('type1', () => 'Instance 1');
      factory.register('type2', () => 'Instance 2');
      
      const supportedTypes = factory.getSupportedTypes();
      expect(supportedTypes).toContain('type1');
      expect(supportedTypes).toContain('type2');
      expect(supportedTypes).toHaveLength(2);
    });

    it('should throw error for unknown types', () => {
      expect(() => {
        factory.create('unknown');
      }).toThrow('No creator registered for type: unknown');
    });
  });

  describe('Strategy System', () => {
    let strategyContext: StrategyContext<string, string>;

    beforeEach(() => {
      strategyContext = new StrategyContext<string, string>();
    });

    it('should execute appropriate strategy based on input', async () => {
      const strategy1 = new TestStrategy('strategy1', 10);
      const strategy2 = new class extends AbstractStrategy<string, string> {
        constructor() {
          super('strategy2', 'Test strategy 2', 5);
        }

        public async execute(input: string): Promise<string> {
          return `Alternative: ${input}`;
        }

        public canHandle(input: string): boolean {
          return input.startsWith('alt');
        }
      }();

      strategyContext.addStrategy(strategy1);
      strategyContext.addStrategy(strategy2);

      const result1 = await strategyContext.execute('test-input');
      expect(result1).toBe('Processed: test-input by strategy1');

      const result2 = await strategyContext.execute('alt-input');
      expect(result2).toBe('Alternative: alt-input');
    });

    it('should select strategy by priority when multiple can handle', async () => {
      const highPriorityStrategy = new TestStrategy('high-priority', 100);
      const lowPriorityStrategy = new TestStrategy('low-priority', 1);

      strategyContext.addStrategy(lowPriorityStrategy);
      strategyContext.addStrategy(highPriorityStrategy);

      const result = await strategyContext.execute('test-input');
      expect(result).toContain('high-priority');
    });

    it('should execute specific strategy by name', async () => {
      const strategy1 = new TestStrategy('strategy1');
      const strategy2 = new TestStrategy('strategy2');

      strategyContext.addStrategy(strategy1);
      strategyContext.addStrategy(strategy2);

      const result = await strategyContext.executeWith('strategy2', 'test-input');
      expect(result).toContain('strategy2');
    });

    it('should throw error when no applicable strategy found', async () => {
      const strategy = new class extends AbstractStrategy<string, string> {
        constructor() {
          super('limited', 'Limited strategy', 0);
        }

        public async execute(input: string): Promise<string> {
          return input;
        }

        public canHandle(input: string): boolean {
          return input === 'specific';
        }
      }();

      strategyContext.addStrategy(strategy);

      await expect(strategyContext.execute('other-input')).rejects.toThrow('No applicable strategy found');
    });
  });

  describe('Combat Extension System', () => {
    let attacker: TestCombatant;
    let target: TestCombatant;
    let combatManager: CombatStrategyManager;

    beforeEach(() => {
      attacker = new TestCombatant('attacker-1', 'Test Attacker');
      target = new TestCombatant('target-1', 'Test Target');
      combatManager = new CombatStrategyManager();
    });

    it('should execute attack actions', async () => {
      const attackAction: ICombatAction = {
        type: CombatActionType.ATTACK,
        id: 'basic-attack'
      };

      const input: ICombatActionInput = {
        action: attackAction,
        attacker,
        target,
        context: {
          turnNumber: 1,
          environment: {
            lighting: 'normal',
            weather: 'clear',
            terrain: 'open',
            coverAvailable: false,
            distanceModifier: 0
          },
          modifiers: [],
          rng: () => 0.5 // Fixed random for testing
        }
      };

      const result = await combatManager.executeAction(input);

      expect(result).toBeDefined();
      expect(result.actionPointsCost).toBeGreaterThan(0);
      expect(result.message).toContain(attacker.getName());
      expect(result.message).toContain(target.getName());
    });

    it('should execute healing actions', async () => {
      const healAction: ICombatAction = {
        type: CombatActionType.USE_ITEM,
        id: 'heal-action',
        itemType: 'healing',
        itemName: 'Stimpak',
        itemEffectValue: 25
      };

      const input: ICombatActionInput = {
        action: healAction,
        attacker,
        context: {
          turnNumber: 1,
          environment: {
            lighting: 'normal',
            weather: 'clear',
            terrain: 'open',
            coverAvailable: false,
            distanceModifier: 0
          },
          modifiers: [],
          rng: () => 0.5
        }
      };

      const result = await combatManager.executeAction(input);

      expect(result.success).toBe(true);
      expect(result.damage).toBeLessThan(0); // Negative damage = healing
      expect(result.message).toContain('recovers');
      expect(result.effects).toContain('heal');
    });

    it('should support adding custom combat strategies', async () => {
      const customStrategy = new class extends AbstractStrategy<ICombatActionInput, IActionResult> {
        constructor() {
          super('custom-action', 'Custom combat action', 50);
        }

        public async execute(input: ICombatActionInput): Promise<IActionResult> {
          return {
            success: true,
            damage: 0,
            message: 'Custom action executed',
            effects: ['custom'],
            actionPointsCost: 2
          };
        }

        public canHandle(input: ICombatActionInput): boolean {
          return input.action.type === 'custom' as any;
        }

        public getSupportedActionTypes() {
          return ['custom' as any];
        }

        public calculateSuccessProbability(input: ICombatActionInput): number {
          return 1.0;
        }

        public getActionRequirements(input: ICombatActionInput) {
          return {
            actionPoints: 2,
            minRange: 0,
            maxRange: 1
          };
        }

        public canPerformAction(input: ICombatActionInput): boolean {
          return true;
        }
      }();

      combatManager.addActionStrategy(customStrategy as any);

      const customAction: ICombatAction = {
        type: 'custom' as any,
        id: 'custom-test'
      };

      const input: ICombatActionInput = {
        action: customAction,
        attacker,
        context: {
          turnNumber: 1,
          environment: {
            lighting: 'normal',
            weather: 'clear',
            terrain: 'open',
            coverAvailable: false,
            distanceModifier: 0
          },
          modifiers: [],
          rng: () => 0.5
        }
      };

      const result = await combatManager.executeAction(input);

      expect(result.message).toBe('Custom action executed');
      expect(result.effects).toContain('custom');
    });

    it('should handle environmental modifiers', async () => {
      const attackStrategy = new AttackActionStrategy();

      const input: ICombatActionInput = {
        action: { type: CombatActionType.ATTACK, id: 'env-test' },
        attacker,
        target,
        context: {
          turnNumber: 1,
          environment: {
            lighting: 'dark',
            weather: 'fog',
            terrain: 'forest',
            coverAvailable: true,
            distanceModifier: -2
          },
          modifiers: [],
          rng: () => 0.5
        }
      };

      const probability = attackStrategy.calculateSuccessProbability(input);

      // Dark lighting (-20) + fog (-15) should reduce hit chance
      expect(probability).toBeLessThan(0.75); // Base skill of 75% minus penalties
    });
  });

  describe('Extension Manager Integration', () => {
    let extensionManager: ExtensionManager;

    beforeEach(() => {
      extensionManager = new ExtensionManager();
    });

    it('should coordinate all extension systems', async () => {
      const testPlugin = new TestPlugin();
      const testListener = new TestEventListener();

      // Register plugin
      extensionManager.getPluginManager().register(testPlugin);
      
      // Register event listener
      extensionManager.getEventBus().subscribe(testListener);

      // Initialize system
      await extensionManager.initialize();

      expect(testPlugin.isInitialized()).toBe(true);
      expect(extensionManager.isInitialized()).toBe(true);

      // Test event flow
      await extensionManager.getEventBus().dispatch('test.event', { data: 'test' }, 'IntegrationTest');
      
      expect(testListener.getHandledEvents()).toContain('test.event');
    });

    it('should register and manage extension points', () => {
      const extensionPoint = {
        id: 'test.extension',
        name: 'Test Extension Point',
        description: 'A test extension point',
        contract: 'ITestExtension',
        type: 'custom' as any
      };

      extensionManager.registerExtensionPoint(extensionPoint);

      expect(extensionManager.hasExtensionPoint('test.extension')).toBe(true);
      expect(extensionManager.getExtensionPoints()).toContainEqual(extensionPoint);
    });

    it('should demonstrate Open/Closed Principle compliance', async () => {
      // System should be open for extension
      const customPlugin = new class extends BasePlugin {
        constructor() {
          super('custom-plugin', 'Custom Plugin', '1.0.0', 'Custom functionality');
        }

        protected async onInitialize(): Promise<void> {
          // Custom initialization
        }

        protected async onDestroy(): Promise<void> {
          // Custom cleanup
        }
      }();

      const customStrategy = new TestStrategy('custom-strategy', 100);
      const customFactory = new RegistryFactory<string>();

      // Extend system without modifying existing code
      extensionManager.getPluginManager().register(customPlugin);
      extensionManager.getStrategyRegistry().registerStrategy('custom-domain', customStrategy);
      extensionManager.getFactoryManager().registerExtensionFactory('custom.factory', customFactory);

      await extensionManager.initialize();

      // Verify extensions are working
      expect(customPlugin.isInitialized()).toBe(true);
      expect(extensionManager.getStrategyRegistry().getDomains()).toContain('custom-domain');
      
      // System should be closed for modification - existing functionality unchanged
      expect(extensionManager.isInitialized()).toBe(true);
    });
  });

  describe('OCP Compliance Validation', () => {
    it('should allow adding new combat actions without modifying existing code', () => {
      const originalStrategies = new CombatStrategyManager().getAvailableStrategies();
      const originalCount = originalStrategies.length;

      // Add new strategy type without modifying existing strategies
      const newStrategy = new class extends AbstractStrategy<ICombatActionInput, IActionResult> {
        constructor() {
          super('new-combat-action', 'New Combat Action', 75);
        }

        public async execute(input: ICombatActionInput): Promise<IActionResult> {
          return {
            success: true,
            damage: 20,
            message: 'New action executed',
            effects: ['new'],
            actionPointsCost: 3
          };
        }

        public canHandle(input: ICombatActionInput): boolean {
          return input.action.type === 'new' as any;
        }

        public getSupportedActionTypes() {
          return ['new' as any];
        }

        public calculateSuccessProbability(): number {
          return 0.8;
        }

        public getActionRequirements() {
          return {
            actionPoints: 3,
            minRange: 0,
            maxRange: 5
          };
        }

        public canPerformAction(): boolean {
          return true;
        }
      }();

      const manager = new CombatStrategyManager();
      manager.addActionStrategy(newStrategy as any);

      // Verify extension without modification
      expect(manager.getAvailableStrategies().length).toBe(originalCount + 1);
      expect(manager.getAvailableStrategies()).toContain(newStrategy);

      // Original strategies should be unmodified
      const originalNames = originalStrategies.map(s => s.name);
      const currentOriginals = manager.getAvailableStrategies()
        .filter(s => originalNames.includes(s.name));
      
      expect(currentOriginals.length).toBe(originalCount);
    });

    it('should support plugin extension without core modification', async () => {
      const extensionManager = new ExtensionManager();
      
      // Create plugin that extends functionality
      const extensionPlugin = new class extends BasePlugin {
        private features: string[] = [];

        constructor() {
          super('extension-demo', 'Extension Demo', '1.0.0', 'Demonstrates extensibility');
        }

        protected async onInitialize(): Promise<void> {
          this.features.push('feature-1');
          this.features.push('feature-2');
        }

        protected async onDestroy(): Promise<void> {
          this.features = [];
        }

        public getFeatures(): string[] {
          return [...this.features];
        }
      }();

      extensionManager.getPluginManager().register(extensionPlugin);
      await extensionManager.initialize();

      // Verify extension works
      expect(extensionPlugin.isInitialized()).toBe(true);
      expect(extensionPlugin.getFeatures()).toEqual(['feature-1', 'feature-2']);

      // Core system remains unmodified
      expect(extensionManager.isInitialized()).toBe(true);
      expect(extensionManager.getPluginManager().hasPlugin('extension-demo')).toBe(true);
    });
  });
});
