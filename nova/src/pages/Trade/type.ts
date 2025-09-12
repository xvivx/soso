import { AccountType } from '@store/wallet';
import { Direction } from '@/type';

// 二元订单筛选
export interface BinaryOrderForm {
  sort: string;
  timeType: string;
}

// -1:关闭 0:进行中， 1:盈利， 2:亏损， 3:错误
export enum OrderStatus {
  Closed = -1,
  Ongoing = 0,
  Profit = 1,
  Loss = 2,
  Error = 3,
}

export type Filters = {
  page: number;
  pageSize: number;
  status: OrderStatus;
  // 货币对
  symbol?: string;
  direction?: Direction;
  currency?: string;
  start?: number;
  end?: number;
  isPublic?: boolean; //是否公有订单
  accountType?: AccountType;
};
