import { mock, setup } from 'mockjs';
import chatApis from '@store/chat/mock';
import notifyApis from '@store/notification/mock';
import tapApis from '@store/tap/mock';
import upAndDownApis from '@store/upDown/mock';
import walletApis from '@store/wallet.mock';
import activityInfoApis from '@pages/Campaign/mock';
import marketsApis from '@pages/Markets/mock';
import personalApis from '@pages/Personal/mock';
import referralApis from '@pages/Referral/MyReward/mock';

const mockApis: MockSchema[] = [
  {
    url: '/api/account/exchange/rate\\?',
    type: 'get',
    response({ url }) {
      const symbol = new URLSearchParams(url.split('?')[1]).get('symbol');

      return mock({
        code: 0,
        data: {
          'rate|1.3': 1,
          currency: `${symbol}-USD`,
        },
      });
    },
  },
  {
    url: '/api/transaction/contractOrder/getLimitData',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          minAmount: 0.1,
          maxAmount: 99,
        },
      });
    },
  },
  {
    url: '/api/transaction/symbol/list',
    type: 'get',
    response({ url }) {
      const params = new URLSearchParams(url.split('?')[1]);
      const type = params.get('type');
      const symbols =
        type === '4'
          ? [
              'BTC/USD',
              'ETH/USD',
              'SOL/USD',
              'DOGE/USD',
              'XRP/USD',
              'ADA/USD',
              'MATIC/USD',
              'DOT/USD',
              'LINK/USD',
              'UNI/USD',
              'AVAX/USD',
              'ATOM/USD',
            ]
          : ['BTC/USD'];

      return mock({
        code: 0,
        data: symbols.map((symbol, index) => {
          const [base] = symbol.split('/');
          return {
            symbol,
            assetBaseImage: `https://currency-trade.s3.ap-east-1.amazonaws.com/icons/${base}.png`,
            assetQuoteImage: 'https://currency-trade.s3.ap-east-1.amazonaws.com/icons/USD.png',
            id: String(index + 1),
            orderStatus: true,
            onlineStatus: true,
            decimalPlaces: 2,
            type: Number(type) || 1,
          };
        }),
      });
    },
  },
];

setup({
  timeout: 300,
});

function start() {
  [
    upAndDownApis,
    mockApis,
    referralApis,
    activityInfoApis,
    personalApis,
    notifyApis,
    chatApis,
    walletApis,
    tapApis,
    marketsApis,
  ].forEach((apis) => {
    apis.forEach((api) => {
      mock(new RegExp(api.url), api.type || 'get', api.response || api.template || (() => ''));
    });
  });
}

start();
