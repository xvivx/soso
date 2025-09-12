import { memo, useId, useMemo } from 'react';
import bridge from '@store/bridge';
import { useLocalCurrency } from '@store/system';
import { useCurrency, useExchanges } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMediaQuery } from '@hooks/useResponsive';
import { AmountInput, Button } from '@components';
import { cn, formatter } from '@utils';
import { getCoinUrl } from '@utils/others';
import AssetsSelector from './Assets';
import AvailableBalance from './AvailableBalance';

interface InputProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  min: number;
  limitCurrency: string;
  disabled?: boolean;
  shortcuts?: boolean;
  presets?: number[];
  showAssets?: boolean;
}

const PlaceInput = (props: InputProps) => {
  const {
    className,
    value,
    onChange,
    min,
    max,
    disabled,
    limitCurrency,
    shortcuts,
    presets,
    showAssets = true,
  } = props;
  const htmlId = useId();
  const exchanges = useExchanges();
  const currency = useCurrency().name;
  const localCurrency = useLocalCurrency();
  const { mobile } = useMediaQuery();

  const handleDecrease = useMemoCallback(() => {
    const amount = Number(value || 0) / 2;
    const half = Math.min(Math.max(amount, min), max);
    return onChange(
      formatter
        .amount(half || min, currency)
        .ceil()
        .toNumber()
        .toString()
    );
  });

  const handleIncrease = useMemoCallback(() => {
    const amount = Number(value || 0) * 2;
    const double = Math.min(Math.max(amount, min), max);
    return onChange(
      formatter
        .amount(double || max, currency)
        .floor()
        .toNumber()
        .toString()
    );
  });

  const inThirdPlatform = bridge.get().micro;
  return (
    <div id="available-balance-input" className={cn('flex items-start flex-wrap gap-y-2 gap-x-2.5', className)}>
      {inThirdPlatform || mobile ? null : <AvailableBalance />}
      <AmountInput
        className="flex-grow-max gap-1 shrink-0 min-w-60 text-primary bg-layer2"
        id={htmlId}
        value={value}
        disabled={disabled}
        size="lg"
        onChange={onChange}
        max={max}
        min={min}
        maxLength={12}
        prefix={
          inThirdPlatform && currency ? (
            <label
              htmlFor={htmlId}
              className="rounded-full shrink-0 size-5 bg-contain"
              style={{ backgroundImage: `url(${getCoinUrl(currency)})` }}
            />
          ) : null
        }
        suffix={
          <>
            <Button
              className="h-full bg-layer4 text-14 w-10 px-0"
              theme="secondary"
              size="free"
              onClick={handleDecrease}
              disabled={disabled}
            >
              1/2
            </Button>
            <Button
              className="h-full bg-layer4 text-14 w-10"
              theme="secondary"
              size="free"
              onClick={handleIncrease}
              disabled={disabled}
            >
              2x
            </Button>
            {inThirdPlatform ? null : showAssets && <AssetsSelector />}
          </>
        }
      />
      {shortcuts && (
        <Presets
          currency={limitCurrency}
          min={min}
          max={max}
          value={value}
          onSelect={onChange}
          disabled={disabled}
          presets={presets}
        />
      )}
      {mobile ? null : (
        <div className="w-full text-12 text-secondary font-600 truncate">
          {`≈${formatter.amount((exchanges[currency] * Number(value)) / exchanges[localCurrency], localCurrency).toText()}`}
        </div>
      )}
    </div>
  );
};

export default memo(PlaceInput);

interface PresetsProps {
  min: number;
  max: number;
  value: string;
  onSelect: (value: this['value']) => void;
  disabled?: boolean;
  /** 最值对应的币种 */
  currency: string;
  presets?: number[];
}

function Presets(props: PresetsProps) {
  const exchanges = useExchanges();
  const { mobile } = useMediaQuery();
  const { onSelect, value, currency, min, max, disabled, presets: propPresets } = props;
  const uMin = min * exchanges[currency];
  const uMax = max * exchanges[currency];
  const options = useMemo(() => {
    const presets = (propPresets || PRESETS).filter((item) => item >= uMin && item <= uMax);
    // 手机端最多展示5个快捷输入按钮
    return mobile ? presets.slice(0, 5) : presets;
  }, [uMin, uMax, mobile, propPresets]);
  return (
    <div className="flex flex-grow justify-between gap-2">
      {options.map((item) => (
        <Button
          key={item}
          className={cn(
            'flex-1 shrink-0 s768:min-w-12 s768:px-2',
            Math.abs(Number(value) * exchanges[currency] - item) < 0.1
              ? 'text-black bg-colorful12 hover:text-black hover:brightness-105'
              : 'text-secondary border-thirdly'
          )}
          theme="secondary"
          size="lg"
          disabled={disabled}
          onClick={() => {
            onSelect(
              formatter
                .amount(item / exchanges[currency], currency)
                .round()
                .toNumber()
                .toString()
            );
          }}
        >
          <div className="flex items-baseline text-14 s1366:text-16">
            {/* 这里不做本地化,否则可能会很长 */}
            <span className="text-10 s768:text-12">$</span>
            <span>{item}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}

const PRESETS = [5, 10, 20, 50, 100, 200, 500, 1000];
