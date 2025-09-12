import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '@pages/components/GameProvider';
import downHighLow from '@/assets/high_low_down.png';
import upHighLow from '@/assets/high_low_up.png';
import downHighLowMobile from '@/assets/mobile/high_low_down.png';
import upHighLowMobile from '@/assets/mobile/high_low_up.png';
import m1 from '@/assets/mobile/m_1.png';
import m2 from '@/assets/mobile/m_2.png';
import m3 from '@/assets/mobile/m_3.png';
import m6 from '@/assets/mobile/m_6.png';
import m7 from '@/assets/mobile/m_7.png';
import downSpreadMobile from '@/assets/mobile/spread_down.png';
import upSpreadMobile from '@/assets/mobile/spread_up.png';
import downSpread from '@/assets/spread_down.png';
import upSpread from '@/assets/spread_up.png';
import step1 from '@/assets/step_v2_1.png';
import step2_2 from '@/assets/step_v2_2_2.png';
import step2 from '@/assets/step_v2_2.png';
import step5_2 from '@/assets/step_v2_5_2.png';
import step5 from '@/assets/step_v2_5.png';
import { GameTypeNumber } from '@/type';
import Descriptions from '../../components/HowItWorksDescriptions';

export default function HowItWorks() {
  const { t } = useTranslation();
  const { type: gameType } = useGameContext();

  const isBinaryGameType = useMemo(() => {
    return gameType === GameTypeNumber.Binary;
  }, [gameType]);

  const assets = useMemo(() => {
    return [
      {
        pcSrc: step1,
        mSrc: m1,
        alt: 'Step 1',
        word: t('Choose the cryptocurrency that you would like to start trading.'),
      },
      {
        pcSrc: isBinaryGameType ? step2 : step2_2,
        mSrc: isBinaryGameType ? m2 : m3,
        alt: 'Step 2',
        word: isBinaryGameType
          ? t('Select a countdown period.')
          : t('Select countdown and spread (spread: the difference between the buy price and the exit price)'),
      },
      {
        pcSrc: isBinaryGameType ? upHighLow : upSpread,
        mSrc: isBinaryGameType ? upHighLowMobile : upSpreadMobile,
        alt: 'Step 3',
        word: t(
          'If you think the price will rise at the end of the countdown, please select UP.(The values in the figure correspond to the profit ratio you obtained)'
        ),
      },
      {
        pcSrc: isBinaryGameType ? downHighLow : downSpread,
        mSrc: isBinaryGameType ? downHighLowMobile : downSpreadMobile,
        alt: 'Step 4',
        word: t(
          'If you think the price will fall when the countdown ends, please select DOWN.(The values in the figure correspond to the profit ratio you obtained)'
        ),
      },
      {
        pcSrc: isBinaryGameType ? step5 : step5_2,
        mSrc: isBinaryGameType ? m6 : m7,
        alt: 'Step 5',
        word: isBinaryGameType ? (
          t('At the end of the countdown, the profit and loss will be determined based on the trend you predicted.')
        ) : (
          <Fragment>
            <span>{t(`When the dual conditions are met, you will receive profits.`)}</span>
            <br />
            <span>{t(`Condition 1: The price trend matches your prediction.`)}</span>
            <br />
            <span>{t(`Condition 2: Price movement breaks through the spread.`)}</span>
          </Fragment>
        ),
      },
    ];
  }, [isBinaryGameType, t]);

  return (
    <div className="grid gap-4 grid-cols-1 s768:grid-cols-2 s1366:grid-cols-3">
      {assets.map((asset) => {
        return <Descriptions key={asset.alt} {...asset} />;
      })}
    </div>
  );
}
