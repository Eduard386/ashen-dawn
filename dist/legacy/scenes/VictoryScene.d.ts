export default class VictoryScene extends Phaser.Scene {
    constructor();
    lootActions: {
        0: {
            ammoType: string;
            amount: number;
        };
        1: {
            ammoType: string;
            amount: number;
        };
        2: {
            ammoType: string;
            amount: number;
        };
        3: {
            ammoType: string;
            amount: number;
        };
        4: {
            ammoType: string;
            amount: number;
        };
        5: {
            ammoType: string;
            amount: number;
        };
        6: {
            ammoType: string;
            amount: number;
        };
        7: {
            ammoType: string;
            amount: number;
        };
        8: {
            ammoType: string;
            amount: number;
        };
        9: {
            ammoType: string;
            amount: number;
        };
    };
    preload(): void;
    armors: string[];
    medcine: string[];
    create(): void;
    gameData: any;
    victory_music: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    spaceKey: Phaser.Input.Keyboard.Key;
    text_params: {
        fontSize: string;
        fill: string;
        fontFamily: string;
        fontWeight: string;
    };
    text: string;
    lootText: Phaser.GameObjects.Text;
    update(): void;
}
