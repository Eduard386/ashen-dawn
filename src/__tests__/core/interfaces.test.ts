import { IPlayerCharacter, IPlayerSkills, IInventory } from '../../typescript/core/interfaces/IPlayer';
import { IWeapon } from '../../typescript/core/interfaces/IWeapon';
import { IEnemy } from '../../typescript/core/interfaces/IEnemy';

describe('Core Interfaces', () => {
  describe('IPlayerCharacter', () => {
    test('should have all required properties', () => {
      const player: IPlayerCharacter = {
        id: 'test-player-id',
        levelCount: 1,
        health: 100,
        maxHealth: 100,
        experience: 0,
        skills: {
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
          surviving: 75
        },
        currentWeapon: 'baseball_bat',
        currentArmor: 'leather_jacket',
        weapons: ['baseball_bat', '9mm_pistol'],
        inventory: {
          med: {
            first_aid_kit: 2,
            jet: 0,
            buffout: 0,
            mentats: 0,
            psycho: 0
          },
          ammo: {
            mm_9: 24,
            magnum_44: 0,
            mm_12: 0,
            mm_5_45: 0,
            energy_cell: 0,
            frag_grenade: 0
          }
        }
      };

      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('levelCount');
      expect(player).toHaveProperty('health');
      expect(player).toHaveProperty('skills');
      expect(typeof player.skills.small_guns).toBe('number');
      expect(player.skills.small_guns).toBe(75);
      expect(player.weapons).toContain('baseball_bat');
      expect(player.inventory.ammo.mm_9).toBe(24);
    });

    test('should enforce readonly properties', () => {
      const player: IPlayerCharacter = {
        id: 'test-id',
        levelCount: 1,
        health: 100,
        maxHealth: 100,
        experience: 0,
        skills: {} as IPlayerSkills,
        currentWeapon: 'test',
        currentArmor: 'test',
        weapons: [],
        inventory: {} as IInventory
      };

      // TypeScript should prevent this at compile time
      // player.id = 'new-id'; // This should cause a TypeScript error
      expect(player.id).toBe('test-id');
      expect(player.maxHealth).toBe(100);
    });
  });

  describe('IWeapon', () => {
    test('should validate weapon configuration', () => {
      const weapon: IWeapon = {
        name: '9mm_pistol',
        skill: 'small_guns',
        ammoType: 'mm_9',
        cooldown: 5000,
        damage: { min: 10, max: 24 },
        clipSize: 12,
        shotsPerAttack: 1,
        criticalChance: 10
      };

      expect(weapon.damage.min).toBeLessThanOrEqual(weapon.damage.max);
      expect(weapon.cooldown).toBeGreaterThan(0);
      expect(['small_guns', 'big_guns', 'energy_weapons', 'melee_weapons', 'pyrotechnics'])
        .toContain(weapon.skill);
      expect(weapon.clipSize).toBeGreaterThan(0);
      expect(weapon.shotsPerAttack).toBeGreaterThan(0);
    });

    test('should handle melee weapons correctly', () => {
      const meleeWeapon: IWeapon = {
        name: 'baseball_bat',
        skill: 'melee_weapons',
        ammoType: 'melee',
        cooldown: 3000,
        damage: { min: 3, max: 10 },
        clipSize: 1000, // High number for melee (unlimited)
        shotsPerAttack: 1,
        criticalChance: 5
      };

      expect(meleeWeapon.ammoType).toBe('melee');
      expect(meleeWeapon.skill).toBe('melee_weapons');
      expect(meleeWeapon.clipSize).toBeGreaterThan(100); // Effectively unlimited
    });
  });

  describe('IEnemy', () => {
    test('should have valid enemy structure', () => {
      const enemy: IEnemy = {
        id: 'rat-1',
        name: 'Rat',
        type: 'creature',
        maxLevel: 1,
        currentHealth: 6,
        defence: {
          health: 6,
          armorClass: 6,
          damageThreshold: 0,
          damageResistance: 0
        },
        attack: {
          hitChance: 40,
          damage: { min: 2, max: 2 },
          shots: 1
        },
        spawning: { min: 6, max: 10 },
        experience: 25,
        sprites: ['rat']
      };

      expect(enemy.currentHealth).toBeLessThanOrEqual(enemy.defence.health);
      expect(enemy.defence.armorClass).toBeGreaterThanOrEqual(0);
      expect(enemy.attack.hitChance).toBeGreaterThan(0);
      expect(enemy.attack.hitChance).toBeLessThanOrEqual(100);
      expect(enemy.spawning.min).toBeLessThanOrEqual(enemy.spawning.max);
      expect(enemy.experience).toBeGreaterThan(0);
      expect(enemy.sprites.length).toBeGreaterThan(0);
    });

    test('should handle raider types correctly', () => {
      const raider: IEnemy = {
        id: 'raider-1',
        name: 'Raiders',
        type: 'human',
        maxLevel: 1,
        currentHealth: 30,
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
          shots: 1
        },
        spawning: { min: 1, max: 4 },
        experience: 75,
        sprites: ['Raider - Leather Jacket - 9mm pistol']
      };

      expect(raider.type).toBe('human');
      expect(raider.attack.weapon).toBeDefined();
      expect(raider.experience).toBeGreaterThan(25); // Raiders give more XP than creatures
    });
  });
});
