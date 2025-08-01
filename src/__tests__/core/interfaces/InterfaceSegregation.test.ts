/**
 * Interface Segregation Tests
 * Testing the new segregated interfaces follow ISP principles
 */

import {
  ICharacterStats,
  ICharacterSkills,
  IHealthManager,
  IExperienceManager,
  ISkillManager,
  IInventoryManager,
  IEquipmentManager,
  isCharacterStats,
  isCharacterSkills,
  isInventoryValid
} from '../../../typescript/core/interfaces/IPlayerSegregated';

import {
  IEnemyStats,
  IEnemyDefense,
  IEnemyAttack,
  IEnemyRendering,
  IEnemyBehavior,
  isEnemyStats,
  isEnemyDefense,
  isEnemyAttack
} from '../../../typescript/core/interfaces/IEnemySegregated';

import {
  ICombatResult,
  IDamageCalculation,
  IHitCalculation,
  ICriticalCalculation,
  isCombatResult,
  isDamageCalculation,
  isHitCalculation
} from '../../../typescript/core/interfaces/ICombatSegregated';

describe('Interface Segregation Principle (ISP)', () => {
  
  describe('Player Interface Segregation', () => {
    
    describe('ICharacterStats', () => {
      it('should only contain core character statistics', () => {
        const stats: ICharacterStats = {
          id: 'player-123',
          health: 30,
          maxHealth: 30,
          levelCount: 1,
          experience: 0
        };

        expect(stats.id).toBe('player-123');
        expect(stats.health).toBe(30);
        expect(stats.maxHealth).toBe(30);
        expect(stats.levelCount).toBe(1);
        expect(stats.experience).toBe(0);
        
        // Verify it only has stats-related properties
        const keys = Object.keys(stats);
        expect(keys).toEqual(['id', 'health', 'maxHealth', 'levelCount', 'experience']);
      });

      it('should validate character stats with type guard', () => {
        const validStats = {
          id: 'player-123',
          health: 30,
          maxHealth: 30,
          levelCount: 1,
          experience: 0
        };

        const invalidStats = {
          id: 'player-123',
          health: 'invalid'
        };

        expect(isCharacterStats(validStats)).toBe(true);
        expect(isCharacterStats(invalidStats)).toBe(false);
        expect(isCharacterStats(null)).toBe(false);
        expect(isCharacterStats(undefined)).toBe(false);
      });
    });

    describe('ICharacterSkills', () => {
      it('should only contain skill-related properties', () => {
        const skills: ICharacterSkills = {
          small_guns: 30,
          big_guns: 10,
          energy_weapons: 10,
          melee_weapons: 20,
          pyrotechnics: 10,
          lockpick: 15,
          science: 10,
          repair: 10,
          medicine: 20,
          barter: 10,
          speech: 10,
          surviving: 15
        };

        // Verify all skill values are numbers
        Object.values(skills).forEach(value => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(0);
        });

        expect(skills.small_guns).toBe(30);
        expect(skills.medicine).toBe(20);
      });

      it('should validate character skills with type guard', () => {
        const validSkills = {
          small_guns: 30, big_guns: 10, energy_weapons: 10, melee_weapons: 20,
          pyrotechnics: 10, lockpick: 15, science: 10, repair: 10,
          medicine: 20, barter: 10, speech: 10, surviving: 15
        };

        const invalidSkills = {
          small_guns: 30,
          // Missing required skills
        };

        expect(isCharacterSkills(validSkills)).toBe(true);
        expect(isCharacterSkills(invalidSkills)).toBe(false);
      });
    });

    describe('IHealthManager Interface', () => {
      it('should define focused health management operations', () => {
        // This is a structural test - we're testing the interface design
        const healthManagerMethods = [
          'getHealth',
          'getMaxHealth', 
          'updateHealth',
          'heal',
          'takeDamage',
          'isDead',
          'getHealthPercentage'
        ];

        // Create mock implementation to test interface structure
        const mockHealthManager: IHealthManager = {
          getHealth: jest.fn().mockReturnValue(30),
          getMaxHealth: jest.fn().mockReturnValue(30),
          updateHealth: jest.fn(),
          heal: jest.fn(),
          takeDamage: jest.fn(),
          isDead: jest.fn().mockReturnValue(false),
          getHealthPercentage: jest.fn().mockReturnValue(100)
        };

        // Verify all methods exist
        healthManagerMethods.forEach(method => {
          expect(mockHealthManager[method as keyof IHealthManager]).toBeDefined();
          expect(typeof mockHealthManager[method as keyof IHealthManager]).toBe('function');
        });

        // Verify focused responsibility - only health-related methods
        expect(Object.keys(mockHealthManager)).toEqual(healthManagerMethods);
      });
    });

    describe('Interface Composition', () => {
      it('should allow composition of segregated interfaces', () => {
        const stats: ICharacterStats = {
          id: 'player-123',
          health: 30,
          maxHealth: 30,
          levelCount: 1,
          experience: 0
        };

        const skills: ICharacterSkills = {
          small_guns: 30, big_guns: 10, energy_weapons: 10, melee_weapons: 20,
          pyrotechnics: 10, lockpick: 15, science: 10, repair: 10,
          medicine: 20, barter: 10, speech: 10, surviving: 15
        };

        // Mock inventory for composition testing
        const inventory = {
          med: { first_aid_kit: 1, jet: 0, buffout: 0, mentats: 0, psycho: 0 },
          ammo: { mm_9: 50, magnum_44: 0, mm_12: 0, mm_5_45: 0, energy_cell: 0, frag_grenade: 0 }
        };

        expect(isInventoryValid(inventory)).toBe(true);

        // Verify each interface works independently
        expect(isCharacterStats(stats)).toBe(true);
        expect(isCharacterSkills(skills)).toBe(true);
        
        // Verify composition doesn't break individual interfaces
        const composedObject = { ...stats, ...skills, inventory };
        expect(isCharacterStats(composedObject)).toBe(true);
        expect(isCharacterSkills(composedObject)).toBe(true);
      });
    });
  });

  describe('Enemy Interface Segregation', () => {
    
    describe('IEnemyStats', () => {
      it('should only contain enemy statistical information', () => {
        const enemyStats: IEnemyStats = {
          id: 'enemy-123',
          name: 'Raider',
          type: 'human',
          maxLevel: 5,
          currentHealth: 25,
          maxHealth: 25,
          experienceReward: 15
        };

        expect(enemyStats.id).toBe('enemy-123');
        expect(enemyStats.name).toBe('Raider');
        expect(enemyStats.type).toBe('human');
        expect(enemyStats.maxLevel).toBe(5);
        expect(enemyStats.currentHealth).toBe(25);
        expect(enemyStats.experienceReward).toBe(15);
      });

      it('should validate enemy stats with type guard', () => {
        const validStats = {
          id: 'enemy-123',
          name: 'Raider',
          type: 'human',
          maxLevel: 5,
          currentHealth: 25,
          maxHealth: 25,
          experienceReward: 15
        };

        expect(isEnemyStats(validStats)).toBe(true);
        expect(isEnemyStats({})).toBe(false);
        expect(isEnemyStats(null)).toBe(false);
      });
    });

    describe('IEnemyDefense', () => {
      it('should only contain defensive capabilities', () => {
        const defense: IEnemyDefense = {
          armorClass: 5,
          damageThreshold: 0,
          damageResistance: 10,
          healthRegeneration: 1
        };

        expect(defense.armorClass).toBe(5);
        expect(defense.damageThreshold).toBe(0);
        expect(defense.damageResistance).toBe(10);
        expect(defense.healthRegeneration).toBe(1);

        // Verify focused on defense only
        const keys = Object.keys(defense);
        expect(keys.every(key => 
          ['armorClass', 'damageThreshold', 'damageResistance', 'healthRegeneration'].includes(key)
        )).toBe(true);
      });

      it('should validate enemy defense with type guard', () => {
        const validDefense = {
          armorClass: 5,
          damageThreshold: 0,
          damageResistance: 10
        };

        const invalidDefense = {
          armorClass: 'invalid'
        };

        expect(isEnemyDefense(validDefense)).toBe(true);
        expect(isEnemyDefense(invalidDefense)).toBe(false);
      });
    });

    describe('IEnemyAttack', () => {
      it('should only contain attack capabilities', () => {
        const attack: IEnemyAttack = {
          hitChance: 50,
          weapon: 'baseball_bat',
          damage: { min: 1, max: 6 },
          shots: 1,
          attackSpeed: 1.0,
          criticalChance: 5
        };

        expect(attack.hitChance).toBe(50);
        expect(attack.weapon).toBe('baseball_bat');
        expect(attack.damage.min).toBe(1);
        expect(attack.damage.max).toBe(6);
        expect(attack.shots).toBe(1);
        expect(attack.attackSpeed).toBe(1.0);
      });

      it('should validate enemy attack with type guard', () => {
        const validAttack = {
          hitChance: 50,
          damage: { min: 1, max: 6 },
          shots: 1,
          attackSpeed: 1.0
        };

        expect(isEnemyAttack(validAttack)).toBe(true);
        expect(isEnemyAttack({})).toBe(false);
      });
    });
  });

  describe('Combat Interface Segregation', () => {
    
    describe('ICombatResult', () => {
      it('should only contain combat result data', () => {
        const result: ICombatResult = {
          isHit: true,
          damage: 15,
          isCritical: false,
          remainingHealth: 15,
          message: 'You hit for 15 damage!',
          timestamp: Date.now()
        };

        expect(result.isHit).toBe(true);
        expect(result.damage).toBe(15);
        expect(result.isCritical).toBe(false);
        expect(result.remainingHealth).toBe(15);
        expect(result.message).toBe('You hit for 15 damage!');
        expect(typeof result.timestamp).toBe('number');
      });

      it('should validate combat result with type guard', () => {
        const validResult = {
          isHit: true,
          damage: 15,
          isCritical: false,
          remainingHealth: 15,
          message: 'Hit!'
        };

        expect(isCombatResult(validResult)).toBe(true);
        expect(isCombatResult({})).toBe(false);
      });
    });

    describe('IDamageCalculation', () => {
      it('should only contain damage calculation details', () => {
        const calculation: IDamageCalculation = {
          baseDamage: 10,
          weaponModifier: 1.2,
          skillModifier: 1.1,
          criticalMultiplier: 1.0,
          armorReduction: 2,
          resistanceReduction: 1,
          thresholdReduction: 0,
          finalDamage: 15,
          isCritical: false
        };

        expect(calculation.baseDamage).toBe(10);
        expect(calculation.finalDamage).toBe(15);
        expect(calculation.isCritical).toBe(false);
        
        // Verify all properties are related to damage calculation
        const keys = Object.keys(calculation);
        const damageKeys = [
          'baseDamage', 'weaponModifier', 'skillModifier', 'criticalMultiplier',
          'armorReduction', 'resistanceReduction', 'thresholdReduction',
          'finalDamage', 'isCritical'
        ];
        expect(keys.every(key => damageKeys.includes(key))).toBe(true);
      });

      it('should validate damage calculation with type guard', () => {
        const validCalculation = {
          baseDamage: 10,
          finalDamage: 15,
          isCritical: false
        };

        expect(isDamageCalculation(validCalculation)).toBe(true);
        expect(isDamageCalculation({})).toBe(false);
      });
    });

    describe('IHitCalculation', () => {
      it('should only contain hit chance calculation details', () => {
        const hitCalc: IHitCalculation = {
          baseHitChance: 60,
          skillModifier: 10,
          weaponAccuracy: 5,
          distanceModifier: -5,
          targetDefenseModifier: -10,
          finalHitChance: 60,
          isHit: true
        };

        expect(hitCalc.baseHitChance).toBe(60);
        expect(hitCalc.finalHitChance).toBe(60);
        expect(hitCalc.isHit).toBe(true);

        // Verify focused on hit calculation only
        const keys = Object.keys(hitCalc);
        expect(keys.every(key => key.includes('Hit') || key.includes('Modifier') || key.includes('Accuracy') || key.includes('Defense'))).toBe(true);
      });

      it('should validate hit calculation with type guard', () => {
        const validHitCalc = {
          baseHitChance: 60,
          finalHitChance: 60,
          isHit: true
        };

        expect(isHitCalculation(validHitCalc)).toBe(true);
        expect(isHitCalculation({})).toBe(false);
      });
    });

    describe('Interface Specialization', () => {
      it('should demonstrate focused interface responsibilities', () => {
        // Each interface should have a single, clear responsibility
        
        // ICombatResult - only result data, no calculations
        const result: ICombatResult = {
          isHit: true,
          damage: 15,
          isCritical: false,
          remainingHealth: 15,
          message: 'Hit!'
        };

        // IDamageCalculation - only damage calculation data
        const damageCalc: IDamageCalculation = {
          baseDamage: 10,
          weaponModifier: 1.0,
          skillModifier: 1.0,
          criticalMultiplier: 1.0,
          armorReduction: 0,
          resistanceReduction: 0,
          thresholdReduction: 0,
          finalDamage: 10,
          isCritical: false
        };

        // IHitCalculation - only hit calculation data
        const hitCalc: IHitCalculation = {
          baseHitChance: 60,
          skillModifier: 0,
          weaponAccuracy: 0,
          distanceModifier: 0,
          targetDefenseModifier: 0,
          finalHitChance: 60,
          isHit: true
        };

        // Verify each interface is focused and valid
        expect(isCombatResult(result)).toBe(true);
        expect(isDamageCalculation(damageCalc)).toBe(true);
        expect(isHitCalculation(hitCalc)).toBe(true);

        // Verify they don't overlap in concerns
        expect(isCombatResult(damageCalc)).toBe(false);
        expect(isDamageCalculation(hitCalc)).toBe(false);
        expect(isHitCalculation(result)).toBe(false);
      });
    });
  });

  describe('Interface Segregation Benefits', () => {
    it('should allow clients to depend only on interfaces they use', () => {
      // Mock implementations showing focused dependencies
      
      // A health display component only needs IHealthManager
      class HealthDisplay {
        constructor(private healthManager: IHealthManager) {}
        
        render() {
          return `Health: ${this.healthManager.getHealth()}/${this.healthManager.getMaxHealth()}`;
        }
      }

      // A skill editor only needs ISkillManager
      class SkillEditor {
        constructor(private skillManager: ISkillManager) {}
        
        editSkill(skill: keyof ICharacterSkills, value: number) {
          this.skillManager.setSkill(skill, value);
        }
      }

      // Mock managers
      const mockHealthManager: IHealthManager = {
        getHealth: () => 30,
        getMaxHealth: () => 30,
        updateHealth: jest.fn(),
        heal: jest.fn(),
        takeDamage: jest.fn(),
        isDead: () => false,
        getHealthPercentage: () => 100
      };

      const mockSkillManager: ISkillManager = {
        getSkill: jest.fn(),
        setSkill: jest.fn(),
        addSkillPoints: jest.fn(),
        getSkillModifier: jest.fn(),
        getAllSkills: jest.fn()
      };

      // Create components with only the interfaces they need
      const healthDisplay = new HealthDisplay(mockHealthManager);
      const skillEditor = new SkillEditor(mockSkillManager);

      // Verify components work with focused interfaces
      expect(healthDisplay.render()).toBe('Health: 30/30');
      
      skillEditor.editSkill('small_guns', 50);
      expect(mockSkillManager.setSkill).toHaveBeenCalledWith('small_guns', 50);
    });

    it('should reduce coupling between unrelated concerns', () => {
      // Before ISP: Large interface with multiple responsibilities
      interface IPlayerLarge {
        // Stats
        health: number;
        experience: number;
        // Skills  
        skills: ICharacterSkills;
        // Inventory
        inventory: any;
        // Equipment
        weapons: string[];
        // Methods for all concerns
        getHealth(): number;
        addExperience(exp: number): void;
        getSkill(skill: string): number;
        addItem(item: string): void;
        equipWeapon(weapon: string): void;
      }

      // After ISP: Focused interfaces
      // Now a damage calculator only needs what it uses
      function calculateDamage(stats: ICharacterStats, skills: ICharacterSkills): number {
        // Only depends on stats and skills, not inventory or equipment
        return stats.health > 0 ? skills.small_guns * 0.5 : 0;
      }

      const mockStats: ICharacterStats = {
        id: 'test',
        health: 30,
        maxHealth: 30,
        levelCount: 1,
        experience: 0
      };

      const mockSkills: ICharacterSkills = {
        small_guns: 50, big_guns: 10, energy_weapons: 10, melee_weapons: 20,
        pyrotechnics: 10, lockpick: 15, science: 10, repair: 10,
        medicine: 20, barter: 10, speech: 10, surviving: 15
      };

      const damage = calculateDamage(mockStats, mockSkills);
      expect(damage).toBe(25); // 50 * 0.5
    });
  });
});
