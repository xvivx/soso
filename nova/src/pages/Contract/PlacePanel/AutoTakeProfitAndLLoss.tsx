import { forwardRef, memo, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommissionType, useActiveTradingPair, useLever } from '@store/contract';
import { useSymbolPricesMap } from '@store/symbol';
import { useCurrency } from '@store/wallet';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button } from '@components';
import { Direction } from '@/type';
import AutoTakeProfitAndLLossPrice, {
  AutoTakeProfitAndLLossPriceProps,
} from '../components/AutoTakeProfitAndLLossPrice';

interface AutoTakeProfitAndLLossProps {
  amount: string;
  direction: Direction;
  feeType: CommissionType;
  outerValue?: AutoTakeProfitAndLLossPriceProps['value'] | null; // 手机端唤起TP/SL弹窗，初始化以前的配置
  onMobileConfirm?: (value: AutoTakeProfitAndLLossPriceProps['value']) => void; // 手机端TP/SL配置需弹起确认
}

export interface AutoTakeProfitAndLLossRef {
  getValue: () => [AutoTakeProfitAndLLossPriceProps['value'], string];
}

const AutoTakeProfitAndLLoss = forwardRef<AutoTakeProfitAndLLossRef, AutoTakeProfitAndLLossProps>(
  function AutoTakeProfitAndLLoss(props, ref) {
    const { amount, direction, feeType, outerValue, onMobileConfirm } = props;
    const { t } = useTranslation();
    const currency = useCurrency();
    const { symbol: tradingPair } = useActiveTradingPair() || {};
    const tickerPrices = useSymbolPricesMap();
    const lever = useLever();
    const [error, setError] = useState('');
    const { mobile } = useMediaQuery();

    const [autoFields, setAutoFields] = useState<AutoTakeProfitAndLLossPriceProps['value']>(() => {
      if (mobile && outerValue) {
        return outerValue;
      } else {
        return {
          takeAtPrice: '',
          takeAtProfit: '',
          closeAtPrice: '',
          closeAtProfit: '',
        };
      }
    });

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return [autoFields, error];
      },
    }));

    return (
      <div>
        <AutoTakeProfitAndLLossPrice
          className="pt-4"
          value={autoFields}
          entryPrice={(tradingPair && tickerPrices[tradingPair]?.p) || 0}
          onChange={setAutoFields}
          onError={setError}
          wager={Number(amount) || 0}
          multiplier={lever}
          direction={direction}
          feeType={feeType}
          symbol={tradingPair}
          currency={currency.name}
        />
        {mobile && (
          <div
            className="pt-4"
            onClick={() => {
              if (!error) {
                onMobileConfirm && onMobileConfirm({ ...autoFields });
              }
            }}
          >
            <Button className="text-18 w-full h-12 block text-white bg-up" theme="transparent" size="free">
              {t('Confirm')}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

export default memo(AutoTakeProfitAndLLoss);
