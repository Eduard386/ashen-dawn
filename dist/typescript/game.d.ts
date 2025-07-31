/**
 * Initialize the modern TypeScript game
 *
 * This replaces the legacy JavaScript game.js entirely.
 * All scenes now use modern TypeScript with:
 * - Service layer architecture
 * - LegacyBridge for data access
 * - Comprehensive error handling
 * - Type safety throughout
 */
declare const game: Phaser.Game;
export default game;
