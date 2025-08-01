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
export declare class SceneNavigationManager {
    private currentScene;
    private previousScene;
    private sceneHistory;
    private maxHistorySize;
    private transitionInProgress;
    private transitionCallbacks;
    private sceneData;
    constructor(initialScene?: string);
    /**
     * Set current scene
     */
    setCurrentScene(sceneName: string): boolean;
    /**
     * Get current scene
     */
    getCurrentScene(): string;
    /**
     * Get previous scene
     */
    getPreviousScene(): string | null;
    /**
     * Navigate back to previous scene
     */
    goBack(): boolean;
    /**
     * Navigate to a specific scene in history
     */
    goToHistoryIndex(index: number): boolean;
    /**
     * Get scene navigation history
     */
    getSceneHistory(): string[];
    /**
     * Clear scene history
     */
    clearHistory(): void;
    /**
     * Set maximum history size
     */
    setMaxHistorySize(size: number): void;
    /**
     * Check if transition is in progress
     */
    isTransitionInProgress(): boolean;
    /**
     * Register transition callback
     */
    onSceneTransition(event: 'before' | 'after', callback: (fromScene: string, toScene: string) => void): void;
    /**
     * Remove transition callback
     */
    removeTransitionCallback(event: 'before' | 'after', callback: (fromScene: string, toScene: string) => void): boolean;
    /**
     * Clear all transition callbacks
     */
    clearTransitionCallbacks(): void;
    /**
     * Set data for a specific scene
     */
    setSceneData(sceneName: string, data: any): void;
    /**
     * Get data for a specific scene
     */
    getSceneData(sceneName: string): any;
    /**
     * Get data for current scene
     */
    getCurrentSceneData(): any;
    /**
     * Clear data for a specific scene
     */
    clearSceneData(sceneName: string): boolean;
    /**
     * Clear all scene data
     */
    clearAllSceneData(): void;
    /**
     * Check if scene has data
     */
    hasSceneData(sceneName: string): boolean;
    /**
     * Get navigation statistics
     */
    getNavigationStats(): {
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
    };
    /**
     * Validate navigation state
     */
    validateNavigationState(): {
        valid: boolean;
        issues: string[];
        currentScene: string;
    };
    /**
     * Get available scenes (scenes with data)
     */
    getAvailableScenes(): string[];
    /**
     * Check if can navigate back
     */
    canGoBack(): boolean;
    /**
     * Reset navigation to initial state
     */
    resetNavigation(initialScene?: string): void;
    /**
     * Add scene to history
     */
    private addToHistory;
    /**
     * Trim history to maximum size
     */
    private trimHistory;
    /**
     * Execute transition callbacks
     */
    private executeTransitionCallbacks;
}
