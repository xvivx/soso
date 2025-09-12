import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContractOrderInfo, usePositionOrderActions } from '@store/contract';
import { usePositionOrders } from '@store/contract/services';
import { useSymbolPricesMap } from '@store/symbol';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, Column, Empty, Image, Loading, SvgIcon, Table } from '@components';
import { formatter } from '@utils';
import { useGameTradingPairsMap } from '@pages/components/GameProvider';
import OrderCoupon from '@pages/components/OrderCoupon';
import { PositionOrder as MobilePositionOrder } from './MobileOrderCard';
import { useCashOut } from './PositionsCashOut';
import FundingCol from './PositionsFundingHour';
import ProfitAndLossInfo from './ProfitAndLossInfo';
import useActiveBetsPnlAndRoi from './useActiveBetsPnlAndRoi';
import useUpdateProfitAndLoss from './useUpdateProfitAndLoss';

function PositionOrders() {
  const { mobile } = useMediaQuery();
  const Component = mobile ? MobilePositionOrders : PcPositions;
  return <Component />;
}

export default memo(PositionOrders);

function MobilePositionOrders() {
  const tickerPrices = useSymbolPricesMap();
  const { data: orders, isLoading: loading } = usePositionOrders();
  const calcPnlAndRoi = useActiveBetsPnlAndRoi();
  const [updateProfitAndLoss, contextHolder] = useUpdateProfitAndLoss();
  return (
    <>
      {loading && <Loading />}

      {orders.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-6 divide-y divide-thirdly">
          {orders.map((order) => {
            const tickerPrice = tickerPrices[order.symbol] ? tickerPrices[order.symbol].p : 0;
            const pnlAndRoi = calcPnlAndRoi(order);
            return (
              <MobilePositionOrder
                key={order.id}
                order={order}
                tickerPrice={tickerPrice}
                pnlAndRoi={pnlAndRoi}
                onUpdateProfitAndLoss={updateProfitAndLoss}
              />
            );
          })}
        </div>
      )}

      {contextHolder}
    </>
  );
}

function PcPositions() {
  const { t } = useTranslation();
  const tradingPairsMap = useGameTradingPairsMap();
  const { data: orders, isLoading: loading } = usePositionOrders();
  const [selectRow, setSelectRow] = useState<{ id: string; show: boolean } | null>(null);
  const [updateProfitAndLoss, contextHolder] = useUpdateProfitAndLoss();
  const tickerPrices = useSymbolPricesMap();

  // 计算利润要传用户所有进行中的订单
  const calcPnlAndRoi = useActiveBetsPnlAndRoi();
  const cashOutAction = useCashOut();
  const { onPositionOrder } = usePositionOrderActions();

  // 点击行的处理函数
  const handleRowClick = useMemoCallback((row: ContractOrderInfo) => {
    const sameRow = selectRow?.id === row.id;
    onPositionOrder({
      id: row.id,
      show: sameRow ? !selectRow.show : true,
      startPrice: row.startPrice,
      bust: row.burstPrice,
      stopLoss: row.stopLossPrice,
      stopProfit: row.stopProfitPrice,
      symbol: row.symbol,
    });
    setSelectRow({ id: row.id, show: sameRow ? !selectRow.show : true });
  });

  // PC 端表格列配置
  const columns = useMemo<Column<ContractOrderInfo>[]>(() => {
    return [
      {
        title: t('Symbol'),
        dataIndex: 'symbol',
        render: ({ assetBaseImage, symbol }) => (
          <div className="flex items-center gap-2 text-14">
            <Image src={assetBaseImage} className="rounded-full size-4" />
            <span>
              {symbol.split('/')[0]}
              <span className="text-secondary">/USDT</span>
            </span>
          </div>
        ),
      },
      {
        title: t('Side'),
        dataIndex: 'direction',
        render: ({ direction }) => <SvgIcon.Updown className="size-6" direction={direction} />,
      },
      {
        title: t('Leverage'),
        dataIndex: 'lever',
        render: ({ lever }) => <span className="text-14 font-500">{lever}X</span>,
      },
      {
        title: t('Size'),
        dataIndex: 'price',
        align: 'right',
        render: ({ amount, lever, currency }) => formatter.amount(amount * lever, currency).toText(true),
      },
      {
        title: t('Currency'),
        dataIndex: 'currency',
        align: 'right',
      },
      {
        title: t('Floating PnL'),
        dataIndex: 'pnl',
        align: 'right',
        width: 180,
        render(order) {
          const pnlAndRoi = calcPnlAndRoi(order);
          return <ProfitAndLossInfo order={order} profit={pnlAndRoi.pnl} />;
        },
      },
      {
        title: t('Floating PnL') + '%',
        dataIndex: 'pnl%',
        align: 'right',
        render(order) {
          const { roi } = calcPnlAndRoi(order);
          return <span className={roi < 0 ? 'text-down' : 'text-up'}>{formatter.percent(roi, true)}</span>;
        },
      },
      {
        title: t('Mark price'),
        dataIndex: 'markPrice',
        width: 110,
        align: 'right',
        render: ({ symbol }) =>
          formatter.price(tickerPrices[symbol]?.p, tradingPairsMap[symbol]?.decimalPlaces).toText(),
      },
      {
        title: t('Entry price'),
        dataIndex: 'startPrice',
        align: 'right',
        render({ startPrice, symbol }) {
          return formatter.price(startPrice, tradingPairsMap[symbol]?.decimalPlaces).toText();
        },
      },
      {
        title: t('Amount'),
        dataIndex: 'amount',
        align: 'right',
        render: ({ amount, currency, useCoupon }) => (
          <div className="flex items-center justify-end gap-2">
            {useCoupon && <OrderCoupon />}
            <div>{formatter.amount(amount, currency).toText(true)}</div>
          </div>
        ),
      },
      {
        title: t('Liq.price'),
        dataIndex: 'burstPrice',
        align: 'right',
        render: ({ burstPrice, symbol }) => {
          return (
            <span className="text-warn text-14">
              {formatter.price(burstPrice, tradingPairsMap[symbol]?.decimalPlaces).toText()}
            </span>
          );
        },
      },
      {
        title: t('Funding/h'),
        dataIndex: 'capitalCost',
        align: 'right',
        render(order) {
          return (
            <div className="flex items-center justify-end gap-1">
              <span className="text-down">{order.capitalCost || '-'}</span>
              <FundingCol order={order} />
            </div>
          );
        },
      },
      {
        title: t('Take-Profit (TP)'),
        dataIndex: 'stopProfitPrice',
        align: 'right',
        render(order) {
          const { stopProfitPrice, symbol } = order;
          return (
            <div className="flex items-center justify-end gap-1">
              {stopProfitPrice ? (
                <span className="text-up">
                  {formatter.price(stopProfitPrice, tradingPairsMap[symbol]?.decimalPlaces).toText()}
                </span>
              ) : (
                t('Add')
              )}

              <Button
                size="free"
                theme="transparent"
                onClick={() => updateProfitAndLoss(order)}
                icon={<SvgIcon name={stopProfitPrice ? 'edit' : 'add'} className="size-5" />}
              />
            </div>
          );
        },
      },
      {
        title: t('Stop-Loss (SL)'),
        dataIndex: 'stopLossPrice',
        align: 'right',
        render(order) {
          const { stopLossPrice, symbol } = order;
          return (
            <div className="flex items-center justify-end gap-1">
              {stopLossPrice ? (
                <span className="text-down">
                  {formatter.price(stopLossPrice, tradingPairsMap[symbol]?.decimalPlaces).toText()}
                </span>
              ) : (
                t('Add')
              )}

              <Button
                size="free"
                theme="transparent"
                onClick={() => updateProfitAndLoss(order)}
                icon={<SvgIcon name={stopLossPrice ? 'edit' : 'add'} className="size-5" />}
              />
            </div>
          );
        },
      },
      {
        title: null,
        dataIndex: 'action',
        fixed: 'right',
        render(order) {
          return (
            <Button theme="secondary" size="sm" onClick={() => cashOutAction(order)}>
              {t('Close')}
            </Button>
          );
        },
      },
    ];
  }, [calcPnlAndRoi, cashOutAction, tradingPairsMap, t, tickerPrices, updateProfitAndLoss]);

  return (
    <>
      <Table<ContractOrderInfo>
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        onRowClick={handleRowClick}
      />
      {contextHolder}
    </>
  );
}
