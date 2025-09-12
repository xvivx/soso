import { Client, Server } from 'mock-socket';
import { mock } from 'mockjs';
import pako from 'pako';
import { store } from '@store';
import { GameStatus, OrderStatus } from '@store/upDown';
import { klineConfig } from '@pages/UpAndDown/common';
import { Direction, WebSocketRequest, WebSocketResponse } from '@/type';

let shouldBroadcastCreateUpDownOrder = true;
let shouldBroadcastUpdateKlineTickerData = true;
let currentUserId = '';
const usePako = true;

export default <MockSchema[]>[
  {
    url: '/api/transaction/updown/order/history/user/get',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          total: 200,
          'items|20-20': [
            {
              accountType: 1,
              'amount|100-10000': 1,
              'usdAmount|100-1000': 1,
              'bonus|100-1000': 1,
              'commission|1-10': 1,
              roundId: '@uuid',
              'currency|1': ['USDT', 'BTC', 'JPA'],
              'direction|1': [Direction.BuyFall, Direction.BuyRise],
              endTime: Date.now(),
              avatar: '@image(100x100, @color)',
              id: '@uuid',
              nickName: '@name',
              openId: '@uuid',
              placeTime: Date.now(),
              'profit|1-100.2': 1,
              startTime: Date.now(),
              'status|1': [OrderStatus.WIN, OrderStatus.LOSS],
              symbol: 'BTC-USD',
              'totalRevenue|1-100': 1,
              userId: '@id',
              startPrice: '@float(50000,70000,6,6)',
              endPrice: '@float(50000,70000,6,6)',
            },
          ],
        },
      });
    },
  },
  {
    url: '/api/transaction/updown/order/history/\\d+/.+/get',
    type: 'get',
    response() {
      shouldBroadcastCreateUpDownOrder = true;

      return mock({
        code: 0,
        'data|100-200': [
          {
            id: '@guid',
            'roundId|+1': 1,
            symbol: 'BTC/USDT',
            status: OrderStatus.IN,
            'direction|1': [Direction.BuyRise, Direction.BuyFall],
            currency: 'USDT',
            userId: '@guid',
            startTime: Date.now() - 10 * 1000,
            endTime: Date.now() + 20 * 1000,
            placeTime: Date.now(),
            'amount|1-1000.1-3': 1,
            'usdAmount|1-1000.1-3': 1,
            avatar: '@dataImage(100x100, )',
            nickName: '@word(3, 8)',
          },
        ],
      });
    },
  },
  {
    url: '/api/contestOrder/create',
    type: 'post',
    response() {
      return { code: 0 };
    },
  },
  {
    url: '/api/data/kline/history/ticker/latest\\?',
    type: 'get',
    response(config) {
      const symbol = new URLSearchParams(config.url.split('?')[1]).get('symbol');
      const now = Date.now();
      const length = 200;
      const res = mock({
        code: 0,
        [`data|${length}-${length}`]: [
          {
            'p|39000-41000.1-5': 1,
            s: symbol,
            t: 0,
            type: 'kline',
          },
        ],
      });

      res.data = res.data.map((it: { s: string; p: string; t: number }, index: number) => {
        it.p = String(it.p);
        it.t = now - (length - index - 1) * klineConfig.itemInterval;
        return it;
      });

      shouldBroadcastUpdateKlineTickerData = true;
      return res;
    },
  },
  {
    url: '/api/transaction/updown/order/statistics',
    type: 'get',
    response() {
      return mock({
        code: 0,
        data: {
          livePlayers24H: '@natural(100, 200)',
          'totalWinPaidAmount|10000-100000.1-3': 1,
          'userWinRatio24H|50-100.1-2': 1,
          'winPaidAmount24H|1000-10000.1-3': 1,
        },
      });
    },
  },
  {
    url: '/api/transaction/updown/order/create',
    type: 'post',
    response() {
      currentUserId = store.getState().user.info.id;
      setTimeout(() => {
        currentUserId = '';
      }, 1000);

      return {
        code: 0,
      };
    },
  },
  {
    url: '/api/transaction/updown/order/rankings',
    type: 'get',
    response() {
      return mock({
        code: 0,
        'data|20-20': [
          {
            avatar: '@dataImage(100x100, )',
            nickName: '@name',
            totalProfit: /1\d{1,2}\.\d{2}/,
            userId: '@uuid',
            'tradeTimes|1-100': 1,
            'winTimes|1-100': 1,
            'winRate|0-1.2': 1,
          },
        ],
      });
    },
  },
  {
    url: '/api/transaction/updown/symbolPeriod/list',
    type: 'get',
    response(config) {
      // 从请求参数中获取symbol
      const symbol = new URLSearchParams(config.url.split('?')[1]).get('symbol');

      if (!symbol) {
        return {
          code: 400,
          message: 'Symbol parameter is required',
        };
      }

      // 为请求的symbol生成游戏规则列表
      const periods = [5, 10, 15, 30, 60];
      const rules = periods.slice(0, mock('@natural(1, 5)')).map((period) => ({
        symbol: symbol,
        period: period,
        label: `${symbol.split('/')[0].toLowerCase()}_${period}`,
        sort: mock('@natural(1, 10)'),
        vip: mock('@boolean'),
        minAmount: mock('@natural(1, 20)'),
        maxAmount: mock('@natural(50, 1000)'),
      }));

      return {
        code: 0,
        data: rules,
      };
    },
  },
  {
    url: '/api/transaction/updown/order/active/\\d+/.+/get',
    type: 'get',
    response() {
      return mock({
        code: 0,
        'data|0-5': [
          {
            id: '@guid',
            'roundId|+1': 1,
            symbol: 'BTC/USDT',
            status: OrderStatus.IN,
            'direction|1': [Direction.BuyRise, Direction.BuyFall],
            currency: 'USDT',
            userId: '@guid',
            startTime: () => Date.now(),
            endTime: () => Date.now() + 20 * 1000,
            placeTime: '@datetime',
            'amount|1-1000.1-3': 1,
            'usdAmount|1-1000.1-3': 1,
            'profit|1-100.2': 1,
            'totalRevenue|1-100': 1,
            startPrice: '@float(39000,41000,3,5)',
            endPrice: '@float(39000,41000,3,5)',
            avatar: '@dataImage(100x100)',
            nickName: '@word(3, 8)',
          },
        ],
      });
    },
  },
];

const mockServer = new Server(import.meta.env.REACT_APP_TRADE_WS);
const timers: Record<string, NodeJS.Timeout | undefined> = {
  game: undefined,
  kline: undefined,
  order: undefined,
  amountPool: undefined,
};

mockServer.on('connection', (socket) => {
  closed = false;
  socket.on('message', (data) => {
    const buffer = pako.inflate(data as Uint8Array);
    const decoder = new TextDecoder();
    const wsReq = JSON.parse(decoder.decode(buffer)) as WebSocketRequest;

    // 处理不同类型的订阅
    if (wsReq.cmd.includes('/contest/') && wsReq.cmd.includes('/ticker/subscribe')) {
      // game订阅处理
      closed = true;
      clearTimeout(timers.game);
      timers.game = setTimeout(() => {
        closed = false;
        // 从订阅命令中提取symbol和period
        const parts = wsReq.cmd.split('/');
        const symbol = `${parts[2]}/${parts[3]}`; // 已经是完整的 "BTC/USDT" 格式
        const period = parts[4]; // 获取period

        // 构造正确的命令路径，不要重复添加 USDT
        broadcast(updateGame.bind(null, socket, `/contest/${symbol}/${period}/ticker`));
      }, 500);
    } else if (wsReq.cmd.includes('/newOrder/subscribe')) {
      // order订阅处理
      const [, , gameLabel] = wsReq.cmd.split('/');
      clearTimeout(timers.order);
      timers.order = setTimeout(() => {
        broadcast(createUpDownOrder.bind(null, socket, `/contest/${gameLabel}/newOrder`), 300);
      }, 500);
    } else if (wsReq.cmd.includes('/kline/') && wsReq.cmd.includes('/ticker/subscribe')) {
      // kline订阅处理
      closed = true;
      clearTimeout(timers.kline);
      timers.kline = setTimeout(() => {
        closed = false;
        const [, , symbol] = wsReq.cmd.split('/');
        broadcast(updateKline.bind(null, socket, `/kline/${symbol}/ticker`), klineConfig.itemInterval);
      }, 500);
    } else if (wsReq.cmd.includes('/amountPool/subscribe')) {
      // amountPool订阅处理
      const [, , gameLabel] = wsReq.cmd.split('/');
      clearTimeout(timers.amountPool);
      timers.amountPool = setTimeout(() => {
        broadcast(updateAmountPool.bind(null, socket, `/contest/${gameLabel}/amountPool`));
      }, 500);
    }
  });
});

mockServer.on('close', () => {
  closed = true;
  Object.values(timers).forEach((timer) => clearTimeout(timer));
  console.warn('断开连接');
});

const encoder = new TextEncoder();
export function formatWsResponse(data: WebSocketResponse) {
  const encodeJson = encoder.encode(JSON.stringify(data));

  if (usePako) {
    return pako.deflate(encodeJson);
  }

  return encodeJson;
}

// 下单推送
function createUpDownOrder(socket: Client, cmd: string) {
  if (!shouldBroadcastCreateUpDownOrder || status === GameStatus.PAY_OUT || status === GameStatus.FINISHED) return;

  socket.send(
    new Blob([
      formatWsResponse({
        cmd,
        status: 200,
        error: '',
        resp: mock({
          id: '@guid',
          'roundId|+1': 1,
          symbol: 'BTC/USDT',
          status: OrderStatus.IN,
          'direction|1': [Direction.BuyRise, Direction.BuyFall],
          currency: 'USDT',
          userId: currentUserId || '@guid',
          startTime: Date.now() - 10 * 1000,
          endTime: Date.now() + 20 * 1000,
          placeTime: Date.now(),
          'amount|1-1000.1-3': 1,
          'usdAmount|1-1000.1-3': 1,
          avatar: '@dataImage(100x100, )',
          nickName: '@word(3, 8)',
        }),
      }),
    ])
  );
}

let serverTime = Date.now();
let status = GameStatus.STARTED;
let id = 1;
let startPrice = 0;
let endPrice = 0;
let winSide: Direction | undefined;
let closed = false;
// 控制游戏节奏
const diff = 20 * 1000;
const startPriceTime = 40 * 1000 - diff; // 停止下注时间点
const endPriceTime = 45 * 1000 - diff; // 结算时间点
const tradeCutoffTime = 50 * 1000 - diff; // 游戏结束时间点
const gameEndTime = 52 * 1000 - diff; // 准备开始新一轮时间点
const nextGameTime = 55 * 1000 - diff; // 新一轮开始时间点
// 游戏推送
function updateGame(socket: Client, cmd: string) {
  const parts = cmd.split('/');
  const period = parseInt(parts[4]); // 获取period并转为数字
  const symbol = `${parts[2]}/${parts[3]}`; // 重建完整的symbol (例如 "BTC/USDT")

  // 构造正确的响应cmd路径，确保包含period
  const responseCmd = `/contest/${symbol}/${period}/ticker`;

  const currentTime = Date.now();
  const contestStartTime = serverTime;
  const statusChangeTime = serverTime + endPriceTime + 1000; // 状态变化时间点，设为结算后1秒

  if (currentTime - serverTime > nextGameTime) {
    // 重置游戏，开始新一轮
    id++;
    serverTime = currentTime;
    winSide = undefined;
    endPrice = 0;
    startPrice = 0;
    status = GameStatus.STARTED;
  } else if (currentTime - serverTime > gameEndTime) {
    // 游戏结束后，准备开始新一轮
    status = GameStatus.READY_TO_START;
  } else if (currentTime - serverTime > tradeCutoffTime) {
    // 游戏结束
    status = GameStatus.FINISHED;
  } else if (currentTime - serverTime > endPriceTime) {
    // 结算阶段
    status = GameStatus.PAY_OUT;
    endPrice = mock('@float(39000, 41000, 3, 5)');
    winSide = endPrice > startPrice ? Direction.BuyRise : Direction.BuyFall;
  } else if (currentTime - serverTime > startPriceTime) {
    // 停止下注
    status = GameStatus.CUTOFF_TRADE;
    startPrice = mock('@float(39000, 41000, 3, 5)');
  } else {
    // 游戏开始，可以下注
    status = GameStatus.STARTED;
    winSide = undefined;
  }

  socket.send(
    new Blob([
      formatWsResponse({
        cmd: responseCmd,
        status: 200,
        error: '',
        resp: {
          id,
          symbol,
          period,
          contestStartTime,
          currentTime,
          priceStartTime: serverTime + startPriceTime,
          tradeCutoffTime: serverTime + tradeCutoffTime,
          priceEndTime: serverTime + endPriceTime,
          statusChangeTime,
          status,
          startPrice,
          endPrice,
          winSide,
          first5sDownPoolAmount: mock('@natural(10, 1000)'),
          second5sDownPoolAmount: mock('@natural(10, 1000)'),
          first5sUpPoolAmount: mock('@natural(10, 1000)'),
          second5sUpPoolAmount: mock('@natural(10, 1000)'),
          previousRoundResult: mock({
            'history|3-6': [
              {
                id: '@guid',
                'roundId|+1': () => Date.now() - mock('@natural(1000, 100000)'),
                'winSide|1': [Direction.BuyFall, Direction.BuyRise],
                'startPrice|39000-40000.3-4': 1,
                'endPrice|39000-40000.3-4': 1,
              },
            ],
          }).history,
        },
      }),
    ])
  );
}

function updateKline(socket: Client, cmd: string) {
  if (!shouldBroadcastUpdateKlineTickerData) return;

  socket.send(
    new Blob([
      formatWsResponse({
        cmd,
        code: 0,
        status: 200,
        error: '',
        resp: mock({
          c: '',
          'p|39000-41000.3-5': 1,
          s: 'BTC-USD',
          t: Date.now(),
        }),
      }),
    ])
  );
}

// 资金池更新推送
function updateAmountPool(socket: Client, cmd: string) {
  socket.send(
    new Blob([
      formatWsResponse({
        cmd,
        status: 200,
        error: '',
        resp: mock({
          id: '@guid',
          symbol: 'BTC/USDT',
          period: '@natural(5, 60)',
          'upPoolAmount|1000-10000': 1,
          'downPoolAmount|1000-10000': 1,
          'first5sUpPoolAmount|100-1000': 1,
          'first5sDownPoolAmount|100-1000': 1,
          'second5sUpPoolAmount|100-1000': 1,
          'second5sDownPoolAmount|100-1000': 1,
        }),
      }),
    ])
  );
}

function broadcast(call: Function, interval?: number, timer?: NodeJS.Timeout) {
  if (closed) {
    clearTimeout(timer);
    return;
  }

  call();
  clearTimeout(timer);
  timer = setTimeout(
    () => {
      broadcast(call, interval, timer);
    },
    interval || mock('@natural(1000, 3000)')
  );
}
