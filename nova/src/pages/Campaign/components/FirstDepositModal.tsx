import { Trans, useTranslation } from 'react-i18next';
import useNavigate from '@hooks/useNavigate';
import { Button, Image, Modal } from '@components';
import i18n from '@/i18n';
import rewardBox from '../assets/rewardBox.png';

function openFirstDepositModal() {
  Modal.open({
    title: i18n.t('Deposit'),
    children: <FirstDepositModal />,
    size: 'sm',
  });
}

function FirstDepositModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <Image className="h-30 w-36 mx-auto mb-8" src={rewardBox} />
      <div className="mb-3 text-24 text-primary font-600">{t('Welcome Bonus')}</div>
      <div className="mb-8 text-16 text-secondary">
        <Trans
          i18nKey={t(`Make successful trades and accumulate the maximum bonus on your first deposit. <0>Learn more<0>`)}
        >
          <span
            onClick={() => navigate('/deposit-bonus-guide')}
            className="underline decoration-dashed cursor-pointer"
          />
        </Trans>
      </div>
      <Button
        onClick={() => {
          Modal.close();
          navigate('/dashboard/wallet/deposit');
        }}
        size="lg"
      >
        {t('deposit with a 50% bonus')}
      </Button>
    </div>
  );
}

export default { openFirstDepositModal };
