import { createContext, memo, PropsWithChildren, useContext } from 'react';
import { SWRResponse } from 'swr';
import { BinaryPresentOrderType } from '@store/binary';
import { BinaryOrderInfo, LeaderBoardInfo, TimePeriods } from '@store/binary/types';
import { SpreadOrderInfo } from '@store/spread/types';
import { OrderFilter } from '@pages/components/GameOrderFilter';

type OrderType = SpreadOrderInfo | BinaryOrderInfo;
type DefinedSWRResponse<T> = SWRResponse<T> & { data: T };
interface ContextValue<OrderT extends OrderType> {
  // High Low、Spread选择的时间组
  selectedTimePeriod?: TimePeriods;
  // High Low、Spread选项卡当前tab
  presentOrderType: BinaryPresentOrderType;
  // High Low、Spread选项卡onChange事件
  onPresentOrderTypeChange: (value: BinaryPresentOrderType) => void;
  onTimePeriodChange: (value: TimePeriods) => void;
  useTimePeriods: () => DefinedSWRResponse<TimePeriods[]>;
  // High Low、Spread下单金额限制
  useAmountLimit: () => DefinedSWRResponse<{ maxAmount: number; minAmount: number; currency: string }>;
  // 公共订单
  usePublicOrders: () => DefinedSWRResponse<OrderT[]>;
  // 历史订单
  useHistoryOrders: () => DefinedSWRResponse<OrderT[]>;
  // High Low、Spread排行榜
  useLeaderBoard: (props: OrderFilter) => DefinedSWRResponse<LeaderBoardInfo[]>;
}

const Context = createContext<ContextValue<any>>();

export function useBinarySpreadContext<OrderT extends OrderType>() {
  return useContext<ContextValue<OrderT>>(Context);
}

function BinarySpreadProvider<OrderT extends OrderType>({
  children,
  ...props
}: PropsWithChildren<ContextValue<OrderT>>) {
  return <Context.Provider value={props}>{children}</Context.Provider>;
}

export default memo(BinarySpreadProvider) as typeof BinarySpreadProvider;
