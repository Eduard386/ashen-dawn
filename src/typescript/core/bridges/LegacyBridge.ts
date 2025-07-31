import { GameDataService } from '../services/GameDataService.js';

/**
 * Simplified Legacy Bridge - Minimal compatibility layer
 * Most functionality moved directly to TypeScript services
 */
export class LegacyBridge {
  private static instance: LegacyBridge;
  private gameDataService: GameDataService;

  private constructor() {
    this.gameDataService = GameDataService.getInstance();
  }

  public static getInstance(): LegacyBridge {
    if (!LegacyBridge.instance) {
      LegacyBridge.instance = new LegacyBridge();
    }
    return LegacyBridge.instance;
  }

  /**
   * Essential initialization only
   */
  public initialize(legacyGameData?: any): void {
    if (legacyGameData) {
      this.gameDataService.set(legacyGameData);
    } else {
      this.gameDataService.init();
    }
    console.log('🔗 Simplified Bridge - TypeScript services active');
  }

  /**
   * Core data access
   */
  public getGameData(): any {
    return this.gameDataService.get();
  }

  public setGameData(legacyData: any): void {
    this.gameDataService.set(legacyData);
  }

  /**
   * Basic service access for testing
   */
  public getServices() {
    return {
      gameData: this.gameDataService
    };
  }

  /**
   * Status check
   */
  public isInitialized(): boolean {
    return this.gameDataService.isInitialized();
  }

  /**
   * Reset for testing
   */
  public resetGame(): void {
    this.gameDataService.reset();
  }
}

// Global access for compatibility
if (typeof window !== 'undefined') {
  (window as any).LegacyBridge = LegacyBridge;
}
