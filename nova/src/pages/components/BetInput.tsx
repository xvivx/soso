import { memo, useCallback, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import bridge from '@store/bridge';
import { useLocalCurrency } from '@store/system';
import { AccountType, setCurrency, useAccountType, useAllAssetsWithLocaleAmount, useCurrency } from '@store/wallet';
import { AmountInput, Button, Image, Popover, ScrollArea, SvgIcon } from '@components';
import { cn, formatter } from '@utils';
import { getCoinUrl } from '@utils/others';

interface InputProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  min: number;
  exchange?: number;
  disabled?: boolean;
}

const BetInput = (props: InputProps) => {
  const htmlId = useId();
  const { className, value, onChange, min, max, exchange = 1, disabled } = props;
  const currency = useCurrency();

  /**
   * 2x 增加金额
   */

  const handleIncrease = useCallback(() => {
    if (!exchange) return;

    const double = Math.min(Number(value || 0) * 2, max / exchange);
    return onChange(formatter.amount(double, currency.name).floor().toNumber().toString());
  }, [max, value, onChange, exchange, currency]);

  /**
   * 1/2 减少金额
   */

  const handleDecrease = useCallback(() => {
    if (!exchange) return;

    const half = Math.max(Number(value || 0) / 2, min / exchange);
    return onChange(formatter.amount(half, currency.name).floor().toNumber().toString());
  }, [min, value, onChange, exchange, currency]);

  const inThirdPlatform = bridge.get().micro;
  const icon = inThirdPlatform && (
    <label
      htmlFor={htmlId}
      className="mr-2 overflow-hidden rounded-full shrink-0 flex-center size-5"
      style={{
        backgroundImage: `url(${currency.logo})`,
        backgroundSize: 'contain',
      }}
    />
  );

  return (
    <AmountInput
      prefix={icon}
      id={htmlId}
      className={cn('min-w-20 text-primary bg-layer2', className)}
      value={value}
      disabled={disabled}
      size="lg"
      onChange={onChange}
      max={max / exchange}
      min={min / exchange}
      suffix={
        // 三方没有币种列表, 使用x2
        inThirdPlatform ? (
          <div className="gap-1 flex h-full">
            <Button
              className="h-full px-3 bg-layer4 text-14"
              theme="secondary"
              size="free"
              onClick={handleDecrease}
              disabled={disabled}
            >
              1/2
            </Button>
            <Button
              className="h-full px-3 bg-layer4 text-14"
              theme="secondary"
              size="free"
              onClick={handleIncrease}
              disabled={disabled}
            >
              2x
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 h-full">
            <div className="gap-1 flex h-full">
              <Button
                className="h-full px-3 bg-layer4 text-14"
                theme="secondary"
                size="free"
                onClick={handleDecrease}
                disabled={disabled}
              >
                1/2
              </Button>
              <Button
                className="h-full px-3 bg-layer4 text-14"
                theme="secondary"
                size="free"
                onClick={handleIncrease}
                disabled={disabled}
              >
                2x
              </Button>
            </div>
            <AssetsSelector />
          </div>
        )
      }
    />
  );
};

export default memo(BetInput);

function AssetsSelector() {
  const { t } = useTranslation();
  const assets = useAllAssetsWithLocaleAmount();
  const accountType = useAccountType();
  const currency = useCurrency();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const localCurrency = useLocalCurrency();

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      overlayClassName="w-full s768:w-96"
      align="end"
      alignOffset={-4}
      content={() => {
        return (
          <ScrollArea className="w-full">
            {assets
              .filter((asset) => asset.type === accountType)
              .map((asset) => {
                return (
                  <div
                    key={asset.currency}
                    className={cn(
                      'flex items-center justify-between gap-4 px-3 py-2 mb-2.5 rounded-2 cursor-pointer hover:darkness',
                      currency.name === asset.currency && 'bg-layer5'
                    )}
                    onClick={() => {
                      setOpen(false);
                      dispatch(setCurrency(asset.currency));
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Image className="rounded-full size-7" src={getCoinUrl(asset.currency)} />
                      <div className="truncate text-12 s768:text-14 font-600">{asset.currency}</div>
                      {asset.type === AccountType.DEMO && (
                        <div className="text-12 text-success h-6 px-1.5 py-1 bg-success/10 rounded">{t('Demo')}</div>
                      )}
                    </div>
                    <div className="text-right flex-1 w-0">
                      <div className="truncate text-12 s768:text-14 font-600">
                        {formatter.amount(asset.amount, asset.currency).floor().toText()}
                      </div>
                      <div className="truncate text-12 text-secondary">
                        {formatter.amount(asset.localeAmount, localCurrency).floor().toText()}
                      </div>
                    </div>
                  </div>
                );
              })}
          </ScrollArea>
        );
      }}
    >
      <div className="flex items-center gap-1 h-full pr-1 select-none">
        <Image className="size-5 rounded-full" src={getCoinUrl(currency.name)} />
        <SvgIcon name="arrow" className={cn('size-6 transition-all', open ? '-rotate-90' : 'rotate-90')} />
      </div>
    </Popover>
  );
}
