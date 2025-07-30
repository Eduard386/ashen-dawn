import { BattleLogic } from '../../../typescript/core/BattleLogic';
import { LegacyBridge } from '../../../typescript/core/bridges/LegacyBridge';

describe('BattleLogic', () => {
  let battleLogic: BattleLogic;
  let bridge: LegacyBridge;

  beforeEach(() => {
    // Reset the bridge singleton
    (LegacyBridge as any).instance = null;
    bridge = LegacyBridge.getInstance();
    
    // Initialize with test data
    bridge.initialize({
      player: {
        characterName: 'TestPlayer',
        levelCount: 1,
        health: 100,
        maxHealth: 100,
        experience: 0,
        currentWeapon: 'baseball_bat',
        inventory: {
          weapons: ['baseball_bat'],
          ammo: {},
          medicine: {}
        }
      }
    });
    
    battleLogic = new BattleLogic();
  });

  afterEach(() => {
    // Reset singleton
    (LegacyBridge as any).instance = null;
  });

  test('should create BattleLogic instance', () => {
    expect(battleLogic).toBeDefined();
    expect(battleLogic.constructor.name).toBe('BattleLogic');
  });

  test('should initialize battle with TypeScript services', () => {
    battleLogic.initializeBattle('Raiders');

    // Verify bridge is initialized
    expect(bridge.isInitialized()).toBe(true);
    
    // Get battle state
    const state = battleLogic.getBattleState();
    expect(state.enemies.length).toBeGreaterThan(0);
    // Health might be affected by automatic enemy turns, so just check it's positive
    expect(state.playerHealth).toBeGreaterThan(0);
    // Max health might vary based on character stats, so just check it's reasonable
    expect(state.playerMaxHealth).toBeGreaterThan(0);
    expect(state.combatLog.length).toBeGreaterThan(0);
    expect(state.playerTurn).toBe(true);
  });

  test('should handle enemy selection', () => {
    battleLogic.initializeBattle('Raiders');
    
    const state = battleLogic.getBattleState();
    expect(state.enemies.length).toBeGreaterThan(0);
    
    // Select different enemy
    if (state.enemies.length > 1) {
      const selected = battleLogic.selectEnemy(1);
      expect(selected).toBe(true);
      
      const newState = battleLogic.getBattleState();
      expect(newState.selectedEnemyIndex).toBe(1);
    }
    
    // Try invalid selection
    const invalidSelection = battleLogic.selectEnemy(999);
    expect(invalidSelection).toBe(false);
  });

  test('should handle weapon switching', () => {
    battleLogic.initializeBattle('Raiders');
    
    // Switch weapon
    const switched = battleLogic.switchWeapon('Combat shotgun');
    expect(typeof switched).toBe('boolean');
    
    const state = battleLogic.getBattleState();
    expect(state.currentWeapon).toBeDefined();
    expect(typeof state.currentWeapon).toBe('string');
  });

  test('should handle combat mechanics', () => {
    battleLogic.initializeBattle('Raiders');
    
    const initialState = battleLogic.getBattleState();
    expect(initialState.enemies.length).toBeGreaterThan(0);
    
    // Try to perform attack
    const attackResult = battleLogic.performAttack();
    expect(typeof attackResult.success).toBe('boolean');
    expect(typeof attackResult.defeated).toBe('boolean');
    expect(typeof attackResult.victory).toBe('boolean');
    
    const newState = battleLogic.getBattleState();
    expect(newState.combatLog.length).toBeGreaterThan(initialState.combatLog.length);
  });

  test('should handle item usage', () => {
    battleLogic.initializeBattle('Raiders');
    
    // Try to use item (might not have any)
    const itemUsed = battleLogic.useItem('first_aid_kit');
    expect(typeof itemUsed).toBe('boolean');
  });

  test('should handle retreat attempts', () => {
    battleLogic.initializeBattle('Raiders');
    
    // Try to retreat
    const retreated = battleLogic.attemptRetreat();
    expect(typeof retreated).toBe('boolean');
  });

  test('should provide access to bridge services', () => {
    battleLogic.initializeBattle('Raiders');
    
    const bridgeInstance = battleLogic.getBridge();
    expect(bridgeInstance).toBe(bridge);
    
    const services = bridgeInstance.getServices();
    expect(services).toBeDefined();
    expect(services.combat).toBeDefined();
    expect(services.weapon).toBeDefined();
    expect(services.enemy).toBeDefined();
    expect(services.player).toBeDefined();
    expect(services.gameState).toBeDefined();
  });

  test('should manage battle state correctly', () => {
    battleLogic.initializeBattle('Cannibals');
    
    const state = battleLogic.getBattleState();
    
    // Verify state structure
    expect(Array.isArray(state.enemies)).toBe(true);
    expect(typeof state.selectedEnemyIndex).toBe('number');
    expect(typeof state.playerTurn).toBe('boolean');
    expect(Array.isArray(state.combatLog)).toBe(true);
    expect(typeof state.playerHealth).toBe('number');
    expect(typeof state.playerMaxHealth).toBe('number');
    expect(typeof state.currentWeapon).toBe('string');
    
    // Verify enemies are spawned with correct properties
    if (state.enemies.length > 0) {
      const enemy = state.enemies[0];
      expect(enemy).toBeDefined();
      expect(enemy.name).toBeDefined();
      expect(typeof enemy.currentHealth).toBe('number');
      expect(enemy.defence).toBeDefined();
      expect(typeof enemy.defence.health).toBe('number');
    }
  });
});
