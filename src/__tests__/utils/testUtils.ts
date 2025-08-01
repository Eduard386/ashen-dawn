/**
 * Test Utilities
 * Common utilities and helpers for testing
 */

import { IPlayerCharacter } from '../../typescript/core/interfaces/IPlayer';
import { IEnemy } from '../../typescript/core/interfaces/IEnemy';
import { IWeapon } from '../../typescript/core/interfaces/IWeapon';

// Type declarations for global test utilities
declare global {
  function createMockPlayer(): IPlayerCharacter;
  function createMockEnemy(): IEnemy;
  function createMockWeapon(): IWeapon;
  function suppressConsole(): void;
  function restoreConsole(): void;
  
  namespace jest {
    interface Matchers<R> {
      toBeCloseTo(expected: number, precision?: number): R;
    }
  }
}

/**
 * Async test helper that waits for next tick
 */
export const nextTick = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Mock Phaser Scene for testing
 */
export class MockScene {
  public scene: any = {
    key: 'MockScene',
    start: jest.fn(),
    stop: jest.fn(),
    switch: jest.fn()
  };
  
  public add = {
    text: jest.fn().mockReturnThis(),
    image: jest.fn().mockReturnThis(),
    rectangle: jest.fn().mockReturnThis(),
    sprite: jest.fn().mockReturnThis()
  };
  
  public input = {
    on: jest.fn(),
    keyboard: {
      createKey: jest.fn().mockReturnValue({
        on: jest.fn()
      })
    }
  };
  
  public sound = {
    add: jest.fn().mockReturnValue({
      play: jest.fn(),
      stop: jest.fn(),
      setVolume: jest.fn()
    }),
    stopAll: jest.fn()
  };
  
  public load = {
    image: jest.fn(),
    audio: jest.fn(),
    video: jest.fn(),
    on: jest.fn(),
    start: jest.fn()
  };
  
  public cameras = {
    main: {
      fadeIn: jest.fn(),
      fadeOut: jest.fn()
    }
  };
  
  public registry = {
    get: jest.fn(),
    set: jest.fn()
  };
  
  create = jest.fn();
  preload = jest.fn();
  update = jest.fn();
  init = jest.fn();
}

/**
 * Mock service factory for dependency injection testing
 */
export class MockServiceFactory {
  private services: Map<string, any> = new Map();
  
  register<T>(name: string, implementation: T): void {
    this.services.set(name, implementation);
  }
  
  get<T>(name: string): T {
    return this.services.get(name);
  }
  
  clear(): void {
    this.services.clear();
  }
}

/**
 * Test data builder for complex objects
 */
export class TestDataBuilder {
  static player(overrides: Partial<IPlayerCharacter> = {}): IPlayerCharacter {
    return {
      id: 'test-player-id',
      levelCount: 1,
      health: 30,
      maxHealth: 30,
      experience: 0,
      // Flatten skills to match IPlayerCharacter
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
      surviving: 15,
      currentWeapon: 'baseball_bat',
      currentArmor: 'leather_jacket',
      weapons: ['baseball_bat'],
      inventory: {
        med: {
          first_aid_kit: 1,
          jet: 0,
          buffout: 0,
          mentats: 0,
          psycho: 0
        },
        ammo: {
          mm_9: 50,
          magnum_44: 0,
          mm_12: 0,
          mm_5_45: 0,
          energy_cell: 0,
          frag_grenade: 0
        }
      },
      ...overrides
    };
  }
  
  static enemy(overrides: Partial<IEnemy> = {}): IEnemy {
    return {
      id: 'test-enemy-id',
      name: 'Test Enemy',
      type: 'human',
      maxLevel: 5,
      currentHealth: 25,
      maxHealth: 25,
      experienceReward: 15,
      defence: {
        health: 25,
        armorClass: 5,
        damageThreshold: 0,
        damageResistance: 0
      },
      attack: {
        hitChance: 50,
        weapon: 'baseball_bat',
        damage: { min: 1, max: 6 },
        shots: 1,
        attackSpeed: 1.0,
        criticalChance: 5
      },
      spawning: {
        min: 1,
        max: 3
      },
      experience: 15,
      sprites: ['test_enemy.png'],
      ...overrides
    };
  }
  
  static weapon(overrides: Partial<IWeapon> = {}): IWeapon {
    return {
      name: 'test_weapon',
      skill: 'small_guns',
      ammoType: 'mm_9',
      cooldown: 1000,
      damage: { min: 1, max: 6 },
      clipSize: 10,
      shotsPerAttack: 1,
      criticalChance: 10,
      ...overrides
    };
  }
}

/**
 * Assertion helpers for common game testing scenarios
 */
export class GameAssertions {
  static expectHealthInRange(character: { health: number; maxHealth: number }): void {
    expect(character.health).toBeGreaterThanOrEqual(0);
    expect(character.health).toBeLessThanOrEqual(character.maxHealth);
  }
  
  static expectValidDamageRange(damage: { min: number; max: number }): void {
    expect(damage.min).toBeGreaterThanOrEqual(0);
    expect(damage.max).toBeGreaterThanOrEqual(damage.min);
  }
  
  static expectValidSkillValue(skillValue: number): void {
    expect(skillValue).toBeGreaterThanOrEqual(0);
    expect(skillValue).toBeLessThanOrEqual(100);
  }
  
  static expectValidInventoryCount(count: number): void {
    expect(count).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(count)).toBe(true);
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  static async measureExecution<T>(fn: () => T | Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }
  
  static expectExecutionTime<T>(
    fn: () => T | Promise<T>,
    maxDuration: number
  ): Promise<void> {
    return this.measureExecution(fn).then(({ duration }) => {
      expect(duration).toBeLessThan(maxDuration);
    });
  }
}

/**
 * Mock data store for testing persistent state
 */
export class MockDataStore {
  private data: Map<string, any> = new Map();
  
  async save(key: string, value: any): Promise<void> {
    this.data.set(key, JSON.parse(JSON.stringify(value)));
  }
  
  async load<T>(key: string): Promise<T | null> {
    const value = this.data.get(key);
    return value ? JSON.parse(JSON.stringify(value)) : null;
  }
  
  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }
  
  async clear(): Promise<void> {
    this.data.clear();
  }
  
  keys(): string[] {
    return Array.from(this.data.keys());
  }
  
  size(): number {
    return this.data.size;
  }
}

export default {
  nextTick,
  MockScene,
  MockServiceFactory,
  TestDataBuilder,
  GameAssertions,
  PerformanceTestUtils,
  MockDataStore
};
