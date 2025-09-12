import { useTranslation } from 'react-i18next';

export enum TimeRange {
  '24h' = '1',
  '7d' = '2',
  '30d' = '3',
  '90d' = '4',
  '1y' = '5',
}

export function useTimeRangeOptions() {
  const { t } = useTranslation();
  return [
    {
      label: t('Past {{hours}} hours', { hours: 24 }),
      value: TimeRange['24h'],
    },
    {
      label: t('Past {{days}} days', { days: 7 }),
      value: TimeRange['7d'],
    },
    {
      label: t('Past {{days}} days', { days: 30 }),
      value: TimeRange['30d'],
    },

    {
      label: t('Past {{days}} days', { days: 90 }),
      value: TimeRange['90d'],
    },
    {
      label: t('Past 1 year'),
      value: TimeRange['1y'],
    },
  ];
}
