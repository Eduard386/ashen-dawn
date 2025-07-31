// Asset Loader Service - Centralized asset management with preloading
import { GameDataService } from './GameDataService.js';
/**
 * Centralized Asset Management Service
 * Provides efficient asset loading with progress tracking and caching
 *
 * Features:
 * - Background preloading of all game assets
 * - Progress tracking with callbacks
 * - Smart asset prioritization
 * - Cache management
 * - Error handling and fallbacks
 */
export class AssetLoaderService {
    constructor() {
        this.scene = null;
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.isLoading = false;
        this.progressCallbacks = [];
        this.completionCallbacks = [];
        // Asset categorization for smart loading
        this.criticalAssets = {
            images: {},
            audio: {},
            video: {}
        };
        this.gameAssets = {
            images: {},
            audio: {},
            video: {}
        };
    }
    static getInstance() {
        if (!AssetLoaderService.instance) {
            AssetLoaderService.instance = new AssetLoaderService();
        }
        return AssetLoaderService.instance;
    }
    /**
     * Initialize the asset loader with a Phaser scene
     */
    init(scene) {
        this.scene = scene;
        this.setupAssetManifests();
    }
    /**
     * Setup all asset manifests - organized by priority
     */
    setupAssetManifests() {
        // Critical assets - needed for main menu and initial gameplay
        this.criticalAssets = {
            images: {
                // Main menu
                'background_menu': 'assets/images/backgrounds/menu/menu.png',
                // Essential UI
                'yes': 'assets/images/yes.png',
                'no': 'assets/images/no.png',
                'escape': 'assets/images/escape_button.png',
                // Essential armor set
                'armor Leather Jacket': 'assets/images/armors/Leather Jacket.png',
                'armor red Leather Jacket': 'assets/images/armors_red/Leather Jacket.png',
                // Essential weapon
                'weapon 9mm pistol': 'assets/images/weapons/9mm pistol.png',
                'hand 9mm pistol': 'assets/images/hands/9mm pistol.png',
                // Basic background
                'backgroundMain1': 'assets/images/backgrounds/battle/backgroundMain1.png'
            },
            audio: {
                // Essential audio for immediate gameplay
                'travel': 'assets/psychobilly.mp3',
                'breath': 'assets/sounds/breath.mp3',
                'reloading': 'assets/sounds/reload.mp3'
            },
            video: {
                'road': 'assets/road.mp4'
            }
        };
        // Game assets - loaded in background during gameplay
        this.gameAssets = this.buildGameAssetManifest();
    }
    /**
     * Build comprehensive game asset manifest
     */
    buildGameAssetManifest() {
        const gameDataService = GameDataService.getInstance();
        const images = {};
        const audio = {};
        // Armors - all variants
        const armors = ['Leather Jacket', 'Leather Armor', 'Metal Armor', 'Combat Armor', 'Power Armor'];
        armors.forEach(armor => {
            images[`armor ${armor}`] = `assets/images/armors/${armor}.png`;
            images[`armor red ${armor}`] = `assets/images/armors_red/${armor}.png`;
        });
        // Weapons - all variants
        const weapons = [
            '9mm pistol', '44 Desert Eagle', '44 Magnum revolver',
            'Combat shotgun', 'SMG', 'Laser pistol', 'Baseball bat'
        ];
        weapons.forEach(weapon => {
            images[`weapon ${weapon}`] = `assets/images/weapons/${weapon}.png`;
            images[`hand ${weapon}`] = `assets/images/hands/${weapon}.png`;
            // Weapon sounds
            audio[`${weapon} - hit`] = `assets/sounds/weapons/${weapon} - hit.mp3`;
            for (let i = 1; i <= 3; i++) {
                audio[`${weapon} - miss ${i}`] = `assets/sounds/weapons/${weapon} - miss ${i}.mp3`;
            }
        });
        // Enemies - all types
        const enemies = [
            'Raider - Leather Jacket - Baseball bat',
            'Raider - Leather Jacket - 9mm pistol',
            'Raider - Leather Jacket - Combat shotgun',
            'Raider - Leather Armor - Baseball bat',
            'Raider - Leather Armor - 9mm pistol',
            'Raider - Leather Armor - Combat shotgun',
            'Cannibal man 1', 'Cannibal woman 1', 'Cannibal man 2',
            'Mantis', 'Rat'
        ];
        enemies.forEach(enemy => {
            images[enemy] = `assets/images/enemies/${enemy}.png`;
            // Enemy sounds
            audio[`${enemy} - attack`] = `assets/sounds/enemies/${enemy} - attack.mp3`;
            audio[`${enemy} - wounded`] = `assets/sounds/enemies/${enemy} - wounded.mp3`;
            audio[`${enemy} - died`] = `assets/sounds/enemies/${enemy} - died.mp3`;
        });
        // UI Elements
        const uiElements = {
            'crosshair_red': 'assets/images/crosshairs/crosshair_red.png',
            'crosshair_green': 'assets/images/crosshairs/crosshair_green.png',
            'indicator green': 'assets/images/health_indicators/green.png',
            'indicator yellow': 'assets/images/health_indicators/yellow.png',
            'indicator red': 'assets/images/health_indicators/red.png',
            'blood': 'assets/images/backgrounds/hit/blood.png',
            'victory_bg': 'assets/images/victory/victory.png'
        };
        Object.assign(images, uiElements);
        // Medical items
        const medicine = ['first_aid_kit', 'jet', 'buffout', 'mentats', 'psycho'];
        medicine.forEach(med => {
            images[med] = `assets/images/medcine/colored/${med}.png`;
            images[`${med} grey`] = `assets/images/medcine/grey/${med}.png`;
        });
        // Ammo
        const ammoTypes = ['mm_9', 'mm_12', 'magnum_44', 'mm_5_45', 'frag_grenade', 'energy_cell'];
        ammoTypes.forEach(ammo => {
            images[ammo] = `assets/images/ammo_small/${ammo}.png`;
        });
        // General audio
        const generalAudio = {
            'hard_breath': 'assets/sounds/hard_breath.mp3',
            'player wounded': 'assets/sounds/player wounded.mp3',
            'sip pill': 'assets/sounds/sip_pill.mp3',
            'victory_sound': 'assets/sounds/victory/victory.wav',
            'enemy killed': 'assets/sounds/enemy_killed/enemy_killed.mp3'
        };
        Object.assign(audio, generalAudio);
        // Battle background music
        const soundtracks = [
            'A Traders Life (in NCR)',
            'All-Clear Signal (Vault City)',
            'Beyond The Canyon (Arroyo)',
            'California Revisited (Worldmap on foot)',
            'Khans of New California (in the Den)',
            'Moribund World (in Klamath)',
            'My Chrysalis Highwayman (Worldmap with Car)'
        ];
        soundtracks.forEach(track => {
            audio[track] = `assets/sounds/battle_background/${track}.mp3`;
        });
        return { images, audio, video: {} };
    }
    /**
     * Load critical assets first - blocks until complete
     */
    async loadCriticalAssets() {
        if (!this.scene) {
            throw new Error('AssetLoaderService not initialized with scene');
        }
        return new Promise((resolve, reject) => {
            this.isLoading = true;
            // Calculate total critical assets
            const totalCritical = Object.keys(this.criticalAssets.images).length +
                Object.keys(this.criticalAssets.audio).length +
                Object.keys(this.criticalAssets.video).length;
            this.totalAssets = totalCritical;
            this.loadedAssets = 0;
            // Setup progress tracking
            this.scene.load.on('progress', (progress) => {
                this.updateProgress(progress, 'Loading critical assets...');
            });
            this.scene.load.on('complete', () => {
                this.isLoading = false;
                console.log('✅ Critical assets loaded');
                resolve();
            });
            this.scene.load.on('loaderror', (file) => {
                console.warn(`❌ Failed to load critical asset: ${file.key}`);
                // Continue anyway - don't block on missing assets
            });
            // Load critical assets
            this.loadAssetGroup(this.criticalAssets);
            this.scene.load.start();
        });
    }
    /**
     * Load game assets in background - non-blocking
     */
    startBackgroundLoading() {
        if (!this.scene || this.isLoading)
            return;
        // Start background loading after a short delay
        this.scene.time.delayedCall(1000, () => {
            this.loadGameAssetsAsync();
        });
    }
    /**
     * Async loading of game assets
     */
    async loadGameAssetsAsync() {
        if (!this.scene)
            return;
        console.log('🔄 Starting background asset loading...');
        const totalGame = Object.keys(this.gameAssets.images).length +
            Object.keys(this.gameAssets.audio).length;
        this.totalAssets = totalGame;
        this.loadedAssets = 0;
        this.isLoading = true;
        // Use separate loader for background loading
        const backgroundLoader = new Phaser.Loader.LoaderPlugin(this.scene);
        backgroundLoader.on('progress', (progress) => {
            this.updateProgress(progress, 'Loading game assets...');
        });
        backgroundLoader.on('complete', () => {
            this.isLoading = false;
            console.log('✅ All game assets loaded in background');
            this.notifyCompletion();
        });
        backgroundLoader.on('loaderror', (file) => {
            console.warn(`⚠️ Failed to load background asset: ${file.key}`);
            // Log but continue
        });
        // Load in chunks to avoid blocking
        await this.loadAssetsInChunks(backgroundLoader, this.gameAssets);
    }
    /**
     * Load assets in smaller chunks to prevent blocking
     */
    async loadAssetsInChunks(loader, assets) {
        const chunkSize = 20; // Load 20 assets at a time
        const allAssets = [
            ...Object.entries(assets.images).map(([key, path]) => ({ type: 'image', key, path })),
            ...Object.entries(assets.audio).map(([key, path]) => ({ type: 'audio', key, path }))
        ];
        for (let i = 0; i < allAssets.length; i += chunkSize) {
            const chunk = allAssets.slice(i, i + chunkSize);
            chunk.forEach(asset => {
                if (asset.type === 'image') {
                    loader.image(asset.key, asset.path);
                }
                else if (asset.type === 'audio') {
                    loader.audio(asset.key, asset.path);
                }
            });
            // Load chunk and wait
            await new Promise(resolve => {
                loader.once('complete', resolve);
                loader.start();
            });
            // Small delay between chunks
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    /**
     * Load a group of assets
     */
    loadAssetGroup(assets) {
        if (!this.scene)
            return;
        // Load images
        Object.entries(assets.images).forEach(([key, path]) => {
            this.scene.load.image(key, path);
        });
        // Load audio
        Object.entries(assets.audio).forEach(([key, path]) => {
            this.scene.load.audio(key, path);
        });
        // Load video
        Object.entries(assets.video).forEach(([key, path]) => {
            this.scene.load.video(key, path);
        });
    }
    /**
     * Update loading progress
     */
    updateProgress(progress, currentFile) {
        const progressInfo = {
            loaded: Math.floor(progress * this.totalAssets),
            total: this.totalAssets,
            percentage: Math.floor(progress * 100),
            currentFile
        };
        this.progressCallbacks.forEach(callback => callback(progressInfo));
    }
    /**
     * Check if an asset is loaded
     */
    isAssetLoaded(key, type = 'image') {
        if (!this.scene)
            return false;
        try {
            switch (type) {
                case 'image':
                    return this.scene.textures.exists(key);
                case 'audio':
                    return this.scene.cache.audio.exists(key);
                case 'video':
                    return this.scene.cache.video?.exists(key) || false;
                default:
                    return false;
            }
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get asset with fallback
     */
    getAssetWithFallback(key, fallbackKey, type = 'image') {
        if (this.isAssetLoaded(key, type)) {
            return key;
        }
        if (fallbackKey && this.isAssetLoaded(fallbackKey, type)) {
            console.warn(`Using fallback asset: ${fallbackKey} for ${key}`);
            return fallbackKey;
        }
        console.warn(`Asset not found: ${key}`);
        return null;
    }
    /**
     * Subscribe to loading progress
     */
    onProgress(callback) {
        this.progressCallbacks.push(callback);
    }
    /**
     * Subscribe to loading completion
     */
    onComplete(callback) {
        this.completionCallbacks.push(callback);
    }
    /**
     * Notify completion callbacks
     */
    notifyCompletion() {
        this.completionCallbacks.forEach(callback => callback());
    }
    /**
     * Get loading status
     */
    getLoadingStatus() {
        return {
            isLoading: this.isLoading,
            progress: this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0
        };
    }
    /**
     * Clear all callbacks (useful for scene transitions)
     */
    clearCallbacks() {
        this.progressCallbacks = [];
        this.completionCallbacks = [];
    }
    /**
     * Preload specific assets for a scene
     */
    preloadSceneAssets(sceneAssets) {
        if (!this.scene)
            return Promise.resolve();
        return new Promise((resolve) => {
            const missingAssets = sceneAssets.filter(asset => !this.isAssetLoaded(asset));
            if (missingAssets.length === 0) {
                resolve();
                return;
            }
            console.log(`Preloading ${missingAssets.length} missing assets for scene`);
            // Add missing assets to loader
            missingAssets.forEach(asset => {
                // Try to find asset in manifests
                if (this.criticalAssets.images[asset]) {
                    this.scene.load.image(asset, this.criticalAssets.images[asset]);
                }
                else if (this.gameAssets.images[asset]) {
                    this.scene.load.image(asset, this.gameAssets.images[asset]);
                }
                else if (this.criticalAssets.audio[asset]) {
                    this.scene.load.audio(asset, this.criticalAssets.audio[asset]);
                }
                else if (this.gameAssets.audio[asset]) {
                    this.scene.load.audio(asset, this.gameAssets.audio[asset]);
                }
            });
            this.scene.load.once('complete', resolve);
            this.scene.load.start();
        });
    }
}
//# sourceMappingURL=AssetLoaderService.js.map