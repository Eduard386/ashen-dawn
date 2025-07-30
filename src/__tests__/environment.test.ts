// Environment tests to ensure Jest setup is working correctly
import { createMockPlayer, createMockWeapon, createMockEnemy } from './setupTests';

describe('Test Environment', () => {
  test('should have Phaser mocked correctly', () => {
    expect(global.Phaser).toBeDefined();
    expect(typeof global.Phaser.Scene).toBe('function');
    expect(typeof global.Phaser.Math.Between).toBe('function');
  });

  test('should have jest-extended matchers available', () => {
    expect([1, 2, 3]).toHaveLength(3);
    expect(typeof 'test').toBe('string');
    expect(typeof 42).toBe('number');
  });

  test('should create mock utilities correctly', () => {
    const player = createMockPlayer();
    const weapon = createMockWeapon();
    const enemy = createMockEnemy();

    expect(player).toBeDefined();
    expect(player.name).toBe('Test Player');
    expect(weapon).toBeDefined();
    expect(weapon.name).toBe('Test Pistol');
    expect(enemy).toBeDefined();
    expect(enemy.name).toBe('Test Raider');
  });

  test('should have localStorage mocked', () => {
    expect(global.localStorage).toBeDefined();
    expect(typeof global.localStorage.getItem).toBe('function');
    expect(typeof global.localStorage.setItem).toBe('function');
  });
});
