import 'jest-extended';
export declare const createMockPlayer: () => {
    name: string;
    health: number;
    maxHealth: number;
    armor: number;
    weapons: any[];
    inventory: {
        medkits: number;
        stimpaks: number;
    };
    skills: {
        smallGuns: number;
        bigGuns: number;
        energyWeapons: number;
        unarmed: number;
        meleeWeapons: number;
        throwing: number;
        firstAid: number;
        doctor: number;
        sneak: number;
        lockpick: number;
        steal: number;
        traps: number;
    };
};
export declare const createMockWeapon: () => {
    name: string;
    damage: number;
    ammoType: string;
    currentAmmo: number;
    maxAmmo: number;
    range: number;
    skillRequired: "smallGuns";
    accuracy: number;
};
export declare const createMockEnemy: () => {
    name: string;
    health: number;
    maxHealth: number;
    armor: number;
    weapon: {
        name: string;
        damage: number;
        ammoType: string;
        currentAmmo: number;
        maxAmmo: number;
        range: number;
        skillRequired: "smallGuns";
        accuracy: number;
    };
    dropRate: number;
    experienceValue: number;
    skills: {
        combat: number;
        armor: number;
    };
};
