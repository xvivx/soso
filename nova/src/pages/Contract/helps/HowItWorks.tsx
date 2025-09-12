import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Descriptions from '@pages/components/HowItWorksDescriptions';
import m1 from '@/assets/mobile/m_1.png';
import m4 from '@/assets/mobile/m_4.png';
import m5 from '@/assets/mobile/m_5.png';
import m8 from '@/assets/mobile/m_8.png';
import m9 from '@/assets/mobile/m_9.png';
import m10 from '@/assets/mobile/m_10.png';
import step1 from '@/assets/step_v2_1.png';
import step2 from '@/assets/step_v2_3.png';
import step3 from '@/assets/step_v2_4.png';
import step6 from '@/assets/step_v2_6.png';
import step4 from '@/assets/stonks_v2_4.png';
import step5 from '@/assets/stonks_v2_5.png';

export default function HowItWorks() {
  const { t } = useTranslation();

  const assets = useMemo(() => {
    return [
      {
        pcSrc: step1,
        mSrc: m1,
        alt: 'Step 1',
        word: t('Choose the cryptocurrency that you would like to start trading.'),
      },
      {
        pcSrc: step2,
        mSrc: m4,
        alt: 'Step 2',
        word: t(
          'Trade on the price going up if you think the price will rise. If the price goes up, you will generate profit.'
        ),
      },
      {
        pcSrc: step3,
        mSrc: m5,
        alt: 'Step 3',
        word: t(
          'Trade on the price going down if you think the price will fall. If the price goes down, you will generate profit.'
        ),
      },
      {
        pcSrc: step4,
        mSrc: m8,
        alt: 'Step 4',
        word: t(
          'Pick a multiplier to maximize your position. Setting a higher multiplier increases the risk of your position.'
        ),
      },
      {
        pcSrc: step5,
        mSrc: m9,
        alt: 'Step 5',
        word: t(
          'Close at any time, whether in profit or loss. Set take-profit or stop-loss targets to close your position automatically'
        ),
      },
      {
        pcSrc: step6,
        mSrc: m10,
        alt: 'Step 6',
        word: t(
          'Keep your position open for longer than 8 hours and you might incur or receive hourly funding payments, depending on market conditions.'
        ),
      },
    ];
  }, [t]);

  return (
    <div className="grid gap-4 grid-cols-1 s1024:grid-cols-3 s1440:grid-cols-3">
      {assets.map((asset) => {
        return <Descriptions key={asset.alt} {...asset} />;
      })}
    </div>
  );
}
