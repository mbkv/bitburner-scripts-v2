import { BitBurner, StockSymbol } from 'bitburner';
import { tuple } from '../../utils/tuple';
import { sortby } from '../../utils/sortby';

// export type Stock = ReturnType<typeof Market["get"]>;

interface StockDetails {
  symbol: string;

  sharesBought: number;
  maxShares: number;

  forecast: number;
  volatility: number;

  buyPrice: number;
  sellPrice: number;
}

export class Stock implements StockDetails {
  public readonly symbol: string;
  public readonly sharesBought: number;
  public readonly maxShares: number;

  public readonly forecast: number;
  public readonly volatility: number;

  public readonly buyPrice: number;
  public readonly sellPrice: number;

  constructor(details: StockDetails) {
    this.symbol = details.symbol;
    this.sharesBought = details.sharesBought;
    this.maxShares = details.maxShares;
    this.forecast = details.forecast;
    this.volatility = details.volatility;
    this.buyPrice = details.buyPrice;
    this.sellPrice = details.sellPrice;
  }

  update(details: Partial<StockDetails>) {
    return new Stock({
      ...this,
      ...details,
    })
  }

  get sharesCanBuy() {
    return this.maxShares - this.sharesBought;
  }

  get averageIncrease() {
    return this.forecast * this.volatility * this.sellPrice;
  }

  get ttdInvestment() {
    return this.buyPrice / this.averageIncrease;
  }
}

export class Market {
  static get(ns: BitBurner, symbol: StockSymbol) {
    return new Stock({
      symbol,
      sharesBought: ns.getStockPosition(symbol)[0],
      maxShares: ns.getStockMaxShares(symbol),

      forecast: ns.getStockForecast(symbol),
      volatility: ns.getStockVolatility(symbol),

      buyPrice: ns.getStockAskPrice(symbol),
      sellPrice: ns.getStockBidPrice(symbol),
    });
  }

  static getMany(ns: BitBurner, symbols: StockSymbol[]) {
    return symbols.map(symbol => Market.get(ns, symbol));
  }

  static all(ns: BitBurner) {
    return ns.getStockSymbols().map(symbol => Market.get(ns, symbol));
  }

  // static availableStocks(ns: BitBurner) {
  //   return Market.all(ns).filter(stock => stock.sharesCanBuy)
  // }

  // static portfolio(ns: BitBurner) {
  //   return Market.all(ns).filter(stock => stock.sharesBought);
  // }

  // static bestStocks(ns: BitBurner) {
  //   return sortby(Market.all(ns), 'ttdInvestment').filter(stock => stock.forecast > 0.6);
  // }

  static stockMap(ns: BitBurner) {
    return new Map(Market.all(ns).map(stock => tuple(stock.symbol, stock)));
  }
}
