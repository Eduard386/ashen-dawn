export default class DeadScene extends Phaser.Scene {
    constructor();
    preload(): void;
    create(): void;
    death_music: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    spaceKey: Phaser.Input.Keyboard.Key;
    update(): void;
}
