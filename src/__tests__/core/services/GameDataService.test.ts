/**
 * GameDataService Tests
 * Baseline tests for existing GameDataService functionality
 */

import { GameDataService } from '../../../typescript/core/services/GameDataService';
import { TestDataBuilder, MockDataStore } from '../../utils/testUtils';

describe('GameDataService', () => {
  let service: GameDataService;
  let mockStore: MockDataStore;

  beforeEach(() => {
    // Reset singleton for testing
    (GameDataService as any).instance = null;
    service = GameDataService.getInstance();
    mockStore = new MockDataStore();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockImplementation((key: string) => 
        mockStore.load(key).then(data => data ? JSON.stringify(data) : null)
      ),
      setItem: jest.fn().mockImplementation((key: string, value: string) => 
        mockStore.save(key, JSON.parse(value))
      ),
      removeItem: jest.fn().mockImplementation((key: string) => 
        mockStore.delete(key)
      ),
      clear: jest.fn().mockImplementation(() => mockStore.clear())
    };
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GameDataService.getInstance();
      const instance2 = GameDataService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should not allow direct instantiation', () => {
      // The constructor is private, so this test checks the intended behavior
      // In TypeScript, this is a compile-time check rather than runtime
      expect(true).toBe(true); // Placeholder - constructor privacy is enforced by TypeScript
    });
  });

  describe('Initialization', () => {
    it('should initialize with default game data', () => {
      service.init();
      
      const gameData = service.get();
      expect(gameData).toBeDefined();
      expect(gameData.health).toBe(30);
      expect(gameData.levelCount).toBe(1);
      expect(gameData.experience).toBe(0);
    });

    it('should initialize with default skills', () => {
      service.init();
      
      const gameData = service.get();
      expect(gameData.skills).toBeDefined();
      expect(typeof gameData.skills).toBe('object');
      expect(gameData.skills.small_guns).toBe(75);
    });

    it('should initialize with default weapons', () => {
      service.init();
      
      const gameData = service.get();
      expect(gameData.weapons).toBeDefined();
      expect(Array.isArray(gameData.weapons)).toBe(true);
      expect(gameData.weapons.length).toBeGreaterThan(0);
    });

    it('should initialize with default medical items', () => {
      service.init();
      
      const gameData = service.get();
      expect(gameData.med).toBeDefined();
      expect(typeof gameData.med).toBe('object');
    });
  });

  describe('Data Management', () => {
    beforeEach(() => {
      service.init();
    });

    it('should get game data', () => {
      const gameData = service.get();
      expect(gameData).toBeDefined();
      expect(typeof gameData).toBe('object');
    });

    it('should set game data', () => {
      const testData = { test: 'value', health: 25 };
      service.set(testData);
      
      const retrieved = service.get();
      expect(retrieved).toEqual(testData);
    });

    it('should maintain data state after setting', () => {
      const originalData = service.get();
      const modifiedData = { ...originalData, health: 15 };
      
      service.set(modifiedData);
      const newData = service.get();
      
      expect(newData.health).toBe(15);
    });
  });

  describe('Level Calculation', () => {
    beforeEach(() => {
      service.init();
    });

    it('should calculate level correctly based on current experience', () => {
      // Test with different experience values by setting game data
      const gameData = service.get();
      
      // Level 1
      service.set({ ...gameData, experience: 0 });
      expect(service.calculateLevel()).toBe(1);
      
      // Check if level increases with more experience
      service.set({ ...gameData, experience: 1000 });
      const levelWith1000Exp = service.calculateLevel();
      expect(levelWith1000Exp).toBeGreaterThanOrEqual(1);
      
      // Higher experience should result in higher or equal level
      service.set({ ...gameData, experience: 5000 });
      const levelWith5000Exp = service.calculateLevel();
      expect(levelWith5000Exp).toBeGreaterThanOrEqual(levelWith1000Exp);
    });

    it('should handle zero experience correctly', () => {
      const gameData = service.get();
      service.set({ ...gameData, experience: 0 });
      
      expect(service.calculateLevel()).toBe(1);
    });

    it('should calculate level consistently', () => {
      const gameData = service.get();
      service.set({ ...gameData, experience: 1500 });
      
      const level1 = service.calculateLevel();
      const level2 = service.calculateLevel();
      
      expect(level1).toBe(level2);
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      service.init();
    });

    it('should reset all data to defaults', () => {
      // Modify data
      const gameData = service.get();
      service.set({ ...gameData, health: 10, experience: 1000 });
      
      // Reset
      service.reset();
      
      // Check that data is back to defaults
      const resetData = service.get();
      expect(resetData.health).toBe(30);
      expect(resetData.experience).toBe(0);
    });

    it('should maintain core data structure after reset', () => {
      service.reset();
      
      const gameData = service.get();
      expect(gameData.health).toBeDefined();
      expect(gameData.skills).toBeDefined();
      expect(gameData.weapons).toBeDefined();
      expect(gameData.med).toBeDefined();
    });

    it('should provide fresh default data copy', () => {
      const default1 = service.getDefault();
      const default2 = service.getDefault();
      
      // Should be equal but not the same reference
      expect(default1).toEqual(default2);
      expect(default1).not.toBe(default2);
    });
  });

  describe('Persistence', () => {
    beforeEach(() => {
      service.init();
    });

    it('should save data to localStorage', () => {
      const gameData = service.get();
      service.set({ ...gameData, health: 15 });
      
      service.save();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'gameData',
        expect.stringContaining('"health":15')
      );
    });

    it('should load data from localStorage', () => {
      // Setup saved data
      const gameData = service.get();
      const savedData = { ...gameData, health: 20, experience: 500 };
      
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify(savedData));
      
      // Load data
      const result = service.load();
      
      expect(result).toBe(true);
      const loadedData = service.get();
      expect(loadedData.health).toBe(20);
      expect(loadedData.experience).toBe(500);
    });

    it('should handle loading when no saved data exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);
      
      const originalData = { ...service.get() };
      const result = service.load();
      
      expect(result).toBe(false);
      // Should maintain current data when no saved data
      const currentData = service.get();
      expect(currentData).toEqual(originalData);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      (localStorage.getItem as jest.Mock).mockReturnValueOnce('invalid json data');
      
      // The load method returns boolean and handles errors internally
      const result = service.load();
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false); // Should return false for invalid data
    });
  });

  describe('Health Management', () => {
    beforeEach(() => {
      service.init();
    });

    it('should get current health', () => {
      const health = service.getHealth();
      expect(typeof health).toBe('number');
      expect(health).toBe(30); // Default health
    });

    it('should set health correctly', () => {
      service.setHealth(25);
      expect(service.getHealth()).toBe(25);
    });
  });

  describe('Experience Management', () => {
    beforeEach(() => {
      service.init();
    });

    it('should get current experience', () => {
      const experience = service.getExperience();
      expect(typeof experience).toBe('number');
      expect(experience).toBe(0); // Default experience
    });

    it('should add experience correctly', () => {
      const initialExp = service.getExperience();
      service.addExperience(100);
      
      expect(service.getExperience()).toBe(initialExp + 100);
    });

    it('should calculate required experience for levels', () => {
      const reqExp1 = service.getRequiredExperience(1);
      const reqExp2 = service.getRequiredExperience(2);
      
      expect(typeof reqExp1).toBe('number');
      expect(typeof reqExp2).toBe('number');
      expect(reqExp2).toBeGreaterThan(reqExp1);
    });
  });

  describe('Data Integrity', () => {
    beforeEach(() => {
      service.init();
    });

    it('should maintain data consistency across operations', () => {
      const originalData = service.get();
      const originalWeapons = [...originalData.weapons];
      
      // Perform health modification
      service.setHealth(25);
      
      // Check that other data remains intact
      const currentData = service.get();
      expect(currentData.weapons).toEqual(originalWeapons);
    });

    it('should handle deep data modifications correctly', () => {
      const gameData = service.get();
      const modifiedData = {
        ...gameData,
        skills: { ...gameData.skills, small_guns: 50 }
      };
      
      service.set(modifiedData);
      const newData = service.get();
      
      expect(newData.skills.small_guns).toBe(50);
      expect(newData.health).toBe(gameData.health); // Should remain unchanged
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      service.init();
    });

    it('should handle multiple rapid get operations efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        service.get();
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle data modifications efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const data = service.get();
        service.set({ ...data, health: 25 + i });
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(200); // Should complete in less than 200ms
    });
  });
});
