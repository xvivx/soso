import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { useCurrency } from '@store/wallet';
import { message } from '@components';
import { getServerTime, request } from '@utils/axios';
import { createOrderToken } from '@utils/others';
import { useGameContext } from '@pages/components/GameProvider';
import { Direction, GameTypeNumber } from '@/type';
import { useBinarySpreadContext } from '../BinarySpreadProvider';

// 定义订单参数类型
type OrderParams = {
  amount: number;
  currency: string;
  delaySeconds: number;
  direction: Direction;
  playType: number;
  symbol: string;
};

function usePlaceOrder(amount: number) {
  const { type: gameType, selectedSymbolPair } = useGameContext();
  const { selectedTimePeriod, onPresentOrderTypeChange } = useBinarySpreadContext();
  const { name: currency } = useCurrency();
  const { t } = useTranslation();
  const isBinary = gameType === GameTypeNumber.Binary;

  // 处理订单响应
  const handleOrderResponse = async (params: OrderParams) => {
    try {
      await request.post(
        isBinary ? '/api/transaction/binaryOrder/create' : '/api/transaction/binarySpreadOrder/create',
        params,
        {
          headers: {
            ['X-Token']: createOrderToken(getServerTime()),
          },
        }
      );
      message.success(t('Order placed successfully!'));
      onPresentOrderTypeChange('POSITIONS');
    } catch (error) {
      if (error.code === 20037) {
        // 赔率发生变化, 刷新赔率列表, 这里不用弹出error msg, 全局axios已做提示
        mutate((key: string[]) => key && key[0] === (isBinary ? 'binary-odds-list' : 'spread-odds-list'));
      }
    }
  };

  const onPlace = async (direction: Direction) => {
    await Promise.all([
      await handleOrderResponse({
        amount,
        currency,
        delaySeconds: selectedTimePeriod!.time,
        direction,
        playType: 0,
        symbol: selectedSymbolPair.symbol,
      }),
      // 后端要求强制500ms后才能下单
      foreWait(500),
    ]);
  };

  return onPlace;
}

export default usePlaceOrder;

function foreWait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
