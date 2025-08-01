/**
 * Jest Setup File
 * Configures global test environment and mocks
 */
// Mock Phaser globally
global.Phaser = {
    Scene: class MockScene {
        constructor(key) {
            this.scene = {};
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
            this.scene = { key };
        }
    },
    Game: class MockGame {
        constructor() {
            this.scene = {
                add: jest.fn(),
                start: jest.fn(),
                stop: jest.fn(),
                switch: jest.fn()
            };
        }
    },
    AUTO: 0,
    Physics: {
        Arcade: {
            DYNAMIC_BODY: 0,
            STATIC_BODY: 1
        }
    },
    Input: {
        Keyboard: {
            KeyCodes: {
                ESC: 27,
                ENTER: 13,
                SPACE: 32,
                UP: 38,
                DOWN: 40,
                LEFT: 37,
                RIGHT: 39
            }
        }
    }
};
// Mock Canvas and WebGL context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(() => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Array(4) })),
        putImageData: jest.fn(),
        createImageData: jest.fn(() => []),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
    }))
});
// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(() => null)
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});
// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
    }
});
// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    load: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    volume: 1,
    currentTime: 0,
    duration: 0,
    paused: false,
    ended: false
}));
// Mock Image
global.Image = jest.fn().mockImplementation(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    src: '',
    width: 0,
    height: 0,
    complete: false,
    naturalWidth: 0,
    naturalHeight: 0
}));
// Extend Jest matchers
expect.extend({
    toBeCloseTo(received, expected, precision = 2) {
        const pass = Math.abs(received - expected) < Math.pow(10, -precision);
        return {
            message: () => `expected ${received} to be close to ${expected}`,
            pass
        };
    }
});
// Global test utilities
global.createMockPlayer = () => ({
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
    }
});
global.createMockEnemy = () => ({
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
    sprites: ['test_enemy.png']
});
global.createMockWeapon = () => ({
    name: 'test_weapon',
    skill: 'small_guns',
    ammoType: 'mm_9',
    cooldown: 1000,
    damage: { min: 1, max: 6 },
    clipSize: 10,
    shotsPerAttack: 1,
    criticalChance: 10
});
// Console utilities for tests
const originalConsole = { ...console };
global.suppressConsole = () => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.info = jest.fn();
};
global.restoreConsole = () => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
};
// Performance mock
global.performance = global.performance || {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn()
};
// RAF mock
global.requestAnimationFrame = global.requestAnimationFrame || jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = global.cancelAnimationFrame || jest.fn();
console.log('✅ Jest testing environment configured successfully');
//# sourceMappingURL=setupTests.js.map