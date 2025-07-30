import { WeaponService } from '../../../typescript/core/services/WeaponService';

describe('WeaponService', () => {
  let weaponService: WeaponService;

  beforeEach(() => {
    weaponService = WeaponService.getInstance();
  });

  describe('Weapon Retrieval', () => {
    test('should get weapon by name', () => {
      const weapon = weaponService.getWeapon('9mm_pistol');
      
      expect(weapon).toBeDefined();
      expect(weapon?.name).toBe('9mm_pistol');
      expect(weapon?.skill).toBe('small_guns');
      expect(weapon?.ammoType).toBe('mm_9');
      expect(weapon?.damage.min).toBeLessThanOrEqual(weapon?.damage.max || 0);
    });

    test('should return null for non-existent weapon', () => {
      const weapon = weaponService.getWeapon('non_existent_weapon');
      expect(weapon).toBeNull();
    });

    test('should get all weapons', () => {
      const weapons = weaponService.getAllWeapons();
      
      expect(weapons.length).toBeGreaterThan(0);
      expect(weapons.some(w => w.name === '9mm_pistol')).toBe(true);
      expect(weapons.some(w => w.name === 'baseball_bat')).toBe(true);
    });
  });

  describe('Weapon Filtering', () => {
    test('should get weapons by skill type', () => {
      const smallGunsWeapons = weaponService.getWeaponsBySkill('small_guns');
      const meleeWeapons = weaponService.getWeaponsBySkill('melee_weapons');
      
      expect(smallGunsWeapons.length).toBeGreaterThan(0);
      expect(smallGunsWeapons.every(w => w.skill === 'small_guns')).toBe(true);
      
      expect(meleeWeapons.length).toBeGreaterThan(0);
      expect(meleeWeapons.every(w => w.skill === 'melee_weapons')).toBe(true);
    });

    test('should get weapons by ammo type', () => {
      const mm9Weapons = weaponService.getWeaponsByAmmoType('mm_9');
      const meleeWeapons = weaponService.getWeaponsByAmmoType('melee');
      
      expect(mm9Weapons.length).toBeGreaterThan(0);
      expect(mm9Weapons.every(w => w.ammoType === 'mm_9')).toBe(true);
      
      expect(meleeWeapons.length).toBeGreaterThan(0);
      expect(meleeWeapons.every(w => w.ammoType === 'melee')).toBe(true);
    });
  });

  describe('Weapon Classification', () => {
    test('should identify ranged weapons correctly', () => {
      expect(weaponService.isRangedWeapon('9mm_pistol')).toBe(true);
      expect(weaponService.isRangedWeapon('laser_rifle')).toBe(true);
      expect(weaponService.isRangedWeapon('baseball_bat')).toBe(false);
      expect(weaponService.isRangedWeapon('knife')).toBe(false);
    });

    test('should identify melee weapons correctly', () => {
      expect(weaponService.isMeleeWeapon('baseball_bat')).toBe(true);
      expect(weaponService.isMeleeWeapon('knife')).toBe(true);
      expect(weaponService.isMeleeWeapon('9mm_pistol')).toBe(false);
      expect(weaponService.isMeleeWeapon('laser_rifle')).toBe(false);
    });
  });

  describe('Weapon Statistics', () => {
    test('should get damage range string', () => {
      const pistolRange = weaponService.getDamageRangeString('9mm_pistol');
      const batRange = weaponService.getDamageRangeString('baseball_bat');
      
      expect(pistolRange).toMatch(/\d+-\d+/); // Format: "10-24"
      expect(batRange).toMatch(/\d+-\d+/); // Format: "3-10"
      
      const unknownRange = weaponService.getDamageRangeString('unknown_weapon');
      expect(unknownRange).toBe('Unknown');
    });

    test('should calculate average damage', () => {
      const weapon = weaponService.getWeapon('9mm_pistol');
      if (weapon) {
        const avgDamage = weaponService.getAverageDamage('9mm_pistol');
        const expectedAvg = (weapon.damage.min + weapon.damage.max) / 2;
        expect(avgDamage).toBe(expectedAvg);
      }

      const unknownAvg = weaponService.getAverageDamage('unknown_weapon');
      expect(unknownAvg).toBe(0);
    });
  });

  describe('Legacy Name Conversion', () => {
    test('should convert legacy weapon names', () => {
      expect(weaponService.convertLegacyName('Baseball bat')).toBe('baseball_bat');
      expect(weaponService.convertLegacyName('9mm pistol')).toBe('9mm_pistol');
      expect(weaponService.convertLegacyName('44 Magnum revolver')).toBe('magnum_44_revolver');
      expect(weaponService.convertLegacyName('Laser rifle')).toBe('laser_rifle');
      expect(weaponService.convertLegacyName('Combat shotgun')).toBe('combat_shotgun');
    });
  });

  describe('Weapon Validation', () => {
    test('should have valid weapon data', () => {
      const weapons = weaponService.getAllWeapons();
      
      weapons.forEach(weapon => {
        expect(weapon.name).toBeTruthy();
        expect(weapon.damage.min).toBeGreaterThan(0);
        expect(weapon.damage.max).toBeGreaterThanOrEqual(weapon.damage.min);
        expect(weapon.cooldown).toBeGreaterThan(0);
        expect(weapon.clipSize).toBeGreaterThan(0);
        expect(weapon.shotsPerAttack).toBeGreaterThan(0);
        expect(weapon.criticalChance).toBeGreaterThanOrEqual(0);
        expect(['small_guns', 'big_guns', 'energy_weapons', 'melee_weapons', 'pyrotechnics'])
          .toContain(weapon.skill);
      });
    });

    test('should have melee weapons with high clip sizes', () => {
      const meleeWeapons = weaponService.getWeaponsByAmmoType('melee');
      
      meleeWeapons.forEach(weapon => {
        expect(weapon.clipSize).toBeGreaterThan(100); // Effectively unlimited
      });
    });
  });
});
