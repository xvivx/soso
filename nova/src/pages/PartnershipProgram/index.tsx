import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AffiliateCard, Card, StepGuide } from '@pages/components';
import step1Icon from './assets/step1.png';
import step2Icon from './assets/step2.png';
import step3Icon from './assets/step3.png';
import ProgramDescription from './ProgramDescription';

/**
 * 合作伙伴计划组件
 * @returns JSX.Element
 */
const PartnershipProgram = () => {
  const { t } = useTranslation();
  const steps = useMemo(() => {
    return [
      {
        icon: step1Icon,
        title: t('Apply'),
        desc: t('Contact us with Email or Live chat'),
      },
      {
        icon: step2Icon,
        title: t('Share'),
        desc: t('Share your Affiliate invitation link to friends and users.'),
      },
      {
        icon: step3Icon,
        title: t('Earn'),
        desc: t('Earn up to 50% commission.'),
      },
    ];
  }, [t]);

  return (
    <div className="flex flex-col gap-3 ">
      <Card className="s768:p-8 s768:pt-4" title={t('Boost your earnings by affiliate program')}>
        <AffiliateCard enableLink={false} />
      </Card>

      <Card className="s768:p-8 s768:pt-4" title={t('Becoming an affiliate is easy')}>
        <StepGuide steps={steps} />
      </Card>

      <Card className="s768:p-8 s768:pt-4" title={t('Detrade partnership program')}>
        <ProgramDescription />
      </Card>
    </div>
  );
};

PartnershipProgram.displayName = 'PartnershipProgram';

export default PartnershipProgram;
