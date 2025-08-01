import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { ServiceRegistry } from './ServiceRegistry.js';
import { StatePersistence } from './StatePersistence.js';
import { GameLifecycleManager } from './GameLifecycleManager.js';
import { SceneNavigationManager } from './SceneNavigationManager.js';
import { LegacyDataBridge } from './LegacyDataBridge.js';
import { EncounterManager, EncounterData } from './EncounterManager.js';

/**
 * ModernGameStateService - Single Responsibility: Game State Orchestration
 * 
 * Orchestrates all game state management components using composition.
 * Provides a unified interface while delegating to specialized SRP-compliant components.
 * 
 * SRP Compliance:
 * ✅ Only handles orchestration and coordination
 * ✅ Does not implement specific business logic
 * ✅ Focused purely on composing and coordinating specialized components
 */
export class ModernGameStateService {
  private static instance: ModernGameStateService;
  
  private serviceRegistry: ServiceRegistry;
  private statePersistence: StatePersistence;
  private lifecycleManager: GameLifecycleManager;
  private sceneNavigation: SceneNavigationManager;
  private legacyBridge: LegacyDataBridge;
  private encounterManager: EncounterManager;

  private constructor() {
    // Initialize all specialized components
    this.serviceRegistry = new ServiceRegistry();
    this.statePersistence = new StatePersistence();
    this.lifecycleManager = new GameLifecycleManager();
    this.sceneNavigation = new SceneNavigationManager();
    this.legacyBridge = new LegacyDataBridge();
    this.encounterManager = new EncounterManager();

    this.setupComponentIntegration();
  }

  public static getInstance(): ModernGameStateService {
    if (!ModernGameStateService.instance) {
      ModernGameStateService.instance = new ModernGameStateService();
    }
    return ModernGameStateService.instance;
  }

  // ======== GAME LIFECYCLE OPERATIONS ========

  /**
   * Initialize game from legacy GameData
   */
  public initializeGame(legacyGameData?: any): void {
    try {
      // Load from storage if no data provided
      const gameData = legacyGameData || this.statePersistence.loadGameData() || this.legacyBridge.getDefaultLegacyData();
      
      // Validate and convert legacy data
      const validationResult = this.legacyBridge.validateLegacyData(gameData);
      if (!validationResult.valid) {
        console.warn('Invalid legacy data, using defaults:', validationResult.errors);
      }

      // Initialize lifecycle
      this.lifecycleManager.initializeGame(gameData);
      
      // Initialize player through service registry
      const playerService = this.serviceRegistry.getPlayerService();
      playerService.initializeFromLegacy(gameData);
      
      console.log('Game initialized with TypeScript services');
    } catch (error) {
      console.error('Game initialization failed:', error);
      throw error;
    }
  }

  /**
   * Reset game to default state
   */
  public resetGame(): void {
    // Clear all persistent data
    this.statePersistence.deleteSaveData();
    
    // Reset lifecycle
    this.lifecycleManager.resetGame();
    
    // Reinitialize with defaults
    this.initializeGame(this.legacyBridge.getDefaultLegacyData());
    
    console.log('Game reset to default state');
  }

  /**
   * Force reset without reinitializing (for testing)
   */
  public forceReset(): void {
    this.statePersistence.clearAllData();
    this.lifecycleManager.forceReset();
    this.serviceRegistry.reinitialize();
    this.sceneNavigation.resetNavigation();
    this.encounterManager.clearEncounterData();
  }

  /**
   * Check if game is initialized
   */
  public isInitialized(): boolean {
    return this.lifecycleManager.isInitialized();
  }

  // ======== SAVE/LOAD OPERATIONS ========

  /**
   * Save game state
   */
  public saveGame(): void {
    const player = this.getPlayer();
    if (!player) {
      console.error('Cannot save game: no player data');
      return;
    }

    // Convert to legacy format for compatibility
    const playerService = this.serviceRegistry.getPlayerService();
    const legacyData = playerService.toLegacyFormat();
    
    if (legacyData) {
      const success = this.statePersistence.saveGameData(legacyData);
      if (success) {
        console.log('Game saved successfully');
      }
    }
  }

  /**
   * Load game state
   */
  public loadGame(): boolean {
    try {
      const savedData = this.statePersistence.loadGameData();
      if (savedData) {
        const playerService = this.serviceRegistry.getPlayerService();
        playerService.initializeFromLegacy(savedData);
        console.log('Game loaded successfully');
        return true;
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
    return false;
  }

  // ======== SERVICE ACCESS ========

  /**
   * Get current player
   */
  public getPlayer(): IPlayerCharacter | null {
    const playerService = this.serviceRegistry.getPlayerService();
    return playerService.getPlayer();
  }

  /**
   * Get player service
   */
  public getPlayerService() {
    return this.serviceRegistry.getPlayerService();
  }

  /**
   * Get weapon service
   */
  public getWeaponService() {
    return this.serviceRegistry.getWeaponService();
  }

  /**
   * Get enemy service
   */
  public getEnemyService() {
    return this.serviceRegistry.getEnemyService();
  }

  /**
   * Get combat service
   */
  public getCombatService() {
    return this.serviceRegistry.getCombatService();
  }

  // ======== SCENE NAVIGATION ========

  /**
   * Set current scene
   */
  public setCurrentScene(sceneName: string): void {
    this.sceneNavigation.setCurrentScene(sceneName);
  }

  /**
   * Get current scene
   */
  public getCurrentScene(): string {
    return this.sceneNavigation.getCurrentScene();
  }

  // ======== LEGACY COMPATIBILITY ========

  /**
   * Bridge method: Get legacy format for compatibility
   */
  public getLegacyGameData(): any {
    const playerService = this.serviceRegistry.getPlayerService();
    return playerService.toLegacyFormat();
  }

  /**
   * Bridge method: Update from legacy format
   */
  public updateFromLegacy(legacyData: any): void {
    const playerService = this.serviceRegistry.getPlayerService();
    playerService.initializeFromLegacy(legacyData);
  }

  // ======== ENCOUNTER MANAGEMENT ========

  /**
   * Set encounter data for battle transitions
   */
  public setEncounterData(data: EncounterData): void {
    this.encounterManager.setEncounterData(data);
  }

  /**
   * Get encounter data for battle transitions
   */
  public getEncounterData(): EncounterData | null {
    return this.encounterManager.getEncounterData();
  }

  /**
   * Clear encounter data after battle
   */
  public clearEncounterData(): void {
    this.encounterManager.clearEncounterData();
  }

  // ======== COMPONENT ACCESS FOR ADVANCED USAGE ========

  /**
   * Get service registry component
   */
  public getServiceRegistry(): ServiceRegistry {
    return this.serviceRegistry;
  }

  /**
   * Get state persistence component
   */
  public getStatePersistence(): StatePersistence {
    return this.statePersistence;
  }

  /**
   * Get lifecycle manager component
   */
  public getLifecycleManager(): GameLifecycleManager {
    return this.lifecycleManager;
  }

  /**
   * Get scene navigation component
   */
  public getSceneNavigation(): SceneNavigationManager {
    return this.sceneNavigation;
  }

  /**
   * Get legacy data bridge component
   */
  public getLegacyBridge(): LegacyDataBridge {
    return this.legacyBridge;
  }

  /**
   * Get encounter manager component
   */
  public getEncounterManager(): EncounterManager {
    return this.encounterManager;
  }

  // ======== SYSTEM DIAGNOSTICS ========

  /**
   * Get comprehensive system status
   */
  public getSystemStatus(): {
    initialized: boolean;
    currentScene: string;
    hasActiveEncounter: boolean;
    saveDataExists: boolean;
    serviceValidation: any;
    lifecycleStatus: any;
    navigationStatus: any;
    encounterStatus: any;
  } {
    return {
      initialized: this.isInitialized(),
      currentScene: this.getCurrentScene(),
      hasActiveEncounter: this.encounterManager.hasActiveEncounter(),
      saveDataExists: this.statePersistence.hasSaveData(),
      serviceValidation: this.serviceRegistry.validateServices(),
      lifecycleStatus: this.lifecycleManager.getLifecycleStats(),
      navigationStatus: this.sceneNavigation.getNavigationStats(),
      encounterStatus: this.encounterManager.getEncounterStats()
    };
  }

  /**
   * Validate all components
   */
  public validateAllComponents(): {
    valid: boolean;
    componentStatus: {
      serviceRegistry: boolean;
      lifecycle: boolean;
      navigation: boolean;
      persistence: boolean;
    };
    issues: string[];
  } {
    const issues: string[] = [];
    const componentStatus = {
      serviceRegistry: true,
      lifecycle: true,
      navigation: true,
      persistence: true
    };

    // Validate service registry
    const serviceValidation = this.serviceRegistry.validateServices();
    if (!serviceValidation.valid) {
      componentStatus.serviceRegistry = false;
      issues.push(`Service Registry: ${serviceValidation.missing.join(', ')}`);
    }

    // Validate lifecycle state
    const lifecycleValidation = this.lifecycleManager.validateLifecycleState();
    if (!lifecycleValidation.valid) {
      componentStatus.lifecycle = false;
      issues.push(`Lifecycle: ${lifecycleValidation.issues.join(', ')}`);
    }

    // Validate navigation state
    const navigationValidation = this.sceneNavigation.validateNavigationState();
    if (!navigationValidation.valid) {
      componentStatus.navigation = false;
      issues.push(`Navigation: ${navigationValidation.issues.join(', ')}`);
    }

    // Check persistence functionality
    try {
      this.statePersistence.getSaveDataInfo();
    } catch (error) {
      componentStatus.persistence = false;
      issues.push(`Persistence: ${error}`);
    }

    return {
      valid: issues.length === 0,
      componentStatus,
      issues
    };
  }

  // ======== PRIVATE SETUP METHODS ========

  /**
   * Setup integration between components
   */
  private setupComponentIntegration(): void {
    // Set up lifecycle callbacks
    this.lifecycleManager.onInitialization(() => {
      console.log('Game lifecycle: Initialization callback executed');
    });

    this.lifecycleManager.onReset(() => {
      this.sceneNavigation.resetNavigation();
      this.encounterManager.clearEncounterData();
      console.log('Game lifecycle: Reset callback executed');
    });

    // Set up scene transition callbacks
    this.sceneNavigation.onSceneTransition('before', (fromScene, toScene) => {
      console.log(`Scene transition: ${fromScene} -> ${toScene}`);
    });

    // Set up encounter callbacks
    this.encounterManager.onEncounter('before', (encounter) => {
      console.log(`Encounter starting: ${encounter.enemyType} (Level ${encounter.playerLevel})`);
    });

    this.encounterManager.onEncounter('after', (encounter) => {
      console.log(`Encounter completed: ${encounter.enemyType}`);
    });
  }
}
