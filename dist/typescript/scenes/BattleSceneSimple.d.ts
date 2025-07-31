/**
 * Complete Legacy BattleScene - Full functionality restored
 * Includes enemy movement, weapon switching, armor display, stats, sounds
 */
export declare class BattleScene extends Phaser.Scene {
    private bridge;
    private gameData;
    private enemies;
    private enemySprites;
    private background;
    private playerArmor;
    private playerRedArmor;
    private healthMask;
    private hand_sprite;
    private crosshair_red;
    private crosshair_green;
    private escape_button;
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
    private healthText;
    private levelText;
    private ammoText;
    private ammo_sprite;
    private clipBar;
    private playerHealth;
    private maxPlayerHealth;
    private chosenArmor;
    private chosenWeapon;
    private bullets_in_current_clip;
    private weaponIndex;
    private cursors;
    private spaceKey;
    private shiftKey;
    private tabKey;
    private medical_keys;
    private availableWeapons;
    private enemyMovementTimer;
    private enemyDirection;
    constructor();
    preload(): void;
    create(data?: {
        enemyType?: string;
        enemies?: string[];
    }): void;
    private setupInput;
    private createBackground;
    private setupPlayerStats;
    private setupWeapon;
    private updateWeaponDisplay;
    private setupEnemies;
    private setupCrosshairs;
    private setupEscapeButton;
    private setupMedicalItems;
    private setupAmmoDisplay;
    private setupStatsDisplay;
    private playBattleAudio;
    update(): void;
    private switchWeapon;
    private updateEnemyMovement;
    private performAttack;
    private handleMedicalInputs;
    private useMedicalItem;
    private updateMedicalItemVisibility;
    private updateItemVisibility;
    private updateHealthDisplay;
    private updateHealthMask;
}
