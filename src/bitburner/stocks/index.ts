import { BitBurner, StockSymbol } from "bitburner";
import { Market } from "./Market";

// import { BitBurner, StockSymbol } from 'bitburner';
// import { sortby } from '../../utils/sortby';
// import { tuple } from '../../utils/tuple';
// import { stats } from './stock';

// export interface Stats {
//   stock: StockSymbol;
//   maxStocks: number;
//   buyPrice: number;
//   sellPrice: number;
//   forecast: number;
//   volatility: number;
// }

// const tickIncrease = (stats: Stats) => {
//   const increaseRate = (stats.forecast - 0.5) * 2;
//   const averageTickIncrease = increaseRate * stats.volatility * stats.buyPrice;
//   return averageTickIncrease;
// };

// const getStocks = (ns: BitBurner) =>
//   ns.getStockSymbols().map(stock => stats(ns, stock));
// // .map(stats => ({ ...stats, timeToDouble: timeToDouble(stats) }))

// const getStats = (ns: BitBurner, bank: number) => {
//   const stats = getStocks(ns)
//     .map(stat => ({
//       ...stat,
//       canBuy: Math.min(stat.maxStocks, Math.floor(bank / stat.buyPrice)),
//     }))
//     .map(stat => ({ ...stat, tickIncrease: tickIncrease(stat) * stat.canBuy }))
//     .map(stat => ({ ...stat, timeToDouble: bank / stat.tickIncrease }));

//   return sortby(stats, 'timeToDouble');
// };

// export const getBestStock = (ns: BitBurner, bank: number) => {
//   const stat = getStats(ns, bank)
//     .filter(stat => stat.timeToDouble > 0)
//     .filter(stock => stock.forecast > 0.60);

//   if (stat.length) {
//     return stat[0];
//   }
// };

// export const findStockStats = (
//   ns: BitBurner,
//   stock: StockSymbol,
//   bank: number,
// ) => getStats(ns, bank).find(el => el.stock === stock)!;

// export const buyStock = (ns: BitBurner, sym: StockSymbol, amount: number) => {
//   const beforePrice = ns.buyStock(sym, amount);

//   return tuple(amount * beforePrice, () => {
//     const afterPrice = ns.sellStock(sym, amount);

//     return afterPrice * amount;
//   });
// };

function buy(ns: BitBurner, symbol: StockSymbol, limit: number) {
  const stock = Market.get(ns, symbol);
  const shares = Math.min(Math.floor(limit / stock.buyPrice), stock.sharesCanBuy);
  
  ns.buyStock(stock.symbol, shares);
}

function sellAll(ns: BitBurner, symbol: StockSymbol) {
  const stock = Market.get(ns, symbol);

  ns.sellStock(stock.symbol, stock.sharesBought)
}

function sellFailingStocks(ns: BitBurner) {
  Market.portfolio(ns)
    .filter(stock => stock.forecast < 0.55)
    .forEach(stock => sellAll(ns, stock.symbol));
}

export class Stock {
  static run(ns: BitBurner) {
    sellFailingStocks(ns);
  }
}