export default class EncounterScene extends Phaser.Scene {
    constructor();
    options: string[];
    selectedOptionIndex: number;
    problemText: string[];
    checkFailed: boolean;
    preload(): void;
    create(): void;
    opponentText: Phaser.GameObjects.Text;
    continueDialogText: Phaser.GameObjects.Text;
    attackText: Phaser.GameObjects.Text;
    leaveText: Phaser.GameObjects.Text;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    spaceKey: Phaser.Input.Keyboard.Key;
    update(): void;
    handleOptionSelection(): void;
    handleAskAboutThings(): void;
    showResponse(response: any): void;
    updateTextStyles(): void;
}
