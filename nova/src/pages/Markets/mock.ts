import { mock } from 'mockjs';
import { CandleResponse } from '@store/symbol';

// 生成连续的K线数据
function generateCandlestickData(symbol: string, count: number): CandleResponse[] {
  const result: CandleResponse[] = [];
  const basePrice = mock('@float(4000, 6000, 5, 5)'); // 基础价格
  let currentTime = Date.now() - count * 3600000; // 从当前时间往前推

  for (let i = 0; i < count; i++) {
    const open = mock(`@float(${basePrice * 0.95}, ${basePrice * 1.05}, 5, 5)`);
    const close = mock(`@float(${basePrice * 0.95}, ${basePrice * 1.05}, 5, 5)`);
    const high = (Math.max(open, close) * 1.05).toFixed(5);
    const low = (Math.min(open, close) * 0.95).toFixed(5);
    const change = mock('@float(0, 1, 2, 2)');

    result.push({
      c: close.toString(),
      h: high.toString(),
      l: low.toString(),
      o: open.toString(),
      p: change,
      s: symbol,
      t: currentTime,
    });

    currentTime += 3600000; // 每小时一个数据点
  }
  return result;
}

const markets = mock({
  'data|1-10': [
    {
      candlestickData: function () {
        return generateCandlestickData(this.symbol, 24);
      },
      errorMessage: '',
      status: '@pick(["SUCCESS", "PARTIAL_SUCCESS", "FAILED"])',
      symbol: '@pick(["BTC-USD", "ETH-USD", "BNB-USD", "SOL-USD", "XRP-USD"])',
      symbolDetail: {
        'amplitude': '@float(0.5, 15, 2, 4)',
        'highPrice': '@float(5000, 6000, 5, 5)',
        'lowPrice': '@float(4000, 5000, 5, 5)',
        'maxLeverage': '@integer(1, 1000)',
        'price': '@float(4000, 6000, 5, 5)',
        'symbol': 'ETH/USD',
        'volume': '@float(1000, 10000000, 2, 2)',
      },
    },
  ],
}).data;

export default <MockSchema[]>[
  {
    url: '/api/data/tradePairConfig/symbolSummary',
    type: 'get',
    response({ url }) {
      const params = new URLSearchParams(url.split('?')[1]);
      const page = Number(params.get('page')) - 1;
      const pageSize = Number(params.get('pageSize'));

      return mock({
        code: 0,
        data: {
          items: markets.slice(page * pageSize, page * pageSize + pageSize),
          total: markets.length,
        },
      });
    },
  },
];
