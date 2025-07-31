declare const _default: ({
    maxLevel: number;
    name: string;
    type: string;
    defence: {
        health: number;
        ac: number;
        threshold: number;
        resistance: number;
    };
    attack: {
        hit_chance: number;
        damage: {
            min: number;
            max: number;
        };
        shots: number;
        weapon?: undefined;
    };
    amount: {
        min: number;
        max: number;
    };
    experience: number;
    title: string[];
} | {
    maxLevel: number;
    name: string;
    type: string;
    defence: {
        health: number;
        ac: number;
        threshold: number;
        resistance: number;
    };
    attack: {
        hit_chance: number;
        weapon: string;
        damage: {
            min: number;
            max: number;
        };
        shots: number;
    };
    amount: {
        min: number;
        max: number;
    };
    experience: number;
    title: string[];
} | {
    maxLevel: number;
    name: string;
    type: string;
    defence: {
        health: number;
        ac: number;
        threshold: number;
        resistance: number;
    };
    attack: {
        hit_chance: number;
        damage?: undefined;
        shots?: undefined;
        weapon?: undefined;
    };
    amount: {
        min: number;
        max: number;
    };
    experience: number;
    title: string[];
})[];
export default _default;
