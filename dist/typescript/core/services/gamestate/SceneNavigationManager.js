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
    constructor(initialScene) {
        this.currentScene = 'MainMenu';
        this.previousScene = null;
        this.sceneHistory = [];
        this.maxHistorySize = 10;
        this.transitionInProgress = false;
        this.transitionCallbacks = new Map();
        this.sceneData = new Map();
        if (initialScene) {
            this.currentScene = initialScene;
        }
        this.addToHistory(this.currentScene);
    }
    /**
     * Set current scene
     */
    setCurrentScene(sceneName) {
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
        }
        catch (error) {
            console.error('Scene transition failed:', error);
            this.transitionInProgress = false;
            return false;
        }
    }
    /**
     * Get current scene
     */
    getCurrentScene() {
        return this.currentScene;
    }
    /**
     * Get previous scene
     */
    getPreviousScene() {
        return this.previousScene;
    }
    /**
     * Navigate back to previous scene
     */
    goBack() {
        if (!this.previousScene) {
            console.warn('No previous scene to navigate back to');
            return false;
        }
        return this.setCurrentScene(this.previousScene);
    }
    /**
     * Navigate to a specific scene in history
     */
    goToHistoryIndex(index) {
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
    getSceneHistory() {
        return [...this.sceneHistory];
    }
    /**
     * Clear scene history
     */
    clearHistory() {
        this.sceneHistory = [this.currentScene];
    }
    /**
     * Set maximum history size
     */
    setMaxHistorySize(size) {
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
    isTransitionInProgress() {
        return this.transitionInProgress;
    }
    /**
     * Register transition callback
     */
    onSceneTransition(event, callback) {
        if (!this.transitionCallbacks.has(event)) {
            this.transitionCallbacks.set(event, []);
        }
        this.transitionCallbacks.get(event).push(callback);
    }
    /**
     * Remove transition callback
     */
    removeTransitionCallback(event, callback) {
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
    clearTransitionCallbacks() {
        this.transitionCallbacks.clear();
    }
    /**
     * Set data for a specific scene
     */
    setSceneData(sceneName, data) {
        this.sceneData.set(sceneName, data);
    }
    /**
     * Get data for a specific scene
     */
    getSceneData(sceneName) {
        return this.sceneData.get(sceneName);
    }
    /**
     * Get data for current scene
     */
    getCurrentSceneData() {
        return this.getSceneData(this.currentScene);
    }
    /**
     * Clear data for a specific scene
     */
    clearSceneData(sceneName) {
        return this.sceneData.delete(sceneName);
    }
    /**
     * Clear all scene data
     */
    clearAllSceneData() {
        this.sceneData.clear();
    }
    /**
     * Check if scene has data
     */
    hasSceneData(sceneName) {
        return this.sceneData.has(sceneName);
    }
    /**
     * Get navigation statistics
     */
    getNavigationStats() {
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
    validateNavigationState() {
        const issues = [];
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
    getAvailableScenes() {
        return Array.from(this.sceneData.keys());
    }
    /**
     * Check if can navigate back
     */
    canGoBack() {
        return this.previousScene !== null && !this.transitionInProgress;
    }
    /**
     * Reset navigation to initial state
     */
    resetNavigation(initialScene = 'MainMenu') {
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
    addToHistory(sceneName) {
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
    trimHistory() {
        while (this.sceneHistory.length > this.maxHistorySize) {
            this.sceneHistory.shift();
        }
    }
    /**
     * Execute transition callbacks
     */
    executeTransitionCallbacks(event, fromScene, toScene) {
        const callbacks = this.transitionCallbacks.get(event);
        if (!callbacks) {
            return;
        }
        callbacks.forEach((callback, index) => {
            try {
                callback(fromScene, toScene);
            }
            catch (error) {
                console.error(`${event} transition callback ${index} failed:`, error);
            }
        });
    }
}
//# sourceMappingURL=SceneNavigationManager.js.map