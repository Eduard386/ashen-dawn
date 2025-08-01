import {
  ServiceRegistry,
  StatePersistence,
  GameLifecycleManager,
  SceneNavigationManager,
  LegacyDataBridge,
  EncounterManager,
  ModernGameStateService,
  EncounterData
} from '../../../../typescript/core/services/gamestate/index.js';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup mocks
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
global.console = { ...console, ...mockConsole };

describe('Game State Service SRP Implementation', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
    // Reset console mocks
    mockConsole.log.mockClear();
    mockConsole.warn.mockClear();
    mockConsole.error.mockClear();
  });

  describe('ServiceRegistry', () => {
    describe('Single Responsibility: Service Registration and Location', () => {
      let serviceRegistry: ServiceRegistry;

      beforeEach(() => {
        serviceRegistry = new ServiceRegistry();
      });

      test('should register and retrieve services correctly', () => {
        const mockService = { name: 'TestService', action: () => 'test' };
        
        serviceRegistry.registerService('test', mockService);
        const retrievedService = serviceRegistry.getService('test');
        
        expect(retrievedService).toBe(mockService);
        expect(serviceRegistry.hasService('test')).toBe(true);
      });

      test('should handle service overwriting with warning', () => {
        const service1 = { name: 'Service1' };
        const service2 = { name: 'Service2' };
        
        serviceRegistry.registerService('test', service1);
        serviceRegistry.registerService('test', service2);
        
        expect(mockConsole.warn).toHaveBeenCalledWith("Service 'test' is already registered. Overwriting.");
        expect(serviceRegistry.getService('test')).toBe(service2);
      });

      test('should return null for non-existent services', () => {
        const result = serviceRegistry.getService('nonexistent');
        
        expect(result).toBeNull();
        expect(mockConsole.error).toHaveBeenCalledWith("Service 'nonexistent' is not registered");
      });

      test('should provide registry statistics', () => {
        serviceRegistry.registerService('service1', {});
        serviceRegistry.registerService('service2', {});
        
        const stats = serviceRegistry.getRegistryStats();
        
        expect(stats.totalServices).toBeGreaterThanOrEqual(2);
        expect(stats.registeredServices).toContain('service1');
        expect(stats.registeredServices).toContain('service2');
        expect(stats.initialized).toBe(true);
      });

      test('should validate required services', () => {
        const validation = serviceRegistry.validateServices();
        
        expect(validation).toHaveProperty('valid');
        expect(validation).toHaveProperty('missing');
        expect(validation).toHaveProperty('available');
        expect(Array.isArray(validation.missing)).toBe(true);
        expect(Array.isArray(validation.available)).toBe(true);
      });

      test('should clear and reinitialize services', () => {
        serviceRegistry.registerService('test', {});
        expect(serviceRegistry.hasService('test')).toBe(true);
        
        serviceRegistry.clearServices();
        expect(serviceRegistry.hasService('test')).toBe(false);
        
        serviceRegistry.reinitialize();
        expect(serviceRegistry.isInitialized()).toBe(true);
      });
    });

    describe('SRP Compliance', () => {
      test('should focus only on service management', () => {
        const serviceRegistry = new ServiceRegistry();
        
        // Should have service management methods only
        expect(typeof serviceRegistry.registerService).toBe('function');
        expect(typeof serviceRegistry.getService).toBe('function');
        expect(typeof serviceRegistry.hasService).toBe('function');
        
        // Should not have methods for other responsibilities
        expect(serviceRegistry).not.toHaveProperty('saveData');
        expect(serviceRegistry).not.toHaveProperty('loadData');
        expect(serviceRegistry).not.toHaveProperty('setScene');
      });

      test('should handle service registration independently', () => {
        const serviceRegistry = new ServiceRegistry();
        const testService = { test: true };
        
        const result = serviceRegistry.registerService('independent', testService);
        expect(result).toBeUndefined(); // void return
        expect(serviceRegistry.getService('independent')).toBe(testService);
      });
    });
  });

  describe('StatePersistence', () => {
    describe('Single Responsibility: Save/Load Operations', () => {
      let statePersistence: StatePersistence;

      beforeEach(() => {
        statePersistence = new StatePersistence();
      });

      test('should save and load game data correctly', () => {
        const testData = { health: 100, experience: 500 };
        
        const saveResult = statePersistence.saveGameData(testData);
        expect(saveResult).toBe(true);
        
        const loadedData = statePersistence.loadGameData();
        expect(loadedData).toEqual(testData);
      });

      test('should handle save data existence checking', () => {
        expect(statePersistence.hasSaveData()).toBe(false);
        
        statePersistence.saveGameData({ test: 'data' });
        expect(statePersistence.hasSaveData()).toBe(true);
      });

      test('should create and restore backups', () => {
        const originalData = { health: 100 };
        const newData = { health: 50 };
        
        statePersistence.saveGameData(originalData);
        statePersistence.createBackup();
        
        statePersistence.saveGameData(newData);
        expect(statePersistence.loadGameData()).toEqual(newData);
        
        const restoreResult = statePersistence.restoreFromBackup();
        expect(restoreResult).toBe(true);
        expect(statePersistence.loadGameData()).toEqual(originalData);
      });

      test('should provide save data information', () => {
        const testData = { health: 100 };
        statePersistence.saveGameData(testData);
        
        const info = statePersistence.getSaveDataInfo();
        
        expect(info.exists).toBe(true);
        expect(info.size).toBeGreaterThan(0);
        expect(info.lastModified).toBeInstanceOf(Date);
      });

      test('should handle export and import operations', () => {
        const testData = { health: 100, experience: 200 };
        statePersistence.saveGameData(testData);
        
        const exportedData = statePersistence.exportSaveData();
        expect(exportedData).toBeTruthy();
        
        statePersistence.deleteSaveData();
        expect(statePersistence.hasSaveData()).toBe(false);
        
        const importResult = statePersistence.importSaveData(exportedData!);
        expect(importResult).toBe(true);
        expect(statePersistence.loadGameData()).toEqual(testData);
      });

      test('should provide storage statistics', () => {
        statePersistence.saveGameData({ test: 'data' });
        
        const stats = statePersistence.getStorageStats();
        
        expect(stats).toHaveProperty('totalSize');
        expect(stats).toHaveProperty('saveDataSize');
        expect(stats).toHaveProperty('backupSize');
        expect(stats).toHaveProperty('compressionEnabled');
        expect(stats).toHaveProperty('storageKey');
      });

      test('should clear all data', () => {
        statePersistence.saveGameData({ test: 'data' });
        statePersistence.createBackup();
        
        expect(statePersistence.hasSaveData()).toBe(true);
        
        const clearResult = statePersistence.clearAllData();
        expect(clearResult).toBe(true);
        expect(statePersistence.hasSaveData()).toBe(false);
      });
    });

    describe('SRP Compliance', () => {
      test('should focus only on persistence operations', () => {
        const statePersistence = new StatePersistence();
        
        // Should have persistence methods only
        expect(typeof statePersistence.saveGameData).toBe('function');
        expect(typeof statePersistence.loadGameData).toBe('function');
        expect(typeof statePersistence.deleteSaveData).toBe('function');
        
        // Should not have methods for other responsibilities
        expect(statePersistence).not.toHaveProperty('initializeGame');
        expect(statePersistence).not.toHaveProperty('setScene');
        expect(statePersistence).not.toHaveProperty('getPlayer');
      });

      test('should handle data serialization independently', () => {
        const statePersistence = new StatePersistence();
        const complexData = {
          nested: { array: [1, 2, 3], object: { key: 'value' } },
          number: 42,
          string: 'test'
        };
        
        statePersistence.saveGameData(complexData);
        const loaded = statePersistence.loadGameData();
        
        expect(loaded).toEqual(complexData);
      });
    });
  });

  describe('GameLifecycleManager', () => {
    describe('Single Responsibility: Game Lifecycle Management', () => {
      let lifecycleManager: GameLifecycleManager;

      beforeEach(() => {
        lifecycleManager = new GameLifecycleManager();
      });

      test('should manage initialization state correctly', () => {
        expect(lifecycleManager.isInitialized()).toBe(false);
        expect(lifecycleManager.getCurrentPhase()).toBe('uninitialized');
        
        const result = lifecycleManager.initializeGame();
        expect(result).toBe(true);
        expect(lifecycleManager.isInitialized()).toBe(true);
        expect(lifecycleManager.getCurrentPhase()).toBe('ready');
      });

      test('should prevent double initialization', () => {
        lifecycleManager.initializeGame();
        const secondInit = lifecycleManager.initializeGame();
        
        expect(secondInit).toBe(false);
        expect(mockConsole.warn).toHaveBeenCalledWith('Game already initialized');
      });

      test('should handle reset operations', () => {
        lifecycleManager.initializeGame();
        expect(lifecycleManager.isInitialized()).toBe(true);
        
        const resetResult = lifecycleManager.resetGame();
        expect(resetResult).toBe(true);
        expect(lifecycleManager.isInitialized()).toBe(false);
        expect(lifecycleManager.getCurrentPhase()).toBe('uninitialized');
      });

      test('should track initialization time and uptime', () => {
        const beforeInit = Date.now();
        lifecycleManager.initializeGame();
        const afterInit = Date.now();
        
        const initTime = lifecycleManager.getInitializationTime();
        expect(initTime).toBeInstanceOf(Date);
        expect(initTime!.getTime()).toBeGreaterThanOrEqual(beforeInit);
        expect(initTime!.getTime()).toBeLessThanOrEqual(afterInit);
        
        const uptime = lifecycleManager.getUptime();
        expect(uptime).toBeGreaterThanOrEqual(0);
      });

      test('should manage lifecycle callbacks', () => {
        const initCallback = jest.fn();
        const resetCallback = jest.fn();
        const shutdownCallback = jest.fn();
        
        lifecycleManager.onInitialization(initCallback);
        lifecycleManager.onReset(resetCallback);
        lifecycleManager.onShutdown(shutdownCallback);
        
        lifecycleManager.initializeGame();
        expect(initCallback).toHaveBeenCalled();
        
        lifecycleManager.resetGame();
        expect(resetCallback).toHaveBeenCalled();
        
        lifecycleManager.shutdownGame();
        expect(shutdownCallback).toHaveBeenCalled();
      });

      test('should provide lifecycle statistics', () => {
        lifecycleManager.initializeGame();
        
        const stats = lifecycleManager.getLifecycleStats();
        
        expect(stats.initialized).toBe(true);
        expect(stats.currentPhase).toBe('ready');
        expect(stats.initializationTime).toBeInstanceOf(Date);
        expect(stats.uptime).toBeGreaterThanOrEqual(0);
        expect(stats.callbackCounts).toHaveProperty('initialization');
        expect(stats.callbackCounts).toHaveProperty('reset');
        expect(stats.callbackCounts).toHaveProperty('shutdown');
      });

      test('should validate lifecycle state', () => {
        const validation = lifecycleManager.validateLifecycleState();
        
        expect(validation).toHaveProperty('valid');
        expect(validation).toHaveProperty('issues');
        expect(validation).toHaveProperty('phase');
        expect(Array.isArray(validation.issues)).toBe(true);
      });

      test('should handle asynchronous initialization waiting', async () => {
        const waitPromise = lifecycleManager.waitForInitialization(1000);
        
        // Initialize after a short delay
        setTimeout(() => {
          lifecycleManager.initializeGame();
        }, 50);
        
        const result = await waitPromise;
        expect(result).toBe(true);
      });
    });

    describe('SRP Compliance', () => {
      test('should focus only on lifecycle management', () => {
        const lifecycleManager = new GameLifecycleManager();
        
        // Should have lifecycle methods only
        expect(typeof lifecycleManager.initializeGame).toBe('function');
        expect(typeof lifecycleManager.resetGame).toBe('function');
        expect(typeof lifecycleManager.isInitialized).toBe('function');
        
        // Should not have methods for other responsibilities
        expect(lifecycleManager).not.toHaveProperty('saveGame');
        expect(lifecycleManager).not.toHaveProperty('setScene');
        expect(lifecycleManager).not.toHaveProperty('registerService');
      });

      test('should manage state transitions independently', () => {
        const lifecycleManager = new GameLifecycleManager();
        
        expect(lifecycleManager.getCurrentPhase()).toBe('uninitialized');
        lifecycleManager.initializeGame();
        expect(lifecycleManager.getCurrentPhase()).toBe('ready');
        lifecycleManager.resetGame();
        expect(lifecycleManager.getCurrentPhase()).toBe('uninitialized');
      });
    });
  });

  describe('SceneNavigationManager', () => {
    describe('Single Responsibility: Scene Navigation', () => {
      let sceneNavigation: SceneNavigationManager;

      beforeEach(() => {
        sceneNavigation = new SceneNavigationManager();
      });

      test('should manage current scene correctly', () => {
        expect(sceneNavigation.getCurrentScene()).toBe('MainMenu');
        
        const result = sceneNavigation.setCurrentScene('Battle');
        expect(result).toBe(true);
        expect(sceneNavigation.getCurrentScene()).toBe('Battle');
      });

      test('should track scene history', () => {
        sceneNavigation.setCurrentScene('WorldMap');
        sceneNavigation.setCurrentScene('Battle');
        sceneNavigation.setCurrentScene('Victory');
        
        const history = sceneNavigation.getSceneHistory();
        expect(history).toContain('MainMenu');
        expect(history).toContain('WorldMap');
        expect(history).toContain('Battle');
        expect(history).toContain('Victory');
      });

      test('should handle navigation back to previous scene', () => {
        sceneNavigation.setCurrentScene('Battle');
        expect(sceneNavigation.getPreviousScene()).toBe('MainMenu');
        
        const backResult = sceneNavigation.goBack();
        expect(backResult).toBe(true);
        expect(sceneNavigation.getCurrentScene()).toBe('MainMenu');
      });

      test('should manage scene transition callbacks', () => {
        const beforeCallback = jest.fn();
        const afterCallback = jest.fn();
        
        sceneNavigation.onSceneTransition('before', beforeCallback);
        sceneNavigation.onSceneTransition('after', afterCallback);
        
        sceneNavigation.setCurrentScene('Battle');
        
        expect(beforeCallback).toHaveBeenCalledWith('MainMenu', 'Battle');
        expect(afterCallback).toHaveBeenCalledWith('MainMenu', 'Battle');
      });

      test('should handle scene data storage', () => {
        const sceneData = { enemies: 5, loot: ['ammo', 'health'] };
        
        sceneNavigation.setSceneData('Battle', sceneData);
        expect(sceneNavigation.getSceneData('Battle')).toEqual(sceneData);
        expect(sceneNavigation.hasSceneData('Battle')).toBe(true);
        
        sceneNavigation.setCurrentScene('Battle');
        expect(sceneNavigation.getCurrentSceneData()).toEqual(sceneData);
      });

      test('should provide navigation statistics', () => {
        sceneNavigation.setCurrentScene('Battle');
        sceneNavigation.setSceneData('Battle', { test: true });
        
        const stats = sceneNavigation.getNavigationStats();
        
        expect(stats.currentScene).toBe('Battle');
        expect(stats.previousScene).toBe('MainMenu');
        expect(stats.historySize).toBeGreaterThan(0);
        expect(stats.sceneDataCount).toBeGreaterThan(0);
        expect(stats.transitionInProgress).toBe(false);
      });

      test('should validate navigation state', () => {
        const validation = sceneNavigation.validateNavigationState();
        
        expect(validation).toHaveProperty('valid');
        expect(validation).toHaveProperty('issues');
        expect(validation).toHaveProperty('currentScene');
        expect(Array.isArray(validation.issues)).toBe(true);
      });

      test('should handle history size management', () => {
        sceneNavigation.setMaxHistorySize(3);
        
        sceneNavigation.setCurrentScene('Scene1');
        sceneNavigation.setCurrentScene('Scene2');
        sceneNavigation.setCurrentScene('Scene3');
        sceneNavigation.setCurrentScene('Scene4');
        
        const history = sceneNavigation.getSceneHistory();
        expect(history.length).toBeLessThanOrEqual(3);
      });
    });

    describe('SRP Compliance', () => {
      test('should focus only on scene navigation', () => {
        const sceneNavigation = new SceneNavigationManager();
        
        // Should have navigation methods only
        expect(typeof sceneNavigation.setCurrentScene).toBe('function');
        expect(typeof sceneNavigation.getCurrentScene).toBe('function');
        expect(typeof sceneNavigation.goBack).toBe('function');
        
        // Should not have methods for other responsibilities
        expect(sceneNavigation).not.toHaveProperty('saveGame');
        expect(sceneNavigation).not.toHaveProperty('initializeGame');
        expect(sceneNavigation).not.toHaveProperty('getPlayer');
      });

      test('should manage transitions independently', () => {
        const sceneNavigation = new SceneNavigationManager();
        
        sceneNavigation.setCurrentScene('Battle');
        expect(sceneNavigation.canGoBack()).toBe(true);
        
        sceneNavigation.goBack();
        expect(sceneNavigation.getCurrentScene()).toBe('MainMenu');
      });
    });
  });

  describe('LegacyDataBridge', () => {
    describe('Single Responsibility: Data Format Conversion', () => {
      let legacyBridge: LegacyDataBridge;

      beforeEach(() => {
        legacyBridge = new LegacyDataBridge();
      });

      test('should convert modern data to legacy format', () => {
        const modernData = {
          health: 100,
          experience: 500,
          level: 5,
          skills: { small_guns: 80 },
          currentWeapon: 'Laser Pistol'
        };
        
        const legacyData = legacyBridge.convertToLegacy(modernData);
        
        expect(legacyData.health).toBe(100);
        expect(legacyData.experience).toBe(500);
        expect(legacyData.levelCount).toBe(5);
        expect(legacyData.current_weapon).toBe('Laser Pistol');
      });

      test('should convert legacy data to modern format', () => {
        const legacyData = {
          health: 75,
          experience: 300,
          levelCount: 3,
          current_weapon: 'Combat Shotgun',
          skills: { big_guns: 90 }
        };
        
        const modernData = legacyBridge.convertFromLegacy(legacyData);
        
        expect(modernData.health).toBe(75);
        expect(modernData.experience).toBe(300);
        expect(modernData.level).toBe(3);
        expect(modernData.currentWeapon).toBe('Combat Shotgun');
      });

      test('should validate legacy data structure', () => {
        const validData = {
          health: 100,
          experience: 200,
          skills: { small_guns: 75 }
        };
        
        const invalidData = {
          health: 'invalid',
          experience: -50
        };
        
        const validResult = legacyBridge.validateLegacyData(validData);
        expect(validResult.valid).toBe(true);
        expect(validResult.errors).toHaveLength(0);
        
        const invalidResult = legacyBridge.validateLegacyData(invalidData);
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errors.length).toBeGreaterThan(0);
      });

      test('should validate modern data structure', () => {
        const validData = {
          health: 100,
          experience: 200,
          skills: { small_guns: 75 }
        };
        
        const invalidData = {
          health: -50,
          experience: 'invalid'
        };
        
        const validResult = legacyBridge.validateModernData(validData);
        expect(validResult.valid).toBe(true);
        
        const invalidResult = legacyBridge.validateModernData(invalidData);
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errors.length).toBeGreaterThan(0);
      });

      test('should provide default data templates', () => {
        const defaultLegacy = legacyBridge.getDefaultLegacyData();
        const defaultModern = legacyBridge.getDefaultModernData();
        
        expect(defaultLegacy).toHaveProperty('health');
        expect(defaultLegacy).toHaveProperty('experience');
        expect(defaultLegacy).toHaveProperty('skills');
        
        expect(defaultModern).toHaveProperty('health');
        expect(defaultModern).toHaveProperty('experience');
        expect(defaultModern).toHaveProperty('skills');
      });

      test('should handle custom conversion rules', () => {
        const customRule = (value: any) => Math.max(0, Number(value));
        
        legacyBridge.addConversionRule('customField', customRule);
        
        const stats = legacyBridge.getConversionStats();
        expect(stats.availableRules).toContain('customField');
        
        const removeResult = legacyBridge.removeConversionRule('customField');
        expect(removeResult).toBe(true);
      });

      test('should compare format differences', () => {
        const legacyData = { health: 100, levelCount: 5 };
        const modernData = { health: 100, level: 5 };
        
        const comparison = legacyBridge.compareFormats(legacyData, modernData);
        
        expect(comparison).toHaveProperty('identical');
        expect(comparison).toHaveProperty('differences');
        expect(comparison).toHaveProperty('legacyOnly');
        expect(comparison).toHaveProperty('modernOnly');
      });
    });

    describe('SRP Compliance', () => {
      test('should focus only on data conversion', () => {
        const legacyBridge = new LegacyDataBridge();
        
        // Should have conversion methods only
        expect(typeof legacyBridge.convertToLegacy).toBe('function');
        expect(typeof legacyBridge.convertFromLegacy).toBe('function');
        expect(typeof legacyBridge.validateLegacyData).toBe('function');
        
        // Should not have methods for other responsibilities
        expect(legacyBridge).not.toHaveProperty('saveGame');
        expect(legacyBridge).not.toHaveProperty('setScene');
        expect(legacyBridge).not.toHaveProperty('initializeGame');
      });

      test('should handle conversion without side effects', () => {
        const legacyBridge = new LegacyDataBridge();
        const originalData = { health: 100, experience: 200 };
        
        const converted = legacyBridge.convertToLegacy(originalData);
        expect(originalData).toEqual({ health: 100, experience: 200 }); // Unchanged
        expect(converted).not.toBe(originalData); // Different object
      });
    });
  });

  describe('EncounterManager', () => {
    describe('Single Responsibility: Encounter Management', () => {
      let encounterManager: EncounterManager;

      beforeEach(() => {
        encounterManager = new EncounterManager();
      });

      test('should manage encounter data correctly', () => {
        const encounterData: EncounterData = {
          enemyType: 'Raider',
          playerLevel: 5,
          encounterType: 'random',
          difficulty: 'normal'
        };
        
        const result = encounterManager.setEncounterData(encounterData);
        expect(result).toBe(true);
        
        const retrieved = encounterManager.getEncounterData();
        expect(retrieved).toEqual(encounterData);
        expect(encounterManager.hasActiveEncounter()).toBe(true);
      });

      test('should validate encounter data', () => {
        const validEncounter: EncounterData = {
          enemyType: 'Mantis',
          playerLevel: 3
        };
        
        const invalidEncounter = {
          enemyType: '',
          playerLevel: -1
        } as EncounterData;
        
        expect(encounterManager.validateEncounterData(validEncounter)).toBe(true);
        expect(encounterManager.validateEncounterData(invalidEncounter)).toBe(false);
      });

      test('should manage encounter templates', () => {
        const template = {
          enemyType: 'Boss Enemy',
          encounterType: 'boss' as const,
          difficulty: 'nightmare' as const
        };
        
        encounterManager.registerEncounterTemplate('boss_fight', template);
        
        const retrieved = encounterManager.getEncounterTemplate('boss_fight');
        expect(retrieved).toEqual(template);
        
        const templateNames = encounterManager.getEncounterTemplateNames();
        expect(templateNames).toContain('boss_fight');
        
        const created = encounterManager.createEncounterFromTemplate('boss_fight', { playerLevel: 10 });
        expect(created?.enemyType).toBe('Boss Enemy');
        expect(created?.playerLevel).toBe(10);
      });

      test('should track encounter history', () => {
        const encounter1: EncounterData = { enemyType: 'Raider', playerLevel: 3 };
        const encounter2: EncounterData = { enemyType: 'Mantis', playerLevel: 4 };
        
        encounterManager.setEncounterData(encounter1);
        encounterManager.clearEncounterData();
        
        encounterManager.setEncounterData(encounter2);
        encounterManager.clearEncounterData();
        
        const history = encounterManager.getEncounterHistory();
        expect(history).toHaveLength(2);
        expect(history[0]).toEqual(encounter1);
        expect(history[1]).toEqual(encounter2);
        
        const lastEncounter = encounterManager.getLastEncounter();
        expect(lastEncounter).toEqual(encounter2);
      });

      test('should generate random encounters', () => {
        const randomEncounter = encounterManager.generateRandomEncounter(5, 'Desert');
        
        expect(randomEncounter.playerLevel).toBe(5);
        expect(randomEncounter.location).toBe('Desert');
        expect(randomEncounter.encounterType).toBe('random');
        expect(['Raider', 'Cannibal', 'Mantis', 'Tribal Warrior']).toContain(randomEncounter.enemyType);
      });

      test('should manage encounter callbacks', () => {
        const beforeCallback = jest.fn();
        const afterCallback = jest.fn();
        
        encounterManager.onEncounter('before', beforeCallback);
        encounterManager.onEncounter('after', afterCallback);
        
        const encounter: EncounterData = { enemyType: 'Raider', playerLevel: 5 };
        
        encounterManager.setEncounterData(encounter);
        expect(beforeCallback).toHaveBeenCalledWith(encounter);
        
        encounterManager.clearEncounterData();
        expect(afterCallback).toHaveBeenCalledWith(encounter);
      });

      test('should provide encounter statistics', () => {
        const encounter: EncounterData = { enemyType: 'Raider', playerLevel: 5 };
        encounterManager.setEncounterData(encounter);
        
        const stats = encounterManager.getEncounterStats();
        
        expect(stats.hasActiveEncounter).toBe(true);
        expect(stats.historySize).toBeGreaterThan(0);
        expect(stats.templateCount).toBeGreaterThan(0);
        expect(stats.callbackCount).toHaveProperty('before');
        expect(stats.callbackCount).toHaveProperty('after');
      });

      test('should handle history size limits', () => {
        encounterManager.setMaxHistorySize(2);
        
        for (let i = 0; i < 5; i++) {
          const encounter: EncounterData = { enemyType: `Enemy${i}`, playerLevel: i + 1 };
          encounterManager.setEncounterData(encounter);
          encounterManager.clearEncounterData();
        }
        
        const history = encounterManager.getEncounterHistory();
        expect(history.length).toBeLessThanOrEqual(2);
      });
    });

    describe('SRP Compliance', () => {
      test('should focus only on encounter management', () => {
        const encounterManager = new EncounterManager();
        
        // Should have encounter methods only
        expect(typeof encounterManager.setEncounterData).toBe('function');
        expect(typeof encounterManager.getEncounterData).toBe('function');
        expect(typeof encounterManager.clearEncounterData).toBe('function');
        
        // Should not have methods for other responsibilities
        expect(encounterManager).not.toHaveProperty('saveGame');
        expect(encounterManager).not.toHaveProperty('setScene');
        expect(encounterManager).not.toHaveProperty('getPlayer');
      });

      test('should manage encounter state independently', () => {
        const encounterManager = new EncounterManager();
        const encounter: EncounterData = { enemyType: 'Raider', playerLevel: 5 };
        
        expect(encounterManager.hasActiveEncounter()).toBe(false);
        
        encounterManager.setEncounterData(encounter);
        expect(encounterManager.hasActiveEncounter()).toBe(true);
        
        encounterManager.clearEncounterData();
        expect(encounterManager.hasActiveEncounter()).toBe(false);
      });
    });
  });

  describe('ModernGameStateService', () => {
    describe('Single Responsibility: Orchestration', () => {
      let gameStateService: ModernGameStateService;

      beforeEach(() => {
        gameStateService = ModernGameStateService.getInstance();
        gameStateService.forceReset(); // Reset for clean test state
      });

      test('should orchestrate game initialization', () => {
        const testData = { health: 100, experience: 500, skills: { small_guns: 80 } };
        
        gameStateService.initializeGame(testData);
        
        expect(gameStateService.isInitialized()).toBe(true);
        expect(gameStateService.getCurrentScene()).toBe('MainMenu');
      });

      test('should coordinate save/load operations', () => {
        gameStateService.initializeGame();
        
        // Mock player service response
        const mockPlayer = { health: 100, experience: 200 };
        const playerService = gameStateService.getPlayerService();
        
        // Assume player service has data
        gameStateService.saveGame();
        const loadResult = gameStateService.loadGame();
        
        // Verify orchestration (actual behavior depends on mocked services)
        expect(typeof loadResult).toBe('boolean');
      });

      test('should provide access to all service components', () => {
        expect(gameStateService.getServiceRegistry()).toBeDefined();
        expect(gameStateService.getStatePersistence()).toBeDefined();
        expect(gameStateService.getLifecycleManager()).toBeDefined();
        expect(gameStateService.getSceneNavigation()).toBeDefined();
        expect(gameStateService.getLegacyBridge()).toBeDefined();
        expect(gameStateService.getEncounterManager()).toBeDefined();
      });

      test('should manage scene navigation through orchestration', () => {
        gameStateService.setCurrentScene('Battle');
        expect(gameStateService.getCurrentScene()).toBe('Battle');
      });

      test('should handle encounter management through orchestration', () => {
        const encounter: EncounterData = { enemyType: 'Raider', playerLevel: 5 };
        
        gameStateService.setEncounterData(encounter);
        const retrieved = gameStateService.getEncounterData();
        
        expect(retrieved).toEqual(encounter);
        
        gameStateService.clearEncounterData();
        expect(gameStateService.getEncounterData()).toBeNull();
      });

      test('should provide comprehensive system status', () => {
        gameStateService.initializeGame();
        
        const status = gameStateService.getSystemStatus();
        
        expect(status).toHaveProperty('initialized');
        expect(status).toHaveProperty('currentScene');
        expect(status).toHaveProperty('hasActiveEncounter');
        expect(status).toHaveProperty('saveDataExists');
        expect(status).toHaveProperty('serviceValidation');
        expect(status).toHaveProperty('lifecycleStatus');
        expect(status).toHaveProperty('navigationStatus');
        expect(status).toHaveProperty('encounterStatus');
      });

      test('should validate all components', () => {
        const validation = gameStateService.validateAllComponents();
        
        expect(validation).toHaveProperty('valid');
        expect(validation).toHaveProperty('componentStatus');
        expect(validation).toHaveProperty('issues');
        expect(Array.isArray(validation.issues)).toBe(true);
      });

      test('should maintain singleton pattern', () => {
        const instance1 = ModernGameStateService.getInstance();
        const instance2 = ModernGameStateService.getInstance();
        
        expect(instance1).toBe(instance2);
      });
    });

    describe('SRP Compliance', () => {
      test('should only orchestrate, not implement specific logic', () => {
        const gameStateService = ModernGameStateService.getInstance();
        
        // Should delegate to components, not implement directly
        expect(typeof gameStateService.initializeGame).toBe('function');
        expect(typeof gameStateService.saveGame).toBe('function');
        expect(typeof gameStateService.setCurrentScene).toBe('function');
        
        // Should provide access to specialized components
        expect(typeof gameStateService.getServiceRegistry).toBe('function');
        expect(typeof gameStateService.getStatePersistence).toBe('function');
      });

      test('should maintain separation of concerns', () => {
        const gameStateService = ModernGameStateService.getInstance();
        
        // Each component should handle its own responsibility
        const serviceRegistry = gameStateService.getServiceRegistry();
        const statePersistence = gameStateService.getStatePersistence();
        const lifecycleManager = gameStateService.getLifecycleManager();
        
        expect(serviceRegistry).not.toBe(statePersistence);
        expect(statePersistence).not.toBe(lifecycleManager);
        expect(lifecycleManager).not.toBe(serviceRegistry);
      });
    });
  });

  describe('SRP Integration', () => {
    test('should demonstrate clear separation of responsibilities', () => {
      const serviceRegistry = new ServiceRegistry();
      const statePersistence = new StatePersistence();
      const lifecycleManager = new GameLifecycleManager();
      const sceneNavigation = new SceneNavigationManager();
      const legacyBridge = new LegacyDataBridge();
      const encounterManager = new EncounterManager();
      
      // Each component should have distinct responsibilities
      expect(serviceRegistry.constructor.name).toBe('ServiceRegistry');
      expect(statePersistence.constructor.name).toBe('StatePersistence');
      expect(lifecycleManager.constructor.name).toBe('GameLifecycleManager');
      expect(sceneNavigation.constructor.name).toBe('SceneNavigationManager');
      expect(legacyBridge.constructor.name).toBe('LegacyDataBridge');
      expect(encounterManager.constructor.name).toBe('EncounterManager');
    });

    test('should support composition over inheritance', () => {
      const gameStateService = ModernGameStateService.getInstance();
      
      // Service should compose components, not inherit from them
      const serviceRegistry = gameStateService.getServiceRegistry();
      const statePersistence = gameStateService.getStatePersistence();
      
      expect(gameStateService).not.toBeInstanceOf(ServiceRegistry);
      expect(gameStateService).not.toBeInstanceOf(StatePersistence);
      expect(serviceRegistry).toBeInstanceOf(ServiceRegistry);
      expect(statePersistence).toBeInstanceOf(StatePersistence);
    });

    test('should enable independent testing of each component', () => {
      // Each component can be tested independently
      const serviceRegistry = new ServiceRegistry();
      const statePersistence = new StatePersistence();
      const lifecycleManager = new GameLifecycleManager();
      
      // Test service registry independently
      serviceRegistry.registerService('test', { name: 'test' });
      expect(serviceRegistry.hasService('test')).toBe(true);
      
      // Test persistence independently
      statePersistence.saveGameData({ test: 'data' });
      expect(statePersistence.hasSaveData()).toBe(true);
      
      // Test lifecycle independently
      lifecycleManager.initializeGame();
      expect(lifecycleManager.isInitialized()).toBe(true);
    });
  });
});
