/**
 * Modern Player Service Tests - Phase 3 SRP Implementation
 * Tests for the decomposed player service components
 */

import { ModernPlayerService } from '../../../../typescript/core/services/player/ModernPlayerService';
import { HealthManager } from '../../../../typescript/core/services/player/HealthManager';
import { ExperienceManager } from '../../../../typescript/core/services/player/ExperienceManager';
import { EquipmentManager } from '../../../../typescript/core/services/player/EquipmentManager';
import { LegacyPlayerConverter } from '../../../../typescript/core/services/player/LegacyPlayerConverter';
import { PlayerDataManager } from '../../../../typescript/core/services/player/PlayerDataManager';

describe('Phase 3 SRP - Player Service Decomposition', () => {
  
  describe('PlayerDataManager', () => {
    let dataManager: PlayerDataManager;

    beforeEach(() => {
      dataManager = new PlayerDataManager();
    });

    it('should initialize and manage player data', () => {
      expect(dataManager.isInitialized()).toBe(false);

      const mockPlayer = {
        id: 'test-123',
        levelCount: 2,
        health: 25,
        maxHealth: 30,
        experience: 150,
        small_guns: 80,
        big_guns: 75,
        energy_weapons: 75,
        melee_weapons: 75,
        pyrotechnics: 75,
        lockpick: 75,
        science: 75,
        repair: 75,
        medicine: 75,
        barter: 75,
        speech: 75,
        surviving: 75,
        currentWeapon: '9mm_pistol',
        currentArmor: 'leather_jacket',
        weapons: ['baseball_bat', '9mm_pistol'],
        inventory: {
          med: { first_aid_kit: 2, jet: 0, buffout: 0, mentats: 0, psycho: 0 },
          ammo: { mm_9: 50, magnum_44: 0, mm_12: 0, mm_5_45: 0, energy_cell: 0, frag_grenade: 0 }
        }
      };

      dataManager.initializePlayer(mockPlayer);
      expect(dataManager.isInitialized()).toBe(true);
      expect(dataManager.getPlayerId()).toBe('test-123');
      expect(dataManager.getPlayerLevel()).toBe(2);
    });

    it('should validate player data structure', () => {
      const validPlayer = {
        id: 'test-123',
        levelCount: 1,
        health: 30,
        maxHealth: 30,
        experience: 0,
        small_guns: 75,
        big_guns: 75,
        energy_weapons: 75,
        melee_weapons: 75,
        pyrotechnics: 75,
        lockpick: 75,
        science: 75,
        repair: 75,
        medicine: 75,
        barter: 75,
        speech: 75,
        surviving: 75,
        currentWeapon: 'baseball_bat',
        currentArmor: 'leather_jacket',
        weapons: ['baseball_bat'],
        inventory: {
          med: { first_aid_kit: 0, jet: 0, buffout: 0, mentats: 0, psycho: 0 },
          ammo: { mm_9: 0, magnum_44: 0, mm_12: 0, mm_5_45: 0, energy_cell: 0, frag_grenade: 0 }
        }
      };

      dataManager.initializePlayer(validPlayer);
      expect(dataManager.validatePlayerData()).toBe(true);
    });
  });

  describe('HealthManager', () => {
    let healthManager: HealthManager;
    let mockPlayer: any;

    beforeEach(() => {
      mockPlayer = {
        health: 25,
        maxHealth: 30,
        inventory: {
          med: { first_aid_kit: 2, jet: 1, buffout: 0, mentats: 1, psycho: 0 }
        }
      };
      healthManager = new HealthManager(mockPlayer);
    });

    it('should manage health values correctly', () => {
      expect(healthManager.getHealth()).toBe(25);
      expect(healthManager.getMaxHealth()).toBe(30);
      expect(healthManager.getHealthPercentage()).toBeCloseTo(83.33, 1);
    });

    it('should handle healing within bounds', () => {
      const healedAmount = healthManager.heal(10);
      expect(healedAmount).toBe(5); // Only healed to max
      expect(healthManager.getHealth()).toBe(30);
    });

    it('should handle damage correctly', () => {
      const damageDealt = healthManager.takeDamage(10);
      expect(damageDealt).toBe(10);
      expect(healthManager.getHealth()).toBe(15);
      expect(healthManager.isDead()).toBe(false);

      healthManager.takeDamage(20);
      expect(healthManager.getHealth()).toBe(0);
      expect(healthManager.isDead()).toBe(true);
    });

    it('should handle medical items correctly', () => {
      expect(healthManager.useMedicalItem('first_aid_kit')).toBe(true);
      expect(healthManager.getHealth()).toBe(30); // Healed by 20, capped at max
      expect(healthManager.getMedicalItemCount('first_aid_kit')).toBe(1);

      expect(healthManager.useMedicalItem('buffout')).toBe(false); // None available
      expect(healthManager.useMedicalItem('jet')).toBe(true); // Available but no healing
    });
  });

  describe('ExperienceManager', () => {
    let expManager: ExperienceManager;
    let mockPlayer: any;

    beforeEach(() => {
      mockPlayer = {
        experience: 800,
        levelCount: 1
      };
      expManager = new ExperienceManager(mockPlayer);
    });

    it('should manage experience and leveling', () => {
      expect(expManager.getExperience()).toBe(800);
      expect(expManager.getCurrentLevel()).toBe(1);
      expect(expManager.getRequiredExperience(1)).toBe(1000);
      expect(expManager.getExperienceToNextLevel()).toBe(200);
    });

    it('should handle level up correctly', () => {
      expect(expManager.canLevelUp()).toBe(false);
      
      const leveledUp = expManager.addExperience(300); // Total: 1100
      expect(leveledUp).toBe(true);
      expect(expManager.getCurrentLevel()).toBe(2);
      expect(expManager.getExperience()).toBe(1100);
    });

    it('should calculate experience progress correctly', () => {
      // At level 1 with 800 exp, need 1000 for level 2
      // Progress: (800 - 0) / (1000 - 0) = 0.8
      const progress = expManager.getExperienceProgress();
      expect(progress).toBeCloseTo(0.8, 2);
    });

    it('should handle max level correctly', () => {
      mockPlayer.levelCount = 50;
      expect(expManager.isMaxLevel()).toBe(true);
      
      expManager.forceLevelUp();
      expect(expManager.getCurrentLevel()).toBe(50); // Should not increase
    });
  });

  describe('EquipmentManager', () => {
    let equipManager: EquipmentManager;
    let mockPlayer: any;

    beforeEach(() => {
      mockPlayer = {
        currentWeapon: '9mm_pistol',
        currentArmor: 'leather_jacket',
        weapons: ['baseball_bat', '9mm_pistol', 'magnum_44']
      };
      equipManager = new EquipmentManager(mockPlayer);
    });

    it('should manage current equipment', () => {
      expect(equipManager.getCurrentWeapon()).toBe('9mm_pistol');
      expect(equipManager.getCurrentArmor()).toBe('leather_jacket');
      expect(equipManager.getWeaponCount()).toBe(3);
    });

    it('should handle weapon switching', () => {
      expect(equipManager.switchWeapon('magnum_44')).toBe(true);
      expect(equipManager.getCurrentWeapon()).toBe('magnum_44');
      
      expect(equipManager.switchWeapon('laser_pistol')).toBe(false); // Don't have it
      expect(equipManager.getCurrentWeapon()).toBe('magnum_44'); // Unchanged
    });

    it('should handle weapon cycling', () => {
      equipManager.switchWeapon('baseball_bat'); // Start with first weapon
      
      expect(equipManager.cycleToNextWeapon()).toBe(true);
      expect(equipManager.getCurrentWeapon()).toBe('9mm_pistol');
      
      equipManager.cycleToNextWeapon();
      expect(equipManager.getCurrentWeapon()).toBe('magnum_44');
      
      equipManager.cycleToNextWeapon();
      expect(equipManager.getCurrentWeapon()).toBe('baseball_bat'); // Wrapped around
    });

    it('should handle adding and removing weapons', () => {
      equipManager.addWeapon('laser_pistol');
      expect(equipManager.hasWeapon('laser_pistol')).toBe(true);
      expect(equipManager.getWeaponCount()).toBe(4);

      expect(equipManager.removeWeapon('laser_pistol')).toBe(true);
      expect(equipManager.hasWeapon('laser_pistol')).toBe(false);
      expect(equipManager.getWeaponCount()).toBe(3);
    });
  });

  describe('LegacyPlayerConverter', () => {
    let converter: LegacyPlayerConverter;

    beforeEach(() => {
      converter = new LegacyPlayerConverter();
    });

    it('should convert from legacy format correctly', () => {
      const legacyData = {
        levelCount: 2,
        health: 25,
        experience: 1500,
        skills: { small_guns: 85, medicine: 90 },
        current_weapon: '9mm pistol',
        current_armor: 'Leather Jacket',
        weapons: ['Baseball bat', '9mm pistol'],
        med: { first_aid_kit: 3 },
        ammo: { mm_9: 100 }
      };

      const modernPlayer = converter.convertFromLegacy(legacyData);
      
      expect(modernPlayer.levelCount).toBe(2);
      expect(modernPlayer.health).toBe(25);
      expect(modernPlayer.small_guns).toBe(85);
      expect(modernPlayer.medicine).toBe(90);
      expect(modernPlayer.currentWeapon).toBe('9mm_pistol');
      expect(modernPlayer.weapons).toContain('baseball_bat');
    });

    it('should convert to legacy format correctly', () => {
      const modernPlayer = {
        id: 'test',
        levelCount: 2,
        health: 25,
        maxHealth: 30,
        experience: 1500,
        small_guns: 85,
        big_guns: 75,
        energy_weapons: 75,
        melee_weapons: 75,
        pyrotechnics: 75,
        lockpick: 75,
        science: 75,
        repair: 75,
        medicine: 90,
        barter: 75,
        speech: 75,
        surviving: 75,
        currentWeapon: '9mm_pistol',
        currentArmor: 'leather_jacket',
        weapons: ['baseball_bat', '9mm_pistol'],
        inventory: {
          med: { first_aid_kit: 3, jet: 0, buffout: 0, mentats: 0, psycho: 0 },
          ammo: { mm_9: 100, magnum_44: 0, mm_12: 0, mm_5_45: 0, energy_cell: 0, frag_grenade: 0 }
        }
      };

      const legacyData = converter.convertToLegacy(modernPlayer);
      
      expect(legacyData.levelCount).toBe(2);
      expect(legacyData.health).toBe(25);
      expect(legacyData.skills.small_guns).toBe(85);
      expect(legacyData.current_weapon).toBe('9mm pistol');
      expect(legacyData.weapons).toContain('Baseball bat');
    });

    it('should validate legacy data correctly', () => {
      expect(converter.validateLegacyData({})).toBe(true); // Empty is valid (uses defaults)
      expect(converter.validateLegacyData({ health: 30 })).toBe(true);
      expect(converter.validateLegacyData(null)).toBe(false);
      expect(converter.validateLegacyData({ health: 'invalid' })).toBe(false);
    });
  });

  describe('ModernPlayerService Integration', () => {
    let service: ModernPlayerService;

    beforeEach(() => {
      // Reset singleton for testing
      (ModernPlayerService as any).instance = null;
      service = ModernPlayerService.getInstance();
    });

    it('should orchestrate all managers correctly', () => {
      const legacyData = {
        levelCount: 1,
        health: 20,
        experience: 900,
        skills: { small_guns: 80 },
        current_weapon: '9mm pistol',
        weapons: ['Baseball bat', '9mm pistol'],
        med: { first_aid_kit: 2 },
        ammo: { mm_9: 50 }
      };

      const player = service.initializeFromLegacy(legacyData);
      expect(player).toBeDefined();
      expect(service.isInitialized()).toBe(true);

      // Test manager access
      const healthMgr = service.getHealthManager();
      const expMgr = service.getExperienceManager();
      const equipMgr = service.getEquipmentManager();

      expect(healthMgr.getHealth()).toBe(20);
      expect(expMgr.getExperience()).toBe(900);
      expect(equipMgr.getCurrentWeapon()).toBe('9mm_pistol');
    });

    it('should handle convenience methods correctly', () => {
      // Use actual default data to ensure weapons are present
      const defaultData = service.getLegacyConverter().getDefaultLegacyData();
      service.initializeFromLegacy(defaultData);
      
      const weapons = service.getEquipmentManager().getWeapons();
      
      // Test health management
      service.updateHealth(15); // Within max health range of 18
      expect(service.getHealthManager().getHealth()).toBe(15);

      // Test experience and level up
      const leveledUp = service.addExperience(1200); // Should level up (1200 > 1000 required)
      expect(leveledUp).toBe(true);
      expect(service.getExperienceManager().getCurrentLevel()).toBe(2);

      // Test equipment management - should have converted weapons
      expect(weapons.length).toBeGreaterThan(0);
      expect(service.switchWeapon(weapons[1])).toBe(true); // Switch to second weapon
      expect(service.getEquipmentManager().getCurrentWeapon()).toBe(weapons[1]);
    });

    it('should provide comprehensive player status', () => {
      service.initializeFromLegacy({ health: 25, experience: 800 });
      
      const status = service.getPlayerStatus();
      expect(status).toBeDefined();
      expect(status!.isAlive).toBe(true);
      expect(status!.health).toBe(25);
      expect(status!.level).toBe(1);
      expect(status!.experience).toBe(800);
    });

    it('should handle legacy format conversion', () => {
      const legacyData = { health: 30, levelCount: 2 };
      service.initializeFromLegacy(legacyData);
      
      const convertedBack = service.toLegacyFormat();
      expect(convertedBack).toBeDefined();
      expect(convertedBack.health).toBe(30);
      expect(convertedBack.levelCount).toBe(2);
    });
  });

  describe('SRP Compliance', () => {
    it('should demonstrate single responsibility for each component', () => {
      // Each component should have one clear responsibility
      
      // PlayerDataManager: Only data management
      const dataManager = new PlayerDataManager();
      expect(typeof dataManager.initializePlayer).toBe('function');
      expect(typeof dataManager.getPlayerData).toBe('function');
      expect(dataManager.constructor.name).toBe('PlayerDataManager');

      // HealthManager: Only health-related operations
      const mockPlayer = { health: 30, maxHealth: 30, inventory: { med: {} } };
      const healthManager = new HealthManager(mockPlayer as any);
      expect(typeof healthManager.getHealth).toBe('function');
      expect(typeof healthManager.heal).toBe('function');
      expect(typeof healthManager.useMedicalItem).toBe('function');

      // ExperienceManager: Only experience and leveling
      const expManager = new ExperienceManager({ experience: 0, levelCount: 1 } as any);
      expect(typeof expManager.addExperience).toBe('function');
      expect(typeof expManager.getCurrentLevel).toBe('function');
      expect(typeof expManager.canLevelUp).toBe('function');

      // EquipmentManager: Only equipment operations
      const equipManager = new EquipmentManager({ currentWeapon: 'test', weapons: [], currentArmor: 'test' } as any);
      expect(typeof equipManager.switchWeapon).toBe('function');
      expect(typeof equipManager.addWeapon).toBe('function');
      expect(typeof equipManager.getCurrentWeapon).toBe('function');

      // LegacyPlayerConverter: Only format conversion
      const converter = new LegacyPlayerConverter();
      expect(typeof converter.convertFromLegacy).toBe('function');
      expect(typeof converter.convertToLegacy).toBe('function');
    });

    it('should allow easy testing of individual components', () => {
      // Each component can be tested in isolation
      const mockPlayer = {
        health: 25,
        maxHealth: 30,
        inventory: { med: { first_aid_kit: 1, jet: 0, buffout: 0, mentats: 0, psycho: 0 } }
      };

      const healthManager = new HealthManager(mockPlayer as any);
      
      // Can test health operations without affecting other systems
      expect(healthManager.getHealth()).toBe(25);
      healthManager.heal(5);
      expect(healthManager.getHealth()).toBe(30);
      
      // Health changes are reflected in the shared player object
      expect(mockPlayer.health).toBe(30);
    });

    it('should demonstrate loose coupling between components', () => {
      // Components should not directly depend on each other
      // They only share the player data object
      
      const player = {
        levelCount: 1,
        health: 30,
        maxHealth: 30,
        experience: 0,
        currentWeapon: 'test',
        currentArmor: 'test',
        weapons: ['test'],
        inventory: { med: { first_aid_kit: 0, jet: 0, buffout: 0, mentats: 0, psycho: 0 } }
      };

      const healthMgr = new HealthManager(player as any);
      const expMgr = new ExperienceManager(player as any);
      const equipMgr = new EquipmentManager(player as any);

      // Each can operate independently
      healthMgr.takeDamage(10);
      expMgr.addExperience(500);
      equipMgr.addWeapon('new_weapon');

      // Changes are reflected in shared data
      expect(player.health).toBe(20);
      expect(player.experience).toBe(500);
      expect(player.weapons).toContain('new_weapon');
    });
  });
});
