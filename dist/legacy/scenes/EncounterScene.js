import GameData from "../utils/GameData.js";
export default class EncounterScene extends Phaser.Scene {
    constructor() {
        super({ key: "EncounterScene" });
        this.options = ["Hi there. How are things going?", "Attack", "Leave"]; // Добавлены новые опции
        this.selectedOptionIndex = 0; // Индекс выбранной опции
        this.problemText = [
            "Not too well, we have an injured members who need medical attention.",
            "Our generator broke down. Do you know how to fix it?",
            "We're struggling to grow crops in the irradiated soil. We could use some scientific expertise.",
        ];
        this.checkFailed = false;
    }
    preload() {
        this.load.image("background image", "assets/images/encounters/Tribe.png");
    }
    create() {
        // Фоновое изображение
        this.add.image(0, 0, "background image").setOrigin(0, 0);
        // Полупрозрачный прямоугольник
        this.add.graphics().fillStyle(0x000000, 0.75).fillRect(100, 300, 824, 200);
        // Текстовые строки
        this.opponentText = this.add
            .text(512, 370, Phaser.Math.RND.pick([
            "Hello, traveler. You don't look like one of us.",
            "Greetings, wanderer. We rarely see new faces here.",
            "Welcome, stranger. You seem different from the locals.",
        ]), { fontSize: "20px", fill: "#0f0" })
            .setOrigin(0.5);
        this.continueDialogText = this.add
            .text(512, 420, this.options[0], { fontSize: "16px", fill: "#0f0" })
            .setOrigin(0.5);
        this.attackText = this.add
            .text(512, 450, this.options[1], { fontSize: "16px", fill: "#0f0" })
            .setOrigin(0.5);
        this.leaveText = this.add
            .text(512, 480, this.options[2], { fontSize: "16px", fill: "#0f0" })
            .setOrigin(0.5);
        // Текущая выбранная опция
        //this.selectedOption = 'Attack';
        this.updateTextStyles();
        // Обработка ввода
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.selectedOptionIndex = Math.max(this.selectedOptionIndex - 1, 0);
            this.updateTextStyles();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.selectedOptionIndex = Math.min(this.selectedOptionIndex + 1, this.options.length - 1);
            this.updateTextStyles();
        }
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.handleOptionSelection();
        }
    }
    handleOptionSelection() {
        if (this.selectedOptionIndex === 0) {
            this.handleAskAboutThings();
        }
        else if (this.selectedOptionIndex === 1) {
            this.scene.start("BattleScene");
        }
        else if (this.selectedOptionIndex === 2) {
            this.options[0] = "Hi there. How are things going?";
            this.scene.start("WorldMapScene");
        }
    }
    handleAskAboutThings() {
        const speechSkill = GameData.get().skills.speech;
        if (Phaser.Math.Between(1, 100) <= speechSkill) {
            console.log("Speech check success");
            this.showResponse(Phaser.Math.RND.pick(this.problemText));
        }
        else {
            // Неуспешная проверка навыка речи
            this.checkFailed = true;
            console.log("Speech check failed");
            if (this.opponentText)
                this.opponentText.destroy();
            this.opponentText = this.add
                .text(512, 350, Phaser.Math.RND.pick([
                "You don't look qualified for that. Maybe we need someone with more experience.",
                "It seems your skills aren't quite what we need. Thank you for trying, though.",
                "I guess this task requires a different kind of knowledge. Thanks.",
            ]), { fontSize: "16px", fill: "#0f0" })
                .setOrigin(0.5);
            if (this.continueDialogText)
                this.continueDialogText.destroy();
            this.attackText.destroy();
            this.leaveText.destroy();
            this.attackText = this.add
                .text(512, 420, this.options[1], { fontSize: "16px", fill: "#0f0" })
                .setOrigin(0.5);
            this.leaveText = this.add
                .text(512, 450, this.options[2], { fontSize: "16px", fill: "#0f0" })
                .setOrigin(0.5);
            this.updateTextStyles();
        }
    }
    showResponse(response) {
        // Удаляем предыдущие текстовые элементы, если они есть
        if (this.opponentText)
            this.opponentText.destroy();
        // Отображение ответа собеседника
        this.opponentText = this.add
            .text(512, 350, response, { fontSize: "16px", fill: "#0f0" })
            .setOrigin(0.5);
        // Обновляем варианты ответов героя
        if (response === this.problemText[0]) {
            this.options[0] = "I'll try to help. Show me where they are.";
            if (this.continueDialogText)
                this.continueDialogText.destroy();
            this.continueDialogText = this.add
                .text(512, 420, this.options[0], { fontSize: "20px", fill: "#0f0" })
                .setOrigin(0.5);
        }
        else if (response === this.problemText[1]) {
            this.options[0] = "I can give it a try. Let's take a look at it.";
            if (this.continueDialogText)
                this.continueDialogText.destroy();
            this.continueDialogText = this.add
                .text(512, 420, this.options[0], { fontSize: "20px", fill: "#0f0" })
                .setOrigin(0.5);
        }
        else if (response === this.problemText[2]) {
            this.options[0] =
                "Alright, I'll see what I can do to help with your agriculture.";
            if (this.continueDialogText)
                this.continueDialogText.destroy();
            this.continueDialogText = this.add
                .text(512, 420, this.options[0], { fontSize: "20px", fill: "#0f0" })
                .setOrigin(0.5);
        }
        this.selectedOptionIndex = 0; // Сброс выбранного индекса
        this.updateTextStyles();
        // Добавляем обработку ввода для новых опций
        // Это может быть уже реализовано в update, если логика обновления текстовых стилей и выбора опции универсальна
    }
    updateTextStyles() {
        // Обновление стилей текстовых элементов в соответствии с выбранной опцией
        // Например, вы можете использовать различные цвета или размеры шрифта для активной и неактивной опции
        if (this.options.length === 3) {
            this.continueDialogText.setFontSize("16px").setFontStyle("");
            this.attackText.setFontSize("16px").setFontStyle("");
            this.leaveText.setFontSize("16px").setFontStyle("");
            // Активная опция выделяется
            if (this.selectedOptionIndex === 0) {
                this.continueDialogText.setFontSize("20px").setFontStyle("bold");
            }
            else if (this.selectedOptionIndex === 1) {
                this.attackText.setFontSize("20px").setFontStyle("bold");
            }
            else if (this.selectedOptionIndex === 2) {
                this.leaveText.setFontSize("20px").setFontStyle("bold");
            }
        }
        if (this.options.length === 2) {
            this.attackText.setFontSize("16px").setFontStyle("");
            this.leaveText.setFontSize("16px").setFontStyle("");
            if (this.selectedOptionIndex === 0) {
                this.attackText.setFontSize("20px").setFontStyle("bold");
            }
            else if (this.selectedOptionIndex === 1) {
                this.leaveText.setFontSize("20px").setFontStyle("bold");
            }
        }
    }
}
//# sourceMappingURL=EncounterScene.js.map