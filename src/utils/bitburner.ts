import { BitBurner } from 'bitburner';
import { HACK_SECURITY, GROW_SECURITY } from '../constants';
import { tuple } from './tuple';

interface Settings {
  amount?: number;
  tries?: number;
}

export const weakenAmount = async (
  ns: BitBurner,
  host: string,
  { amount = Infinity, tries = Infinity }: Settings,
): Promise<number> => {
  let security = 0;
  for (let i = 0; i < tries; i++) {
    security += await ns.weaken(host);
  }

  return security;
};

export const growAmount = async (
  ns: BitBurner,
  host: string,
  { amount = Infinity, tries = Infinity }: Settings,
) => {
  let i = 0;
  let money = 1;
  for (; i < tries && money < amount; i++) {
    money *= await ns.grow(host);
  }

  return tuple(i * GROW_SECURITY, money);
};

export const hackAmount = async (
  ns: BitBurner,
  host: string,
  { amount = Infinity, tries = Infinity }: Settings,
) => {
  let i = 0;
  let money = 0;
  for (; i < tries && money < amount; i++) {
    money += await ns.hack(host);
  }

  return tuple(i * HACK_SECURITY, money);
};
