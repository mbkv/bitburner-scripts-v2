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
    }
  });

  const index = ns.args.findIndex(el => el === '--');

  if (index < 0 || !args.file) {
    ns.tprint('Usage: run run.ns -f file -- [args]')

    return;
  }

  if (!args.file) {
    ns.tprint(`File ${args.file} does not exist!`);

    return;
  }

  const scriptArgs = ns.args.slice(index + 1);
  const memUsage = ns.getScriptRam(args.file)
  ns.tprint(`Spawning threads with ${JSON.stringify(scriptArgs)}`)

  const hostnames = args.hostnames?.length ? args.hostnames : serverScanWithoutPurchased(ns);

  for (const host of hostnames) {
    ns.scp(args.file, host);

    const ram = ns.getServerRam(host);
    const freeRam = ram[0] - ram[1];
    const threads = Math.floor(freeRam / memUsage);
    
    if (threads <= 0 || threads === Infinity) {
      continue;
    }
    
    ns.tprint(`${host} - ${threads} (${freeRam} / ${memUsage})`)
    const pid = ns.exec(args.file, host, threads, '--', ...scriptArgs);
    ns.tprint(String(pid));
  }
}