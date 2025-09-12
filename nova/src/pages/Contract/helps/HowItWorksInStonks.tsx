import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Descriptions from '@pages/components/HowItWorksDescriptions';
import m4 from '@/assets/mobile/m_4.png';
import m5 from '@/assets/mobile/m_5.png';
import m8 from '@/assets/mobile/m_8.png';
import m9 from '@/assets/mobile/m_9.png';
import m11 from '@/assets/mobile/m_11.png';
import m12 from '@/assets/mobile/m_12.png';
import step2 from '@/assets/step_v2_3.png';
import step3 from '@/assets/step_v2_4.png';
import step1 from '@/assets/stonks_v2_1.png';
import step4 from '@/assets/stonks_v2_4.png';
import step5 from '@/assets/stonks_v2_5.png';
import step6 from '@/assets/stonks_v2_6.png';

function HowItWorksInStonks() {
  const { t } = useTranslation();

  const assets = useMemo(() => {
    return [
      {
        pcSrc: step1,
        mSrc: m11,
        alt: 'Step 1',
        word: t(
          'Welcome to Stonks! The price will be reset to $1,000 at 00:00 UTC every day, and any pending orders will be automatically settled during the reset.'
        ),
      },
      {
        pcSrc: step2,
        mSrc: m4,
        alt: 'Step 2',
        word: t(
          'If you think the price will go up, set a margin and click the long button. If the price goes up, you generate a profit.'
        ),
      },
      {
        pcSrc: step3,
        mSrc: m5,
        alt: 'Step 3',
        word: t(
          'If you think the price will fall, set a margin and store a short button. If the price falls, you generate a profit.'
        ),
      },
      {
        pcSrc: step4,
        mSrc: m8,
        alt: 'Step 4',
        word: t(
          'Choose a multiplier to maximize your position. Setting a higher multiplier increases your margin risk'
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
        mSrc: m12,
        alt: 'Step 6',
        word: t('Stonks prices are generated using a provably fair algorithm. The house edge is 2.5%.'),
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
export default HowItWorksInStonks;
