import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BinaryOrderInfo } from '@store/binary/types';
import { type SpreadOrderInfo } from '@store/spread/types';
import { useSymbolPricesMap } from '@store/symbol';
import { Settings } from '@store/system';
import Table, { Column } from '@components/Table';
import { cn, formatter } from '@utils';
import { GameTypeNumber } from '@/type';
import { useGameContext } from '../../components/GameProvider';
import { OrderProgress } from './OrderProgress';
import useTableCommonColumns from './useTableCommonColumns';
import { calcBinaryProfit, calcSpreadProfit } from './util';

// 实时订单
function ActiveBets<T extends BinaryOrderInfo | SpreadOrderInfo>() {
  const { usePositionOrders } = useGameContext<Settings, T>();
  const { t } = useTranslation();
  const data = usePositionOrders();
  const commons = useTableCommonColumns<T>();

  const columns = useMemo<Column<T>[]>(() => {
    return [
      ...commons.slice(0, -3),
      {
        title: t('Yield'),
        dataIndex: 'profitRate',
        align: 'right',
        render: (order) => order.profitRate + '%',
      },
      {
        title: t('Profit'),
        dataIndex: 'profit',
        width: 80,
        align: 'right',
        render(order) {
          return <Profit order={order} />;
        },
      },
      // {
      //   title: t('order id'),
      //   dataIndex: 'id',
      //   align: 'right',
      // },
      {
        title: t('Time'),
        dataIndex: 'time',
        render: (order) => <OrderProgress duration={order.delaySeconds} startTime={order.startTime} />,
      },
    ];
  }, [commons, t]);

  return <Table<T> columns={columns} dataSource={data} />;
}

const Profit = memo(<T extends BinaryOrderInfo | SpreadOrderInfo>(props: { order: T }) => {
  const { order } = props;
  const { type, symbols } = useGameContext();
  const klineMap = useSymbolPricesMap();
  const tradingPairName = order.symbol;
  const tradingPairInfo = useMemo(
    () => symbols.find((tradingPair) => tradingPair.symbol === tradingPairName),
    [tradingPairName, symbols]
  );
  if (!klineMap[tradingPairName] || !tradingPairInfo) return 0;
  const currentPrice = formatter.price(klineMap[tradingPairName].p, tradingPairInfo.decimalPlaces).toNumber();
  const profit =
    type === GameTypeNumber.Binary
      ? calcBinaryProfit(order as BinaryOrderInfo, currentPrice)
      : calcSpreadProfit(order as SpreadOrderInfo, currentPrice);
  return (
    <div className={cn(Number(profit) > 0 ? 'text-up' : 'text-down')}>
      {formatter.amount(profit, order.currency).toText(true)}
    </div>
  );
});

export default memo(ActiveBets);
