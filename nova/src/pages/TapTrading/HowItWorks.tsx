import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Descriptions from '@pages/components/HowItWorksDescriptions';
import m1 from '@/assets/tap/step_h5_01.png';
import m2 from '@/assets/tap/step_h5_02.png';
import m3 from '@/assets/tap/step_h5_03.png';
import p1 from '@/assets/tap/step_pc_01.png';
import p2 from '@/assets/tap/step_pc_02.png';
import p3 from '@/assets/tap/step_pc_03.png';

export default function HowItWorks() {
  const { t } = useTranslation();

  const assets = useMemo(() => {
    return [
      {
        pcSrc: p1,
        mSrc: m1,
        alt: 'Step 1',
        word: t('Choose the cryptocurrency that you would like to start trading.'),
      },
      {
        pcSrc: p2,
        mSrc: m2,
        alt: 'Step 2',
        word: t('Tap a block to place your order.'),
      },
      {
        pcSrc: p3,
        mSrc: m3,
        alt: 'Step 3',
        word: t(
          'If the curve touches your block, you earn profit based on its multiplier. If not, you lose the invested amount.'
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
