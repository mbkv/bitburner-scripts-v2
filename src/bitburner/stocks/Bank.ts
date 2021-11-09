import { BitBurner } from 'bitburner';
import { Market } from './Market';

export class Bank {
  static available(ns: BitBurner) {
    return ns.getServerMoneyAvailable('home');
  }

  static moneyInStocks(ns: BitBurner) {
    return Market.all(ns)
      .map(stock => stock.sellPrice * stock.sharesBought)
      .reduce((previous, current) => previous + current);
  }

  static total(ns: BitBurner) {
    return Bank.available(ns) + Bank.moneyInStocks(ns);
  }
  
  static moneyToInvest(ns: BitBurner) {
    const available = Bank.available(ns);
    const stocks = Bank.moneyInStocks(ns);
    const total = available + stocks;
    const goal = Math.floor(total * .9)

    return goal - stocks;
  }
}
