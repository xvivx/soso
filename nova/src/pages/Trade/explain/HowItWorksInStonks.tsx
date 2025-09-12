import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '@pages/components/GameProvider';
import highLowDown from '@/assets/high_low_down.png';
import highLowUp from '@/assets/high_low_up.png';
import highLowDownMobile from '@/assets/mobile/high_low_down.png';
import highLowUpMobile from '@/assets/mobile/high_low_up.png';
import m2 from '@/assets/mobile/m_2.png';
import m3 from '@/assets/mobile/m_3.png';
import m6 from '@/assets/mobile/m_6.png';
import m11 from '@/assets/mobile/m_11.png';
import m12 from '@/assets/mobile/m_12.png';
import step2_2 from '@/assets/step_v2_2_2.png';
import step2 from '@/assets/step_v2_2.png';
import step5 from '@/assets/step_v2_5.png';
import step1_stonks from '@/assets/stonks_v2_1.png';
import step6 from '@/assets/stonks_v2_6.png';
import { GameTypeNumber } from '@/type';
import Descriptions from '../../components/HowItWorksDescriptions';

export default function HowItWorksInStonks() {
  const { t } = useTranslation();
  const { type: gameType } = useGameContext();

  const isBinarySpreadGameType = useMemo(() => {
    return gameType === GameTypeNumber.BinarySpread;
  }, [gameType]);

  const assets = useMemo(() => {
    return [
      {
        pcSrc: step1_stonks,
        mSrc: m11,
        alt: 'Step 1',
        word: t(
          'Welcome to Stonks! The price will be reset to $1,000 at 00:00 UTC every day, and any pending orders will be automatically settled during the reset.'
        ),
      },
      {
        pcSrc: isBinarySpreadGameType ? step2_2 : step2,
        mSrc: isBinarySpreadGameType ? m3 : m2,
        alt: 'Step 2',
        word: isBinarySpreadGameType
          ? t('Select countdown and spread (spread: the difference between the buy price and the exit price)')
          : t('Select a countdown period.'),
      },
      {
        pcSrc: highLowUp,
        mSrc: highLowUpMobile,
        alt: 'Step 3',
        word: t(
          'If you think the price will rise at the end of the countdown, please select UP.(The values in the figure correspond to the profit ratio you obtained)'
        ),
      },
      {
        pcSrc: highLowDown,
        mSrc: highLowDownMobile,
        alt: 'Step 4',
        word: t(
          'If you think the price will fall when the countdown ends, please select DOWN.(The values in the figure correspond to the profit ratio you obtained)'
        ),
      },
      {
        pcSrc: step5,
        mSrc: m6,
        alt: 'Step 5',
        word: isBinarySpreadGameType ? (
          <Fragment>
            <span>{t(`When the dual conditions are met, you will receive profits.`)}</span>
            <br />
            <span>{t(`Condition 1: The price trend matches your prediction.`)}</span>
            <br />
            <span>{t(`Condition 2: Price movement breaks through the spread.`)}</span>
          </Fragment>
        ) : (
          t('At the end of the countdown, the profit and loss will be determined based on the trend you predicted.')
        ),
      },
      {
        pcSrc: step6,
        mSrc: m12,
        alt: 'Step 6',
        word: t('Stonks prices are generated using a provably fair algorithm.'),
      },
    ];
  }, [isBinarySpreadGameType, t]);

  return (
    <div className="grid gap-4 grid-cols-1 s1024:grid-cols-3 s1440:grid-cols-3">
      {assets.map((asset) => {
        return <Descriptions key={asset.alt} {...asset} />;
      })}
    </div>
  );
}
