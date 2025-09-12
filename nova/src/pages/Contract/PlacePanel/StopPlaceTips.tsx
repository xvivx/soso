import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '@components';

function StopPlaceTips() {
  const { t } = useTranslation();
  return (
    <div className="flex gap-3 p-3 detrade-card bg-layer5">
      <SvgIcon name="remind" className="text-warn shrink-0" />
      <div className="text-12 text-warn">
        {t(
          'Trading is paused daily from {{startTime}} to {{endTime}} ({{timeZone}}) and during weekends. Please settle your orders in advance.',
          {
            startTime: '20:00',
            endTime: '23:00',
            timeZone: 'UTC+0',
          }
        )}
      </div>
    </div>
  );
}

export default memo(StopPlaceTips);
