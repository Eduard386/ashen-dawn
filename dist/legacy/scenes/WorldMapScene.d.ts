export default class WorldMapScene extends Phaser.Scene {
    constructor();
    popupActive: boolean;
    selectedButton: string;
    soundtrackNames: string[];
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
    preload(): void;
    create(): void;
    gameData: any;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    spaceKey: Phaser.Input.Keyboard.Key;
    update(): void;
    playRandomSoundtrack(): void;
    soundtrack: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    startRandomEncounterTimer(): void;
    createPopup(text?: string): void;
    popupBackground: Phaser.GameObjects.Graphics;
    popupText: Phaser.GameObjects.Text;
    yesButton: Phaser.GameObjects.Image;
    noButton: Phaser.GameObjects.Image;
    showPopup(hasNoButton: any): void;
    hidePopup(): void;
    handlePopupInput(): void;
    getLevelConfig(player_level: any): (string | string[])[];
    chosenEnemy: {
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
    };
}
