import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@hooks/useResponsive';
import { FormItem, Select, SvgIcon, Tabs } from '@components';
import { convertTime } from '@utils/others';
import { useGameContext } from '@pages/components/GameProvider';
import { GameTypeNumber } from '@/type';
import { useBinarySpreadContext } from '../BinarySpreadProvider';

// 当前货币对的时间组
function TimePeriods() {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  const { type: gameType } = useGameContext();
  const { selectedTimePeriod, onTimePeriodChange, useTimePeriods } = useBinarySpreadContext();
  const { data: timePeriods } = useTimePeriods();

  // 初始化默认选中的时间组
  useEffect(() => {
    if (!timePeriods.length) return;
    onTimePeriodChange(timePeriods[0]);
  }, [timePeriods, onTimePeriodChange]);

  const options = useMemo(() => {
    return timePeriods.map((it) => {
      return {
        value: it.time,
        label: (
          <div className="flex items-center gap-1 text-secondary text-12 font-400">
            <div className="text-primary text-14 font-600">{convertTime(it.time)}</div>
            {gameType === GameTypeNumber.BinarySpread && (
              <>
                <SvgIcon name="spreadArrow" className="size-3.5 shrink-0" />
                <span className="spread-value">{it.spread}</span>
              </>
            )}
          </div>
        ),
      };
    });
  }, [timePeriods, gameType]);

  if (mobile) {
    return (
      <Select
        size="lg"
        className="bg-layer2 flex-1"
        options={options}
        value={selectedTimePeriod?.time || 0}
        compact
        onChange={(value) => {
          const item = timePeriods.find((period) => period.time === value);
          if (!item) return;
          onTimePeriodChange(item);
        }}
      />
    );
  }

  return (
    <FormItem id="time-periods" label={t('Time')}>
      <Tabs
        className="overflow-hidden"
        // 解决tab选项是动态变化导致index错乱问题
        key={timePeriods.map((t) => t.id).join(',')}
        selectedIndex={timePeriods.findIndex((it) => it.id === selectedTimePeriod?.id)}
        onChange={(index: number) => {
          const item = timePeriods[index];
          onTimePeriodChange(item);
        }}
      >
        <Tabs.Header className="flex bg-layer2">
          {options.map((tab) => (
            <Tabs.Item className="flex-1" key={tab.value} selectedClassName="bg-layer4">
              {tab.label}
            </Tabs.Item>
          ))}
        </Tabs.Header>
      </Tabs>
    </FormItem>
  );
}

export default TimePeriods;
