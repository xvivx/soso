import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useLevelColor(level: number) {
  const linearColor = useMemo(() => {
    switch (level) {
      default:
      case 1:
        return 'from-colorful4 to-layer3';
      case 2:
        return 'from-colorful5 to-layer3';
      case 3:
        return 'from-colorful6 to-layer3';
      case 4:
        return 'from-colorful7 to-layer3';
      case 5:
        return 'from-colorful8 to-layer3';
      case 6:
        return 'from-colorful9 to-layer3';
      case 7:
        return 'from-colorful10 to-layer3';
    }
  }, [level]);

  const levelColor = useMemo(() => {
    switch (level) {
      default:
      case 1:
        return 'border-colorful4';
      case 2:
        return 'border-colorful5';
      case 3:
        return 'border-colorful6';
      case 4:
        return 'border-colorful7';
      case 5:
        return 'border-colorful8';
      case 6:
        return 'border-colorful9';
      case 7:
        return 'border-colorful10';
    }
  }, [level]);

  return {
    levelLinearColor: linearColor,
    levelBorderColor: levelColor,
  };
}

export function useLevelBenefit(level: number) {
  const { t } = useTranslation();

  const MWLLabel = useMemo(() => {
    switch (level) {
      default:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        return t('Max withdrawal limit');
      case 7:
        return t('Custom cashback plan');
    }
  }, [level, t]);

  const DCSlabel = useMemo(() => {
    switch (level) {
      default:
      case 1:
        return t('Dedicated customer support');
      case 2:
        return t('Standard CS');
      case 3:
        return t('Fast response');
      case 4:
        return t('1-on-1 manager');
      case 5:
      case 6:
        return t('Premium support');
      case 7:
        return t('Top-tier account manager');
    }
  }, [level, t]);

  const APALabel = useMemo(() => {
    switch (level) {
      default:
      case 1:
        return t('Activity priority access');
      case 2:
        return t('General access');
      case 3:
        return t('Priority access');
      case 4:
        return t('Whitelist pre-booking');
      case 5:
      case 6:
        return t('Private invitation');
      case 7:
        return t('Co-planning rights');
    }
  }, [level, t]);

  const CALabel = useMemo(() => {
    switch (level) {
      default:
      case 1:
        return t('Community access');
      case 2:
        return t('Step-up group');
      case 3:
        return t('VIP group');
      case 4:
        return t('Internal group');
      case 5:
      case 6:
        return t('Research lab');
      case 7:
        return t('Black diamond circle');
    }
  }, [level, t]);

  const CSLabel = useMemo(() => {
    switch (level) {
      default:
      case 1:
      case 2:
      case 3:
        return t('Custom services');
      case 4:
        return t('Available on request');
      case 5:
      case 6:
        return t('Custom signals');
      case 7:
        return t('Strategy planning');
    }
  }, [level, t]);

  const MCCLabel = useMemo(() => {
    switch (level) {
      default:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        return t('Monthly cashback cap');
      case 7:
        return t('Custom cashback plan');
    }
  }, [level, t]);

  return { MWLLabel, DCSlabel, APALabel, CALabel, CSLabel, MCCLabel };
}
