import { AccountType } from '../wallet';

export interface ContractOrderInfo {
  id: string;
  direction: number;
  symbol: string;
  currency: string;
  startTime: number;
  endTime: number;
  startPrice: number;
  endPrice: number;
  amount: number;
  commission: number;
  stopProfitAmount: number;
  stopProfitPrice: number;
  stopLossAmount: number;
  stopLossPrice: number;
  burstPrice: number;
  lever: number;
  status: ContractOrderStatus;
  assetBaseImage: string;
  assetQuoteImage: string;
  profit: number;
  roi: number;
  avatar: string;
  commissionType: CommissionType;
  nickName: string;
  endType: ContractEndType;
  capitalCost: null;
  nextCapitalCost: null;
  accountType: AccountType;
  dataSource: 'ws' | 'http';
  userId: string;
  privateHide: boolean;
  platformName: string;
  useCoupon: string | null;
}

// 合约订单状态
export enum ContractOrderStatus {
  Position = 0,
  Closed = -1,
}

// 合约结束类型
export enum ContractEndType {
  NotEnd = 0, // 未结束
  StopProfit = 1, // 止盈
  StopLoss = 2, // 止损
  CashedOut = 3, // 关闭
  Busted = 4, // 爆仓
  Systemic = 5, // 强制平仓
}

// 手续费类型
export enum CommissionType {
  PNL = 1,
  FLAT = 2,
}

// 玩法2定位订单
export interface OrderPosition {
  id: string;
  show: boolean;
  startPrice?: number;
  bust?: number;
  stopProfit?: number;
  stopLoss?: number;
  symbol: string; // 斜杠, 例如 BTC/USD
}

export interface SymbolPrice {
  name: string;
  title: string;
  precision: number;
  max_multiplier: number;
  bust_buffer: number;
  buffer_multiplier: number;
  max_user_position: number;
  max_pnl_cut_position: number;
  interest_rate: number;
  interest_hours: number;
  interest_threshold: number;
  base_rate: number;
  rate_multiplier: number;
  rate_exponent: number;
  position_multiplier: number;
  fixed_cost: number;
  impact_cost: number;
  impact_speed: number;
  icon_id: string;
  sort_order: number;
}
