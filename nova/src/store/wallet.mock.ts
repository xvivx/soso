import { mock } from 'mockjs';

const betHistory = mock({
  'data|10-200': [
    {
      'id': '@guid',
      'bizId': '@guid',
      'userId': '@guid',
      'currency': 'USDT',
      'source': [],
      'changeAmount|1-1000.1-3': 1,
      'usdAmount|1-1000.1-3': 1,
      'createTime': '@datetime',
      'showType|1': '@pick([1, 2, 3, 4, 6])',
    },
  ],
}).data;

const transaction = mock({
  'data|10-200': [
    {
      'id': '@guid',
      'recordId': '@guid',
      'status|1': '@pick([-1, 1, 2, 3])',
      'crypto': 'USDT',
      'icon': '@dataImage(100x100)',
      'txId': '@string("upper", 64)',
      'fromAddress': '@string("upper", 42)',
      'toAddress': '@string("upper", 42)',
      'changeType|0-1': 0,
      'amount|1-1000.1-3': 1,
      'fee|0.00001-0.1': 1,
      'receiveTime': '@datetime',
      'createTime': '@datetime',
      'userId|@string("number", 9, 12)': 1,
      'showStatus|1': '@pick([-1, 1, 2, 3])',
    },
  ],
}).data;

const other = mock({
  'data|10-200': [
    {
      'id': '@guid',
      'currency': 'USDT',
      'amount|1-1000.1-3': 1,
      'usdAmount|1-1000.1-3': 1,
      'fromUserId': '@guid',
      'toUserId': '@guid',
      'fromUserName': '@word(3, 8)',
      'toUserName': '@word(3, 8)',
      'createTime': '@datetime',
    },
  ],
}).data;

const reward = mock({
  'data|10-200': [
    {
      'id': '@guid',
      'recordId': '@guid',
      'status|1': '@pick([-1, 1, 2, 3])',
      'crypto': 'USDT',
      'icon': '@dataImage(100x100)',
      'txId': '@string("upper", 64)',
      'fromAddress': '@string("upper", 42)',
      'toAddress': '@string("upper", 42)',
      'changeType|0-1': 0,
      'amount|1-1000.1-3': 1,
      'fee|0.00001-0.1': 1,
      'receiveTime': '@datetime',
      'createTime': '@datetime',
      'userId|@string("number", 9, 12)': 1,
      'showStatus|1': '@pick([-1, 1, 2, 3])',
    },
  ],
}).data;

export default <MockSchema[]>[
  {
    url: '/api/account/fiat/payment/deposit/methods',
    type: 'get',
    response() {
      const createMethods = (category: string) => {
        return mock({
          'data|1-3': [
            {
              category,
              'channelId|+1': 1,
              displayName: '@word(3,8)',
              expiredTime: Date.now() + 10 * 60 * 1000,
              feeFixed: 0,
              feePercent: 0,
              icon: '@image(200x100, @color, %20)',
              kycRequirement: 0,
              minLimit: '@integer(100,1000)',
              maxLimit: '@integer(10000,1000000)',
            },
          ],
        }).data;
      };

      return mock({
        code: 0,
        data: mock({
          'data|1-10': ['@word(3,10)'],
        }).data.reduce((data: Record<string, any[]>, curr: string) => {
          data[curr] = createMethods(curr);
          return data;
        }, {}),
      });
    },
  },
  {
    url: '/api/account/fiat/payment/deposit/confirm/form',
    type: 'get',
    response() {
      return mock({
        code: 0,
        'data|3-6': [
          {
            label: '@word(3,6)',
            commonKey: '@word(3,6)',
            hide: false,
            readOnly: false,
            'type|1': ['email', 'select', 'map_select'],
            'mapOptions|2-5': [['@word(3,6)', '@word(3,6)']],
            'options|2-5': ['@word(3,6)'],
            'validPatterns|1-3': [
              {
                validMessage: '@sentence',
                'validRule|1': ['.+'],
              },
            ],
          },
        ],
      });
    },
  },
  {
    url: '/api/account/fiat/payment/deposit/create',
    type: 'post',
    response({ body }) {
      const { amount, currency } = JSON.parse(body);
      return mock({
        code: 0,
        data: {
          amount,
          currency,
          expiredTime: Date.now() + 100 * 60 * 1000,
          createTime: Date.now(),
          updateTime: Date.now() - 100 * 1000,
          channel: '@word(3,7)',
          id: '@integer(1, 100000)',
          qrCode: '@url',
          qrCodeContent: '@url',
          status: 2,
          walletUrl: '@url',
        },
      });
    },
  },
  {
    url: '/api/account/account/biz/list',
    type: 'post',
    response(options) {
      const { page, pageSize } = JSON.parse(options.body);
      return mock({
        code: 0,
        data: {
          items: betHistory.slice((page - 1) * pageSize, page * pageSize + pageSize),
          total: betHistory.length,
        },
      });
    },
  },
  {
    url: '/api/account/payment/v2/list',
    type: 'post',
    response(options) {
      const { page, pageSize } = JSON.parse(options.body);
      return mock({
        code: 0,
        data: {
          items: transaction.slice((page - 1) * pageSize, page * pageSize + pageSize),
          total: transaction.length,
        },
      });
    },
  },
  {
    url: '/api/account/account/tip/list',
    type: 'post',
    response(options) {
      const { page, pageSize } = JSON.parse(options.body);
      return mock({
        code: 0,
        data: {
          items: other.slice((page - 1) * pageSize, page * pageSize + pageSize),
          total: other.length,
        },
      });
    },
  },
  {
    url: '/api/account/account/reward/list',
    type: 'post',
    response(options) {
      const { page, pageSize } = JSON.parse(options.body);
      return mock({
        code: 0,
        data: {
          items: reward.slice((page - 1) * pageSize, page * pageSize + pageSize),
          total: reward.length,
        },
      });
    },
  },
];
