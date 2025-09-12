import { AccountType } from '@store/wallet';

// -1:关闭 0:进行中， 1:盈利， 2:亏损， 3:错误
enum OrderStatus {
  Closed = -1,
  Ongoing = 0,
  Profit = 1,
  Loss = 2,
  Error = 3,
}

export interface TimePeriods {
  id: string;
  symbol: string;
  highOdds: number;
  type: number;
  spread: string;
  lowOdds: number;
  time: number;
  status: boolean;
}

export interface BinaryOrderInfo {
  id: string;
  direction: number;
  symbol: string;
  currency: string;
  startTime: number;
  endTime: number;
  delaySeconds: number;
  startPrice: number;
  endPrice: number;
  accountType: AccountType;
  amount: number;
  avatar: string;
  nickName: string;
  profit: number;
  status: OrderStatus;
  profitRate: number;
  roi: number;
  assetBaseImage: string;
  assetQuoteImage: string;
  usdAmount: number;
  usdProfit: number;
  userId: string;
  privateHide: boolean;
  platformName: string;
  useCoupon: string | null;
}

export interface LeaderBoardInfo {
  tradesNum: number;
  winNum: number;
  winRate: number;
  nickName: string;
  avatar: string;
  roi: number;
  usdProfit: number;
  userId: string;
  privateHide: boolean;
  platformName: string;
}
