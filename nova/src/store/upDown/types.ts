import { AccountType } from '@store/wallet';
import { Direction } from '@/type';

export type KlineItem = [time: number, price: number];

export interface UpDownState {
  wager: string;
  game: Game;
  klineData: KlineItem[];
  loading: boolean;
  amountPool: IAmountPool;
  presentOrderType: 'POSITIONS' | 'HISTORY' | 'LEADERBOARD';
}

export enum OrderStatus {
  /** 进行中 */
  IN = 0,
  WIN = 1,
  LOSS = 2,
  // 错误
  ERROR = 3,
  // 取消
  CANCEL = 4,
  // 已扣款
  CHARGED = 5,
}

export interface Order {
  id: string;
  roundId: number;
  symbol: string;
  status: OrderStatus;
  direction: Direction;
  currency: string;
  userId: string;
  startTime?: number;
  endTime?: number;
  placeTime: number;
  amount: number;
  usdAmount: number;
  avatar: string;
  nickName: string;
  privateHide: boolean;
  useCoupon: string | null;
  accountType: AccountType;
  openId: string;
  profit: number;
  totalRevenue: number;
  startPrice: number;
  endPrice: number;
}

export enum GameStatus {
  UNKNOWN_STATUS = 0,
  STARTED = 1001,
  CUTOFF_TRADE = 1003,
  START_PAY_OUT = 1002,
  PAY_OUT = 1004,
  FINISHED = 1005,
  READY_TO_START = 1006,
  CANCEL = 1007,
}

export type Game = {
  id: string;
  currentTime: number;
  tradeCutoffTime: number;
  priceStartTime: number;
  priceEndTime: number;
  status: GameStatus;
  platformName: string;
  first5sDownPoolAmount: number;
  second5sDownPoolAmount: number;
  first5sUpPoolAmount: number;
  second5sUpPoolAmount: number;
  startPrice?: number;
  endPrice?: number;
  winSide?: Direction;
  previousRoundResult: {
    id: number;
    winSide: Direction;
    startPrice: number;
    endPrice: number;
  }[];
};

export interface SettingState {
  symbol: string;
  timePeriod: number;
  mode: 'candle' | 'turbo' | 'normal';
}

/**
 * @interface GameRule
 * @description 游戏玩法配置接口
 */
export interface IGameRule {
  /** 交易对符号 */
  symbol: string;
  /** 游戏周期 */
  period: number;
  /** 显示标签 */
  label: string;
  /** 排序 */
  sort: number;
  /** 是否需要VIP */
  vip: boolean;
  /** 最小投注金额 */
  minAmount: number;
  /** 最大投注金额 */
  maxAmount: number;
  /** 当前币种 */
  currency: string;
  id: string;
  /** 优先级 - 兼容旧代码 */
  // priority?: number;
}

/**
 * @interface Symbol
 * @description 交易对信息接口
 */

export interface IAmountPool {
  id: string;
  symbol: string;
  period: string;
  upPoolAmount: number;
  downPoolAmount: number;
}
