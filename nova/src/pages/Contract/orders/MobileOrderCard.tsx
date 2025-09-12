import { useTranslation } from 'react-i18next';
import { ContractOrderInfo } from '@store/contract';
import { Button, Image } from '@components';
import { cn, formatter } from '@utils';
import { useGameTradingPairsMap } from '@pages/components/GameProvider';
import OrderCoupon from '@pages/components/OrderCoupon';
import OrderStatus from './OrderStatus';
import { useCashOut } from './PositionsCashOut';
import ProfitAndLossInfo from './ProfitAndLossInfo';

interface PositionOrderProps {
  order: ContractOrderInfo;
  pnlAndRoi: { pnl: number; roi: number };
  onUpdateProfitAndLoss: (order: this['order']) => void;
  tickerPrice: number;
}
export function PositionOrder(props: PositionOrderProps) {
  const { t } = useTranslation();
  const { order, pnlAndRoi, tickerPrice, onUpdateProfitAndLoss } = props;
  const tradingPairsMap = useGameTradingPairsMap();
  const tradingPairInfo = tradingPairsMap[order.symbol];
  const cashOutAction = useCashOut();
  return (
    <article key={order.id} className="space-y-3 pt-6 bg-layer3 text-14 font-500">
      {/* 头部信息：交易对、方向、杠杆等 */}
      <header className="flex items-center justify-between text-secondary">
        <div className="flex items-center gap-1">
          <Image src={order.assetBaseImage} className="rounded-full size-4" />
          <h3 className="text-14 font-500 text-primary">
            {order.symbol.split('/')[0]}
            <span className="text-secondary">/USDT</span>
          </h3>

          <span
            className={cn(
              'py-0.5 px-1 rounded text-10',
              order.direction === 1 ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
            )}
          >
            {order.direction === 1 ? t('Buy') : t('Sell')}
          </span>
          <span className="py-0.5 px-1 rounded bg-layer7 text-10">{`${order.lever}X`}</span>
        </div>
        {order.useCoupon && <OrderCoupon />}
      </header>
      <div>
        <h4 className="text-12 text-secondary mb-0.5">{t('PnL')}</h4>
        <ProfitAndLossInfo className="justify-start" order={order} profit={pnlAndRoi.pnl} />
      </div>
      <section className="grid grid-cols-3 text-tertiary text-12 font-500">
        <div className="space-y-0.5">
          <p>{t('Amount')}</p>
          <p className="text-14 text-primary font-400">{formatter.amount(order.amount, order.currency).toText()}</p>
        </div>
        <div className="space-y-0.5">
          <p>{t('Size')}</p>
          <p className="text-14 text-primary font-400">
            {formatter.amount(order.amount * order.lever, order.currency).toText()}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p>{`${t('PnL')}%`}</p>
          <p className={cn('text-14 font-400', pnlAndRoi.roi >= 0 ? 'text-up' : 'text-down')}>
            {formatter.percent(pnlAndRoi.roi, true)}
          </p>
        </div>
      </section>
      <section className="grid grid-cols-3">
        <div className="space-y-0.5">
          <p className="text-tertiary text-12 font-500">{t('Entry price')}</p>
          <p className="text-14 text-primary font-400">
            {formatter.price(order.startPrice, tradingPairInfo?.decimalPlaces).toText()}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-tertiary text-12 font-500">{t('Mark price')}</p>
          <p className="text-14 text-primary font-400">
            {formatter.price(tickerPrice, tradingPairInfo?.decimalPlaces).toText()}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-tertiary text-12 font-500">{t('Liq price')}</p>
          <p className="text-14 text-primary font-400">
            {formatter.price(order.burstPrice, tradingPairInfo?.decimalPlaces).toText()}
          </p>
        </div>
      </section>
      <footer className="flex gap-4">
        <Button theme="secondary" size="md" className="w-1/2" onClick={() => onUpdateProfitAndLoss(order)}>
          {t('TP/SL')}
        </Button>

        <Button theme="secondary" size="md" className="w-1/2" onClick={() => cashOutAction(order)}>
          {t('Close')}
        </Button>
      </footer>
    </article>
  );
}

export function HistoryOrder(props: { order: ContractOrderInfo }) {
  const { t } = useTranslation();
  const { order } = props;
  const tradingPairsMap = useGameTradingPairsMap();
  const tradingPairInfo = tradingPairsMap[order.symbol];
  return (
    <article key={order.id} className="space-y-3 pt-6 bg-layer3 text-14 font-500 text-primary">
      {/* 头部信息：交易对、方向、杠杆等 */}
      <header className="flex items-center flex-wrap gap-1 text-10 text-secondary">
        <Image src={order.assetBaseImage} className="rounded-full size-4" />
        <h3 className="text-14 font-500 text-primary">
          {order.symbol.split('/')[0]}
          <span className="text-secondary">/USDT</span>
        </h3>
        <span
          className={cn('py-0.5 px-1 rounded', order.direction === 1 ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}
        >
          {order.direction === 1 ? t('Buy') : t('Sell')}
        </span>
        <span className="py-0.5 px-1 rounded bg-layer7">{`${order.lever}X`}</span>
        <OrderStatus className="flex-1 text-right" order={order} />
      </header>

      <div className="space-y-0.5">
        <div className="flex justify-between">
          <h4 className="text-12 text-secondary">{t('PnL')}</h4>
          {order.useCoupon && <OrderCoupon />}
        </div>
        <ProfitAndLossInfo className="justify-start text-14" order={order} profit={order.profit} />
      </div>

      <section className="grid grid-cols-3 text-tertiary text-12 font-500">
        <div className="space-y-0.5">
          <p>{t('Amount')}</p>
          <p className="text-14 text-primary font-400">{formatter.amount(order.amount, order.currency).toText()}</p>
        </div>
        <div className="space-y-0.5">
          <p>{t('Size')}</p>
          <p className="text-14 text-primary font-400">
            {formatter.amount(order.amount * order.lever, order.currency).toText()}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p>{`${t('PnL')}%`}</p>
          <p className={cn('text-14 font-400', order.roi >= 0 ? 'text-up' : 'text-down')}>
            {formatter.percent(order.roi / 100, true)}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-3 text-tertiary text-12 font-500">
        <div className="space-y-0.5">
          <p>{t('Entry price')}</p>
          <p className="text-14 text-primary font-400">
            {formatter.price(order.startPrice, tradingPairInfo?.decimalPlaces).toText()}
          </p>
        </div>
        <div className="space-y-0.5">
          <p>{t('Mark price')}</p>
          <p className="text-14 text-primary font-400">
            {formatter.price(order.endPrice, tradingPairInfo?.decimalPlaces).toText()}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p>{t('liq price')}</p>
          <p className="text-14 text-primary font-400">
            {formatter.price(order.burstPrice, tradingPairInfo?.decimalPlaces).toText()}
          </p>
        </div>
      </section>

      <footer>
        <div className="flex justify-between text-secondary text-12 font-500">
          <span>{t('Entry Time')}</span>
          <span>{formatter.time(order.startTime)}</span>
        </div>
        <div className="flex justify-between text-secondary text-12 font-500">
          <span>{t('Close Time')}</span>
          <span>{formatter.time(order.endTime)}</span>
        </div>
      </footer>
    </article>
  );
}
