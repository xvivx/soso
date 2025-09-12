import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CommissionType, useTradingPairParam } from '@store/contract';
import { useCurrency } from '@store/wallet';
import { Radio, SvgIcon, Tooltip } from '@components';
import { formatter } from '@utils';
import { calcFlatFee } from '../ROI';

export interface ChooseFeeTypeProps {
  value: CommissionType;
  onChange: (value: this['value']) => void;
  wager: string;
  multiplier: number;
  className?: string;
  symbol: string;
  exchange?: number;
  showRoiHelp?: () => void;
}

export default function ChooseFeeType(props: ChooseFeeTypeProps) {
  const { value, onChange, wager, multiplier, className, symbol, exchange = 1, showRoiHelp } = props;
  const position = Number(wager) * multiplier;
  const symbolParam = useTradingPairParam(symbol);
  const feePercent = useMemo(() => {
    if (!symbolParam || !position) return 0;
    return calcFlatFee(symbolParam, position * exchange);
  }, [position, symbolParam, exchange]);
  const currency = useCurrency();

  const { t } = useTranslation();
  const options = useMemo(
    () => [
      {
        label: t('PnL fee'),
        value: CommissionType.PNL.toString(),
      },
      {
        label: t('Flat fee'),
        value: CommissionType.FLAT.toString(),
      },
    ],
    [t]
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Radio.Group
          className="gap-8"
          value={value.toString()}
          onValueChange={(value) => onChange(Number(value))}
          options={options}
          disabled={symbol === 'STONKS/USD'}
        />
        <Tooltip
          content={
            <div className="space-y-4 text-12">
              <p>
                {t(
                  'With a PnL fee, you do not pay any fees to open or close the trade, and only a fraction of your profits (if any) is taken when you close the trade'
                )}
              </p>

              <p>
                <Trans i18nKey="With a flat fee enabled, you receive 100% of your profits but prepay a <0>flat fee that covers your entry, exit, and slippage</0> before entering the trade, like on a regular exchange">
                  <span className="underline" />
                </Trans>
              </p>

              <p>{t('Flat fee is calculated as a percentage of your position (amount * leverage)')}</p>

              {showRoiHelp && (
                <p>
                  <Trans i18nKey="Check <0>ROI calculator</0> for more details">
                    <span className="inline cursor-pointer text-brand text-12 hover:underline" onClick={showRoiHelp} />
                  </Trans>
                </p>
              )}
            </div>
          }
          side="top"
        >
          <SvgIcon name="attention" className="size-5" />
        </Tooltip>
      </div>
      <p className="mt-2 text-secondary text-12">
        {value === CommissionType.PNL ? (
          t('A fraction of your profits (if any) is taken when you close the trade')
        ) : (
          <Trans
            i18nKey="<0>{{flatFee}}</0> per entry and exit trades of {{position}} including slippage"
            values={{
              flatFee: formatter.percent(feePercent),
              position: formatter.amount(position, currency.name).toText(),
            }}
          >
            <span className="font-700" />
          </Trans>
        )}
      </p>
    </div>
  );
}
