import { useDispatch } from 'react-redux';
import { CommissionType, setPresentOrderType, useActiveTradingPair, useLever } from '@store/contract';
import { useCurrency } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { getServerTime, request } from '@utils/axios';
import { createOrderToken } from '@utils/others';
import { Direction } from '@/type';
import { type AutoTakeProfitAndLLossRef } from './AutoTakeProfitAndLLoss';
import { type OrderType } from './OderTypes';

type TakeProfitAndLLoss = ReturnType<AutoTakeProfitAndLLossRef['getValue']>[0];
export default function usePlaceOrder() {
  const dispatch = useDispatch();
  const currency = useCurrency();
  const multiplier = useLever();
  const currentCurrencyPairInfo = useActiveTradingPair();

  return useMemoCallback(async function placeOrder(
    orderType: OrderType,
    amount: number,
    direction: Direction,
    feeType: CommissionType,
    extraParams?: number | TakeProfitAndLLoss
  ) {
    const params = {
      amount: amount,
      currency: currency.name,
      direction,
      symbol: currentCurrencyPairInfo.symbol,
      lever: Number(multiplier),
      commissionType: feeType,
    };

    if (orderType === 'MARKET') {
      await request.post(`/api/transaction/contractOrder/create`, params, {
        headers: { ['X-Token']: createOrderToken(getServerTime()) },
      });
      dispatch(setPresentOrderType('MARKET'));
    } else if (orderType === 'TP/SL') {
      const { closeAtProfit, takeAtProfit } = extraParams as TakeProfitAndLLoss;
      await request.post(
        `/api/transaction/contractOrder/create`,
        {
          ...params,
          stopLossAmount: -1 * Number(closeAtProfit) || null,
          stopProfitAmount: Number(takeAtProfit) || null,
        },
        {
          headers: { ['X-Token']: createOrderToken(getServerTime()) },
        }
      );
      dispatch(setPresentOrderType('MARKET'));
    }
  });
}
