/**
 * Modern Combat Service Tests - SRP Implementation
 * Testing decomposed combat services following Single Responsibility Principle
 */

import {
  HitChanceCalculator,
  DamageCalculator,
  AmmoManager,
  ArmorCalculator,
  ExperienceCalculator,
  CombatMessageGenerator,
  ModernCombatService
} from '../../../typescript/core/services/combat/index.js';

import { IPlayerCharacter } from '../../../typescript/core/interfaces/IPlayer.js';
import { IWeapon } from '../../../typescript/core/interfaces/IWeapon.js';
import { IEnemy } from '../../../typescript/core/interfaces/IEnemy.js';

describe('Modern Combat Service - SRP Implementation', () => {

  // Test data
  const mockPlayer: IPlayerCharacter = {
    id: 'test-player',
    health: 30,
    maxHealth: 30,
    levelCount: 2,
    experience: 1500,
    small_guns: 75,
    big_guns: 50,
    energy_weapons: 50,
    melee_weapons: 60,
    pyrotechnics: 40,
    lockpick: 70,
    science: 80,
    repair: 65,
    medicine: 70,
    barter: 60,
    speech: 75,
    surviving: 80,
    currentWeapon: '9mm_pistol',
    currentArmor: 'leather_armor',
    weapons: ['9mm_pistol', 'baseball_bat'],
    inventory: {
      med: {
        first_aid_kit: 2,
        jet: 0,
        buffout: 1,
        mentats: 0,
        psycho: 0
      },
      ammo: {
        mm_9: 50,
        magnum_44: 12,
        mm_12: 8,
        mm_5_45: 0,
        energy_cell: 20,
        frag_grenade: 3
      }
    }
  };

  const mockWeapon: IWeapon = {
    name: '9mm_pistol',
    skill: 'small_guns',
    ammoType: 'mm_9',
    cooldown: 2500,
    damage: { min: 10, max: 24 },
    clipSize: 12,
    shotsPerAttack: 1,
    criticalChance: 10
  };

  const mockEnemy: IEnemy = {
    id: 'test-raider',
    name: 'Raider',
    type: 'human',
    maxLevel: 2,
    currentHealth: 25,
    maxHealth: 25,
    experience: 15,
    experienceReward: 15,
    spawning: { min: 1, max: 3 },
    sprites: ['raider_body.png'],
    defence: {
      health: 25,
      armorClass: 3,
      damageThreshold: 1,
      damageResistance: 0.1
    },
    attack: {
      hitChance: 60,
      weapon: 'knife',
      damage: { min: 3, max: 8 },
      shots: 1,
      attackSpeed: 1.0
    }
  };

  describe('HitChanceCalculator - Single Responsibility for Hit Calculations', () => {
    let hitCalculator: HitChanceCalculator;

    beforeEach(() => {
      hitCalculator = new HitChanceCalculator();
    });

    it('should calculate complete hit calculation with all modifiers', () => {
      const calculation = hitCalculator.calculateHitChance(mockPlayer, mockWeapon, mockEnemy);

      expect(calculation).toHaveProperty('baseHitChance');
      expect(calculation).toHaveProperty('skillModifier');
      expect(calculation).toHaveProperty('weaponAccuracy');
      expect(calculation).toHaveProperty('distanceModifier');
      expect(calculation).toHaveProperty('targetDefenseModifier');
      expect(calculation).toHaveProperty('finalHitChance');
      expect(calculation).toHaveProperty('isHit');

      expect(calculation.baseHitChance).toBe(75); // Player's small_guns skill
      expect(calculation.weaponAccuracy).toBe(5); // criticalChance / 2
      expect(calculation.finalHitChance).toBeGreaterThan(0);
      expect(calculation.finalHitChance).toBeLessThanOrEqual(95);
      expect(typeof calculation.isHit).toBe('boolean');
    });

    it('should apply enemy armor class penalties correctly', () => {
      const highACEnemy = { ...mockEnemy, defence: { ...mockEnemy.defence, armorClass: 10 } };
      const calculation = hitCalculator.calculateHitChance(mockPlayer, mockWeapon, highACEnemy);

      expect(calculation.targetDefenseModifier).toBeLessThan(0); // Should be negative penalty
      expect(calculation.finalHitChance).toBeLessThan(calculation.baseHitChance);
    });

    it('should provide legacy compatibility method', () => {
      const hitChance = hitCalculator.getHitChance(mockPlayer, mockWeapon, mockEnemy);
      
      expect(typeof hitChance).toBe('number');
      expect(hitChance).toBeGreaterThanOrEqual(5);
      expect(hitChance).toBeLessThanOrEqual(95);
    });
  });

  describe('DamageCalculator - Single Responsibility for Damage Calculations', () => {
    let damageCalculator: DamageCalculator;

    beforeEach(() => {
      damageCalculator = new DamageCalculator();
    });

    it('should calculate complete damage with all modifiers', () => {
      const calculation = damageCalculator.calculateDamage(mockWeapon, mockEnemy, mockPlayer);

      expect(calculation).toHaveProperty('baseDamage');
      expect(calculation).toHaveProperty('weaponModifier');
      expect(calculation).toHaveProperty('skillModifier');
      expect(calculation).toHaveProperty('criticalMultiplier');
      expect(calculation).toHaveProperty('armorReduction');
      expect(calculation).toHaveProperty('resistanceReduction');
      expect(calculation).toHaveProperty('thresholdReduction');
      expect(calculation).toHaveProperty('finalDamage');
      expect(calculation).toHaveProperty('isCritical');

      expect(calculation.baseDamage).toBeGreaterThanOrEqual(mockWeapon.damage.min);
      expect(calculation.baseDamage).toBeLessThanOrEqual(mockWeapon.damage.max);
      expect(calculation.finalDamage).toBeGreaterThanOrEqual(1); // Minimum damage
      expect(typeof calculation.isCritical).toBe('boolean');
    });

    it('should apply skill bonuses for high skill levels', () => {
      const highSkillPlayer = { ...mockPlayer, small_guns: 90 };
      const calculation = damageCalculator.calculateDamage(mockWeapon, mockEnemy, highSkillPlayer);

      expect(calculation.skillModifier).toBeGreaterThan(0); // Should have skill bonus
    });

    it('should handle critical hits correctly', () => {
      // Mock Math.random to force critical hit
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.05); // 5% - should trigger critical

      const calculation = damageCalculator.calculateDamage(mockWeapon, mockEnemy, mockPlayer);
      
      expect(calculation.isCritical).toBe(true);
      expect(calculation.criticalMultiplier).toBe(2);

      Math.random = originalRandom;
    });

    it('should apply armor mitigation correctly', () => {
      const mitigatedDamage = damageCalculator.applyArmorMitigation(20, 5, 0.2);
      
      // 20 damage - 5 threshold = 15, then 15 * (1 - 0.2) = 12
      expect(mitigatedDamage).toBe(12);
    });
  });

  describe('AmmoManager - Single Responsibility for Ammunition Management', () => {
    let ammoManager: AmmoManager;

    beforeEach(() => {
      ammoManager = new AmmoManager();
    });

    it('should check weapon usability based on ammo', () => {
      const canUse = ammoManager.canUseWeapon(mockPlayer, mockWeapon);
      expect(canUse).toBe(true); // Player has 50 mm_9 ammo

      const emptyAmmoPlayer = {
        ...mockPlayer,
        inventory: { ...mockPlayer.inventory, ammo: { ...mockPlayer.inventory.ammo, mm_9: 0 } }
      };
      const cannotUse = ammoManager.canUseWeapon(emptyAmmoPlayer, mockWeapon);
      expect(cannotUse).toBe(false);
    });

    it('should handle melee weapons correctly', () => {
      const meleeWeapon: IWeapon = {
        name: 'baseball_bat',
        skill: 'melee_weapons',
        ammoType: 'melee',
        cooldown: 3000,
        damage: { min: 3, max: 10 },
        clipSize: 1000,
        shotsPerAttack: 1,
        criticalChance: 5
      };

      const canUse = ammoManager.canUseWeapon(mockPlayer, meleeWeapon);
      expect(canUse).toBe(true); // Melee weapons always usable

      const remaining = ammoManager.getRemainingAmmo(mockPlayer, meleeWeapon);
      expect(remaining).toBe(Infinity);
    });

    it('should consume ammo correctly', () => {
      const playerCopy = JSON.parse(JSON.stringify(mockPlayer));
      const initialAmmo = playerCopy.inventory.ammo.mm_9;

      const consumed = ammoManager.consumeAmmo(playerCopy, mockWeapon);
      expect(consumed).toBe(true);
      expect(playerCopy.inventory.ammo.mm_9).toBe(initialAmmo - 1);
    });

    it('should calculate possible shots correctly', () => {
      const possibleShots = ammoManager.calculatePossibleShots(mockPlayer, mockWeapon);
      expect(possibleShots).toBe(50); // 50 ammo / 1 shot per attack

      const burstWeapon = { ...mockWeapon, shotsPerAttack: 3 };
      const burstShots = ammoManager.calculatePossibleShots(mockPlayer, burstWeapon);
      expect(burstShots).toBe(16); // 50 ammo / 3 shots per attack = 16 full bursts
    });
  });

  describe('ArmorCalculator - Single Responsibility for Armor Calculations', () => {
    let armorCalculator: ArmorCalculator;

    beforeEach(() => {
      armorCalculator = new ArmorCalculator();
    });

    it('should get armor information correctly', () => {
      const armorInfo = armorCalculator.getArmorInfo('leather_armor');
      
      expect(armorInfo).not.toBeNull();
      expect(armorInfo!.armorClass).toBe(2);
      expect(armorInfo!.damageThreshold).toBe(1);
      expect(armorInfo!.damageResistance).toBe(0.10);
    });

    it('should calculate player armor reduction', () => {
      const reducedDamage = armorCalculator.calculatePlayerArmorReduction(mockPlayer, 20);
      
      // 20 damage - 1 threshold = 19, then 19 * (1 - 0.1) = 17.1 -> 17
      expect(reducedDamage).toBe(17);
    });

    it('should compare armor effectiveness', () => {
      const comparison = armorCalculator.compareArmor('combat_armor', 'leather_armor');
      
      expect(comparison.better).toBe('combat_armor');
      expect(comparison.protection).toBe('better');
      expect(comparison.acDifference).toBe(4); // 6 - 2 = 4
    });

    it('should get enemy defense values', () => {
      const defense = armorCalculator.getEnemyDefense(mockEnemy);
      
      expect(defense.armorClass).toBe(3);
      expect(defense.damageThreshold).toBe(1);
      expect(defense.damageResistance).toBe(0.1);
    });
  });

  describe('ExperienceCalculator - Single Responsibility for Experience Calculations', () => {
    let experienceCalculator: ExperienceCalculator;

    beforeEach(() => {
      experienceCalculator = new ExperienceCalculator();
    });

    it('should calculate experience gain with level scaling', () => {
      const calculation = experienceCalculator.calculateExperienceGain(mockEnemy, 2);
      
      expect(calculation.baseExperience).toBe(15);
      expect(calculation.levelModifier).toBe(1); // Same level, no penalty
      expect(calculation.finalExperience).toBe(15);
    });

    it('should apply level difference penalties', () => {
      const calculation = experienceCalculator.calculateExperienceGain(mockEnemy, 5);
      
      expect(calculation.levelDifference).toBe(3); // 5 - 2 = 3
      expect(calculation.levelModifier).toBe(0.7); // 1 - (3 * 0.1)
      expect(calculation.finalExperience).toBe(10); // 15 * 0.7 = 10.5 -> 10
    });

    it('should calculate bonus experience for achievements', () => {
      const bonusXP = experienceCalculator.calculateBonusExperience(100, {
        criticalKill: true,
        perfectAccuracy: true,
        noHealthLost: true
      });
      
      // 100 * (1 + 0.25 + 0.15 + 0.20) = 100 * 1.6 = 160
      expect(bonusXP).toBe(160);
    });

    it('should check level up correctly', () => {
      // Level 2 needs 2000 XP, Level 3 needs 3000 XP
      // Player with 2500 XP at level 2 should level up to 3
      const levelUp = experienceCalculator.checkLevelUp(2500, 2);
      
      expect(levelUp.levelsGained).toBe(0); // 2500 < 3000, so no level up yet
      expect(levelUp.newLevel).toBe(2);
      expect(levelUp.experienceToNext).toBe(500); // 3000 - 2500 = 500
    });

    it('should calculate experience progress percentage', () => {
      // Level 2 = 2000 XP, Level 3 = 3000 XP
      // Player with 2250 XP should be 25% towards level 3
      const progress = experienceCalculator.getExperienceProgress(2250, 2);
      
      expect(progress).toBe(25); // (2250 - 2000) / (3000 - 2000) * 100 = 25%
    });
  });

  describe('CombatMessageGenerator - Single Responsibility for Combat Messages', () => {
    let messageGenerator: CombatMessageGenerator;

    beforeEach(() => {
      messageGenerator = new CombatMessageGenerator();
    });

    it('should generate attack messages with weapon names', () => {
      const normalDamage = {
        baseDamage: 15,
        weaponModifier: 1.0,
        skillModifier: 2,
        criticalMultiplier: 1,
        armorReduction: 0,
        resistanceReduction: 1,
        thresholdReduction: 1,
        finalDamage: 15,
        isCritical: false
      };

      const message = messageGenerator.generateAttackMessage(normalDamage, '9mm_pistol');
      expect(message).toContain('9mm_pistol');
      expect(message).toContain('15');
      expect(message).not.toContain('Critical');
    });

    it('should generate critical hit messages', () => {
      const criticalDamage = {
        baseDamage: 15,
        weaponModifier: 1.0,
        skillModifier: 2,
        criticalMultiplier: 2,
        armorReduction: 0,
        resistanceReduction: 1,
        thresholdReduction: 1,
        finalDamage: 30,
        isCritical: true
      };

      const message = messageGenerator.generateAttackMessage(criticalDamage, '9mm_pistol');
      expect(message).toContain('Critical');
      expect(message).toContain('30');
    });

    it('should generate enemy attack messages', () => {
      const message = messageGenerator.generateEnemyAttackMessage(mockEnemy, 8);
      expect(message).toContain('Raider');
      expect(message).toContain('8');
    });

    it('should generate death messages', () => {
      const message = messageGenerator.generateDeathMessage(mockEnemy);
      expect(message).toContain('Raider');
    });

    it('should generate various miss messages', () => {
      const message1 = messageGenerator.generateMissMessage();
      const message2 = messageGenerator.generateMissMessage('9mm_pistol');
      
      expect(message1).toContain('❌');
      expect(message2).toContain('9mm_pistol');
    });
  });

  describe('ModernCombatService - Composition and Orchestration', () => {
    let modernCombat: ModernCombatService;

    beforeEach(() => {
      modernCombat = ModernCombatService.getInstance();
    });

    it('should be a singleton', () => {
      const instance1 = ModernCombatService.getInstance();
      const instance2 = ModernCombatService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should calculate complete player attack', () => {
      const result = modernCombat.calculatePlayerAttack(mockPlayer, mockWeapon, mockEnemy);
      
      expect(result).toHaveProperty('isHit');
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('isCritical');
      expect(result).toHaveProperty('remainingHealth');
      expect(result).toHaveProperty('message');
      
      if (result.isHit) {
        expect(result.damage).toBeGreaterThan(0);
        expect(result.remainingHealth).toBeLessThanOrEqual(mockEnemy.currentHealth);
      }
    });

    it('should calculate enemy attack', () => {
      const result = modernCombat.calculateEnemyAttack(mockEnemy, mockPlayer);
      
      expect(result).toHaveProperty('isHit');
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('isCritical');
      expect(result).toHaveProperty('remainingHealth');
      expect(result).toHaveProperty('message');
    });

    it('should provide access to specialized components', () => {
      expect(modernCombat.getHitChanceCalculator()).toBeInstanceOf(HitChanceCalculator);
      expect(modernCombat.getDamageCalculator()).toBeInstanceOf(DamageCalculator);
      expect(modernCombat.getAmmoManager()).toBeInstanceOf(AmmoManager);
      expect(modernCombat.getArmorCalculator()).toBeInstanceOf(ArmorCalculator);
      expect(modernCombat.getExperienceCalculator()).toBeInstanceOf(ExperienceCalculator);
      expect(modernCombat.getMessageGenerator()).toBeInstanceOf(CombatMessageGenerator);
    });

    it('should provide legacy compatibility methods', () => {
      const hitChance = modernCombat.calculateHitChance(mockPlayer, mockWeapon, mockEnemy);
      expect(typeof hitChance).toBe('number');

      const damageCalc = modernCombat.calculateDamage(mockWeapon, mockEnemy, mockPlayer);
      expect(damageCalc).toHaveProperty('finalDamage');
    });

    it('should delegate ammo management correctly', () => {
      const canUse = modernCombat.canUseWeapon(mockPlayer, mockWeapon);
      expect(typeof canUse).toBe('boolean');

      const playerCopy = JSON.parse(JSON.stringify(mockPlayer));
      const consumed = modernCombat.consumeAmmo(playerCopy, mockWeapon);
      expect(typeof consumed).toBe('boolean');
    });

    it('should calculate experience gain', () => {
      const experience = modernCombat.calculateExperienceGain(mockEnemy, 2);
      expect(typeof experience).toBe('number');
      expect(experience).toBeGreaterThan(0);
    });
  });

  describe('SRP Validation - Single Responsibility Principle', () => {
    it('should demonstrate focused responsibilities for each component', () => {
      // Each service should have a clear, single responsibility
      
      const hitCalculator = new HitChanceCalculator();
      const damageCalculator = new DamageCalculator();
      const ammoManager = new AmmoManager();
      const armorCalculator = new ArmorCalculator();
      const experienceCalculator = new ExperienceCalculator();
      const messageGenerator = new CombatMessageGenerator();

      // HitChanceCalculator - only hit calculations
      expect(typeof hitCalculator.calculateHitChance).toBe('function');
      expect(typeof hitCalculator.getHitChance).toBe('function');
      expect(typeof hitCalculator.checkHit).toBe('function');

      // DamageCalculator - only damage calculations
      expect(typeof damageCalculator.calculateDamage).toBe('function');
      expect(typeof damageCalculator.calculateCritical).toBe('function');
      expect(typeof damageCalculator.applyArmorMitigation).toBe('function');

      // AmmoManager - only ammo management
      expect(typeof ammoManager.canUseWeapon).toBe('function');
      expect(typeof ammoManager.consumeAmmo).toBe('function');
      expect(typeof ammoManager.getRemainingAmmo).toBe('function');

      // ArmorCalculator - only armor calculations
      expect(typeof armorCalculator.getArmorInfo).toBe('function');
      expect(typeof armorCalculator.calculatePlayerArmorReduction).toBe('function');
      expect(typeof armorCalculator.compareArmor).toBe('function');

      // ExperienceCalculator - only experience calculations
      expect(typeof experienceCalculator.calculateExperienceGain).toBe('function');
      expect(typeof experienceCalculator.checkLevelUp).toBe('function');
      expect(typeof experienceCalculator.getExperienceProgress).toBe('function');

      // CombatMessageGenerator - only message generation
      expect(typeof messageGenerator.generateAttackMessage).toBe('function');
      expect(typeof messageGenerator.generateMissMessage).toBe('function');
      expect(typeof messageGenerator.generateDeathMessage).toBe('function');
    });

    it('should show improved maintainability through composition', () => {
      // ModernCombatService composes specialized services
      const modernCombat = ModernCombatService.getInstance();
      
      // Can access individual components for specialized operations
      const hitCalc = modernCombat.getHitChanceCalculator();
      const damageCalc = modernCombat.getDamageCalculator();
      
      // Each component can be tested and modified independently
      expect(hitCalc).toBeInstanceOf(HitChanceCalculator);
      expect(damageCalc).toBeInstanceOf(DamageCalculator);
      
      // Composition allows for easy extension and modification
      const hitDetails = hitCalc.calculateHitChance(mockPlayer, mockWeapon, mockEnemy);
      const damageDetails = damageCalc.calculateDamage(mockWeapon, mockEnemy, mockPlayer);
      
      expect(hitDetails).toHaveProperty('finalHitChance');
      expect(damageDetails).toHaveProperty('finalDamage');
    });
  });
});
