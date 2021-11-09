import { BitBurner } from "bitburner";

export const runIfExists = <T>(ns: BitBurner, exe: string, fn: () => T) => {
  if (ns.fileExists(exe, 'home')) {
    return fn();
  }
}