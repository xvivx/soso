import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CommissionType, useActiveTradingPair, useLever, useStonksCoin } from '@store/contract';
import { useCurrencyExchange } from '@store/wallet';
import { Accordion } from '@components';
import ChooseFeeType from '../components/ChooseFeeType';
import { showRoiHelp } from '../helps/RoiHelp';

function FeeAndHelp(props: { amount: string; value: CommissionType; onChange: (value: CommissionType) => void }) {
  const { t } = useTranslation();
  const { amount, value, onChange } = props;
  const multiplier = useLever();
  const { symbol: tradingPair } = useActiveTradingPair() || {};
  const isStonksPair = useStonksCoin();

  useEffect(() => {
    if (isStonksPair) {
      onChange(CommissionType.PNL);
    }
  }, [isStonksPair, onChange]);

  const exchange = useCurrencyExchange();
  return (
    <div className="relative">
      <Accordion.Collapse
        className="text-secondary"
        defaultOpen={false}
        content={
          <ChooseFeeType
            wager={amount}
            multiplier={multiplier}
            value={value}
            onChange={onChange}
            symbol={tradingPair}
            exchange={exchange}
            showRoiHelp={showRoiHelp}
          />
        }
      >
        {t('Fee options')}
      </Accordion.Collapse>
    </div>
  );
}

export default memo(FeeAndHelp);
