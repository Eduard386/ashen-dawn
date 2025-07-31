export default class BattleScene extends Phaser.Scene {
    constructor();
    soundtrackNames: string[];
    amountOfMainBackgrounds: number;
    armors: {
        name: string;
        ac: number;
        threshold: number;
        resistance: number;
    }[];
    weapons: {
        name: string;
        skill: string;
        type: string;
        cooldown: number;
        damage: {
            min: number;
            max: number;
        };
        clip: number;
        shots: number;
    }[];
    enemies_all: ({
        maxLevel: number;
        name: string;
        type: string;
        defence: {
            health: number;
            ac: number;
            threshold: number;
            resistance: number;
        };
        attack: {
            hit_chance: number;
            damage: {
                min: number;
                max: number;
            };
            shots: number;
            weapon?: undefined;
        };
        amount: {
            min: number;
            max: number;
        };
        experience: number;
        title: string[];
    } | {
        maxLevel: number;
        name: string;
        type: string;
        defence: {
            health: number;
            ac: number;
            threshold: number;
            resistance: number;
        };
        attack: {
            hit_chance: number;
            weapon: string;
            damage: {
                min: number;
                max: number;
            };
            shots: number;
        };
        amount: {
            min: number;
            max: number;
        };
        experience: number;
        title: string[];
    } | {
        maxLevel: number;
        name: string;
        type: string;
        defence: {
            health: number;
            ac: number;
            threshold: number;
            resistance: number;
        };
        attack: {
            hit_chance: number;
            damage?: undefined;
            shots?: undefined;
            weapon?: undefined;
        };
        amount: {
            min: number;
            max: number;
        };
        experience: number;
        title: string[];
    })[];
    enemies: any[];
    tempLootArmors: any[];
    lastShotTime: {};
    heroStatsTexts: any[];
    isBreathSoundPlaying: boolean;
    isHardBreathSoundPlaying: boolean;
    preload(): void;
    armors_red: string[];
    medcine: string[];
    updateItemVisibility(count: any, item: any, itemGrey: any): void;
    playRandomSoundtrack(): void;
    soundtrack: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    updateClipBar(): void;
    create(): void;
    cameraSpeed: number;
    gameData: any;
    critical_chance: number;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    spaceKey: Phaser.Input.Keyboard.Key;
    shiftKey: Phaser.Input.Keyboard.Key;
    downKey: Phaser.Input.Keyboard.Key;
    upKey: Phaser.Input.Keyboard.Key;
    first_aid_kit_key: Phaser.Input.Keyboard.Key;
    jet_key: Phaser.Input.Keyboard.Key;
    buffout_key: Phaser.Input.Keyboard.Key;
    mentats_key: Phaser.Input.Keyboard.Key;
    psycho_key: Phaser.Input.Keyboard.Key;
    background: Phaser.GameObjects.Image;
    playerHealth: any;
    maxPlayerHealth: any;
    chosenArmorName: any;
    chosenArmor: any;
    playerRedArmor: Phaser.GameObjects.Sprite;
    playerArmor: Phaser.GameObjects.Sprite;
    healthMask: Phaser.GameObjects.Graphics;
    chosenWeaponName: any;
    chosenWeapon: any;
    text_params: {
        fontSize: string;
        fill: string;
        fontFamily: string;
        fontWeight: string;
    };
    ammoText: Phaser.GameObjects.Text;
    clipBar: Phaser.GameObjects.Graphics;
    soundReload: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    bullets_in_current_clip: any;
    hand_sprite: Phaser.GameObjects.Sprite;
    crosshair_red: Phaser.GameObjects.Sprite;
    crosshair_green: Phaser.GameObjects.Sprite;
    crosshairOriginalY: number;
    soundEnemyKilled: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    sip_pill: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    escape_button: Phaser.GameObjects.Sprite;
    first_aid_kit_grey: Phaser.GameObjects.Sprite;
    jet_grey: Phaser.GameObjects.Sprite;
    buffout_grey: Phaser.GameObjects.Sprite;
    mentats_grey: Phaser.GameObjects.Sprite;
    psycho_grey: Phaser.GameObjects.Sprite;
    first_aid_kit: Phaser.GameObjects.Sprite;
    jet: Phaser.GameObjects.Sprite;
    buffout: Phaser.GameObjects.Sprite;
    mentats: Phaser.GameObjects.Sprite;
    psycho: Phaser.GameObjects.Sprite;
    medTexts: {};
    ammo_sprite: Phaser.GameObjects.Sprite;
    update(): void;
    breathSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    hardBreathSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    attackEffect(enemy: any): void;
    playEnemyAttackSound(enemy: any, isHit: any): void;
    tiltEffect(): void;
    bloodSplashEffect(): void;
    show_stats(): void;
    use_first_aid_kit(): void;
    use_jet(): void;
    use_buffout(): void;
    use_mentats(): void;
    use_psycho(): void;
    updateHealthDisplay(): void;
    showEscapeButtonTimer(): void;
    hideEscapeButtonTimer(): void;
    switchWeapon(next: any): void;
    checkIntersectionWithEnemies(): boolean;
    createEnemy(enemy_name: any): Phaser.GameObjects.Image;
    setAttackTimer(enemy: any): void;
    crosshairRect(): Phaser.Geom.Rectangle;
    enemyAttack(enemy: any): void;
    fireWeapon(): void;
    reload(): void;
}
