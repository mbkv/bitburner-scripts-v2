import { BitBurner } from "bitburner";
import { HACK_SECURITY, GROW_SECURITY, WEAKEN_SECURITY } from "../constants";
import { getServerStats, Stats } from "./servers";

interface Props extends Stats {
  threads: number;
}

class GrowServer {
  threads: number;
  available: number;
  security = 0;

  constructor(protected ns: BitBurner, protected host: string, protected state: Props) {
    this.threads = state.threads;
    this.available = state.money;
  }

  debug() {
    this.ns.print(JSON.stringify({ available: this.available, security: this.security, threads: this.threads }));
  }

  async weaken() {
    await this.ns.weaken(this.host);
    this.security -= WEAKEN_SECURITY * this.threads
    this.security = Math.max(this.security, 0);
  }

  async weakenIfNeeded() {
    if (this.security > 2) {
      await this.weaken();
    }
  }

  async grow() {
    await this.weakenIfNeeded();
    const multiplier = await this.ns.grow(this.host);
    const previous = this.available;
    this.available *= multiplier;
    this.available = Math.min(this.available, this.state.maxMoney);
    this.security += GROW_SECURITY * this.threads

    this.ns.print(`Multiplier ${multiplier}`);

    if (multiplier === 1) {
      return Infinity
    }

    return previous * (multiplier - 1);
  }
}

class HackServer extends GrowServer {
  async hack() {
    await this.weakenIfNeeded();
    const threads = Math.min(this.threads, 20);
    const hacked = await this.ns.hack(this.host, { threads });
    this.available -= hacked;
    this.security += HACK_SECURITY * threads

    return hacked;
  }
}

export const growServer = async (ns: BitBurner, host: string, stats: Stats) => {
  ns.disableLog('getServerMoneyAvailable')
  ns.disableLog('getServerSecurityLevel')

  const threads = await ns.weaken(host) / WEAKEN_SECURITY;
  const server = new GrowServer(ns, host, { ...stats, threads })

  while (true) {
    server.debug();
    await server.grow();
  }
}

export const hackServer = async (ns: BitBurner, host: string, stats: Stats) => {
  ns.disableLog('getServerMoneyAvailable')
  ns.disableLog('getServerSecurityLevel')

  const threads = await ns.weaken(host) / WEAKEN_SECURITY;
  const server = new HackServer(ns, host, { ...stats, threads })

  while (true) {
    let hacked = await server.hack();
    server.debug();
    
    while (hacked > .5) {
      ns.print(JSON.stringify({ left: hacked }));
      server.debug();
      hacked -= await server.grow();
    }
  }
}