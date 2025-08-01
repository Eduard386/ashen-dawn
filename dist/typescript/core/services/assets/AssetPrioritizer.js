/**
 * Asset Prioritizer - Single responsibility for asset prioritization
 * Handles critical vs non-critical assets, loading order, chunking strategies
 */
export class AssetPrioritizer {
    constructor() {
        this.criticalAssets = { images: {}, audio: {}, video: {} };
        this.gameAssets = { images: {}, audio: {}, video: {} };
        // Priority mapping
        this.priorityValues = {
            critical: 1000,
            high: 800,
            normal: 500,
            low: 200,
            background: 100
        };
    }
    /**
     * Initialize with asset manifests
     */
    initialize() {
        this.setupCriticalAssets();
        this.setupGameAssets();
    }
    /**
     * Setup critical assets - needed for immediate gameplay
     */
    setupCriticalAssets() {
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
                'backgroundMain1': 'assets/images/backgrounds/battle/backgroundMain1.png',
                // Basic UI elements
                'crosshair_red': 'assets/images/crosshairs/crosshair_red.png',
                'crosshair_green': 'assets/images/crosshairs/crosshair_green.png'
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
    }
    /**
     * Setup game assets - can be loaded in background
     */
    setupGameAssets() {
        const images = {};
        const audio = {};
        // All armors
        const armors = ['Leather Jacket', 'Leather Armor', 'Metal Armor', 'Combat Armor', 'Power Armor'];
        armors.forEach(armor => {
            if (armor !== 'Leather Jacket') { // Already in critical
                images[`armor ${armor}`] = `assets/images/armors/${armor}.png`;
                images[`armor red ${armor}`] = `assets/images/armors_red/${armor}.png`;
            }
        });
        // All weapons
        const weapons = [
            '44 Desert Eagle', '44 Magnum revolver',
            'Combat shotgun', 'SMG', 'Laser pistol', 'Baseball bat'
            // '9mm pistol' already in critical
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
        // Enemies
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
        // Battle background music (low priority)
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
        this.gameAssets = { images, audio, video: {} };
    }
    /**
     * Get critical assets manifest
     */
    getCriticalAssets() {
        return { ...this.criticalAssets };
    }
    /**
     * Get game assets manifest
     */
    getGameAssets() {
        return { ...this.gameAssets };
    }
    /**
     * Get assets sorted by priority
     */
    getAssetsByPriority(includeGame = true) {
        const assets = [];
        // Add critical assets
        this.addAssetsFromManifest(assets, this.criticalAssets, 'critical');
        if (includeGame) {
            // Add game assets with different priorities
            this.addGameAssetsWithPriority(assets);
        }
        // Sort by priority (higher number = higher priority)
        return assets.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Get assets in chunks for progressive loading
     */
    getAssetsInChunks(chunkSize = 20) {
        const sortedAssets = this.getAssetsByPriority();
        const chunks = [];
        for (let i = 0; i < sortedAssets.length; i += chunkSize) {
            chunks.push(sortedAssets.slice(i, i + chunkSize));
        }
        return chunks;
    }
    /**
     * Get assets for specific scene
     */
    getSceneAssets(sceneName) {
        const sceneAssetMap = {
            'MainMenu': [
                'background_menu', 'yes', 'no', 'escape', 'travel'
            ],
            'WorldMap': [
                'road', 'travel', 'armor Leather Jacket', 'weapon 9mm pistol'
            ],
            'Battle': [
                'backgroundMain1', 'crosshair_red', 'crosshair_green',
                'armor Leather Jacket', 'armor red Leather Jacket',
                'weapon 9mm pistol', 'hand 9mm pistol',
                'breath', 'reloading'
            ]
        };
        const sceneAssetKeys = sceneAssetMap[sceneName] || [];
        const allAssets = this.getAssetsByPriority();
        return allAssets.filter(asset => sceneAssetKeys.includes(asset.key));
    }
    /**
     * Determine asset priority based on type and usage
     */
    getAssetPriority(key, type) {
        // Critical assets
        if (this.isInManifest(key, this.criticalAssets)) {
            return 'critical';
        }
        // High priority for UI and essential gameplay
        if (key.includes('crosshair') || key.includes('indicator') ||
            key.includes('yes') || key.includes('no') || key.includes('escape')) {
            return 'high';
        }
        // High priority for basic weapons and armor
        if ((key.includes('9mm pistol') || key.includes('Leather Jacket')) &&
            (key.includes('weapon') || key.includes('armor'))) {
            return 'high';
        }
        // Normal priority for weapons and enemies
        if (key.includes('weapon') || key.includes('enemy') || key.includes('armor')) {
            return 'normal';
        }
        // Low priority for background music
        if (type === 'audio' && (key.includes('background') || key.includes('soundtrack'))) {
            return 'low';
        }
        // Background priority for extra content
        if (key.includes('victory') || key.includes('death') || key.includes('buff')) {
            return 'background';
        }
        return 'normal';
    }
    /**
     * Calculate total assets count by priority
     */
    getAssetCountsByPriority() {
        const assets = this.getAssetsByPriority();
        const counts = {
            critical: 0,
            high: 0,
            normal: 0,
            low: 0,
            background: 0
        };
        assets.forEach(asset => {
            const priority = this.getAssetPriority(asset.key, asset.type);
            counts[priority]++;
        });
        return counts;
    }
    // Private helper methods
    addAssetsFromManifest(assets, manifest, category) {
        Object.entries(manifest.images).forEach(([key, path]) => {
            const priority = this.getAssetPriority(key, 'image');
            assets.push({
                key,
                path,
                type: 'image',
                priority: this.priorityValues[priority],
                category
            });
        });
        Object.entries(manifest.audio).forEach(([key, path]) => {
            const priority = this.getAssetPriority(key, 'audio');
            assets.push({
                key,
                path,
                type: 'audio',
                priority: this.priorityValues[priority],
                category
            });
        });
        Object.entries(manifest.video).forEach(([key, path]) => {
            const priority = this.getAssetPriority(key, 'video');
            assets.push({
                key,
                path,
                type: 'video',
                priority: this.priorityValues[priority],
                category
            });
        });
    }
    addGameAssetsWithPriority(assets) {
        this.addAssetsFromManifest(assets, this.gameAssets, 'game');
    }
    isInManifest(key, manifest) {
        return !!(manifest.images[key] || manifest.audio[key] || manifest.video[key]);
    }
}
//# sourceMappingURL=AssetPrioritizer.js.map