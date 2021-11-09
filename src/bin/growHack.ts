import { BitBurner } from "bitburner";
import { parseArgs, parseKnownArgs } from "../utils/args";
import { growServer } from "../bitburner/hack";

export const main = async (ns: BitBurner) => {
  const args = parseArgs(ns.args, {
    hostname: {
      aliases: ['--hostname', '-h'],
      input: 'single',
    },
  })

  const stats = parseKnownArgs(ns.args);

  if (!stats) {
    ns.tprint('Stats is needed');

    return
  }

  while (true) {
    await growServer(ns, args.hostname, stats);
  }
}