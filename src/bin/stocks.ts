import { BitBurner } from 'bitburner';
import { parseArgs } from '../utils/args';
import { getBestStock, buyStock, findStockStats } from '../bitburner/stocks';

const formatDollar = (ns: BitBurner, num: number) => ns.nFormat(num, '$0.000a');

export const main = async (ns: BitBurner) => {
  const args = parseArgs(ns.args, {
    limit: {
      aliases: ['--limit', '-l'],
      type: Number,
      input: 'single',
    }
  })

  ns.disableLog('sleep')
  const f = formatDollar.bind(undefined, ns);
  let bank = args.limit;

  while (true) {
    const time = Date.now();
    const stock = getBestStock(ns, bank);
    ns.print(`Bank ${f(bank)} - ${JSON.stringify(stock, undefined, 2)}`);

    if (!stock) {
      await ns.sleep(10000);
      continue;
    }

    const [cost, sell] = buyStock(ns, stock.stock, stock.canBuy);
    bank -= cost;
    ns.print(`Buying ${stock.canBuy} of ${stock.stock} for total of ${f(cost)}`)

    while (true) {
      const bankAfterSell = ns.getStockBidPrice(stock.stock) * stock.canBuy + bank

      const updated = findStockStats(ns, stock.stock, bankAfterSell)
      const bestStock = getBestStock(ns, bankAfterSell);

      if (bestStock?.stock === updated.stock) {
        await ns.sleep(1000);
        continue;
      }

      if (Date.now() - time > 1000 * 60 * 20) {
        ns.print('Breaking because we already spent 20 minutes on this stock')
        break;
      }

      if (bestStock && bestStock.timeToDouble < updated.timeToDouble * .95) {
        ns.print(`Breaking because ${bestStock.stock} has a better value ${bestStock.timeToDouble} vs ${updated.timeToDouble}`)
        break;
      }

      if (ns.getStockForecast(stock.stock) < 0.55) {
        ns.print(`Breaking because forecast fell to ${ns.getStockForecast(stock.stock)} with limit of 0.55`)
        break;
      }
      
      await ns.sleep(1000);
    }

    const sold = sell()
    bank += sold;
    const profit = sold - cost;
    ns.print(`Selling ${stock.stock} at ${f(sold / stock.canBuy)} - Profit: ${f(profit)}`)
  }
};
