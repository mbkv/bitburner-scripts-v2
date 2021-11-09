import { BitBurner } from "bitburner";
import { parseArgs } from "../utils/args";
import { serverScanWithoutPurchased } from "../bitburner/servers";

export const main = async (ns: BitBurner) => {
  const args = parseArgs(ns.args, {
    file: {
      aliases: ['--file', '-f'],
      input: 'single',
    },
    hostnames: {
      aliases: ['--hostnames', '-h'],
      input: 'multiple',
    },
  });

  if (!args.file) {
    ns.tprint('Usage: run kill.ns -f [file]')

    return;
  }

  if (!ns.fileExists(args.file)) {
    ns.tprint(`File ${args.file} does not exist!`);

    return;
  }

  const hostnames = args.hostnames?.length ? args.hostnames : serverScanWithoutPurchased(ns);

  for (const host of hostnames) {
    ns.scriptKill(args.file, host);
  }
}