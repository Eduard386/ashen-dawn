// Loading Scene - Beautiful loading screen with progress
import { AssetLoaderService } from '../core/services/AssetLoaderService.js';
/**
 * Modern Loading Scene with Progress Indication
 *
 * Features:
 * - Animated progress bar
 * - Loading tips and lore
 * - Smooth transitions
 * - Asset loading progress
 * - Background animations
 */
export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
        this.currentTipIndex = 0;
        this.loadingDots = '';
        // Loading tips for immersion
        this.loadingTips = [
            "The year is 2161. Nuclear war has devastated the world...",
            "Explore the wasteland and discover its secrets",
            "Combat is turn-based. Plan your moves carefully",
            "Collect armor and weapons to improve your survival chances",
            "Medical items can save your life in critical moments",
            "Different enemies require different tactics",
            "Your equipment determines your combat effectiveness",
            "The wasteland is full of dangers and opportunities"
        ];
    }
    preload() {
        // Create minimal loading graphics - no external assets needed
        this.createLoadingScreen();
    }
    create() {
        console.log('🎬 Loading Scene started');
        // Initialize asset loader
        this.assetLoader = AssetLoaderService.getInstance();
        this.assetLoader.init(this);
        // Clear any previous callbacks
        this.assetLoader.clearCallbacks();
        // Setup progress tracking
        this.assetLoader.onProgress((progress) => {
            this.updateProgress(progress);
        });
        // Setup completion callback
        this.assetLoader.onComplete(() => {
            this.onLoadingComplete();
        });
        // Create loading animations
        this.createAnimations();
        // Start loading critical assets
        this.startLoading();
    }
    createLoadingScreen() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        // Background gradient
        const background = this.add.graphics();
        background.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x1a1a1a, 0x1a1a1a, 1);
        background.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        // Game title
        this.titleText = this.add.text(centerX, centerY - 150, 'ASHEN DAWN', {
            fontSize: '64px',
            color: '#ff6b35',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        // Subtitle
        this.add.text(centerX, centerY - 100, 'Loading Post-Nuclear Adventure...', {
            fontSize: '20px',
            color: '#cccccc',
            fontFamily: 'monospace',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        // Progress bar background
        this.progressBarBackground = this.add.graphics();
        this.progressBarBackground.fillStyle(0x333333);
        this.progressBarBackground.fillRoundedRect(centerX - 200, centerY, 400, 20, 10);
        // Progress bar
        this.progressBar = this.add.graphics();
        // Progress text
        this.progressText = this.add.text(centerX, centerY + 40, '0%', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        // Loading tip
        this.tipText = this.add.text(centerX, centerY + 100, '', {
            fontSize: '16px',
            color: '#aaaaaa',
            fontFamily: 'monospace',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);
        // Set initial tip
        this.updateTip();
    }
    createAnimations() {
        // Title glow animation
        this.tweens.add({
            targets: this.titleText,
            alpha: { from: 0.8, to: 1.0 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        // Animated loading dots
        this.dotsTimer = this.time.addEvent({
            delay: 500,
            callback: this.updateLoadingDots,
            callbackScope: this,
            loop: true
        });
        // Cycle through tips
        this.time.addEvent({
            delay: 4000,
            callback: this.updateTip,
            callbackScope: this,
            loop: true
        });
    }
    updateLoadingDots() {
        this.loadingDots += '.';
        if (this.loadingDots.length > 3) {
            this.loadingDots = '';
        }
    }
    updateTip() {
        this.tipText.setText(this.loadingTips[this.currentTipIndex]);
        this.currentTipIndex = (this.currentTipIndex + 1) % this.loadingTips.length;
        // Fade in animation for tip
        this.tipText.setAlpha(0);
        this.tweens.add({
            targets: this.tipText,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }
    updateProgress(progress) {
        // Update progress bar
        this.progressBar.clear();
        this.progressBar.fillStyle(0xff6b35);
        const barWidth = (progress.percentage / 100) * 400;
        this.progressBar.fillRoundedRect(this.cameras.main.width / 2 - 200, this.cameras.main.height / 2, barWidth, 20, 10);
        // Update progress text
        this.progressText.setText(`${progress.percentage}%${this.loadingDots}`);
        // Update current file info
        if (progress.currentFile) {
            this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 70, `Loading: ${progress.currentFile}`, {
                fontSize: '12px',
                color: '#888888',
                fontFamily: 'monospace'
            }).setOrigin(0.5);
        }
    }
    async startLoading() {
        try {
            console.log('🔄 Starting critical asset loading...');
            // Load critical assets first
            await this.assetLoader.loadCriticalAssets();
            // Small delay for smooth transition
            await new Promise(resolve => setTimeout(resolve, 500));
            // Start background loading of remaining assets
            this.assetLoader.startBackgroundLoading();
            // Transition to main menu after critical assets are loaded
            this.transitionToMainMenu();
        }
        catch (error) {
            console.error('❌ Loading failed:', error);
            this.showError('Loading failed. Please refresh the page.');
        }
    }
    onLoadingComplete() {
        console.log('✅ All assets loaded successfully');
        // All assets loaded - game is fully ready
    }
    transitionToMainMenu() {
        console.log('🎮 Transitioning to Main Menu');
        // Stop animations
        if (this.dotsTimer) {
            this.dotsTimer.remove();
        }
        // Fade out animation
        this.tweens.add({
            targets: [this.titleText, this.progressBar, this.progressBarBackground, this.progressText, this.tipText],
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Clear callbacks before scene transition
                this.assetLoader.clearCallbacks();
                // Start main menu
                this.scene.start('MainMenu');
            }
        });
    }
    showError(message) {
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, message, {
            fontSize: '18px',
            color: '#ff4444',
            fontFamily: 'monospace',
            align: 'center'
        }).setOrigin(0.5);
    }
}
//# sourceMappingURL=LoadingScene.js.map