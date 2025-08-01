/**
 * Test Utilities
 * Common utilities and helpers for testing
 */
/**
 * Async test helper that waits for next tick
 */
export const nextTick = () => {
    return new Promise(resolve => setTimeout(resolve, 0));
};
/**
 * Mock Phaser Scene for testing
 */
export class MockScene {
    constructor() {
        this.scene = {
            key: 'MockScene',
            start: jest.fn(),
            stop: jest.fn(),
            switch: jest.fn()
        };
        this.add = {
            text: jest.fn().mockReturnThis(),
            image: jest.fn().mockReturnThis(),
            rectangle: jest.fn().mockReturnThis(),
            sprite: jest.fn().mockReturnThis()
        };
        this.input = {
            on: jest.fn(),
            keyboard: {
                createKey: jest.fn().mockReturnValue({
                    on: jest.fn()
                })
            }
        };
        this.sound = {
            add: jest.fn().mockReturnValue({
                play: jest.fn(),
                stop: jest.fn(),
                setVolume: jest.fn()
            }),
            stopAll: jest.fn()
        };
        this.load = {
            image: jest.fn(),
            audio: jest.fn(),
            video: jest.fn(),
            on: jest.fn(),
            start: jest.fn()
        };
        this.cameras = {
            main: {
                fadeIn: jest.fn(),
                fadeOut: jest.fn()
            }
        };
        this.registry = {
            get: jest.fn(),
            set: jest.fn()
        };
        this.create = jest.fn();
        this.preload = jest.fn();
        this.update = jest.fn();
        this.init = jest.fn();
    }
}
/**
 * Mock service factory for dependency injection testing
 */
export class MockServiceFactory {
    constructor() {
        this.services = new Map();
    }
    register(name, implementation) {
        this.services.set(name, implementation);
    }
    get(name) {
        return this.services.get(name);
    }
    clear() {
        this.services.clear();
    }
}
/**
 * Test data builder for complex objects
 */
export class TestDataBuilder {
    static player(overrides = {}) {
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
    static enemy(overrides = {}) {
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
    static weapon(overrides = {}) {
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
    static expectHealthInRange(character) {
        expect(character.health).toBeGreaterThanOrEqual(0);
        expect(character.health).toBeLessThanOrEqual(character.maxHealth);
    }
    static expectValidDamageRange(damage) {
        expect(damage.min).toBeGreaterThanOrEqual(0);
        expect(damage.max).toBeGreaterThanOrEqual(damage.min);
    }
    static expectValidSkillValue(skillValue) {
        expect(skillValue).toBeGreaterThanOrEqual(0);
        expect(skillValue).toBeLessThanOrEqual(100);
    }
    static expectValidInventoryCount(count) {
        expect(count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(count)).toBe(true);
    }
}
/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
    static async measureExecution(fn) {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;
        return { result, duration };
    }
    static expectExecutionTime(fn, maxDuration) {
        return this.measureExecution(fn).then(({ duration }) => {
            expect(duration).toBeLessThan(maxDuration);
        });
    }
}
/**
 * Mock data store for testing persistent state
 */
export class MockDataStore {
    constructor() {
        this.data = new Map();
    }
    async save(key, value) {
        this.data.set(key, JSON.parse(JSON.stringify(value)));
    }
    async load(key) {
        const value = this.data.get(key);
        return value ? JSON.parse(JSON.stringify(value)) : null;
    }
    async delete(key) {
        this.data.delete(key);
    }
    async clear() {
        this.data.clear();
    }
    keys() {
        return Array.from(this.data.keys());
    }
    size() {
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
//# sourceMappingURL=testUtils.js.map