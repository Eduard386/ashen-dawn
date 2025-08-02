/**
 * Enemy Service SRP Implementation Tests
 * Comprehensive testing of all enemy service components and their SRP compliance
 */

import {
  EnemyTemplateManager,
  EnemyInstanceFactory,
  EnemySpawnManager,
  EnemyHealthManager,
  LegacyEnemyConverter,
  EnemySpriteManager,
  ModernEnemyService,
  IEnemyTemplate,
  IEnemyInstance,
  HealthStatus,
  SpriteSelectionStrategy
} from '../../../../typescript/core/services/enemy/index';

describe('Enemy Service SRP Implementation', () => {

  describe('EnemyTemplateManager', () => {
    let templateManager: EnemyTemplateManager;
    let sampleTemplate: IEnemyTemplate;

    beforeEach(() => {
      templateManager = new EnemyTemplateManager();
      sampleTemplate = {
        name: 'Test Raider',
        type: 'human',
        maxLevel: 3,
        experienceReward: 50,
        defence: {
          health: 30,
          armorClass: 5,
          damageThreshold: 0,
          damageResistance: 0
        },
        attack: {
          hitChance: 60,
          weapon: '9mm_pistol',
          damage: { min: 10, max: 24 },
          shots: 1,
          attackSpeed: 1.0,
          criticalChance: 5
        },
        spawning: { min: 1, max: 4 },
        sprites: ['Raider1', 'Raider2']
      };
    });

    describe('Single Responsibility: Template Storage and Retrieval', () => {
      it('should register and retrieve templates correctly', () => {
        templateManager.registerTemplate(sampleTemplate);
        
        const retrieved = templateManager.getTemplate('Test Raider');
        expect(retrieved).toEqual(sampleTemplate);
        expect(templateManager.hasTemplate('Test Raider')).toBe(true);
        expect(templateManager.getTemplateCount()).toBe(1);
      });

      it('should handle template collections correctly', () => {
        const humanTemplate = { ...sampleTemplate, name: 'Human1', type: 'human' };
        const creatureTemplate = { ...sampleTemplate, name: 'Creature1', type: 'creature' };
        
        templateManager.registerTemplate(humanTemplate);
        templateManager.registerTemplate(creatureTemplate);

        const humans = templateManager.getTemplatesByType('human');
        const creatures = templateManager.getTemplatesByType('creature');
        
        expect(humans).toHaveLength(1);
        expect(creatures).toHaveLength(1);
        expect(humans[0].name).toBe('Human1');
        expect(creatures[0].name).toBe('Creature1');
      });

      it('should provide random template selection', () => {
        templateManager.registerTemplate(sampleTemplate);
        templateManager.registerTemplate({ ...sampleTemplate, name: 'Raider2' });
        templateManager.registerTemplate({ ...sampleTemplate, name: 'Raider3' });

        const randomTemplate = templateManager.getRandomTemplate();
        expect(randomTemplate).toBeTruthy();
        expect(['Test Raider', 'Raider2', 'Raider3']).toContain(randomTemplate!.name);
      });

      it('should manage template removal and clearing', () => {
        templateManager.registerTemplate(sampleTemplate);
        expect(templateManager.getTemplateCount()).toBe(1);

        const removed = templateManager.removeTemplate('Test Raider');
        expect(removed).toBe(true);
        expect(templateManager.getTemplateCount()).toBe(0);
        expect(templateManager.getTemplate('Test Raider')).toBeNull();
      });

      it('should provide comprehensive template statistics', () => {
        const humanTemplate = { ...sampleTemplate, name: 'Human1', type: 'human', maxLevel: 2, defence: { ...sampleTemplate.defence, health: 25 } };
        const creatureTemplate = { ...sampleTemplate, name: 'Creature1', type: 'creature', maxLevel: 4, defence: { ...sampleTemplate.defence, health: 40 } };
        
        templateManager.registerTemplate(humanTemplate);
        templateManager.registerTemplate(creatureTemplate);

        const stats = templateManager.getTemplateStats();
        expect(stats.totalTemplates).toBe(2);
        expect(stats.typeBreakdown.get('human')).toBe(1);
        expect(stats.typeBreakdown.get('creature')).toBe(1);
        expect(stats.maxLevelRange.min).toBe(2);
        expect(stats.maxLevelRange.max).toBe(4);
        expect(stats.healthRange.min).toBe(25);
        expect(stats.healthRange.max).toBe(40);
      });

      it('should validate template data correctly', () => {
        expect(templateManager.validateTemplate(sampleTemplate)).toBe(true);
        
        const invalidTemplate = { ...sampleTemplate, name: '' };
        expect(templateManager.validateTemplate(invalidTemplate)).toBe(false);
        
        const invalidHealth = { ...sampleTemplate, defence: { ...sampleTemplate.defence, health: -10 } };
        expect(templateManager.validateTemplate(invalidHealth)).toBe(false);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on template management', () => {
        const templateManagerMethods = [
          'registerTemplate', 'getTemplate', 'hasTemplate', 'getAllTemplates',
          'getTemplateNames', 'getTemplatesByType', 'getRandomTemplate',
          'removeTemplate', 'clearTemplates', 'getTemplateCount', 'validateTemplate'
        ];

        templateManagerMethods.forEach(method => {
          expect(templateManager[method as keyof EnemyTemplateManager]).toBeDefined();
          expect(typeof templateManager[method as keyof EnemyTemplateManager]).toBe('function');
        });

        // Should not have instance creation or health management methods
        expect((templateManager as any).createInstance).toBeUndefined();
        expect((templateManager as any).applyDamage).toBeUndefined();
        expect((templateManager as any).spawnGroup).toBeUndefined();
      });

      it('should handle template operations independently', () => {
        templateManager.registerTemplate(sampleTemplate);
        
        // Template operations should not affect other concerns
        const retrieved = templateManager.getTemplate('Test Raider');
        expect(retrieved).toEqual(sampleTemplate);
        
        // Modification should only affect template storage
        templateManager.removeTemplate('Test Raider');
        expect(templateManager.getTemplate('Test Raider')).toBeNull();
      });
    });
  });

  describe('EnemyInstanceFactory', () => {
    let instanceFactory: EnemyInstanceFactory;
    let sampleTemplate: IEnemyTemplate;

    beforeEach(() => {
      instanceFactory = new EnemyInstanceFactory();
      sampleTemplate = {
        name: 'Test Raider',
        type: 'human',
        maxLevel: 3,
        experienceReward: 50,
        defence: { health: 30, armorClass: 5, damageThreshold: 0, damageResistance: 0 },
        attack: { hitChance: 60, weapon: '9mm_pistol', damage: { min: 10, max: 24 }, shots: 1, attackSpeed: 1.0, criticalChance: 5 },
        spawning: { min: 1, max: 4 },
        sprites: ['Raider1']
      };
    });

    describe('Single Responsibility: Instance Creation', () => {
      it('should create valid instances from templates', () => {
        const instance = instanceFactory.createInstance(sampleTemplate);
        
        expect(instance.id).toBeTruthy();
        expect(instance.templateName).toBe('Test Raider');
        expect(instance.currentHealth).toBeGreaterThan(0);
        expect(instance.maxHealth).toBeGreaterThan(0);
        expect(instance.currentHealth).toBeLessThanOrEqual(instance.maxHealth);
        expect(instance.level).toBeGreaterThanOrEqual(1);
        expect(instance.level).toBeLessThanOrEqual(sampleTemplate.maxLevel);
        expect(instance.createdAt).toBeGreaterThan(0);
      });

      it('should create multiple instances with unique IDs', () => {
        const instances = instanceFactory.createInstances(sampleTemplate, 3);
        
        expect(instances).toHaveLength(3);
        
        const ids = instances.map(i => i.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(3); // All IDs should be unique
        
        instances.forEach(instance => {
          expect(instance.templateName).toBe('Test Raider');
          expect(instance.currentHealth).toBeGreaterThan(0);
        });
      });

      it('should create elite instances with enhanced stats', () => {
        const eliteInstance = instanceFactory.createEliteInstance(sampleTemplate);
        
        expect(eliteInstance.level).toBeGreaterThan(sampleTemplate.maxLevel);
        expect(eliteInstance.modifiers?.healthBonus).toBe(0.5);
        expect(eliteInstance.modifiers?.damageBonus).toBe(0.3);
        expect(eliteInstance.modifiers?.experienceMultiplier).toBe(1.5);
        expect(eliteInstance.currentHealth).toBeGreaterThan(sampleTemplate.defence.health);
      });

      it('should create weak instances with reduced stats', () => {
        const weakInstance = instanceFactory.createWeakInstance(sampleTemplate);
        
        expect(weakInstance.level).toBeLessThanOrEqual(sampleTemplate.maxLevel);
        expect(weakInstance.modifiers?.healthBonus).toBe(-0.3);
        expect(weakInstance.modifiers?.damageBonus).toBe(-0.2);
        expect(weakInstance.modifiers?.experienceMultiplier).toBe(0.7);
        expect(weakInstance.currentHealth).toBeLessThan(sampleTemplate.defence.health);
      });

      it('should handle health variation configuration', () => {
        instanceFactory.setHealthVariationRange(0.9, 1.0);
        const range = instanceFactory.getHealthVariationRange();
        
        expect(range.min).toBe(0.9);
        expect(range.max).toBe(1.0);
        
        const instance = instanceFactory.createInstance(sampleTemplate);
        const expectedMinHealth = Math.floor(sampleTemplate.defence.health * 0.9);
        const baseHealth = sampleTemplate.defence.health;
        
        expect(instance.currentHealth).toBeGreaterThanOrEqual(expectedMinHealth);
        // maxHealth can vary due to level scaling, so check it's reasonable
        expect(instance.maxHealth).toBeGreaterThanOrEqual(baseHealth);
        expect(instance.maxHealth).toBeLessThanOrEqual(baseHealth * 2); // Reasonable upper bound
      });

      it('should validate instance data correctly', () => {
        const validInstance = instanceFactory.createInstance(sampleTemplate);
        expect(instanceFactory.validateInstance(validInstance)).toBe(true);
        
        const invalidInstance = { ...validInstance, currentHealth: -10 };
        expect(instanceFactory.validateInstance(invalidInstance)).toBe(false);
        
        const overHealthInstance = { ...validInstance, currentHealth: validInstance.maxHealth + 100 };
        expect(instanceFactory.validateInstance(overHealthInstance)).toBe(false);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on instance creation', () => {
        const factoryMethods = [
          'createInstance', 'createInstances', 'createEliteInstance', 'createWeakInstance',
          'createInstanceWithHealth', 'cloneInstance', 'validateInstance'
        ];

        factoryMethods.forEach(method => {
          expect(instanceFactory[method as keyof EnemyInstanceFactory]).toBeDefined();
          expect(typeof instanceFactory[method as keyof EnemyInstanceFactory]).toBe('function');
        });

        // Should not have template management or spawning methods
        expect((instanceFactory as any).registerTemplate).toBeUndefined();
        expect((instanceFactory as any).spawnGroup).toBeUndefined();
        expect((instanceFactory as any).applyDamage).toBeUndefined();
      });

      it('should create instances without side effects', () => {
        const stats = instanceFactory.getCreationStats();
        const initialCount = stats.totalInstancesCreated;
        
        instanceFactory.createInstance(sampleTemplate);
        instanceFactory.createInstances(sampleTemplate, 2);
        
        const finalStats = instanceFactory.getCreationStats();
        expect(finalStats.totalInstancesCreated).toBe(initialCount + 3);
      });
    });
  });

  describe('EnemySpawnManager', () => {
    let spawnManager: EnemySpawnManager;
    let instanceFactory: EnemyInstanceFactory;
    let sampleTemplate: IEnemyTemplate;

    beforeEach(() => {
      spawnManager = new EnemySpawnManager();
      instanceFactory = new EnemyInstanceFactory();
      sampleTemplate = {
        name: 'Test Raider',
        type: 'human',
        maxLevel: 3,
        experienceReward: 50,
        defence: { health: 30, armorClass: 5, damageThreshold: 0, damageResistance: 0 },
        attack: { hitChance: 60, weapon: '9mm_pistol', damage: { min: 10, max: 24 }, shots: 1, attackSpeed: 1.0, criticalChance: 5 },
        spawning: { min: 2, max: 4 },
        sprites: ['Raider1']
      };
    });

    describe('Single Responsibility: Spawn Management', () => {
      it('should spawn enemy groups correctly', () => {
        const result = spawnManager.spawnGroup(sampleTemplate, instanceFactory, {
          spawnChance: 1.0, // Guarantee spawn
          groupSizeRange: { min: 2, max: 3 }
        });

        expect(result.success).toBe(true);
        expect(result.instances).toHaveLength(result.actualGroupSize);
        expect(result.actualGroupSize).toBeGreaterThanOrEqual(2);
        expect(result.actualGroupSize).toBeLessThanOrEqual(3);
        expect(result.templateUsed).toBe('Test Raider');
        expect(result.spawnTime).toBeGreaterThan(0);

        result.instances.forEach(instance => {
          expect(instance.templateName).toBe('Test Raider');
          expect(instance.currentHealth).toBeGreaterThan(0);
        });
      });

      it('should handle spawn failure based on chance', () => {
        const result = spawnManager.spawnGroup(sampleTemplate, instanceFactory, {
          spawnChance: 0.0 // Guarantee failure
        });

        expect(result.success).toBe(false);
        expect(result.instances).toHaveLength(0);
        expect(result.actualGroupSize).toBe(0);
        expect(result.templateUsed).toBe('Test Raider');
      });

      it('should spawn with environmental conditions', () => {
        const result = spawnManager.spawnWithConditions(
          sampleTemplate,
          instanceFactory,
          {
            timeOfDay: 'day',
            playerLevel: 5,
            location: 'wasteland'
          },
          {
            spawnChance: 1.0,
            spawnConditions: {
              timeOfDay: 'day'
            }
          }
        );

        expect(result.success).toBe(true);
        expect(result.spawnLocation).toBe('wasteland');
        expect(result.spawnConditions?.timeOfDay).toBe('day');
      });

      it('should track spawn history correctly', () => {
        const initialHistory = spawnManager.getSpawnHistory();
        const initialCount = initialHistory.length;

        spawnManager.spawnGroup(sampleTemplate, instanceFactory, { spawnChance: 1.0 });
        spawnManager.spawnGroup(sampleTemplate, instanceFactory, { spawnChance: 0.0 });

        const finalHistory = spawnManager.getSpawnHistory();
        expect(finalHistory).toHaveLength(initialCount + 2);

        const successful = spawnManager.getSuccessfulSpawns();
        const failed = spawnManager.getFailedSpawns();
        expect(successful.length).toBeGreaterThanOrEqual(1);
        expect(failed.length).toBeGreaterThanOrEqual(1);
      });

      it('should provide comprehensive spawn statistics', () => {
        spawnManager.spawnGroup(sampleTemplate, instanceFactory, { spawnChance: 1.0 });
        spawnManager.spawnGroup(sampleTemplate, instanceFactory, { spawnChance: 0.0 });

        const stats = spawnManager.getSpawnStats();
        expect(stats.totalSpawnAttempts).toBeGreaterThanOrEqual(2);
        expect(stats.successfulSpawns).toBeGreaterThanOrEqual(1);
        expect(stats.failedSpawns).toBeGreaterThanOrEqual(1);
        expect(stats.successRate).toBeGreaterThan(0);
        expect(stats.successRate).toBeLessThanOrEqual(1);
        expect(stats.templateUsage.get('Test Raider')).toBeGreaterThanOrEqual(2);
      });

      it('should manage spawn configuration correctly', () => {
        const defaultConfig = spawnManager.getDefaultSpawnConfig();
        expect(defaultConfig.groupSizeRange).toBeDefined();
        expect(defaultConfig.spawnChance).toBeDefined();

        spawnManager.setDefaultSpawnConfig({
          groupSizeRange: { min: 3, max: 5 },
          spawnChance: 0.9
        });

        const updatedConfig = spawnManager.getDefaultSpawnConfig();
        expect(updatedConfig.groupSizeRange.min).toBe(3);
        expect(updatedConfig.groupSizeRange.max).toBe(5);
        expect(updatedConfig.spawnChance).toBe(0.9);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on spawn management', () => {
        const spawnMethods = [
          'spawnGroup', 'spawnMultipleGroups', 'spawnWithConditions', 'spawnRandomGroup',
          'setDefaultSpawnConfig', 'getSpawnHistory', 'getSpawnStats'
        ];

        spawnMethods.forEach(method => {
          expect(spawnManager[method as keyof EnemySpawnManager]).toBeDefined();
          expect(typeof spawnManager[method as keyof EnemySpawnManager]).toBe('function');
        });

        // Should not have instance creation or health management methods
        expect((spawnManager as any).createInstance).toBeUndefined();
        expect((spawnManager as any).applyDamage).toBeUndefined();
        expect((spawnManager as any).registerTemplate).toBeUndefined();
      });

      it('should handle spawn operations independently', async () => {
        const result1 = spawnManager.spawnGroup(sampleTemplate, instanceFactory, { spawnChance: 1.0 });
        
        // Add small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 1));
        
        const result2 = spawnManager.spawnGroup(sampleTemplate, instanceFactory, { spawnChance: 1.0 });

        expect(result1.instances).not.toBe(result2.instances); // Different instances
        expect(result1.spawnTime).toBeLessThan(result2.spawnTime); // Different timestamps
      });
    });
  });

  describe('EnemyHealthManager', () => {
    let healthManager: EnemyHealthManager;
    let sampleInstance: IEnemyInstance;

    beforeEach(() => {
      healthManager = new EnemyHealthManager();
      sampleInstance = {
        id: 'test-instance-1',
        templateName: 'Test Raider',
        currentHealth: 30,
        maxHealth: 30,
        level: 3,
        createdAt: Date.now(),
        modifiers: {}
      };
    });

    describe('Single Responsibility: Health Management', () => {
      it('should check health status correctly', () => {
        expect(healthManager.isAlive(sampleInstance)).toBe(true);
        expect(healthManager.isDead(sampleInstance)).toBe(false);
        expect(healthManager.getHealthStatus(sampleInstance)).toBe(HealthStatus.HEALTHY);
        expect(healthManager.getHealthPercentage(sampleInstance)).toBe(100);
      });

      it('should apply damage correctly', () => {
        const damageResult = healthManager.applyDamage(sampleInstance, 10);
        
        expect(damageResult.instanceId).toBe('test-instance-1');
        expect(damageResult.damageTaken).toBe(10);
        expect(damageResult.healthBefore).toBe(30);
        expect(damageResult.healthAfter).toBe(20);
        expect(damageResult.wasKilled).toBe(false);
        expect(damageResult.status).toBe(HealthStatus.WOUNDED);
        
        expect(sampleInstance.currentHealth).toBe(20);
        expect(healthManager.getHealthPercentage(sampleInstance)).toBe(67); // Rounded
      });

      it('should handle lethal damage correctly', () => {
        const damageResult = healthManager.applyDamage(sampleInstance, 50);
        
        expect(damageResult.wasKilled).toBe(true);
        expect(damageResult.status).toBe(HealthStatus.DEAD);
        expect(sampleInstance.currentHealth).toBe(0);
        expect(healthManager.isDead(sampleInstance)).toBe(true);
      });

      it('should apply healing correctly', () => {
        // Damage first
        healthManager.applyDamage(sampleInstance, 15);
        expect(sampleInstance.currentHealth).toBe(15);
        
        // Then heal
        const healingResult = healthManager.applyHealing(sampleInstance, 10);
        
        expect(healingResult.instanceId).toBe('test-instance-1');
        expect(healingResult.healingApplied).toBe(10);
        expect(healingResult.healthBefore).toBe(15);
        expect(healingResult.healthAfter).toBe(25);
        expect(healingResult.wasRevived).toBe(false);
        
        expect(sampleInstance.currentHealth).toBe(25);
      });

      it('should handle revival correctly', () => {
        // Kill the instance
        healthManager.kill(sampleInstance);
        expect(healthManager.isDead(sampleInstance)).toBe(true);
        
        // Revive
        const reviveResult = healthManager.revive(sampleInstance, 50);
        
        expect(reviveResult.wasRevived).toBe(true);
        expect(sampleInstance.currentHealth).toBe(15); // 50% of 30
        expect(healthManager.isAlive(sampleInstance)).toBe(true);
      });

      it('should track health history correctly', () => {
        healthManager.applyDamage(sampleInstance, 5);
        healthManager.applyHealing(sampleInstance, 3);
        healthManager.applyDamage(sampleInstance, 8);
        
        const history = healthManager.getHealthHistory('test-instance-1');
        expect(history).toHaveLength(3);
        
        const damageHistory = healthManager.getDamageHistory('test-instance-1');
        const healingHistory = healthManager.getHealingHistory('test-instance-1');
        
        expect(damageHistory).toHaveLength(2);
        expect(healingHistory).toHaveLength(1);
      });

      it('should provide health statistics', () => {
        healthManager.applyDamage(sampleInstance, 10);
        healthManager.applyHealing(sampleInstance, 5);
        healthManager.applyDamage(sampleInstance, 25); // Kill
        
        const stats = healthManager.getHealthStats('test-instance-1');
        
        expect(stats.totalDamageTaken).toBe(35);
        expect(stats.totalHealingReceived).toBe(5);
        expect(stats.timesKilled).toBe(1);
        expect(stats.averageDamagePerHit).toBe(17.5); // 35/2
        expect(stats.currentStatus).toBe(HealthStatus.DEAD);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on health management', () => {
        const healthMethods = [
          'isAlive', 'isDead', 'getHealthStatus', 'getHealthPercentage',
          'applyDamage', 'applyHealing', 'setHealth', 'restoreFullHealth',
          'kill', 'revive', 'getHealthHistory', 'getHealthStats'
        ];

        healthMethods.forEach(method => {
          expect(healthManager[method as keyof EnemyHealthManager]).toBeDefined();
          expect(typeof healthManager[method as keyof EnemyHealthManager]).toBe('function');
        });

        // Should not have instance creation or spawning methods
        expect((healthManager as any).createInstance).toBeUndefined();
        expect((healthManager as any).spawnGroup).toBeUndefined();
        expect((healthManager as any).registerTemplate).toBeUndefined();
      });

      it('should handle health operations independently', () => {
        const instance2: IEnemyInstance = {
          id: 'test-instance-2',
          templateName: 'Test Raider',
          currentHealth: 25,
          maxHealth: 25,
          level: 2,
          createdAt: Date.now(),
          modifiers: {}
        };

        // Operations on one instance should not affect another
        healthManager.applyDamage(sampleInstance, 10);
        expect(sampleInstance.currentHealth).toBe(20);
        expect(instance2.currentHealth).toBe(25); // Unchanged

        healthManager.applyDamage(instance2, 5);
        expect(instance2.currentHealth).toBe(20);
        expect(sampleInstance.currentHealth).toBe(20); // Still unchanged
      });
    });
  });

  describe('LegacyEnemyConverter', () => {
    let converter: LegacyEnemyConverter;
    let legacyEnemyData: any;

    beforeEach(() => {
      converter = new LegacyEnemyConverter();
      legacyEnemyData = {
        name: 'Legacy Raider',
        type: 'human',
        maxLevel: 2,
        defence: { health: 25, ac: 6, threshold: 1, resistance: 0.1 },
        attack: { hit_chance: 65, weapon: 'pistol', damage: { min: 8, max: 16 }, shots: 1 },
        amount: { min: 1, max: 3 },
        experience: 40,
        title: ['Legacy Raider 1', 'Legacy Raider 2']
      };
    });

    describe('Single Responsibility: Data Conversion', () => {
      it('should convert legacy data to modern template', () => {
        const result = converter.convertToTemplate(legacyEnemyData);
        
        expect(result.success).toBe(true);
        expect(result.template).toBeDefined();
        expect(result.errors).toHaveLength(0);
        
        const template = result.template!;
        expect(template.name).toBe('Legacy Raider');
        expect(template.type).toBe('human');
        expect(template.maxLevel).toBe(2);
        expect(template.experienceReward).toBe(40);
        expect(template.defence.health).toBe(25);
        expect(template.defence.armorClass).toBe(6);
        expect(template.attack.hitChance).toBe(65);
        expect(template.spawning.min).toBe(1);
        expect(template.spawning.max).toBe(3);
        expect(template.sprites).toEqual(['Legacy Raider 1', 'Legacy Raider 2']);
      });

      it('should convert back to legacy format', () => {
        const conversionResult = converter.convertToTemplate(legacyEnemyData);
        const modernTemplate = conversionResult.template!;
        
        const backToLegacy = converter.convertToLegacy(modernTemplate);
        
        expect(backToLegacy.name).toBe(legacyEnemyData.name);
        expect(backToLegacy.type).toBe(legacyEnemyData.type);
        expect(backToLegacy.defence.health).toBe(legacyEnemyData.defence.health);
        expect(backToLegacy.defence.ac).toBe(legacyEnemyData.defence.ac);
        expect(backToLegacy.attack.hit_chance).toBe(legacyEnemyData.attack.hit_chance);
        expect(backToLegacy.amount.min).toBe(legacyEnemyData.amount.min);
        expect(backToLegacy.title).toEqual(legacyEnemyData.title);
      });

      it('should handle conversion errors gracefully', () => {
        const invalidData = { name: '', type: 'invalid' };
        const result = converter.convertToTemplate(invalidData);
        
        expect(result.success).toBe(false);
        expect(result.template).toBeUndefined();
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should validate legacy data correctly', () => {
        const validationErrors = converter.validateLegacyData(legacyEnemyData);
        expect(validationErrors).toHaveLength(0);
        
        const invalidData = { ...legacyEnemyData, defence: { health: -10 } };
        const invalidErrors = converter.validateLegacyData(invalidData);
        expect(invalidErrors.length).toBeGreaterThan(0);
      });

      it('should detect legacy format correctly', () => {
        expect(converter.isLegacyFormat(legacyEnemyData)).toBe(true);
        
        const modernData = {
          name: 'Modern Enemy',
          defence: { armorClass: 5 }, // Modern uses armorClass instead of ac
          attack: { hitChance: 60 }, // Modern uses hitChance instead of hit_chance
          spawning: { min: 1, max: 2 } // Modern uses spawning instead of amount
        };
        expect(converter.isLegacyFormat(modernData)).toBe(false);
      });

      it('should handle multiple conversions with statistics', () => {
        const legacyArray = [
          legacyEnemyData,
          { ...legacyEnemyData, name: 'Raider2' },
          { name: 'Invalid' } // This should fail
        ];
        
        const results = converter.convertMultiple(legacyArray);
        expect(results).toHaveLength(3);
        
        const stats = converter.getConversionStats(results);
        expect(stats.totalAttempted).toBe(3);
        expect(stats.successful).toBe(2);
        expect(stats.failed).toBe(1);
        expect(stats.successRate).toBeCloseTo(0.667, 2);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on data conversion', () => {
        const converterMethods = [
          'convertToTemplate', 'convertMultiple', 'convertToLegacy',
          'validateLegacyData', 'isLegacyFormat', 'getConversionStats'
        ];

        converterMethods.forEach(method => {
          expect(converter[method as keyof LegacyEnemyConverter]).toBeDefined();
          expect(typeof converter[method as keyof LegacyEnemyConverter]).toBe('function');
        });

        // Should not have instance creation or spawning methods
        expect((converter as any).createInstance).toBeUndefined();
        expect((converter as any).spawnGroup).toBeUndefined();
        expect((converter as any).applyDamage).toBeUndefined();
      });

      it('should handle conversion without side effects', () => {
        const originalData = { ...legacyEnemyData };
        const result = converter.convertToTemplate(legacyEnemyData);
        
        // Original data should be unchanged
        expect(legacyEnemyData).toEqual(originalData);
        
        // Conversion should be pure
        const result2 = converter.convertToTemplate(legacyEnemyData);
        expect(result.template).toEqual(result2.template);
      });
    });
  });

  describe('EnemySpriteManager', () => {
    let spriteManager: EnemySpriteManager;
    let sampleTemplate: IEnemyTemplate;
    let sampleInstance: IEnemyInstance;

    beforeEach(() => {
      spriteManager = new EnemySpriteManager();
      sampleTemplate = {
        name: 'Test Raider',
        type: 'human',
        maxLevel: 3,
        experienceReward: 50,
        defence: { health: 30, armorClass: 5, damageThreshold: 0, damageResistance: 0 },
        attack: { hitChance: 60, weapon: '9mm_pistol', damage: { min: 10, max: 24 }, shots: 1, attackSpeed: 1.0, criticalChance: 5 },
        spawning: { min: 1, max: 4 },
        sprites: ['Raider1', 'Raider2', 'Raider3']
      };
      sampleInstance = {
        id: 'test-instance-1',
        templateName: 'Test Raider',
        currentHealth: 30,
        maxHealth: 30,
        level: 3,
        createdAt: Date.now(),
        modifiers: {}
      };
    });

    describe('Single Responsibility: Sprite Management', () => {
      it('should select sprites for templates correctly', () => {
        const result = spriteManager.getSpriteForTemplate(sampleTemplate);
        
        expect(result.spriteName).toBeDefined();
        expect(sampleTemplate.sprites).toContain(result.spriteName);
        expect(result.strategy).toBe(SpriteSelectionStrategy.RANDOM);
        expect(result.templateName).toBe('Test Raider');
        expect(result.timestamp).toBeGreaterThan(0);
      });

      it('should select sprites for instances correctly', () => {
        const result = spriteManager.getSpriteForInstance(sampleInstance, sampleTemplate);
        
        expect(result.spriteName).toBeDefined();
        expect(sampleTemplate.sprites).toContain(result.spriteName);
        expect(result.instanceId).toBe('test-instance-1');
        expect(result.templateName).toBe('Test Raider');
        
        // Should track history
        const history = spriteManager.getSpriteHistory('test-instance-1');
        expect(history).toHaveLength(1);
        expect(history[0]).toEqual(result);
      });

      it('should handle different selection strategies', () => {
        // Random strategy
        const randomResult = spriteManager.getSpriteForTemplate(sampleTemplate, SpriteSelectionStrategy.RANDOM);
        expect(randomResult.strategy).toBe(SpriteSelectionStrategy.RANDOM);
        
        // Sequential strategy
        const seq1 = spriteManager.getSpriteForTemplate(sampleTemplate, SpriteSelectionStrategy.SEQUENTIAL);
        const seq2 = spriteManager.getSpriteForTemplate(sampleTemplate, SpriteSelectionStrategy.SEQUENTIAL);
        
        expect(seq1.strategy).toBe(SpriteSelectionStrategy.SEQUENTIAL);
        expect(seq2.strategy).toBe(SpriteSelectionStrategy.SEQUENTIAL);
        
        // Sequential should cycle through sprites
        expect(seq1.spriteName).not.toBe(seq2.spriteName);
      });

      it('should manage sprite metadata correctly', () => {
        const metadata = {
          name: 'Raider1',
          path: '/sprites/raiders/raider1.png',
          weight: 2,
          conditions: {
            healthRange: { min: 50, max: 100 }
          },
          variations: ['Raider1_wounded', 'Raider1_angry']
        };
        
        spriteManager.registerSpriteMetadata('Raider1', metadata);
        
        const retrieved = spriteManager.getSpriteMetadata('Raider1');
        expect(retrieved).toEqual(metadata);
        
        const variations = spriteManager.getSpriteVariations('Raider1');
        expect(variations).toEqual(['Raider1_wounded', 'Raider1_angry']);
        
        expect(spriteManager.hasSpriteVariations('Raider1')).toBe(true);
        
        const randomVariation = spriteManager.getRandomVariation('Raider1');
        expect(variations).toContain(randomVariation);
      });

      it('should provide sprite statistics', () => {
        spriteManager.registerSpriteMetadata('Raider1', { name: 'Raider1', path: '/path1.png' });
        spriteManager.registerSpriteMetadata('Raider2', { name: 'Raider2', path: '/path2.png' });
        
        spriteManager.getSpriteForInstance(sampleInstance, sampleTemplate);
        spriteManager.getSpriteForInstance(sampleInstance, sampleTemplate);
        
        const stats = spriteManager.getSpriteStats();
        
        expect(stats.totalSpritesRegistered).toBe(2);
        expect(stats.totalInstancesTracked).toBe(1);
        expect(stats.totalSelections).toBe(2);
        expect(stats.strategyUsage.get(SpriteSelectionStrategy.RANDOM)).toBe(2);
      });

      it('should validate sprite lists correctly', () => {
        spriteManager.registerSpriteMetadata('Raider1', { name: 'Raider1', path: '/valid/path.png' });
        spriteManager.registerSpriteMetadata('Raider2', { name: 'Raider2', path: '' }); // Invalid path
        
        const validation = spriteManager.validateSpriteList(['Raider1', 'Raider2', 'Raider3']);
        
        expect(validation.valid).toBe(false);
        expect(validation.missingMetadata).toContain('Raider3');
        expect(validation.invalidPaths).toContain('Raider2');
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on sprite management', () => {
        const spriteMethods = [
          'getSpriteForTemplate', 'getSpriteForInstance', 'registerSpriteMetadata',
          'getSpriteMetadata', 'getSpriteVariations', 'getRandomVariation',
          'getSpriteHistory', 'getSpriteStats', 'validateSpriteList'
        ];

        spriteMethods.forEach(method => {
          expect(spriteManager[method as keyof EnemySpriteManager]).toBeDefined();
          expect(typeof spriteManager[method as keyof EnemySpriteManager]).toBe('function');
        });

        // Should not have instance creation or health management methods
        expect((spriteManager as any).createInstance).toBeUndefined();
        expect((spriteManager as any).applyDamage).toBeUndefined();
        expect((spriteManager as any).spawnGroup).toBeUndefined();
      });

      it('should handle sprite operations independently', async () => {
        const result1 = spriteManager.getSpriteForTemplate(sampleTemplate);
        
        // Add small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 1));
        
        const result2 = spriteManager.getSpriteForTemplate(sampleTemplate);
        
        // Different selections should be independent
        expect(result1.timestamp).toBeLessThan(result2.timestamp);
        
        // Sprite selection should not affect other concerns
        expect(sampleTemplate.sprites).toHaveLength(3); // Unchanged
      });
    });
  });

  describe('ModernEnemyService', () => {
    let enemyService: ModernEnemyService;

    beforeEach(async () => {
      enemyService = ModernEnemyService.getInstance();
      await enemyService.initializeService();
    });

    describe('Single Responsibility: Orchestration', () => {
      it('should orchestrate enemy system initialization', async () => {
        expect(enemyService.isInitialized()).toBe(true);
        
        const templates = enemyService.getAllEnemyTemplates();
        expect(templates.length).toBeGreaterThan(0);
        
        // Should have loaded default templates
        const ratTemplate = enemyService.getEnemyTemplate('Rat');
        expect(ratTemplate).toBeTruthy();
        expect(ratTemplate!.type).toBe('creature');
      });

      it('should coordinate template and instance operations', () => {
        const raiderTemplate = enemyService.getEnemyTemplate('Raiders');
        expect(raiderTemplate).toBeTruthy();
        
        const instance = enemyService.createEnemyInstance('Raiders');
        expect(instance).toBeTruthy();
        expect(instance!.templateName).toBe('Raiders');
        expect(instance!.currentHealth).toBeGreaterThan(0);
        
        const eliteInstance = enemyService.createEliteEnemyInstance('Raiders');
        expect(eliteInstance).toBeTruthy();
        expect(eliteInstance!.level).toBeGreaterThan(raiderTemplate!.maxLevel);
      });

      it('should coordinate spawn operations', () => {
        const spawnResult = enemyService.spawnEnemyGroup('Raiders', {
          spawnChance: 1.0,
          groupSizeRange: { min: 2, max: 3 }
        });
        
        expect(spawnResult.success).toBe(true);
        expect(spawnResult.instances.length).toBeGreaterThanOrEqual(2);
        expect(spawnResult.instances.length).toBeLessThanOrEqual(3);
        expect(spawnResult.templateUsed).toBe('Raiders');
        
        spawnResult.instances.forEach(instance => {
          expect(instance.templateName).toBe('Raiders');
          expect(enemyService.isAlive(instance)).toBe(true);
        });
      });

      it('should coordinate health operations', () => {
        const instance = enemyService.createEnemyInstance('Raiders')!;
        const initialHealth = instance.currentHealth;
        
        expect(enemyService.isAlive(instance)).toBe(true);
        expect(enemyService.getHealthPercentage(instance)).toBe(100);
        
        const damageResult = enemyService.applyDamage(instance, 10);
        expect(damageResult.damageTaken).toBe(10);
        expect(instance.currentHealth).toBe(initialHealth - 10);
        
        const healingResult = enemyService.applyHealing(instance, 5);
        expect(healingResult.healingApplied).toBe(5);
        expect(instance.currentHealth).toBe(initialHealth - 5);
      });

      it('should coordinate sprite operations', () => {
        const instance = enemyService.createEnemyInstance('Raiders')!;
        
        const spriteResult = enemyService.getEnemySprite(instance);
        expect(spriteResult.spriteName).toBeTruthy();
        expect(spriteResult.instanceId).toBe(instance.id);
        
        const randomSprite = enemyService.getRandomSprite('Raiders');
        expect(randomSprite.spriteName).toBeTruthy();
        expect(randomSprite.templateName).toBe('Raiders');
      });

      it('should provide comprehensive system status', () => {
        const status = enemyService.getSystemStatus();
        
        expect(status.initialized).toBe(true);
        expect(status.templates.total).toBeGreaterThan(0);
        expect(status.templates.byType.size).toBeGreaterThan(0);
        expect(status.components.templateManager).toBe(true);
        expect(status.components.instanceFactory).toBe(true);
        expect(status.components.spawnManager).toBe(true);
        expect(status.components.healthManager).toBe(true);
        expect(status.components.legacyConverter).toBe(true);
        expect(status.components.spriteManager).toBe(true);
      });

      it('should provide access to individual components', () => {
        expect(enemyService.getTemplateManager()).toBeTruthy();
        expect(enemyService.getInstanceFactory()).toBeTruthy();
        expect(enemyService.getSpawnManager()).toBeTruthy();
        expect(enemyService.getHealthManager()).toBeTruthy();
        expect(enemyService.getLegacyConverter()).toBeTruthy();
        expect(enemyService.getSpriteManager()).toBeTruthy();
      });

      it('should validate all components', () => {
        expect(enemyService.validateAllComponents()).toBe(true);
      });

      it('should maintain singleton pattern', () => {
        const anotherInstance = ModernEnemyService.getInstance();
        expect(anotherInstance).toBe(enemyService);
      });
    });

    describe('SRP Compliance', () => {
      it('should only orchestrate, not implement specific logic', () => {
        // Service should delegate to specialized components
        const templateManager = enemyService.getTemplateManager();
        const instanceFactory = enemyService.getInstanceFactory();
        
        expect(templateManager).toBeTruthy();
        expect(instanceFactory).toBeTruthy();
        
        // Should not implement low-level logic directly
        expect((enemyService as any).generateInstanceId).toBeUndefined();
        expect((enemyService as any).calculateDamage).toBeUndefined();
        expect((enemyService as any).selectSprite).toBeUndefined();
      });

      it('should maintain separation of concerns', () => {
        const instance = enemyService.createEnemyInstance('Raiders')!;
        
        // Each operation should be handled by appropriate component
        const spawnResult = enemyService.spawnEnemyGroup('Raiders', { spawnChance: 1.0 });
        const damageResult = enemyService.applyDamage(instance, 5);
        const spriteResult = enemyService.getEnemySprite(instance);
        
        // Results should be independent
        expect(spawnResult.templateUsed).toBe('Raiders');
        expect(damageResult.instanceId).toBe(instance.id);
        expect(spriteResult.instanceId).toBe(instance.id);
        
        // Operations should not interfere with each other
        expect(spawnResult.instances[0].id).not.toBe(instance.id);
      });
    });
  });

  describe('SRP Integration', () => {
    it('should demonstrate clear separation of responsibilities', () => {
      const templateManager = new EnemyTemplateManager();
      const instanceFactory = new EnemyInstanceFactory();
      const spawnManager = new EnemySpawnManager();
      const healthManager = new EnemyHealthManager();
      const legacyConverter = new LegacyEnemyConverter();
      const spriteManager = new EnemySpriteManager();

      // Each component should have distinct responsibilities
      expect(templateManager.constructor.name).toBe('EnemyTemplateManager');
      expect(instanceFactory.constructor.name).toBe('EnemyInstanceFactory');
      expect(spawnManager.constructor.name).toBe('EnemySpawnManager');
      expect(healthManager.constructor.name).toBe('EnemyHealthManager');
      expect(legacyConverter.constructor.name).toBe('LegacyEnemyConverter');
      expect(spriteManager.constructor.name).toBe('EnemySpriteManager');

      // No component should have methods from another's domain
      expect((templateManager as any).createInstance).toBeUndefined();
      expect((instanceFactory as any).applyDamage).toBeUndefined();
      expect((healthManager as any).spawnGroup).toBeUndefined();
      expect((spawnManager as any).convertToTemplate).toBeUndefined();
    });

    it('should support composition over inheritance', () => {
      const modernService = ModernEnemyService.getInstance();
      
      // Service should compose components, not inherit from them
      expect(Object.getPrototypeOf(modernService).constructor.name).toBe('ModernEnemyService');
      
      // Should have component instances as properties
      expect(modernService.getTemplateManager()).toBeInstanceOf(EnemyTemplateManager);
      expect(modernService.getInstanceFactory()).toBeInstanceOf(EnemyInstanceFactory);
      expect(modernService.getSpawnManager()).toBeInstanceOf(EnemySpawnManager);
      expect(modernService.getHealthManager()).toBeInstanceOf(EnemyHealthManager);
      expect(modernService.getLegacyConverter()).toBeInstanceOf(LegacyEnemyConverter);
      expect(modernService.getSpriteManager()).toBeInstanceOf(EnemySpriteManager);
    });

    it('should enable independent testing of each component', () => {
      // Each component can be tested in isolation
      const templateManager = new EnemyTemplateManager();
      const testTemplate: IEnemyTemplate = {
        name: 'Test Enemy',
        type: 'test',
        maxLevel: 1,
        experienceReward: 10,
        defence: { health: 10, armorClass: 0, damageThreshold: 0, damageResistance: 0 },
        attack: { hitChance: 50, damage: { min: 1, max: 2 }, shots: 1, attackSpeed: 1.0, criticalChance: 0 },
        spawning: { min: 1, max: 1 },
        sprites: []
      };
      
      templateManager.registerTemplate(testTemplate);
      expect(templateManager.getTemplate('Test Enemy')).toEqual(testTemplate);
      
      // Instance factory can work independently
      const instanceFactory = new EnemyInstanceFactory();
      const instance = instanceFactory.createInstance(testTemplate);
      expect(instance.templateName).toBe('Test Enemy');
      
      // Health manager can work independently
      const healthManager = new EnemyHealthManager();
      expect(healthManager.isAlive(instance)).toBe(true);
      
      healthManager.applyDamage(instance, 5);
      expect(instance.currentHealth).toBeLessThan(instance.maxHealth);
    });
  });
});
