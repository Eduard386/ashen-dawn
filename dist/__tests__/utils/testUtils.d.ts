/**
 * Test Utilities
 * Common utilities and helpers for testing
 */
import { IPlayerCharacter } from '../../typescript/core/interfaces/IPlayer';
import { IEnemy } from '../../typescript/core/interfaces/IEnemy';
import { IWeapon } from '../../typescript/core/interfaces/IWeapon';
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
export declare const nextTick: () => Promise<void>;
/**
 * Mock Phaser Scene for testing
 */
export declare class MockScene {
    scene: any;
    add: {
        text: jest.Mock<any, any, any>;
        image: jest.Mock<any, any, any>;
        rectangle: jest.Mock<any, any, any>;
        sprite: jest.Mock<any, any, any>;
    };
    input: {
        on: jest.Mock<any, any, any>;
        keyboard: {
            createKey: jest.Mock<any, any, any>;
        };
    };
    sound: {
        add: jest.Mock<any, any, any>;
        stopAll: jest.Mock<any, any, any>;
    };
    load: {
        image: jest.Mock<any, any, any>;
        audio: jest.Mock<any, any, any>;
        video: jest.Mock<any, any, any>;
        on: jest.Mock<any, any, any>;
        start: jest.Mock<any, any, any>;
    };
    cameras: {
        main: {
            fadeIn: jest.Mock<any, any, any>;
            fadeOut: jest.Mock<any, any, any>;
        };
    };
    registry: {
        get: jest.Mock<any, any, any>;
        set: jest.Mock<any, any, any>;
    };
    create: jest.Mock<any, any, any>;
    preload: jest.Mock<any, any, any>;
    update: jest.Mock<any, any, any>;
    init: jest.Mock<any, any, any>;
}
/**
 * Mock service factory for dependency injection testing
 */
export declare class MockServiceFactory {
    private services;
    register<T>(name: string, implementation: T): void;
    get<T>(name: string): T;
    clear(): void;
}
/**
 * Test data builder for complex objects
 */
export declare class TestDataBuilder {
    static player(overrides?: Partial<IPlayerCharacter>): IPlayerCharacter;
    static enemy(overrides?: Partial<IEnemy>): IEnemy;
    static weapon(overrides?: Partial<IWeapon>): IWeapon;
}
/**
 * Assertion helpers for common game testing scenarios
 */
export declare class GameAssertions {
    static expectHealthInRange(character: {
        health: number;
        maxHealth: number;
    }): void;
    static expectValidDamageRange(damage: {
        min: number;
        max: number;
    }): void;
    static expectValidSkillValue(skillValue: number): void;
    static expectValidInventoryCount(count: number): void;
}
/**
 * Performance testing utilities
 */
export declare class PerformanceTestUtils {
    static measureExecution<T>(fn: () => T | Promise<T>): Promise<{
        result: T;
        duration: number;
    }>;
    static expectExecutionTime<T>(fn: () => T | Promise<T>, maxDuration: number): Promise<void>;
}
/**
 * Mock data store for testing persistent state
 */
export declare class MockDataStore {
    private data;
    save(key: string, value: any): Promise<void>;
    load<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): string[];
    size(): number;
}
declare const _default: {
    nextTick: () => Promise<void>;
    MockScene: typeof MockScene;
    MockServiceFactory: typeof MockServiceFactory;
    TestDataBuilder: typeof TestDataBuilder;
    GameAssertions: typeof GameAssertions;
    PerformanceTestUtils: typeof PerformanceTestUtils;
    MockDataStore: typeof MockDataStore;
};
export default _default;
