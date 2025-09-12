import { mock } from 'mockjs';

export default <MockSchema[]>[
  {
    url: '/api/account/account/asset',
    type: 'get',
    response() {
      const data = mock({
        'data|50-100': [
          {
            'asset|1000-10003.1-3': 1,
          },
        ],
      }).data as { asset: number }[];
      const now = Date.now();
      return {
        code: 0,
        data: data.map((item, index) => ({ ...item, time: now + index * 1000 })),
      };
    },
  },
];
