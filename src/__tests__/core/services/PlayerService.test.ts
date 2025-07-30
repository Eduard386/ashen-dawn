import { PlayerService } from '../../../typescript/core/services/PlayerService';
import { IPlayerCharacter } from '../../../typescript/core/interfaces/IPlayer';

describe('PlayerService', () => {
  let playerService: PlayerService;

  beforeEach(() => {
    // Get fresh instance for each test
    playerService = PlayerService.getInstance();
  });

  describe('Initialization', () => {
    test('should initialize player from legacy data', () => {
      const legacyData = {
        levelCount: 2,
        health: 35,
        experience: 150,
        skills: {
          small_guns: 80,
          big_guns: 70,
          energy_weapons: 60,
          melee_weapons: 85,
          pyrotechnics: 65,
          lockpick: 75,
          science: 70,
          repair: 75,
          medicine: 80,
          barter: 70,
          speech: 75,
          surviving: 80
        },
        current_weapon: 'Baseball bat',
        current_armor: 'Leather Jacket',
        weapons: ['Baseball bat', '9mm pistol'],
        med: {
          first_aid_kit: 2,
          jet: 0,
          buffout: 1,
          mentats: 0,
          psycho: 0
        },
        ammo: {
          mm_9: 24,
          magnum_44: 6,
          mm_12: 0,
          mm_5_45: 0,
          energy_cell: 0,
          frag_grenade: 0
        }
      };

      const player = playerService.initializeFromLegacy(legacyData);

      expect(player).toBeDefined();
      expect(player.id).toBeDefined();
      expect(player.levelCount).toBe(2);
      expect(player.health).toBe(35);
      expect(player.experience).toBe(150);
      expect(player.skills.small_guns).toBe(80);
      expect(player.currentWeapon).toBe('baseball_bat');
      expect(player.currentArmor).toBe('leather_jacket');
      expect(player.weapons).toContain('baseball_bat');
      expect(player.weapons).toContain('9mm_pistol');
      expect(player.inventory.med.first_aid_kit).toBe(2);
      expect(player.inventory.ammo.mm_9).toBe(24);
    });

    test('should handle legacy data with typos', () => {
      const legacyDataWithTypo = {
        skills: {
          medcine: 75 // Typo in legacy data
        }
      };

      const player = playerService.initializeFromLegacy(legacyDataWithTypo);
      expect(player.skills.medicine).toBe(75);
    });
  });

  describe('Health Management', () => {
    test('should update health within valid range', () => {
      const legacyData = { health: 50, levelCount: 1 }; // levelCount will determine maxHealth
      const player = playerService.initializeFromLegacy(legacyData);
      
      // Check max health calculation (30 + (level-1)*5 = 30 for level 1)
      expect(player.maxHealth).toBe(30);
      
      playerService.updateHealth(25);
      expect(player.health).toBe(25);

      playerService.updateHealth(-10);
      expect(player.health).toBe(0);

      playerService.updateHealth(150);
      expect(player.health).toBe(player.maxHealth);
    });
  });

  describe('Experience and Leveling', () => {
    test('should add experience and trigger level up', () => {
      const legacyData = { levelCount: 1, experience: 80 };
      const player = playerService.initializeFromLegacy(legacyData);
      const oldMaxHealth = player.maxHealth;

      const leveledUp = playerService.addExperience(25);

      expect(leveledUp).toBe(true);
      expect(player.levelCount).toBe(2);
      expect(player.maxHealth).toBeGreaterThan(oldMaxHealth);
      expect(player.health).toBe(player.maxHealth); // Full heal on level up
      expect(player.experience).toBe(5); // 105 - 100 = 5 remaining
    });

    test('should add experience without level up', () => {
      const legacyData = { levelCount: 1, experience: 50 };
      const player = playerService.initializeFromLegacy(legacyData);

      const leveledUp = playerService.addExperience(25);

      expect(leveledUp).toBe(false);
      expect(player.levelCount).toBe(1);
      expect(player.experience).toBe(75);
    });
  });

  describe('Medical Item Usage', () => {
    test('should use medical items correctly', () => {
      const legacyData = {
        health: 20,
        levelCount: 5, // Higher level for more max health  
        med: { first_aid_kit: 2 }
      };
      const player = playerService.initializeFromLegacy(legacyData);
      
      // Max health should be 30 + (5-1)*5 = 50
      expect(player.maxHealth).toBe(50);

      const used = playerService.useMedicalItem('first_aid_kit');

      expect(used).toBe(true);
      expect(player.inventory.med.first_aid_kit).toBe(1);
      expect(player.health).toBe(40); // 20 + 20 healing
    });

    test('should not use medical items when none available', () => {
      const legacyData = { med: { first_aid_kit: 0 } };
      const player = playerService.initializeFromLegacy(legacyData);

      const used = playerService.useMedicalItem('first_aid_kit');

      expect(used).toBe(false);
      expect(player.inventory.med.first_aid_kit).toBe(0);
    });
  });

  describe('Weapon Management', () => {
    test('should add and switch weapons', () => {
      const legacyData = { weapons: ['baseball_bat'] };
      const player = playerService.initializeFromLegacy(legacyData);

      playerService.addWeapon('laser_pistol');
      expect(player.weapons).toContain('laser_pistol');

      const switched = playerService.switchWeapon('laser_pistol');
      expect(switched).toBe(true);
      expect(player.currentWeapon).toBe('laser_pistol');
    });

    test('should not switch to weapon not in inventory', () => {
      const legacyData = { weapons: ['baseball_bat'] };
      const player = playerService.initializeFromLegacy(legacyData);

      const switched = playerService.switchWeapon('minigun');
      expect(switched).toBe(false);
      expect(player.currentWeapon).not.toBe('minigun');
    });
  });

  describe('Ammo Management', () => {
    test('should add and use ammo correctly', () => {
      const legacyData = { ammo: { mm_9: 20 } };
      const player = playerService.initializeFromLegacy(legacyData);

      playerService.addAmmo('mm_9', 15);
      expect(player.inventory.ammo.mm_9).toBe(35);

      const used = playerService.useAmmo('mm_9', 10);
      expect(used).toBe(true);
      expect(player.inventory.ammo.mm_9).toBe(25);
    });

    test('should not use ammo when insufficient', () => {
      const legacyData = { ammo: { mm_9: 5 } };
      const player = playerService.initializeFromLegacy(legacyData);

      const used = playerService.useAmmo('mm_9', 10);
      expect(used).toBe(false);
      expect(player.inventory.ammo.mm_9).toBe(5);
    });
  });

  describe('Legacy Conversion', () => {
    test('should convert back to legacy format', () => {
      const originalData = {
        levelCount: 3,
        health: 45,
        experience: 250,
        current_weapon: 'Laser pistol',
        current_armor: 'Combat Armor',
        weapons: ['Baseball bat', 'Laser pistol']
      };

      const player = playerService.initializeFromLegacy(originalData);
      const legacyFormat = playerService.toLegacyFormat();

      expect(legacyFormat).toBeDefined();
      expect(legacyFormat.levelCount).toBe(3);
      expect(legacyFormat.health).toBe(45);
      expect(legacyFormat.experience).toBe(250);
      expect(legacyFormat.current_weapon).toBe('laser pistol');
      expect(legacyFormat.current_armor).toBe('combat armor');
      expect(legacyFormat.weapons).toContain('baseball bat');
      expect(legacyFormat.weapons).toContain('laser pistol');
    });
  });
});
