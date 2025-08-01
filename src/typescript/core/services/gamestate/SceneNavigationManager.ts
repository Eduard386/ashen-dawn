/**
 * SceneNavigationManager - Single Responsibility: Scene Navigation and State
 * 
 * Manages scene transitions, current scene tracking, and navigation history.
 * Provides scene-related state management and transition coordination.
 * 
 * SRP Compliance:
 * ✅ Only handles scene navigation and tracking
 * ✅ Does not handle game logic or other state management
 * ✅ Focused purely on scene transitions and navigation state
 */
export class SceneNavigationManager {
  private currentScene: string = 'MainMenu';
  private previousScene: string | null = null;
  private sceneHistory: string[] = [];
  private maxHistorySize: number = 10;
  private transitionInProgress: boolean = false;
  private transitionCallbacks: Map<string, Array<(fromScene: string, toScene: string) => void>> = new Map();
  private sceneData: Map<string, any> = new Map();

  constructor(initialScene?: string) {
    if (initialScene) {
      this.currentScene = initialScene;
    }
    this.addToHistory(this.currentScene);
  }

  /**
   * Set current scene
   */
  public setCurrentScene(sceneName: string): boolean {
    if (this.transitionInProgress) {
      console.warn('Scene transition already in progress');
      return false;
    }

    if (sceneName === this.currentScene) {
      console.log(`Already in scene: ${sceneName}`);
      return true;
    }

    try {
      this.transitionInProgress = true;
      const fromScene = this.currentScene;

      // Execute before-transition callbacks
      this.executeTransitionCallbacks('before', fromScene, sceneName);

      // Update scene state
      this.previousScene = this.currentScene;
      this.currentScene = sceneName;
      this.addToHistory(sceneName);

      // Execute after-transition callbacks
      this.executeTransitionCallbacks('after', fromScene, sceneName);

      this.transitionInProgress = false;
      console.log(`Scene changed from '${fromScene}' to '${sceneName}'`);
      return true;
    } catch (error) {
      console.error('Scene transition failed:', error);
      this.transitionInProgress = false;
      return false;
    }
  }

  /**
   * Get current scene
   */
  public getCurrentScene(): string {
    return this.currentScene;
  }

  /**
   * Get previous scene
   */
  public getPreviousScene(): string | null {
    return this.previousScene;
  }

  /**
   * Navigate back to previous scene
   */
  public goBack(): boolean {
    if (!this.previousScene) {
      console.warn('No previous scene to navigate back to');
      return false;
    }

    return this.setCurrentScene(this.previousScene);
  }

  /**
   * Navigate to a specific scene in history
   */
  public goToHistoryIndex(index: number): boolean {
    if (index < 0 || index >= this.sceneHistory.length) {
      console.error('Invalid history index');
      return false;
    }

    const targetScene = this.sceneHistory[index];
    return this.setCurrentScene(targetScene);
  }

  /**
   * Get scene navigation history
   */
  public getSceneHistory(): string[] {
    return [...this.sceneHistory];
  }

  /**
   * Clear scene history
   */
  public clearHistory(): void {
    this.sceneHistory = [this.currentScene];
  }

  /**
   * Set maximum history size
   */
  public setMaxHistorySize(size: number): void {
    if (size < 1) {
      console.error('History size must be at least 1');
      return;
    }

    this.maxHistorySize = size;
    this.trimHistory();
  }

  /**
   * Check if transition is in progress
   */
  public isTransitionInProgress(): boolean {
    return this.transitionInProgress;
  }

  /**
   * Register transition callback
   */
  public onSceneTransition(event: 'before' | 'after', callback: (fromScene: string, toScene: string) => void): void {
    if (!this.transitionCallbacks.has(event)) {
      this.transitionCallbacks.set(event, []);
    }
    this.transitionCallbacks.get(event)!.push(callback);
  }

  /**
   * Remove transition callback
   */
  public removeTransitionCallback(event: 'before' | 'after', callback: (fromScene: string, toScene: string) => void): boolean {
    const callbacks = this.transitionCallbacks.get(event);
    if (!callbacks) {
      return false;
    }

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all transition callbacks
   */
  public clearTransitionCallbacks(): void {
    this.transitionCallbacks.clear();
  }

  /**
   * Set data for a specific scene
   */
  public setSceneData(sceneName: string, data: any): void {
    this.sceneData.set(sceneName, data);
  }

  /**
   * Get data for a specific scene
   */
  public getSceneData(sceneName: string): any {
    return this.sceneData.get(sceneName);
  }

  /**
   * Get data for current scene
   */
  public getCurrentSceneData(): any {
    return this.getSceneData(this.currentScene);
  }

  /**
   * Clear data for a specific scene
   */
  public clearSceneData(sceneName: string): boolean {
    return this.sceneData.delete(sceneName);
  }

  /**
   * Clear all scene data
   */
  public clearAllSceneData(): void {
    this.sceneData.clear();
  }

  /**
   * Check if scene has data
   */
  public hasSceneData(sceneName: string): boolean {
    return this.sceneData.has(sceneName);
  }

  /**
   * Get navigation statistics
   */
  public getNavigationStats(): {
    currentScene: string;
    previousScene: string | null;
    historySize: number;
    maxHistorySize: number;
    transitionInProgress: boolean;
    sceneDataCount: number;
    callbackCount: {
      before: number;
      after: number;
    };
  } {
    return {
      currentScene: this.currentScene,
      previousScene: this.previousScene,
      historySize: this.sceneHistory.length,
      maxHistorySize: this.maxHistorySize,
      transitionInProgress: this.transitionInProgress,
      sceneDataCount: this.sceneData.size,
      callbackCount: {
        before: this.transitionCallbacks.get('before')?.length || 0,
        after: this.transitionCallbacks.get('after')?.length || 0
      }
    };
  }

  /**
   * Validate navigation state
   */
  public validateNavigationState(): {
    valid: boolean;
    issues: string[];
    currentScene: string;
  } {
    const issues: string[] = [];

    // Check if current scene is in history
    if (!this.sceneHistory.includes(this.currentScene)) {
      issues.push('Current scene not found in history');
    }

    // Check if previous scene exists in history (if set)
    if (this.previousScene && !this.sceneHistory.includes(this.previousScene)) {
      issues.push('Previous scene not found in history');
    }

    // Check history size
    if (this.sceneHistory.length > this.maxHistorySize) {
      issues.push('History size exceeds maximum');
    }

    // Check for empty current scene
    if (!this.currentScene || this.currentScene.trim() === '') {
      issues.push('Current scene is empty or invalid');
    }

    return {
      valid: issues.length === 0,
      issues,
      currentScene: this.currentScene
    };
  }

  /**
   * Get available scenes (scenes with data)
   */
  public getAvailableScenes(): string[] {
    return Array.from(this.sceneData.keys());
  }

  /**
   * Check if can navigate back
   */
  public canGoBack(): boolean {
    return this.previousScene !== null && !this.transitionInProgress;
  }

  /**
   * Reset navigation to initial state
   */
  public resetNavigation(initialScene: string = 'MainMenu'): void {
    this.currentScene = initialScene;
    this.previousScene = null;
    this.sceneHistory = [initialScene];
    this.transitionInProgress = false;
    this.clearAllSceneData();
  }

  // Private helper methods

  /**
   * Add scene to history
   */
  private addToHistory(sceneName: string): void {
    // Don't add duplicates if it's the same as the last entry
    if (this.sceneHistory.length > 0 && this.sceneHistory[this.sceneHistory.length - 1] === sceneName) {
      return;
    }

    this.sceneHistory.push(sceneName);
    this.trimHistory();
  }

  /**
   * Trim history to maximum size
   */
  private trimHistory(): void {
    while (this.sceneHistory.length > this.maxHistorySize) {
      this.sceneHistory.shift();
    }
  }

  /**
   * Execute transition callbacks
   */
  private executeTransitionCallbacks(event: 'before' | 'after', fromScene: string, toScene: string): void {
    const callbacks = this.transitionCallbacks.get(event);
    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback, index) => {
      try {
        callback(fromScene, toScene);
      } catch (error) {
        console.error(`${event} transition callback ${index} failed:`, error);
      }
    });
  }
}
