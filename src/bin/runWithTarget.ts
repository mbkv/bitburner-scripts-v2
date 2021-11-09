import { BitBurner } from "bitburner";
import { parseArgs } from "../utils/args";
import { serverScanWithoutPurchased, findServerStats } from "../bitburner/servers";

export const main = async (ns: BitBurner) => {
  const args = parseArgs(ns.args, {
    file: {
      aliases: ['--file', '-f'],
      input: 'single',
    },
    target: {
      aliases: ['--target'],
      input: 'single',
    },
    hostnames: {
      aliases: ['--hostnames', '-h'],
      input: 'multiple',
    }
  });

  const index = ns.args.findIndex(el => el === '--');

  if (index < 0 || !args.file || !args.target) {
    ns.tprint('Usage: run run.ns -f file -t target -- [args]')

    return;
  }

  if (!args.file) {
    ns.tprint(`File ${args.file} does not exist!`);

    return;
  }

  const stats = findServerStats(ns, args.target);

  if (!stats) {
    ns.tprint(`Server ${args.target} not found!`);

    return;
  }

  const scriptArgs = ns.args.slice(index + 1);
  const memUsage = ns.getScriptRam(args.file)

  scriptArgs.push('--stats', JSON.stringify(stats))
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