import { BitBurner } from "bitburner";
import { parseArgs, parseKnownArgs } from "../utils/args";
import { hackServer } from "../bitburner/hack";
import { repeat } from "../utils/repeat";

export const main = async (ns: BitBurner) => {
  const args = parseArgs(ns.args, {
    hostname: {
      aliases: ['--hostname', '-h'],
      input: 'single',
    },
    weaken: {
      aliases: ['--weaken', '-w'],
      type: Number,
      input: 'single',
    },
    grow: {
      aliases: ['--grow', '-g'],
      type: Number,
      input: 'single',
    },
  })

  await repeat(args.weaken || 0, () => ns.weaken(args.hostname), true);
  await repeat(args.grow || 0, () => ns.grow(args.hostname), true);

  const stats = parseKnownArgs(ns.args);

  if (!stats) {
    ns.tprint('Stats is needed');

    return
  }

  while (true) {
    await hackServer(ns, args.hostname, stats);
  }
}