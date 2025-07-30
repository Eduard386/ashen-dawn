// Jest setup file for global test configuration
import 'jest-extended';

// Mock Phaser 3 for testing
global.Phaser = {
  Scene: class MockScene {
    scene: any;
    add: any;
    load: any;
    input: any;
    cameras: any;
    
    constructor(config: any) {
      this.scene = { 
        key: config.key || config,
        start: jest.fn(),
        get: jest.fn()
      };
      this.add = {
        image: jest.fn(),
        sprite: jest.fn(),
        text: jest.fn(),
        graphics: jest.fn()
      };
      this.load = {
        image: jest.fn(),
        audio: jest.fn()
      };
      this.input = {
        keyboard: {
          createCursorKeys: jest.fn(),
          addKey: jest.fn(),
          addKeys: jest.fn()
        }
      };
      this.cameras = {
        main: {
          width: 1024,
          height: 600,
          centerX: 512,
          centerY: 300
        }
      };
    }
  },
  Game: class MockGame {},
  Math: {
    Between: jest.fn((min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min),
    RND: {
      pick: jest.fn((array: any[]) => array[Math.floor(Math.random() * array.length)])
    }
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        SPACE: 32,
        SHIFT: 16,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        Z: 90,
        X: 88,
        C: 67,
        V: 86,
        B: 66
      },
      JustDown: jest.fn()
    }
  },
  Geom: {
    Rectangle: class MockRectangle {
      constructor(public x: number, public y: number, public width: number, public height: number) {}
    },
    Intersects: {
      RectangleToRectangle: jest.fn()
    }
  },
  Utils: {
    Array: {
      GetRandom: jest.fn((array: any[]) => array[Math.floor(Math.random() * array.length)])
    }
  }
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
} as any;

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now())
} as any;

// Mock DOM
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(),
      putImageData: jest.fn(),
      createImageData: jest.fn(),
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
      measureText: jest.fn(() => ({ width: 12 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
    }))
  }))
});

// Global test utilities
export const createMockPlayer = () => ({
  name: 'Test Player',
  health: 100,
  maxHealth: 100,
  armor: 5,
  weapons: [],
  inventory: { medkits: 2, stimpaks: 1 },
  skills: {
    smallGuns: 50,
    bigGuns: 30,
    energyWeapons: 25,
    unarmed: 40,
    meleeWeapons: 35,
    throwing: 30,
    firstAid: 60,
    doctor: 40,
    sneak: 45,
    lockpick: 35,
    steal: 25,
    traps: 30
  }
});

export const createMockWeapon = () => ({
  name: 'Test Pistol',
  damage: 25,
  ammoType: '9mm',
  currentAmmo: 15,
  maxAmmo: 15,
  range: 20,
  skillRequired: 'smallGuns' as const,
  accuracy: 0.8
});

export const createMockEnemy = () => ({
  name: 'Test Raider',
  health: 60,
  maxHealth: 60,
  armor: 3,
  weapon: createMockWeapon(),
  dropRate: 0.5,
  experienceValue: 50,
  skills: {
    combat: 45,
    armor: 3
  }
});
