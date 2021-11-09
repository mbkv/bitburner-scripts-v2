import { BitBurner } from "bitburner";
import { serverStats } from "../bitburner/servers";

export const main = async (ns: BitBurner) => {
  ns.tprint(JSON.stringify(serverStats(ns), undefined, 2));
}