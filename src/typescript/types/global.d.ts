// Global type declarations for Phaser loaded via CDN
declare const Phaser: typeof import('phaser');

// Extend Window interface if needed
declare global {
  interface Window {
    Phaser: typeof import('phaser');
    game?: Phaser.Game;
  }
}

export {};
