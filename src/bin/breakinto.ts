import { BitBurner } from "bitburner";
import { niceTry } from "../utils/niceTry";
import { serverScanWithoutPurchased } from "../bitburner/servers";

const breakInto = (ns: BitBurner, host: string) => {
  ns.tprint(`Attempting hack on "${host}"`)

  niceTry(() => ns.brutessh(host));
  niceTry(() => ns.ftpcrack(host));
  niceTry(() => ns.relaysmtp(host));
  niceTry(() => ns.httpworm(host));
  niceTry(() => ns.sqlinject(host));

  niceTry(() => {
    ns.nuke(host);
    ns.tprint(`Successfully nuked "${host}"`)
  })
}

export const main = async (ns: BitBurner) => {
  for (const host of serverScanWithoutPurchased(ns)) {
    breakInto(ns, host);
  }
}