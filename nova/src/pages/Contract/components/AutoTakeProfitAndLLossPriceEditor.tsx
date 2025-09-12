import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContractOrderInfo } from '@store/contract';
import { useSymbolPricesMap } from '@store/symbol';
import { useCurrency } from '@store/wallet';
import { Button, Image } from '@components';
import { cn, formatter } from '@utils';
import { useGameTradingPairsMap } from '@pages/components/GameProvider';
import { Direction } from '@/type';
import AutoTakeProfitAndLLossPrice, { AutoTakeProfitAndLLossPriceProps } from './AutoTakeProfitAndLLossPrice';
import BustPrice from './BustPrice';

type AutoTakeProfitAndLLossPriceEditorProps = {
  onConfirm: (value: AutoTakeProfitAndLLossPriceProps['value']) => Promise<void>;
  order: ContractOrderInfo;
};

export default function AutoTakeProfitAndLLossPriceEditor(props: AutoTakeProfitAndLLossPriceEditorProps) {
  const { t } = useTranslation();
  const { onConfirm, order } = props;
  const tickerPrices = useSymbolPricesMap();
  const [error, setError] = useState('');
  const currency = useCurrency();
  const { symbol, direction, lever, amount, commissionType } = 'order' in props ? props.order : props;
  const tradingPairsMap = useGameTradingPairsMap();
  const tradingPair = tradingPairsMap[symbol];
  const tradingPairPrecision = tradingPair.decimalPlaces || 2;
  const [autoFields, setAutoFields] = useState<AutoTakeProfitAndLLossPriceProps['value']>(() => ({
    takeAtPrice: String(formatter.price(order.stopProfitPrice, tradingPairPrecision).toNumber() || ''),
    takeAtProfit: String(formatter.amount(order.stopProfitAmount, order.currency).floor().toNumber() || ''),
    closeAtPrice: String(formatter.price(order.stopLossPrice, tradingPairPrecision).toNumber() || ''),
    closeAtProfit: String(formatter.amount(Math.abs(order.stopLossAmount), order.currency).floor().toNumber() || ''),
  }));
  return (
    <div>
      <div className="flex items-center gap-2">
        <Image src={tradingPair?.assetBaseImage} className="rounded-full size-4.5" />
        <span className="text-14">
          {symbol.split('/')[0]}
          <span className="text-secondary">/USDT</span>
        </span>
        <span
          className={cn(
            'py-0.5 px-1 rounded text-12',
            direction === Direction.BuyRise ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
          )}
        >
          {direction === Direction.BuyRise ? t('Buy') : t('Sell')}
        </span>
        <span className="text-12 font-500 inline-block px-1 py-0.5 rounded bg-layer7">{lever}X</span>
      </div>
      <section className="flex text-12 text-tertiary mt-2.5 mb-4.5">
        <div className="flex-1 text-12 font-500">
          <p className="mb-0.5">{order ? t('Entry Price') : t('Amount')}</p>
          <p className="text-14 text-primary">
            {order ? formatter.price(order.startPrice, tradingPairPrecision).toText() : amount}
          </p>
        </div>
        <div className="flex-1 text-12 font-500">
          <p className="mb-0.5">{t('Mark Price')}</p>
          <p className="text-14 text-primary">
            {formatter.price(tickerPrices[symbol]?.p, tradingPairPrecision).toText()}
          </p>
        </div>
        <div className="flex-1 text-12 font-500 text-right">
          <p className="mb-0.5">{t('Liq.price')}</p>
          {order ? (
            <p className="text-14 text-warn font-400">
              {formatter.price(order.burstPrice, tradingPairPrecision).toText()}
            </p>
          ) : (
            <BustPrice
              className="text-14 text-warn font-400"
              amount={amount}
              direction={direction}
              feeType={commissionType}
            />
          )}
        </div>
      </section>

      <AutoTakeProfitAndLLossPrice
        value={autoFields}
        entryPrice={order ? order.startPrice : tickerPrices[symbol]?.p}
        onChange={setAutoFields}
        onError={setError}
        wager={amount || 0}
        multiplier={lever}
        direction={direction}
        feeType={commissionType}
        symbol={symbol}
        currency={order ? order.currency : currency.name}
      />

      <Button
        className="w-full mt-4.5"
        size="lg"
        disabled={Boolean(error)}
        onClick={() => {
          if (error) return;
          return onConfirm(autoFields);
        }}
      >
        {t('Confirm')}
      </Button>
    </div>
  );
}
