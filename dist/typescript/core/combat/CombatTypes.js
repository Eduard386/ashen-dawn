/**
 * Combat Types and Interfaces
 * Defines the core data structures for the combat system
 */
/**
 * Combat Action Types
 */
export var CombatActionType;
(function (CombatActionType) {
    CombatActionType["ATTACK"] = "attack";
    CombatActionType["AIMED_SHOT"] = "aimed_shot";
    CombatActionType["BURST_FIRE"] = "burst_fire";
    CombatActionType["USE_ITEM"] = "use_item";
    CombatActionType["MOVE"] = "move";
    CombatActionType["RELOAD"] = "reload";
    CombatActionType["THROW_GRENADE"] = "throw_grenade";
    CombatActionType["USE_SKILL"] = "use_skill";
    CombatActionType["DEFEND"] = "defend";
    CombatActionType["RUN_AWAY"] = "run_away";
})(CombatActionType || (CombatActionType = {}));
//# sourceMappingURL=CombatTypes.js.map