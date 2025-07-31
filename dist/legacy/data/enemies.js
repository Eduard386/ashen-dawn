export default [
    {
        maxLevel: 1, name: 'Rat', type: 'creature',
        defence: { health: 6, ac: 6, threshold: 0, resistance: 0 },
        attack: { hit_chance: 40, damage: { min: 2, max: 2 }, shots: 1 },
        amount: { min: 6, max: 10 }, experience: 25, title: ['Rat']
    },
    {
        maxLevel: 1, name: 'Mantis', type: 'creature',
        defence: { health: 25, ac: 13, threshold: 0, resistance: 0.2 },
        attack: { hit_chance: 50, damage: { min: 5, max: 8 }, shots: 1 },
        amount: { min: 1, max: 4 }, experience: 50, title: ['Mantis']
    },
    {
        maxLevel: 1, name: 'Tribe', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: 'Spear', damage: { min: 3, max: 10 }, shots: 1 },
        amount: { min: 2, max: 4 }, experience: 50,
        title: ['Tribe man 1', 'Tribe man 2', 'Tribe man 3', 'Tribe man 4',
            'Tribe woman 1', 'Tribe woman 2']
    },
    {
        maxLevel: 1, name: 'Cannibals', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: 'Knife', damage: { min: 1, max: 6 }, shots: 1 },
        amount: { min: 2, max: 4 }, experience: 50,
        title: ['Cannibal man 1', 'Cannibal man 2', 'Cannibal man 3',
            'Cannibal woman 1', 'Cannibal woman 2']
    },
    {
        maxLevel: 1, name: 'Raiders', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60 },
        amount: { min: 1, max: 4 }, experience: 75,
        title: [
            'Raider - Leather Jacket - Baseball bat',
            'Raider - Leather Jacket - 44 Magnum revolver',
            'Raider - Leather Jacket - 9mm pistol',
            'Raider - Leather Jacket - 44 Desert Eagle',
            'Raider - Leather Jacket - Laser pistol',
            'Raider - Leather Jacket - SMG',
            'Raider - Leather Jacket - Frag grenade',
            'Raider - Leather Jacket - Combat shotgun',
            'Raider - Leather Jacket - Laser rifle',
            'Raider - Leather Jacket - Minigun',
            'Raider - Leather Armor - Baseball bat',
            'Raider - Leather Armor - 44 Magnum revolver',
            'Raider - Leather Armor - 9mm pistol',
            'Raider - Leather Armor - 44 Desert Eagle',
            'Raider - Leather Armor - Laser pistol',
            'Raider - Leather Armor - SMG',
            'Raider - Leather Armor - Combat shotgun',
            'Raider - Metal Armor - Baseball bat',
            'Raider - Metal Armor - 44 Magnum revolver',
            'Raider - Metal Armor - 9mm pistol',
            'Raider - Metal Armor - 44 Desert Eagle',
            'Raider - Metal Armor - Laser pistol',
            'Raider - Metal Armor - SMG',
            'Raider - Metal Armor - Combat shotgun'
        ]
    }
];
//# sourceMappingURL=enemies.js.map