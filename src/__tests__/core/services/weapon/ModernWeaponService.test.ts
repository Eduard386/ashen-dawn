/**
 * Weapon Service SRP Implementation Tests
 * Comprehensive testing of all weapon service components and their SRP compliance
 */

import {
  WeaponRegistry,
  WeaponQueryEngine,
  WeaponClassifier,
  WeaponDamageCalculator,
  LegacyWeaponConverter,
  WeaponDatabaseLoader,
  ModernWeaponService,
  type WeaponClassification,
  type DamageComparison,
  type WeaponDamageStats
} from '../../../../typescript/core/services/weapon';

import type { IWeapon } from '../../../../typescript/core/interfaces/IWeapon';

describe('Weapon Service SRP Implementation', () => {

  describe('WeaponRegistry', () => {
    let weaponRegistry: WeaponRegistry;
    let sampleWeapon: IWeapon;

    beforeEach(() => {
      weaponRegistry = new WeaponRegistry();
      sampleWeapon = {
        name: 'test_pistol',
        skill: 'small_guns',
        ammoType: 'mm_9',
        cooldown: 2500,
        damage: { min: 10, max: 20 },
        clipSize: 12,
        shotsPerAttack: 1,
        criticalChance: 10
      };
    });

    describe('Single Responsibility: Weapon Storage and Retrieval', () => {
      it('should register and retrieve weapons correctly', () => {
        weaponRegistry.registerWeapon(sampleWeapon);
        
        const retrieved = weaponRegistry.getWeapon('test_pistol');
        expect(retrieved).toEqual(sampleWeapon);
        expect(weaponRegistry.hasWeapon('test_pistol')).toBe(true);
        expect(weaponRegistry.getWeaponCount()).toBe(1);
      });

      it('should handle weapon collections correctly', () => {
        const weapon1 = { ...sampleWeapon, name: 'weapon1' };
        const weapon2 = { ...sampleWeapon, name: 'weapon2' };
        
        weaponRegistry.registerWeapons([weapon1, weapon2]);

        const allWeapons = weaponRegistry.getAllWeapons();
        const weaponNames = weaponRegistry.getWeaponNames();
        
        expect(allWeapons).toHaveLength(2);
        expect(weaponNames).toEqual(['weapon1', 'weapon2']);
        expect(weaponRegistry.getWeaponCount()).toBe(2);
      });

      it('should provide weapon removal and clearing', () => {
        weaponRegistry.registerWeapon(sampleWeapon);
        expect(weaponRegistry.getWeaponCount()).toBe(1);

        const removed = weaponRegistry.removeWeapon('test_pistol');
        expect(removed).toBe(true);
        expect(weaponRegistry.getWeaponCount()).toBe(0);
        expect(weaponRegistry.getWeapon('test_pistol')).toBeNull();
      });

      it('should validate weapon data correctly', () => {
        expect(weaponRegistry.validateWeapon(sampleWeapon)).toBe(true);
        
        const invalidWeapon = { ...sampleWeapon, name: '' };
        expect(weaponRegistry.validateWeapon(invalidWeapon)).toBe(false);
        
        const invalidDamage = { ...sampleWeapon, damage: { min: 20, max: 10 } };
        expect(weaponRegistry.validateWeapon(invalidDamage)).toBe(false);
      });

      it('should provide registration statistics', () => {
        weaponRegistry.registerWeapon(sampleWeapon);
        weaponRegistry.registerWeapon({ ...sampleWeapon, name: 'weapon2' });

        const stats = weaponRegistry.getRegistrationStats();
        expect(stats.totalWeapons).toBe(2);
        expect(stats.registrationHistory).toHaveLength(2);
        expect(stats.oldestRegistration).toBeTruthy();
        expect(stats.newestRegistration).toBeTruthy();
      });

      it('should handle import/export operations', () => {
        weaponRegistry.registerWeapon(sampleWeapon);
        
        const exported = weaponRegistry.exportWeapons();
        expect(exported['test_pistol']).toEqual(sampleWeapon);
        
        weaponRegistry.clearWeapons();
        expect(weaponRegistry.getWeaponCount()).toBe(0);
        
        const importResult = weaponRegistry.importWeapons(exported);
        expect(importResult.imported).toBe(1);
        expect(importResult.failed).toBe(0);
        expect(weaponRegistry.getWeaponCount()).toBe(1);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on storage and retrieval', () => {
        const registryMethods = [
          'registerWeapon', 'registerWeapons', 'getWeapon', 'hasWeapon',
          'getWeaponNames', 'getAllWeapons', 'removeWeapon', 'clearWeapons',
          'getWeaponCount', 'validateWeapon', 'getRegistrationStats',
          'exportWeapons', 'importWeapons'
        ];

        registryMethods.forEach(method => {
          expect(weaponRegistry[method as keyof WeaponRegistry]).toBeDefined();
          expect(typeof weaponRegistry[method as keyof WeaponRegistry]).toBe('function');
        });

        // Should not have query or calculation methods
        expect((weaponRegistry as any).searchWeapons).toBeUndefined();
        expect((weaponRegistry as any).calculateDamage).toBeUndefined();
        expect((weaponRegistry as any).classifyWeapon).toBeUndefined();
      });

      it('should return copies to prevent external mutation', () => {
        weaponRegistry.registerWeapon(sampleWeapon);
        
        const retrieved = weaponRegistry.getWeapon('test_pistol');
        // Test that mutation attempt doesn't affect stored data
        if (retrieved) {
          (retrieved as any).name = 'mutated_name';
        }
        
        const retrievedAgain = weaponRegistry.getWeapon('test_pistol');
        expect(retrievedAgain!.name).toBe('test_pistol'); // Original value unchanged
      });
    });
  });

  describe('WeaponQueryEngine', () => {
    let weaponRegistry: WeaponRegistry;
    let queryEngine: WeaponQueryEngine;

    beforeEach(() => {
      weaponRegistry = new WeaponRegistry();
      queryEngine = new WeaponQueryEngine(weaponRegistry);

      // Register test weapons
      const weapons: IWeapon[] = [
        {
          name: 'pistol', skill: 'small_guns', ammoType: 'mm_9',
          cooldown: 2500, damage: { min: 10, max: 20 },
          clipSize: 12, shotsPerAttack: 1, criticalChance: 10
        },
        {
          name: 'rifle', skill: 'big_guns', ammoType: 'mm_5_45',
          cooldown: 4000, damage: { min: 20, max: 40 },
          clipSize: 30, shotsPerAttack: 1, criticalChance: 15
        },
        {
          name: 'smg', skill: 'small_guns', ammoType: 'mm_9',
          cooldown: 1500, damage: { min: 8, max: 16 },
          clipSize: 30, shotsPerAttack: 3, criticalChance: 8
        }
      ];
      weaponRegistry.registerWeapons(weapons);
    });

    describe('Single Responsibility: Weapon Filtering and Queries', () => {
      it('should filter weapons by skill type', () => {
        const smallGuns = queryEngine.getWeaponsBySkill('small_guns');
        const bigGuns = queryEngine.getWeaponsBySkill('big_guns');
        
        expect(smallGuns).toHaveLength(2);
        expect(bigGuns).toHaveLength(1);
        expect(smallGuns.map(w => w.name)).toEqual(['pistol', 'smg']);
        expect(bigGuns[0].name).toBe('rifle');
      });

      it('should filter weapons by ammo type', () => {
        const mm9Weapons = queryEngine.getWeaponsByAmmoType('mm_9');
        const mm545Weapons = queryEngine.getWeaponsByAmmoType('mm_5_45');
        
        expect(mm9Weapons).toHaveLength(2);
        expect(mm545Weapons).toHaveLength(1);
        expect(mm9Weapons.map(w => w.name)).toEqual(['pistol', 'smg']);
      });

      it('should filter weapons by damage range', () => {
        const lowDamage = queryEngine.getWeaponsByDamageRange(5, 15);
        const highDamage = queryEngine.getWeaponsByDamageRange(15, 50);
        
        expect(lowDamage).toHaveLength(2); // pistol (avg 15) and smg (avg 12)
        expect(highDamage).toHaveLength(2); // pistol (avg 15) and rifle (avg 30)
        expect(lowDamage.some(w => w.name === 'smg')).toBe(true);
      });

      it('should filter weapons by cooldown range', () => {
        const fastWeapons = queryEngine.getWeaponsByCooldownRange(1000, 2000);
        const slowWeapons = queryEngine.getWeaponsByCooldownRange(3000, 5000);
        
        expect(fastWeapons).toHaveLength(1);
        expect(slowWeapons).toHaveLength(1);
        expect(fastWeapons[0].name).toBe('smg');
        expect(slowWeapons[0].name).toBe('rifle');
      });

      it('should search weapons by name pattern', () => {
        const results = queryEngine.searchWeaponsByName('ri');
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('rifle');
        
        const caseInsensitive = queryEngine.searchWeaponsByName('SMG', false);
        expect(caseInsensitive).toHaveLength(1);
        expect(caseInsensitive[0].name).toBe('smg');
      });

      it('should handle complex multi-criteria queries', () => {
        const results = queryEngine.getWeaponsMatchingCriteria({
          skills: ['small_guns'],
          minDamage: 8,
          maxCooldown: 3000
        });
        
        expect(results).toHaveLength(2);
        expect(results.map(w => w.name)).toEqual(['pistol', 'smg']);
      });

      it('should sort weapons by damage and cooldown', () => {
        const byDamage = queryEngine.getWeaponsSortedByDamage();
        const byCooldown = queryEngine.getWeaponsSortedByCooldown();
        
        expect(byDamage[0].name).toBe('rifle'); // Highest damage
        expect(byCooldown[0].name).toBe('smg'); // Fastest cooldown
      });

      it('should provide top weapons by criteria', () => {
        const topDamage = queryEngine.getTopWeapons(2, 'damage');
        const topSpeed = queryEngine.getTopWeapons(2, 'speed');
        
        expect(topDamage).toHaveLength(2);
        expect(topSpeed).toHaveLength(2);
        expect(topDamage[0].name).toBe('rifle');
        expect(topSpeed[0].name).toBe('smg');
      });

      it('should track query statistics', () => {
        queryEngine.getWeaponsBySkill('small_guns');
        queryEngine.searchWeaponsByName('test');
        queryEngine.getTopWeapons(3);
        
        const stats = queryEngine.getQueryStats();
        expect(stats.totalQueries).toBe(3);
        expect(stats.queryTypeBreakdown.get('skill')).toBe(1);
        expect(stats.queryTypeBreakdown.get('nameSearch')).toBe(1);
        expect(stats.queryTypeBreakdown.get('topWeapons')).toBe(1);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on querying and filtering', () => {
        const queryMethods = [
          'getWeaponsBySkill', 'getWeaponsByAmmoType', 'getWeaponsByDamageRange',
          'getWeaponsByCooldownRange', 'getWeaponsByCriticalChance', 'getWeaponsByClipSize',
          'searchWeaponsByName', 'getWeaponsMatchingCriteria', 'getWeaponsSortedByDamage',
          'getWeaponsSortedByCooldown', 'getTopWeapons', 'getQueryStats', 'clearQueryHistory'
        ];

        queryMethods.forEach(method => {
          expect(queryEngine[method as keyof WeaponQueryEngine]).toBeDefined();
          expect(typeof queryEngine[method as keyof WeaponQueryEngine]).toBe('function');
        });

        // Should not have storage or calculation methods
        expect((queryEngine as any).registerWeapon).toBeUndefined();
        expect((queryEngine as any).calculateDamage).toBeUndefined();
        expect((queryEngine as any).classifyWeapon).toBeUndefined();
      });

      it('should delegate storage to registry', () => {
        // Query engine should use registry, not store weapons directly
        expect(() => {
          queryEngine.getWeaponsBySkill('small_guns');
        }).not.toThrow();
        
        const results = queryEngine.getWeaponsBySkill('small_guns');
        expect(results).toHaveLength(2); // From registry
      });
    });
  });

  describe('WeaponClassifier', () => {
    let weaponRegistry: WeaponRegistry;
    let classifier: WeaponClassifier;

    beforeEach(() => {
      weaponRegistry = new WeaponRegistry();
      classifier = new WeaponClassifier(weaponRegistry);

      const weapons: IWeapon[] = [
        {
          name: 'knife', skill: 'melee_weapons', ammoType: 'melee',
          cooldown: 800, damage: { min: 5, max: 10 },
          clipSize: 1000, shotsPerAttack: 1, criticalChance: 15
        },
        {
          name: 'smg', skill: 'small_guns', ammoType: 'mm_9',
          cooldown: 1500, damage: { min: 8, max: 16 },
          clipSize: 30, shotsPerAttack: 3, criticalChance: 8
        },
        {
          name: 'grenade', skill: 'pyrotechnics', ammoType: 'frag_grenade',
          cooldown: 6000, damage: { min: 30, max: 60 },
          clipSize: 1, shotsPerAttack: 1, criticalChance: 25
        }
      ];
      weaponRegistry.registerWeapons(weapons);
    });

    describe('Single Responsibility: Weapon Classification', () => {
      it('should classify ranged vs melee weapons', () => {
        expect(classifier.isMeleeWeapon('knife')).toBe(true);
        expect(classifier.isRangedWeapon('knife')).toBe(false);
        
        expect(classifier.isRangedWeapon('smg')).toBe(true);
        expect(classifier.isMeleeWeapon('smg')).toBe(false);
      });

      it('should classify automatic vs single-shot weapons', () => {
        expect(classifier.isAutomaticWeapon('smg')).toBe(true);
        expect(classifier.isSingleShotWeapon('smg')).toBe(false);
        
        expect(classifier.isSingleShotWeapon('knife')).toBe(true);
        expect(classifier.isAutomaticWeapon('knife')).toBe(false);
      });

      it('should classify special weapon types', () => {
        expect(classifier.isExplosiveWeapon('grenade')).toBe(true);
        expect(classifier.isExplosiveWeapon('knife')).toBe(false);
        
        expect(classifier.isEnergyWeapon('knife')).toBe(false);
      });

      it('should categorize fire rate', () => {
        expect(classifier.getFireRateCategory('knife')).toBe('very_fast'); // 800ms
        expect(classifier.getFireRateCategory('smg')).toBe('fast'); // 1500ms
        expect(classifier.getFireRateCategory('grenade')).toBe('very_slow'); // 6000ms
      });

      it('should categorize damage levels', () => {
        expect(classifier.getDamageCategory('knife')).toBe('very_low'); // avg 7.5
        expect(classifier.getDamageCategory('smg')).toBe('low'); // avg 12
        expect(classifier.getDamageCategory('grenade')).toBe('very_high'); // avg 45
      });

      it('should provide comprehensive classification', () => {
        const classification = classifier.getWeaponClassification('smg');
        
        expect(classification.weaponName).toBe('smg');
        expect(classification.exists).toBe(true);
        expect(classification.isRanged).toBe(true);
        expect(classification.isMelee).toBe(false);
        expect(classification.isAutomatic).toBe(true);
        expect(classification.fireRateCategory).toBe('fast');
        expect(classification.damageCategory).toBe('low');
        expect(classification.ammoType).toBe('mm_9');
        expect(classification.skillType).toBe('small_guns');
      });

      it('should filter weapons by classification', () => {
        const rangedWeapons = classifier.getWeaponsByClassification({ isRanged: true });
        const automaticWeapons = classifier.getWeaponsByClassification({ isAutomatic: true });
        
        expect(rangedWeapons).toHaveLength(2);
        expect(automaticWeapons).toHaveLength(1);
        expect(automaticWeapons[0].name).toBe('smg');
      });

      it('should provide classification statistics', () => {
        const stats = classifier.getClassificationStats();
        
        expect(stats.totalClassified).toBe(3);
        expect(stats.meleeCount).toBe(1);
        expect(stats.rangedCount).toBe(2);
        expect(stats.automaticCount).toBe(1);
        expect(stats.explosiveCount).toBe(1);
      });

      it('should cache classifications for performance', () => {
        // First call should calculate and cache
        const classification1 = classifier.getWeaponClassification('smg');
        const classification2 = classifier.getWeaponClassification('smg');
        
        expect(classification1).toBe(classification2); // Same object from cache
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on classification logic', () => {
        const classifierMethods = [
          'isRangedWeapon', 'isMeleeWeapon', 'isAutomaticWeapon', 'isSingleShotWeapon',
          'isExplosiveWeapon', 'isEnergyWeapon', 'getFireRateCategory', 'getDamageCategory',
          'getAccuracyCategory', 'getWeaponClassification', 'getWeaponsByClassification',
          'getClassificationStats', 'clearCache', 'getClassificationHistory'
        ];

        classifierMethods.forEach(method => {
          expect(classifier[method as keyof WeaponClassifier]).toBeDefined();
          expect(typeof classifier[method as keyof WeaponClassifier]).toBe('function');
        });

        // Should not have storage or calculation methods
        expect((classifier as any).registerWeapon).toBeUndefined();
        expect((classifier as any).calculateDamage).toBeUndefined();
        expect((classifier as any).queryWeapons).toBeUndefined();
      });

      it('should use registry for data, not store weapons', () => {
        const classification = classifier.getWeaponClassification('smg');
        expect(classification.exists).toBe(true);
        
        const nonExistent = classifier.getWeaponClassification('nonexistent');
        expect(nonExistent.exists).toBe(false);
      });
    });
  });

  describe('WeaponDamageCalculator', () => {
    let weaponRegistry: WeaponRegistry;
    let damageCalculator: WeaponDamageCalculator;

    beforeEach(() => {
      weaponRegistry = new WeaponRegistry();
      damageCalculator = new WeaponDamageCalculator(weaponRegistry);

      const weapons: IWeapon[] = [
        {
          name: 'pistol', skill: 'small_guns', ammoType: 'mm_9',
          cooldown: 2500, damage: { min: 10, max: 20 },
          clipSize: 12, shotsPerAttack: 1, criticalChance: 10
        },
        {
          name: 'smg', skill: 'small_guns', ammoType: 'mm_9',
          cooldown: 1500, damage: { min: 8, max: 16 },
          clipSize: 30, shotsPerAttack: 3, criticalChance: 8
        }
      ];
      weaponRegistry.registerWeapons(weapons);
    });

    describe('Single Responsibility: Damage Calculations', () => {
      it('should calculate basic damage values', () => {
        expect(damageCalculator.getMinimumDamage('pistol')).toBe(10);
        expect(damageCalculator.getMaximumDamage('pistol')).toBe(20);
        expect(damageCalculator.getAverageDamage('pistol')).toBe(15);
        expect(damageCalculator.getDamageVariance('pistol')).toBe(10);
      });

      it('should format damage range strings', () => {
        expect(damageCalculator.getDamageRangeString('pistol')).toBe('10-20');
        
        // Test single value
        weaponRegistry.registerWeapon({
          name: 'fixed_damage', skill: 'small_guns', ammoType: 'mm_9',
          cooldown: 1000, damage: { min: 15, max: 15 },
          clipSize: 1, shotsPerAttack: 1, criticalChance: 5
        });
        expect(damageCalculator.getDamageRangeString('fixed_damage')).toBe('15');
      });

      it('should calculate damage per shot with multiple shots', () => {
        expect(damageCalculator.getDamagePerShot('pistol')).toBe(15); // 15 * 1
        expect(damageCalculator.getDamagePerShot('smg')).toBe(36); // 12 * 3
      });

      it('should calculate damage per second (DPS)', () => {
        const pistolDPS = damageCalculator.getDamagePerSecond('pistol');
        const smgDPS = damageCalculator.getDamagePerSecond('smg');
        
        expect(pistolDPS).toBeCloseTo(6, 1); // 15 damage / 2.5s
        expect(smgDPS).toBeCloseTo(24, 1); // 36 damage / 1.5s
      });

      it('should calculate expected damage with criticals', () => {
        const expectedDamage = damageCalculator.getExpectedDamageWithCriticals('pistol', 2.0);
        // 15 * 0.9 + 30 * 0.1 = 13.5 + 3 = 16.5
        expect(expectedDamage).toBeCloseTo(16.5, 1);
      });

      it('should calculate damage efficiency', () => {
        const pistolEfficiency = damageCalculator.getDamageEfficiency('pistol');
        const smgEfficiency = damageCalculator.getDamageEfficiency('smg');
        
        expect(pistolEfficiency).toBeCloseTo(0.006, 3); // 15/2500
        expect(smgEfficiency).toBeCloseTo(0.024, 3); // 36/1500
      });

      it('should compare damage between weapons', () => {
        const comparison = damageCalculator.compareDamage('pistol', 'smg');
        
        expect(comparison.weapon1).toBe('pistol');
        expect(comparison.weapon2).toBe('smg');
        expect(comparison.valid).toBe(true);
        expect(comparison.avgDamage1).toBe(15);
        expect(comparison.avgDamage2).toBe(12);
        expect(comparison.winner).toBe('weapon2'); // SMG has higher DPS
      });

      it('should provide comprehensive damage statistics', () => {
        const allStats = damageCalculator.getAllWeaponDamageStats();
        
        expect(allStats).toHaveLength(2);
        const pistolStats = allStats.find(s => s.weaponName === 'pistol')!;
        expect(pistolStats.minDamage).toBe(10);
        expect(pistolStats.maxDamage).toBe(20);
        expect(pistolStats.avgDamage).toBe(15);
      });

      it('should find top weapons by criteria', () => {
        const topDamage = damageCalculator.getHighestDamageWeapons(1);
        const topDPS = damageCalculator.getHighestDPSWeapons(1);
        const mostEfficient = damageCalculator.getMostEfficientWeapons(1);
        
        expect(topDamage[0].weaponName).toBe('pistol'); // Higher avg damage
        expect(topDPS[0].weaponName).toBe('smg'); // Higher DPS
        expect(mostEfficient[0].weaponName).toBe('smg'); // More efficient
      });

      it('should track calculation statistics', () => {
        damageCalculator.getAverageDamage('pistol');
        damageCalculator.getDamagePerSecond('smg');
        damageCalculator.compareDamage('pistol', 'smg');
        
        const stats = damageCalculator.getCalculationStats();
        expect(stats.totalCalculations).toBeGreaterThan(0);
        expect(stats.weaponCalculationCount.get('pistol')).toBeGreaterThan(0);
        expect(stats.weaponCalculationCount.get('smg')).toBeGreaterThan(0);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on damage calculations', () => {
        const calculatorMethods = [
          'getDamageRangeString', 'getAverageDamage', 'getMinimumDamage', 'getMaximumDamage',
          'getDamagePerShot', 'getDamagePerSecond', 'getExpectedDamageWithCriticals',
          'getDamageVariance', 'getDamageEfficiency', 'compareDamage', 'getAllWeaponDamageStats',
          'getHighestDamageWeapons', 'getHighestDPSWeapons', 'getMostEfficientWeapons',
          'getCalculationStats', 'clearCalculationHistory'
        ];

        calculatorMethods.forEach(method => {
          expect(damageCalculator[method as keyof WeaponDamageCalculator]).toBeDefined();
          expect(typeof damageCalculator[method as keyof WeaponDamageCalculator]).toBe('function');
        });

        // Should not have storage or query methods
        expect((damageCalculator as any).registerWeapon).toBeUndefined();
        expect((damageCalculator as any).searchWeapons).toBeUndefined();
        expect((damageCalculator as any).classifyWeapon).toBeUndefined();
      });

      it('should handle missing weapons gracefully', () => {
        expect(damageCalculator.getAverageDamage('nonexistent')).toBe(0);
        expect(damageCalculator.getDamageRangeString('nonexistent')).toBe('Unknown');
        
        const comparison = damageCalculator.compareDamage('pistol', 'nonexistent');
        expect(comparison.valid).toBe(false);
      });
    });
  });

  describe('LegacyWeaponConverter', () => {
    let converter: LegacyWeaponConverter;
    let legacyWeaponData: any;

    beforeEach(() => {
      converter = new LegacyWeaponConverter();
      legacyWeaponData = {
        name: 'Baseball Bat',
        skill: 'melee weapons',
        ammoType: 'none',
        cooldown: 3000,
        damage: { min: 3, max: 10 },
        clipSize: 1000,
        shotsPerAttack: 1,
        criticalChance: 5
      };
    });

    describe('Single Responsibility: Legacy Data Conversion', () => {
      it('should convert legacy weapon names', () => {
        expect(converter.convertLegacyName('Baseball Bat')).toBe('baseball_bat');
        expect(converter.convertLegacyName('9mm pistol')).toBe('9mm_pistol');
        expect(converter.convertLegacyName('44 Magnum revolver')).toBe('magnum_44_revolver');
        expect(converter.convertLegacyName('SMG')).toBe('smg_9mm');
      });

      it('should handle automatic name conversion', () => {
        const result = converter.convertLegacyName('Some New Weapon');
        expect(result).toBe('some_new_weapon');
        
        const withNumbers = converter.convertLegacyName('Weapon 2000');
        expect(withNumbers).toBe('weapon_2000');
      });

      it('should detect legacy format correctly', () => {
        expect(converter.isLegacyFormat('Baseball Bat')).toBe(true);
        expect(converter.isLegacyFormat('9mm pistol')).toBe(true);
        expect(converter.isLegacyFormat('Some Weapon')).toBe(true);
        
        expect(converter.isLegacyFormat('baseball_bat')).toBe(false);
        expect(converter.isLegacyFormat('9mm_pistol')).toBe(false);
      });

      it('should convert legacy weapon data structures', () => {
        const modernWeapon = converter.convertLegacyWeaponData(legacyWeaponData);
        
        expect(modernWeapon).toBeTruthy();
        expect(modernWeapon!.name).toBe('baseball_bat');
        expect(modernWeapon!.skill).toBe('melee_weapons');
        expect(modernWeapon!.ammoType).toBe('melee');
        expect(modernWeapon!.damage).toEqual({ min: 3, max: 10 });
      });

      it('should handle invalid legacy data gracefully', () => {
        const invalidData = { invalid: 'data' };
        const result = converter.convertLegacyWeaponData(invalidData);
        expect(result).toBeNull();
        
        const result2 = converter.convertLegacyWeaponData(null);
        expect(result2).toBeNull();
      });

      it('should convert multiple weapons at once', () => {
        const legacyArray = [
          legacyWeaponData,
          { ...legacyWeaponData, name: '9mm pistol' },
          { invalid: 'data' } // This should fail conversion
        ];
        
        const result = converter.convertLegacyWeaponArray(legacyArray);
        expect(result.converted).toHaveLength(2);
        expect(result.failed).toBe(1);
        expect(result.errors).toHaveLength(1);
      });

      it('should provide reverse mapping', () => {
        const legacyName = converter.getModernToLegacyName('baseball_bat');
        expect(legacyName).toBe('Baseball Bat');
        
        const unknown = converter.getModernToLegacyName('unknown_weapon');
        expect(unknown).toBeNull();
      });

      it('should support custom mappings', () => {
        converter.addLegacyMapping('Custom Weapon', 'custom_weapon');
        expect(converter.convertLegacyName('Custom Weapon')).toBe('custom_weapon');
        
        const removed = converter.removeLegacyMapping('Custom Weapon');
        expect(removed).toBe(true);
        
        // Should fallback to automatic conversion
        expect(converter.convertLegacyName('Custom Weapon')).toBe('custom_weapon');
      });

      it('should track conversion statistics', () => {
        converter.convertLegacyName('Baseball Bat');
        converter.convertLegacyWeaponData(legacyWeaponData);
        converter.convertLegacyName('9mm pistol');
        
        const stats = converter.getConversionStats();
        expect(stats.totalConversions).toBeGreaterThanOrEqual(3);
        expect(stats.nameConversions).toBeGreaterThanOrEqual(2);
        expect(stats.dataConversions).toBeGreaterThanOrEqual(1);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on data conversion', () => {
        const converterMethods = [
          'convertLegacyName', 'convertLegacyNames', 'isLegacyFormat',
          'convertLegacyWeaponData', 'convertLegacyWeaponArray', 'getModernToLegacyName',
          'addLegacyMapping', 'removeLegacyMapping', 'getAllLegacyMappings',
          'getConversionStats', 'clearConversionHistory'
        ];

        converterMethods.forEach(method => {
          expect(converter[method as keyof LegacyWeaponConverter]).toBeDefined();
          expect(typeof converter[method as keyof LegacyWeaponConverter]).toBe('function');
        });

        // Should not have storage or calculation methods
        expect((converter as any).registerWeapon).toBeUndefined();
        expect((converter as any).calculateDamage).toBeUndefined();
        expect((converter as any).searchWeapons).toBeUndefined();
      });

      it('should be stateless except for history tracking', () => {
        const result1 = converter.convertLegacyName('Baseball bat');
        const result2 = converter.convertLegacyName('Baseball bat');
        
        expect(result1).toBe(result2);
        expect(result1).toBe('baseball_bat');
      });
    });
  });

  describe('WeaponDatabaseLoader', () => {
    let weaponRegistry: WeaponRegistry;
    let databaseLoader: WeaponDatabaseLoader;

    beforeEach(() => {
      weaponRegistry = new WeaponRegistry();
      databaseLoader = new WeaponDatabaseLoader(weaponRegistry);
    });

    describe('Single Responsibility: Database Loading and Initialization', () => {
      it('should load default weapon database', () => {
        const result = databaseLoader.loadDefaultWeapons();
        
        expect(result.loaded).toBeGreaterThan(0);
        expect(result.failed).toBe(0);
        expect(result.errors).toHaveLength(0);
        expect(weaponRegistry.getWeaponCount()).toBe(result.loaded);
      });

      it('should load weapons from array', () => {
        const weapons: IWeapon[] = [
          {
            name: 'test_weapon', skill: 'small_guns', ammoType: 'mm_9',
            cooldown: 1000, damage: { min: 5, max: 10 },
            clipSize: 10, shotsPerAttack: 1, criticalChance: 5
          }
        ];
        
        const result = databaseLoader.loadWeaponArray(weapons, 'test');
        expect(result.loaded).toBe(1);
        expect(result.failed).toBe(0);
        expect(weaponRegistry.hasWeapon('test_weapon')).toBe(true);
      });

      it('should load weapons from JSON data', () => {
        const jsonData = JSON.stringify([
          {
            name: 'json_weapon', skill: 'small_guns', ammoType: 'mm_9',
            cooldown: 1000, damage: { min: 5, max: 10 },
            clipSize: 10, shotsPerAttack: 1
          }
        ]);
        
        const result = databaseLoader.loadWeaponsFromJSON(jsonData, 'json');
        expect(result.loaded).toBe(1);
        expect(result.failed).toBe(0);
        expect(weaponRegistry.hasWeapon('json_weapon')).toBe(true);
      });

      it('should handle invalid JSON gracefully', () => {
        const result = databaseLoader.loadWeaponsFromJSON('invalid json');
        expect(result.loaded).toBe(0);
        expect(result.failed).toBe(1);
        expect(result.errors).toHaveLength(1);
      });

      it('should load weapons from object map', () => {
        const weaponMap = {
          weapon1: {
            name: 'weapon1', skill: 'small_guns', ammoType: 'mm_9',
            cooldown: 1000, damage: { min: 5, max: 10 },
            clipSize: 10, shotsPerAttack: 1
          } as IWeapon
        };
        
        const result = databaseLoader.loadWeaponsFromMap(weaponMap, 'map');
        expect(result.loaded).toBe(1);
        expect(result.failed).toBe(0);
        expect(weaponRegistry.hasWeapon('weapon1')).toBe(true);
      });

      it('should handle weapon validation during loading', () => {
        const invalidWeapons = [
          {
            name: '', // Invalid name
            skill: 'small_guns', ammoType: 'mm_9',
            cooldown: 1000, damage: { min: 5, max: 10 },
            clipSize: 10, shotsPerAttack: 1
          } as IWeapon
        ];
        
        const result = databaseLoader.loadWeaponArray(invalidWeapons);
        expect(result.loaded).toBe(0);
        expect(result.failed).toBe(1);
        expect(result.errors).toHaveLength(1);
      });

      it('should reload weapons correctly', () => {
        // Load some weapons first
        databaseLoader.loadDefaultWeapons();
        const initialCount = weaponRegistry.getWeaponCount();
        
        // Add a custom weapon
        weaponRegistry.registerWeapon({
          name: 'custom', skill: 'small_guns', ammoType: 'mm_9',
          cooldown: 1000, damage: { min: 1, max: 2 },
          clipSize: 1, shotsPerAttack: 1, criticalChance: 5
        });
        
        expect(weaponRegistry.getWeaponCount()).toBe(initialCount + 1);
        
        // Reload should clear and reload only default weapons
        const reloadResult = databaseLoader.reloadDefaultWeapons();
        expect(reloadResult.loaded).toBe(initialCount);
        expect(weaponRegistry.getWeaponCount()).toBe(initialCount);
        expect(weaponRegistry.hasWeapon('custom')).toBe(false);
      });

      it('should track loading statistics', () => {
        databaseLoader.loadDefaultWeapons();
        databaseLoader.loadWeaponArray([]);
        
        const stats = databaseLoader.getLoadingStats();
        expect(stats.totalLoadOperations).toBe(2);
        expect(stats.totalWeaponsLoaded).toBeGreaterThan(0);
        expect(stats.sourceBreakdown.get('default')).toBeGreaterThan(0);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on data loading', () => {
        const loaderMethods = [
          'loadDefaultWeapons', 'loadWeaponArray', 'loadWeaponsFromJSON',
          'loadWeaponsFromMap', 'reloadDefaultWeapons', 'getLoadingStats',
          'clearLoadingHistory'
        ];

        loaderMethods.forEach(method => {
          expect(databaseLoader[method as keyof WeaponDatabaseLoader]).toBeDefined();
          expect(typeof databaseLoader[method as keyof WeaponDatabaseLoader]).toBe('function');
        });

        // Should not have query or calculation methods
        expect((databaseLoader as any).searchWeapons).toBeUndefined();
        expect((databaseLoader as any).calculateDamage).toBeUndefined();
        expect((databaseLoader as any).classifyWeapon).toBeUndefined();
      });

      it('should delegate storage to registry', () => {
        const initialCount = weaponRegistry.getWeaponCount();
        
        databaseLoader.loadDefaultWeapons();
        
        expect(weaponRegistry.getWeaponCount()).toBeGreaterThan(initialCount);
        // Loader should not store weapons directly
      });
    });
  });

  describe('ModernWeaponService', () => {
    let weaponService: ModernWeaponService;

    beforeEach(async () => {
      weaponService = ModernWeaponService.getInstance();
      await weaponService.initializeService();
    });

    describe('Single Responsibility: System Orchestration', () => {
      it('should orchestrate weapon system initialization', async () => {
        expect(weaponService.isInitialized()).toBe(true);
        
        const allWeapons = weaponService.getAllWeapons();
        expect(allWeapons.length).toBeGreaterThan(0);
        
        // Should have loaded default weapons
        expect(weaponService.hasWeapon('9mm_pistol')).toBe(true);
        expect(weaponService.hasWeapon('baseball_bat')).toBe(true);
      });

      it('should coordinate registry operations', () => {
        const weapon = weaponService.getWeapon('9mm_pistol');
        expect(weapon).toBeTruthy();
        expect(weapon!.skill).toBe('small_guns');
        
        const newWeapon: IWeapon = {
          name: 'test_weapon', skill: 'small_guns', ammoType: 'mm_9',
          cooldown: 1000, damage: { min: 5, max: 10 },
          clipSize: 10, shotsPerAttack: 1, criticalChance: 5
        };
        
        weaponService.registerWeapon(newWeapon);
        expect(weaponService.hasWeapon('test_weapon')).toBe(true);
      });

      it('should coordinate query operations', () => {
        const smallGuns = weaponService.getWeaponsBySkill('small_guns');
        const mm9Weapons = weaponService.getWeaponsByAmmoType('mm_9');
        const searchResults = weaponService.searchWeapons('pistol');
        
        expect(smallGuns.length).toBeGreaterThan(0);
        expect(mm9Weapons.length).toBeGreaterThan(0);
        expect(searchResults.length).toBeGreaterThan(0);
        
        const topWeapons = weaponService.getTopWeapons(3, 'damage');
        expect(topWeapons).toHaveLength(3);
      });

      it('should coordinate classification operations', () => {
        expect(weaponService.isRangedWeapon('9mm_pistol')).toBe(true);
        expect(weaponService.isMeleeWeapon('baseball_bat')).toBe(true);
        expect(weaponService.isAutomaticWeapon('smg_9mm')).toBe(true);
        
        const classification = weaponService.getWeaponClassification('9mm_pistol');
        expect(classification.isRanged).toBe(true);
        expect(classification.skillType).toBe('small_guns');
      });

      it('should coordinate damage calculation operations', () => {
        const damage = weaponService.getAverageDamage('9mm_pistol');
        const dps = weaponService.getDamagePerSecond('9mm_pistol');
        const rangeString = weaponService.getDamageRangeString('9mm_pistol');
        
        expect(damage).toBeGreaterThan(0);
        expect(dps).toBeGreaterThan(0);
        expect(rangeString).toContain('-');
        
        const comparison = weaponService.compareDamage('9mm_pistol', 'smg_9mm');
        expect(comparison.valid).toBe(true);
        
        const allStats = weaponService.getAllWeaponDamageStats();
        expect(allStats.length).toBeGreaterThan(0);
      });

      it('should coordinate legacy conversion operations', () => {
        expect(weaponService.convertLegacyName('9mm pistol')).toBe('9mm_pistol');
        expect(weaponService.isLegacyFormat('Baseball bat')).toBe(true);
        expect(weaponService.isLegacyFormat('baseball_bat')).toBe(false);
        
        const legacyData = {
          name: 'Test Weapon',
          skill: 'small guns',
          ammoType: '9mm',
          damage: { min: 5, max: 10 },
          cooldown: 1000,
          clipSize: 10,
          shotsPerAttack: 1
        };
        
        const converted = weaponService.convertLegacyWeaponData(legacyData);
        expect(converted).toBeTruthy();
        expect(converted!.name).toBe('test_weapon');
      });

      it('should provide comprehensive system status', () => {
        const status = weaponService.getSystemStatus();
        
        expect(status.initialized).toBe(true);
        expect(status.weaponCount).toBeGreaterThan(0);
        expect(status.components.registry).toBe(true);
        expect(status.components.queryEngine).toBe(true);
        expect(status.components.classifier).toBe(true);
        expect(status.components.damageCalculator).toBe(true);
        expect(status.components.legacyConverter).toBe(true);
        expect(status.components.databaseLoader).toBe(true);
        
        expect(status.statistics.registrationStats).toBeTruthy();
        expect(status.statistics.queryStats).toBeTruthy();
        expect(status.statistics.classificationStats).toBeTruthy();
        expect(status.statistics.calculationStats).toBeTruthy();
        expect(status.statistics.conversionStats).toBeTruthy();
        expect(status.statistics.loadingStats).toBeTruthy();
      });

      it('should validate all components', () => {
        expect(weaponService.validateAllComponents()).toBe(true);
      });

      it('should provide access to individual components', () => {
        expect(weaponService.getWeaponRegistry()).toBeInstanceOf(WeaponRegistry);
        expect(weaponService.getQueryEngine()).toBeInstanceOf(WeaponQueryEngine);
        expect(weaponService.getClassifier()).toBeInstanceOf(WeaponClassifier);
        expect(weaponService.getDamageCalculator()).toBeInstanceOf(WeaponDamageCalculator);
        expect(weaponService.getLegacyConverter()).toBeInstanceOf(LegacyWeaponConverter);
        expect(weaponService.getDatabaseLoader()).toBeInstanceOf(WeaponDatabaseLoader);
      });

      it('should handle system reset and data import/export', () => {
        const exportedData = weaponService.exportSystemData();
        expect(exportedData.weapons).toBeTruthy();
        expect(exportedData.statistics).toBeTruthy();
        expect(exportedData.timestamp).toBeGreaterThan(0);
        
        weaponService.resetSystem();
        expect(weaponService.isInitialized()).toBe(false);
        
        const importResult = weaponService.importSystemData(exportedData);
        expect(importResult.imported).toBeGreaterThan(0);
        expect(importResult.failed).toBe(0);
      });

      it('should maintain singleton pattern', () => {
        const anotherInstance = ModernWeaponService.getInstance();
        expect(anotherInstance).toBe(weaponService);
      });
    });

    describe('SRP Compliance', () => {
      it('should only orchestrate, not implement specific logic', () => {
        // Service should delegate to specialized components
        const registry = weaponService.getWeaponRegistry();
        const queryEngine = weaponService.getQueryEngine();
        
        expect(registry).toBeTruthy();
        expect(queryEngine).toBeTruthy();
        
        // Should not implement low-level logic directly
        expect((weaponService as any).storeWeapon).toBeUndefined();
        expect((weaponService as any).calculateSpecificDamage).toBeUndefined();
        expect((weaponService as any).performDirectQuery).toBeUndefined();
      });

      it('should maintain separation of concerns', () => {
        const weapon = weaponService.getWeapon('9mm_pistol');
        
        // Each operation should be handled by appropriate component
        const queryResult = weaponService.getWeaponsBySkill('small_guns');
        const classification = weaponService.getWeaponClassification('9mm_pistol');
        const damage = weaponService.getAverageDamage('9mm_pistol');
        
        // Operations should be independent
        expect(weapon).toBeTruthy();
        expect(queryResult.length).toBeGreaterThan(0);
        expect(classification.exists).toBe(true);
        expect(damage).toBeGreaterThan(0);
        
        // Each operation delegates to the correct component
        expect(queryResult.some(w => w.name === '9mm_pistol')).toBe(true);
      });
    });
  });

  describe('SRP Integration', () => {
    it('should demonstrate clear separation of responsibilities', () => {
      const registry = new WeaponRegistry();
      const queryEngine = new WeaponQueryEngine(registry);
      const classifier = new WeaponClassifier(registry);
      const calculator = new WeaponDamageCalculator(registry);
      const converter = new LegacyWeaponConverter();
      const loader = new WeaponDatabaseLoader(registry);

      // Each component should have distinct responsibilities
      expect(registry.constructor.name).toBe('WeaponRegistry');
      expect(queryEngine.constructor.name).toBe('WeaponQueryEngine');
      expect(classifier.constructor.name).toBe('WeaponClassifier');
      expect(calculator.constructor.name).toBe('WeaponDamageCalculator');
      expect(converter.constructor.name).toBe('LegacyWeaponConverter');
      expect(loader.constructor.name).toBe('WeaponDatabaseLoader');

      // No component should have methods from another's domain
      expect((registry as any).searchWeapons).toBeUndefined();
      expect((queryEngine as any).calculateDamage).toBeUndefined();
      expect((classifier as any).registerWeapon).toBeUndefined();
      expect((calculator as any).queryWeapons).toBeUndefined();
      expect((converter as any).storeWeapons).toBeUndefined();
      expect((loader as any).classifyWeapons).toBeUndefined();
    });

    it('should support composition over inheritance', () => {
      const modernService = ModernWeaponService.getInstance();
      
      // Service should compose components, not inherit from them
      expect(Object.getPrototypeOf(modernService).constructor.name).toBe('ModernWeaponService');
      
      // Should have component instances as properties
      expect(modernService.getWeaponRegistry()).toBeInstanceOf(WeaponRegistry);
      expect(modernService.getQueryEngine()).toBeInstanceOf(WeaponQueryEngine);
      expect(modernService.getClassifier()).toBeInstanceOf(WeaponClassifier);
      expect(modernService.getDamageCalculator()).toBeInstanceOf(WeaponDamageCalculator);
      expect(modernService.getLegacyConverter()).toBeInstanceOf(LegacyWeaponConverter);
      expect(modernService.getDatabaseLoader()).toBeInstanceOf(WeaponDatabaseLoader);
    });

    it('should enable independent testing of each component', () => {
      // Each component can be tested in isolation
      const registry = new WeaponRegistry();
      const testWeapon: IWeapon = {
        name: 'test_weapon',
        skill: 'small_guns',
        ammoType: 'mm_9',
        cooldown: 1000,
        damage: { min: 5, max: 10 },
        clipSize: 10,
        shotsPerAttack: 1,
        criticalChance: 5
      };
      
      registry.registerWeapon(testWeapon);
      expect(registry.getWeapon('test_weapon')).toEqual(testWeapon);
      
      // Query engine can work independently
      const queryEngine = new WeaponQueryEngine(registry);
      const results = queryEngine.getWeaponsBySkill('small_guns');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('test_weapon');
      
      // Damage calculator can work independently
      const calculator = new WeaponDamageCalculator(registry);
      expect(calculator.getAverageDamage('test_weapon')).toBe(7.5);
      
      // Classifier can work independently
      const classifier = new WeaponClassifier(registry);
      const classification = classifier.getWeaponClassification('test_weapon');
      expect(classification.isRanged).toBe(true);
    });
  });
});
