import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, tickOptions as ticks, type Ticks } from '@store/system';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, Checkbox, Popover, Select, SvgIcon } from '@components';
import { ChartAppearType } from '@/type';
import { useGameContext } from './GameProvider';
import StonksTimeDown from './Stonks/StonksTimeDown';

function ActionTools() {
  const { t } = useTranslation();
  const { settings, onSettingsChange, selectedSymbolPair } = useGameContext();
  const settingOptions = useMemo(() => {
    return [
      {
        key: 'showPublicBets',
        label: t('Show live positions on chart'),
      },
      {
        key: 'showMyBets',
        label: t('Show my positions on chart'),
      },
      {
        key: 'confirmCashOut',
        label: t('Confirm Close'),
      },
      {
        key: 'advancedChart',
        label: t('Advanced chart'),
      },
    ]
      .filter((it) => it.key in settings)
      .map((it) => ({ ...it, value: settings[it.key as keyof Settings] as boolean }));
  }, [settings, t]);
  const { mobile } = useMediaQuery();

  const tickButton = useMemo(() => {
    if (mobile) return ticks.slice(0, 6);
    return ticks;
  }, [mobile]);
  const tickOption = ticks.slice(6);

  const handleTickChange = (value: Ticks) => {
    onSettingsChange({
      tick: value,
      chartType: value === '500ms' ? ChartAppearType.kline : ChartAppearType.candle,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between min-h-8 gap-1 s768:gap-2">
      {selectedSymbolPair.symbol === 'STONKS/USD' && <StonksTimeDown className="s768:pr-2" />}

      <div className="flex items-center gap-4 px-4 s768:px-0 text-12 font-600 w-full s768:w-auto border-b border-black/10 s768:border-none">
        {tickButton.map((tick) => (
          <Button
            key={tick.value}
            size="free"
            theme="transparent"
            className={settings.tick === tick.value ? 'text-primary' : 'text-secondary font-500'}
            onClick={() => handleTickChange(tick.value)}
          >
            {tick.label}
          </Button>
        ))}

        {mobile && (
          <Select
            options={tickOption}
            value={settings.tick}
            placeholder={t('More')}
            className="p-0 border-0 gap-0"
            onChange={(value) => handleTickChange(value || '500ms')}
          />
        )}

        <Popover
          content={
            <div className="w-full space-y-1.5 select-none">
              {settingOptions.map((option) => {
                return (
                  <div className="flex items-center p-2 rounded cursor-pointer hover:bg-layer5" key={option.key}>
                    <Checkbox
                      checked={option.value}
                      onCheckedChange={() =>
                        onSettingsChange({
                          [option.key]: !settings[option.key as keyof Settings],
                        })
                      }
                    >
                      {option.label}
                    </Checkbox>
                  </div>
                );
              })}
            </div>
          }
        >
          <Button
            className="ml-auto s768:ml-0"
            theme="transparent"
            size="free"
            icon={<SvgIcon name="setting" className="size-5" />}
          />
        </Popover>
      </div>
    </div>
  );
}

export default memo(ActionTools);
