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
export declare class LoadingScene extends Phaser.Scene {
    private assetLoader;
    private progressBar;
    private progressBarBackground;
    private progressText;
    private titleText;
    private tipText;
    private currentTipIndex;
    private loadingDots;
    private dotsTimer?;
    private readonly loadingTips;
    constructor();
    preload(): void;
    create(): void;
    private createLoadingScreen;
    private createAnimations;
    private updateLoadingDots;
    private updateTip;
    private updateProgress;
    private startLoading;
    private onLoadingComplete;
    private transitionToMainMenu;
    private showError;
}
