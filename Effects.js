class GameEffects {
    constructor(scene) {
        this.scene = scene;  // Ссылка на сцену, чтобы использовать функции и объекты Phaser
    }

    attackEffect(enemy) {
        enemy.setScale(1.1);
        this.scene.time.delayedCall(1000, () => {
            enemy.setScale(1);
        });
    }

    tiltEffect() {
        const tiltDirection = Math.random() < 0.5 ? -1 : 1;
        const maxRotation = 0.05 * tiltDirection;
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: 1.2,
            duration: 250,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.scene.cameras.main,
                    rotation: maxRotation,
                    duration: 250,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: this.scene.cameras.main,
                            rotation: 0,
                            zoom: 1,
                            duration: 250,
                            ease: 'Sine.easeInOut'
                        });
                    }
                });
            }
        });
    }

    bloodSplashEffect() {
        let bloodSplash = this.scene.add.image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY, 'blood').setDepth(50).setScrollFactor(0);
        this.scene.sound.add(`player wounded`).play();
        this.scene.tweens.add({
            targets: this.scene.background,
            tint: 0xff0000,
            duration: 375,
            yoyo: true,
            onComplete: () => {
                this.scene.background.clearTint();
            }
        });

        this.scene.time.delayedCall(750, () => {
            bloodSplash.destroy();
        });
    }
}

export default GameEffects;