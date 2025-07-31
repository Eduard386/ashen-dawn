/**
 * Complete Legacy BattleScene - Exact functionality from legacy JS
 * All assets, sounds, weapon switching, combat mechanics restored
 * Now using pure TypeScript GameDataService and AssetLoaderService
 */
export declare class BattleScene extends Phaser.Scene {
    private gameDataService;
    private assetLoader;
    private gameData;
    private soundtrackNames;
    private weapons;
    private armors;
    private enemies_all;
    private background;
    private playerArmor;
    private playerRedArmor;
    private healthMask;
    private hand_sprite;
    private crosshair_red;
    private crosshair_green;
    private escape_button;
    private healthText;
    private levelText;
    private weaponStatsText;
    private armorStatsText;
    private first_aid_kit;
    private first_aid_kit_grey;
    private jet;
    private jet_grey;
    private buffout;
    private buffout_grey;
    private mentats;
    private mentats_grey;
    private psycho;
    private psycho_grey;
    private chosenWeapon;
    private chosenArmor;
    private playerHealth;
    private maxPlayerHealth;
    private bullets_in_current_clip;
    private enemies;
    private enemySprites;
    private enemyHealthIndicators;
    private lastShotTime;
    private isDead;
    private isVictoryTriggered;
    private victoryLoot;
    private soundtrack;
    private breathSound;
    private hardBreathSound;
    private isBreathSoundPlaying;
    private isHardBreathSoundPlaying;
    private ammoText;
    private clipBar;
    private cursors;
    private spaceKey;
    private shiftKey;
    private tabKey;
    private qKey;
    private eKey;
    private medical_keys;
    constructor();
    preload(): void;
    create(data?: {
        enemyType?: string;
        enemies?: string[];
    }): void;
    private setupInput;
    private stopAllSounds;
    private createBackground;
    private setupPlayerStats;
    private setupWeapon;
    private updateWeaponDisplay;
    private updateAmmoDisplay;
    private updateClipBar;
    private setupEnemies;
    private startEnemyMovement;
    private createMovementLoop;
    private setupCrosshairs;
    private setupEscapeButton;
    private showEscapeButton;
    private handleEscapeButtonClick;
    private setupMedicalItems;
    private setupAmmoDisplay;
    private setupStatsDisplay;
    private updateStatsDisplay;
    private playRandomSoundtrack;
    update(): void;
    private updateCrosshairTargeting;
    private checkCrosshairTargeting;
    private updateBreathingSounds;
    private updateEnemies;
    private enemyAttack;
    private playEnemySound;
    private playEnemyAttackSound;
    private switchWeapon;
    private performAttack;
    private playWeaponSound;
    private reload;
    private victory;
    private playerDeath;
    private handleMedicalInputs;
    private useMedicalItem;
    /**
     * Reset all medicine effects after battle
     */
    private resetMedicineEffects;
    private updateMedicalItemVisibility;
    private updateItemVisibility;
    private updateHealthMask;
    private generateVictoryLoot;
    private getEnemyWeapons;
    private getEnemyArmor;
    private shouldGetArmor;
    private calculatePlayerLevel;
    private updatePlayerLevel;
}
