import { WeaponSkillType, AmmoType, IDamageRange } from '../types/GameTypes';

export interface IWeapon {
  readonly name: string;
  readonly skill: WeaponSkillType;
  readonly ammoType: AmmoType;
  readonly cooldown: number;
  readonly damage: IDamageRange;
  readonly clipSize: number;
  readonly shotsPerAttack: number;
  readonly criticalChance: number;
}

// Service interface for weapon management
export interface IWeaponService {
  getWeapon(name: string): IWeapon | null;
  getAllWeapons(): IWeapon[];
  switchWeapon(direction: number): boolean;
  canFire(weapon: IWeapon, ammoCount: number): boolean;
  getAmmoConsumption(weapon: IWeapon): number;
}
