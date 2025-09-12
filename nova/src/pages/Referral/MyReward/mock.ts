// src/pages/Referral/MyReward/mock.ts
import { mock } from 'mockjs';

const apis: MockSchema[] = [
  // 获取统计信息
  {
    url: '/api/promotion/referralCommission/info',
    type: 'get',
    response: mock({
      code: 0,
      data: {
        'totalCommission|1000-10000.2': 1000,
        'balance|100-1000.2': 100,
      },
    }),
  },

  // 获取列表数据
  {
    url: '/api/promotion/referralCommission/details',
    type: 'get',
    response: mock({
      code: 0,
      data: {
        'total|100': 100,
        'items|20': [
          {
            'id|+1': 1,
            'userId': '@id',
            'userName': '@name',
            'totalCommission|100-1000.2': 100,
            'wagered|1000-10000.2': 1000,
            'referredAt': '@datetime',
          },
        ],
      },
    }),
  },

  // 提现接口
  {
    url: '/api/promotion/referralCommission/withdraw',
    type: 'post',
    response: mock({
      code: 0,
      data: true,
    }),
  },
];

export default apis;
