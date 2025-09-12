import { mock } from 'mockjs';

const reward = mock({
  'items|10': [
    {
      'userId': '@id',
      'currency': 'USDT',
      'amount|1-1000.1-3': 1,
      'username': '@word(16)',
      'avatar': '@dataImage(100x100)',
    },
  ],
});

const tickets = mock({
  'items|100': [
    {
      'activeTicket|100-1000': 0,
      'avatar': '@dataImage(100x100)',
      'coupon': '@id',
      'createTime': '@datetime',
      'prize|1000-10000': 1000,
      'totalPrizeWon|10000-100000': 10000,
      'totalTicket|50-100': 1,
      'totalWinningTicket|1-50': 1,
      'userId': '@id',
      'username': '@word(16)',
    },
  ],
});

const apis: MockSchema[] = [
  {
    url: '/api/promotion/activity/info',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          'endTime': () => {
            const now = new Date();
            const utcTimestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 50);
            return utcTimestamp;
          },
          'id': '@id',
          'name': '@word(16)',
          'startTime': () => {
            const now = new Date();
            const utcTimestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            return utcTimestamp;
          },
          'currentCount|1000-3000': 1000,
          'prizePool|10000-30000': 10000,
          'ticketQuota|100-1000': 100,
          'quota|10-50': 10,
        },
      });
    },
  },
  {
    url: '/api/promotion/activity/daily/contest/detail',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          avatar: '@word(3, 8)',
          'position|1-10': 1,
          'prizePool|100000-100000000': 1,
          'quota|1-100': 1,
          'rankList|10': [
            {
              'percentage|1-100': 1,
              'prize|1000-10000': 1,
              'username': '@word(16)',
              'wager|10000-100000': 1,
            },
          ],
          'toReach|1000-10000': 1,
          username: '@word(16)',
          'wager|1000-10000': 1,
        },
      });
    },
  },
  {
    url: '/api/promotion/activity/daily/contest/rank',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: mock({
          'items|10': [
            {
              'percentage|1-100': 1,
              'prize|1000-10000': 1,
              'username': '@word(16)',
              'wager|10000-100000': 1,
            },
          ],
        }).items,
      });
    },
  },
  {
    url: '/api/promotion/activity/airdrop/reward/list',
    type: 'get',
    response({ url }) {
      const page = new URLSearchParams(url.split('?')[1]).get('page');
      const pageSize = new URLSearchParams(url.split('?')[1]).get('pageSize');
      const current = Number(page) - 1;
      return mock({
        code: 0,
        data: {
          items: reward.items.slice(current * Number(pageSize), current * Number(pageSize) + Number(pageSize)),
          total: reward.items.length,
        },
      });
    },
  },
  {
    url: '/api/transaction/activity/week/ticket/stats',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          'activeTicket|1-100': 1,
          avatar: '@dataImage(100x100)',
          'coupon': '@id',
          createTime: '@datetime',
          'prize|100-1000': 100,
          'totalPrizeWon|10000-100000': 10000,
          'totalTicket|100-1000': 100,
          'totalWinningTicket|1-100': 1,
          userId: '@id',
          username: '@word(16)',
        },
      });
    },
  },
  {
    url: '/api/transaction/activity/week/ticket/list',
    type: 'get',
    response({ url }) {
      const page = new URLSearchParams(url.split('?')[1]).get('page');
      const pageSize = new URLSearchParams(url.split('?')[1]).get('pageSize');
      const current = Number(page) - 1;
      return mock({
        code: 0,
        data: {
          'currentAmount|1000-2000': 1000,
          'ticketAmount|1000-2000': 1000,
          'ticketList': {
            'items': tickets.items.slice(current * Number(pageSize), current * Number(pageSize) + Number(pageSize)),
            'total': tickets.items.length,
          },
          'totalTicket|100-10000': 100,
        },
      });
    },
  },
  {
    url: '/api/transaction/activity/week/ticket/code/list',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          'items|10': ['@id'],
          'total': 10,
        },
      });
    },
  },
  {
    url: '/api/promotion/coupon/list',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: mock({
          'items|10': [
            {
              'id': '@id',
              'userId': '@id',
              'openId': '@id',
              'platform': '@word(16)',
              'amount|10-1000': 10,
              'currency': 'USDT',
              'status': '@pick(["PENDING", "ACTIVE", "EXPIRED", "USED", "CANCEL"])',
              'createTime': '@datetime',
              'expireTime': '@datetime',
              'availableTime': '@datetime',
            },
          ],
        }).items,
      });
    },
  },
  {
    url: '/api/promotion/coupon/active/',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: null,
      });
    },
  },
  {
    url: '/api/promotion/activity/participant',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: mock({
          'items|3': [
            {
              'activityDescription':
                '<span style="font-weight: 600; font-size: 16px; color: #5F6D6D;">Earn up to <span style="color: #24ee89;">100 USDT</span> USDT rewards</span>',
              'activityId': '@id',
              'activityName': '@word(16)',
              'activityType': '@pick(["deposit", "invited", "trade"])',
              'details': {
                'process': '@pick(["1/4", "2/4", "3/4", "4/4"])',
                'status': '@pick(["notCompleted", "completed", "process", "expired"])',
              },
            },
          ],
        }),
      });
    },
  },
  {
    url: '/api/promotion/activity/detail',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          'banner': '@dataImage(100x100)',
          'description': '@word(16)',
          'endTime': '@datetime',
          'id': '@id',
          'name': '@word(16)',
          'rule': '@word(16)',
          'startTime': '@datetime',
        },
      });
    },
  },
  {
    url: '/api/promotion/activity/reward/record',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          'items|10': [
            {
              'amount|1000-10000': 1000,
              'id': '@id',
              'time': '@datetime',
              'type': '@word(16)',
            },
          ],
          total: 10,
        },
      });
    },
  },
  {
    url: '/api/promotion/activity/list',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: mock({
          'items|2': [
            {
              'banner': '@dataImage(100x100)',
              'description': '@word(16)',
              'endTime': '@datetime',
              'id': '@id',
              'name': '@word(16)',
              'rule': '@word(16)',
              'startTime': '@datetime',
            },
          ],
          total: 4,
        }),
      });
    },
  },
];

export default apis;
