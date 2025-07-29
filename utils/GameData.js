const defaultGameData = {
    levelCount: 1,
    health: 30,
    experience: 0,
    skills: {
        small_guns: 75,
        big_guns: 75,
        energy_weapons: 75,
        melee_weapons: 75,
        pyrotechnics: 75,
        lockpick: 75,
        science: 75,
        repair: 75,
        medcine: 75,
        barter: 75,
        speech: 75,
        surviving: 75
    },
    current_weapon: 'Baseball bat',
    current_armor: 'Leather Jacket',
    weapons: ['Baseball bat', '9mm pistol'],
    med: {
        first_aid_kit: 0,
        jet: 0,
        buffout: 0,
        mentats: 0,
        psycho: 0
    },
    ammo: {
        mm_9: 500,
        magnum_44: 12,
        mm_12: 0,
        mm_5_45: 0,
        energy_cell: 0,
        frag_grenade: 0
    },
    enemiesToCreate: [],
    levelLoot: [],
    armorLoot: null
};

let gameData = null;

function init() {
    if (!gameData) {
        gameData = JSON.parse(JSON.stringify(defaultGameData));
    }
}

function get() {
    if (!gameData) {
        init();
    }
    return gameData;
}

function set(data) {
    gameData = data;
}

function reset() {
    gameData = JSON.parse(JSON.stringify(defaultGameData));
}

export default {
    init,
    get,
    set,
    reset,
    getDefault: () => JSON.parse(JSON.stringify(defaultGameData))
};
