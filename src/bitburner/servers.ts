import { BitBurner } from "bitburner";

export function *serverScan(ns: BitBurner) {
  const visited = new Set<string>();
  const stack = ['home'];

  while (stack.length) {
    const nextScan = stack.pop()!;
    yield nextScan
    visited.add(nextScan);

    const nextValues = ns.scan(nextScan);
    for (const nextValue of nextValues) {
      if (!visited.has(nextValue)) {
        stack.push(nextValue);
      }
    }
  }
}

export function *serverScanWithoutPurchased(ns: BitBurner) {
  const ours = ns.getPurchasedServers();

  for (const host of serverScan(ns)) {
    if (!ours.includes(host) && host !== 'home') {
      yield host
    }
  }
}

export function *hackedServerScan(ns: BitBurner) {
  for (const host of serverScan(ns)) {
    if (ns.hasRootAccess(host)) {
      yield host
    }
  }
}

export function *hackedServerScanWithoutPurchased(ns: BitBurner) {
  const ours = ns.getPurchasedServers();

  for (const host of hackedServerScan(ns)) {
    if (!ours.includes(host) && host !== 'home') {
      yield host
    }
  }
}

export const getServerStats = (ns: BitBurner, host: string) => {
  const money = ns.getServerMoneyAvailable(host);
  const maxMoney = ns.getServerMaxMoney(host);
  ns.tprint(`${host} - ${maxMoney} ${money}`)

  return {
    host,
    hacked: ns.hasRootAccess(host),
    level: ns.getServerRequiredHackingLevel(host),
    hackChance: ns.hackChance(host),

    money: money,
    maxMoney: maxMoney,

    security: ns.getServerSecurityLevel(host),
    minSecurity: ns.getServerMinSecurityLevel(host),

    growth: ns.getServerGrowth(host),
    growthToPeak: money === 0 ? NaN : ns.growthAnalyze(host, maxMoney / money),

    totalRam: ns.getServerRam(host)[0],
    freeRam: ns.getServerRam(host)[1],

    hackTime: ns.getHackTime(host),
    growTime: ns.getGrowTime(host),
    weakenTime: ns.getWeakenTime(host),
  }
}

export type Stats = ReturnType<typeof getServerStats>;

export const serverStats = (ns: BitBurner) => {
  return Array.from(serverScanWithoutPurchased(ns))
    .map(host => getServerStats(ns, host))
    .filter(stats => stats.hacked)
    .filter(stats => stats.level <= ns.getHackingLevel())
}

export const findServerStats = (ns: BitBurner, host: string) => {
  return serverStats(ns).find(stat => stat.host === host);
}