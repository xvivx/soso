import { mock } from 'mockjs';

export default <MockSchema[]>[
  {
    url: '/api/transaction/symbol/tapConfig/list',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: [
          {
            symbol: 'BTC/USD',
            priceIncrement: 9,
            timeIncrement: 5,
          },
        ],
      });
    },
  },
  {
    url: '/api/transaction/tapOrder/create',
    type: 'post',
    response({ body }) {
      return mock({
        code: 0,
        data: {
          ...JSON.parse(body),
          id: '@uuid',
        },
      });
    },
  },
];
