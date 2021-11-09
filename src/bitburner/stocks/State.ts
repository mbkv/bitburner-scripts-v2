import { StockSymbol, BitBurner } from "bitburner";
import { Stock, Market } from "./Market";
import { Bank } from "./Bank";

export class State {
  static current(ns: BitBurner) {
    return new State(Bank.available(ns), Market.stockMap(ns));
  }

  queue: Map<StockSymbol, number> = new Map();
  state: Map<StockSymbol, Stock>;

  constructor(public bank: number, state: Map<StockSymbol, Stock>) {
    this.state = new Map(state);
  }

  get() {
    const state = new Map(this.state);

    for (const [symbol, action] of this.queue) {
      const updated = state.get(symbol)!

      state.set(symbol, {
        ...updated,
        sharesBought: updated.sharesBought + action,
      })
    }

    return state;
  }

  sellMax(symbol: StockSymbol) {
    const stock = this.state.get(symbol)!;
    this.resetStock(symbol);

    this.bank += stock.sharesBought * stock.sellPrice;
    this.queue.set(symbol, -stock.sharesBought);
  }

  buyMax(symbol: StockSymbol) {
    const stock = this.state.get(symbol)!;
    this.resetStock(symbol);

    const shares = Math.min(Math.floor(this.bank / stock.buyPrice), stock.sharesCanBuy)

    this.bank -= shares * stock.buyPrice;
    this.queue.set(symbol, shares);
  }

  protected resetStock(symbol: StockSymbol) {
    const stock = this.state.get(symbol)!;
    const action = this.queue.get(symbol);

    if (action) {
      if (action > 0) {
        this.bank += stock.buyPrice * action;
      } else {
        this.bank -= stock.sellPrice * action;
      }
    }

    this.queue.delete(symbol);
  }
}

export class Transaction {
  static current(ns: BitBurner) {
    // return new TransactionState(Bank.available(ns), Market.stockMap(ns));
  }

  protected queue: Map<StockSymbol, number> = new Map();

  constructor(public cash: number, public market: Map<StockSymbol, Stock>) {}


}