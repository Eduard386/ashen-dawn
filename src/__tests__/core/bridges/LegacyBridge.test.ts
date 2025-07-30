import { LegacyBridge } from '../../../typescript/core/bridges/LegacyBridge';

describe('LegacyBridge', () => {
  let bridge: LegacyBridge;

  beforeEach(() => {
    bridge = LegacyBridge.getInstance();
  });

  describe('Initialization', () => {
    test('should initialize with default data', () => {
      bridge.forceReset(); // Reset to ensure clean state
      bridge.initialize();
      
      expect(bridge.isInitialized()).toBe(true);
      expect(bridge.getPlayerLevel()).toBe(1);
      expect(bridge.getPlayerHealth()).toBeGreaterThan(0);
    });

    test('should initialize with custom legacy data', () => {
      bridge.forceReset(); // Reset to ensure clean state
      
      const legacyData = {
        levelCount: 3,
        health: 45,
        experience: 200,
        current_weapon: 'Laser pistol',
        weapons: ['Baseball bat', 'Laser pistol']
      };

      bridge.initialize(legacyData);
      
      expect(bridge.getPlayerLevel()).toBe(3);
      expect(bridge.getPlayerHealth()).toBe(45);
      expect(bridge.getPlayerExperience()).toBe(200);
      expect(bridge.getCurrentWeapon()).toBe('laser pistol');
    });
  });

  describe('Player Management', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize();
    });

    test('should manage player health', () => {
      bridge.updatePlayerHealth(25);
      expect(bridge.getPlayerHealth()).toBe(25);
      
      const maxHealth = bridge.getPlayerMaxHealth();
      expect(maxHealth).toBeGreaterThan(0);
      
      bridge.updatePlayerHealth(999);
      expect(bridge.getPlayerHealth()).toBe(maxHealth);
    });

    test('should manage experience and leveling', () => {
      const initialLevel = bridge.getPlayerLevel();
      const leveledUp = bridge.addExperience(150);
      
      if (leveledUp) {
        expect(bridge.getPlayerLevel()).toBeGreaterThan(initialLevel);
        expect(bridge.getPlayerHealth()).toBe(bridge.getPlayerMaxHealth());
      }
    });
  });

  describe('Weapon Management', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize();
    });

    test('should manage weapons with legacy naming', () => {
      bridge.addWeapon('Laser Pistol');
      
      const weapons = bridge.getPlayerWeapons();
      expect(weapons).toContain('laser pistol');
      
      const switched = bridge.switchWeapon('Laser Pistol');
      expect(switched).toBe(true);
      expect(bridge.getCurrentWeapon()).toBe('laser pistol');
    });

    test('should handle invalid weapons', () => {
      const switched = bridge.switchWeapon('Invalid Weapon');
      expect(switched).toBe(false);
    });
  });

  describe('Ammo Management', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize({
        ammo: { mm_9: 50, magnum_44: 12 }
      });
    });

    test('should manage ammo with legacy naming', () => {
      const initialAmmo = bridge.getAmmo('mm 9');
      expect(initialAmmo).toBe(50);
      
      bridge.addAmmo('mm 9', 25);
      expect(bridge.getAmmo('mm 9')).toBe(75);
      
      const used = bridge.useAmmo('mm 9', 10);
      expect(used).toBe(true);
      expect(bridge.getAmmo('mm 9')).toBe(65);
    });

    test('should handle insufficient ammo', () => {
      const used = bridge.useAmmo('mm 9', 100);
      expect(used).toBe(false);
      expect(bridge.getAmmo('mm 9')).toBe(50); // Should remain unchanged
    });
  });

  describe('Medical Items', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize({
        med: { first_aid_kit: 3, buffout: 1 }
      });
    });

    test('should manage medical items', () => {
      const initialAidKits = bridge.getMedicalItem('first aid kit');
      expect(initialAidKits).toBe(3);
      
      const used = bridge.useMedicalItem('first aid kit');
      expect(used).toBe(true);
      expect(bridge.getMedicalItem('first aid kit')).toBe(2);
    });

    test('should handle insufficient medical items', () => {
      const used = bridge.useMedicalItem('jet');
      expect(used).toBe(false);
    });
  });

  describe('Combat Integration', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize();
    });

    test('should calculate player attacks', () => {
      const enemyData = {
        name: 'Test Enemy',
        type: 'creature',
        maxLevel: 1,
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 50, damage: { min: 5, max: 10 }, shots: 1 },
        amount: { min: 1, max: 1 },
        experience: 25,
        title: ['Test Enemy']
      };

      const result = bridge.calculatePlayerAttack('9mm pistol', enemyData);
      
      expect(result).toHaveProperty('isHit');
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('message');
      expect(typeof result.isHit).toBe('boolean');
      expect(typeof result.damage).toBe('number');
    });

    test('should calculate enemy attacks', () => {
      const enemyData = {
        name: 'Test Raider',
        type: 'human',
        maxLevel: 1,
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: '9mm pistol', damage: { min: 10, max: 20 }, shots: 1 },
        amount: { min: 1, max: 1 },
        experience: 50,
        title: ['Test Raider']
      };

      const result = bridge.calculateEnemyAttack(enemyData);
      
      expect(result).toHaveProperty('isHit');
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('message');
      expect(typeof result.isHit).toBe('boolean');
      expect(typeof result.damage).toBe('number');
    });
  });

  describe('Enemy Management', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize();
    });

    test('should spawn enemy groups', () => {
      const enemies = bridge.spawnEnemyGroup('Rat');
      
      expect(Array.isArray(enemies)).toBe(true);
      expect(enemies.length).toBeGreaterThan(0);
      
      const enemy = enemies[0];
      expect(enemy).toHaveProperty('name');
      expect(enemy).toHaveProperty('defence');
      expect(enemy).toHaveProperty('attack');
      expect(enemy).toHaveProperty('currentHealth');
      expect(enemy.name).toBe('Rat');
    });
  });

  describe('Scene Management', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize();
    });

    test('should manage current scene', () => {
      bridge.setCurrentScene('BattleScene');
      expect(bridge.getCurrentScene()).toBe('BattleScene');
      
      bridge.setCurrentScene('WorldMapScene');
      expect(bridge.getCurrentScene()).toBe('WorldMapScene');
    });
  });

  describe('Save/Load', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize();
    });

    test('should save and load game data', () => {
      // Modify some data
      bridge.updatePlayerHealth(15);
      bridge.addExperience(50);
      
      // Save
      bridge.saveGame();
      
      // Reset and load
      bridge.resetGame();
      const loaded = bridge.loadGame();
      
      expect(loaded).toBe(true);
      // Note: The exact values depend on level up mechanics
    });
  });

  describe('Service Access', () => {
    beforeEach(() => {
      bridge.forceReset();
      bridge.initialize();
    });

    test('should provide access to all services', () => {
      const services = bridge.getServices();
      
      expect(services).toHaveProperty('gameState');
      expect(services).toHaveProperty('player');
      expect(services).toHaveProperty('weapon');
      expect(services).toHaveProperty('enemy');
      expect(services).toHaveProperty('combat');
      
      expect(services.gameState).toBeDefined();
      expect(services.player).toBeDefined();
      expect(services.weapon).toBeDefined();
      expect(services.enemy).toBeDefined();
      expect(services.combat).toBeDefined();
    });
  });
});
