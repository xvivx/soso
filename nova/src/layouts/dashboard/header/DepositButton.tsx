import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setFirstDepositTip } from '@store/system';
import { AccountType, useAccountType } from '@store/wallet';
import useFirstDeposit from '@hooks/useFirstDeposit';
import useNavigate from '@hooks/useNavigate';
import { Button, Image, Modal } from '@components';
import DepositBox from '@/Spine/DepositBox';
import rewardBox from './assets/rewardBox.png';

export default function DepositButton() {
  const { t } = useTranslation();
  const firstDeposit = useFirstDeposit();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const accountType = useAccountType();
  const firstDepositTip = useSelector((state: StoreState) => state.system.firstDepositTip);
  const dispatch = useDispatch();

  // 新用户、没有提醒过充值、live账户的需要弹出充值提醒
  useEffect(() => {
    if (firstDeposit && !firstDepositTip && accountType === AccountType.REAL) {
      setVisible(true);
      dispatch(setFirstDepositTip(true));
    }
  }, [firstDeposit, firstDepositTip, accountType, dispatch]);

  if (firstDeposit) {
    return (
      <>
        <Button
          onClick={() => setVisible(true)}
          className="gap-2.5 px-3 py-1 bg-success/20"
          size="free"
          theme="transparent"
        >
          <DepositBox className="size-6" />
          <div className="-space-y-1">
            <div className="text-14 font-600">{t('Get 50% bonus')}</div>
            <div className="text-10 text-secondary font-500">{t('On your first deposit')}</div>
          </div>
        </Button>
        <Modal visible={visible} title=" " onClose={setVisible} className="text-center" size="sm">
          <Image className="h-30 w-36 mx-auto mb-8" src={rewardBox} />
          <div className="mb-3 text-24 text-primary font-600">{t('Welcome Bonus')}</div>
          <div className="mb-8 text-16 text-secondary">
            <Trans
              i18nKey={t(
                `Make successful trades and accumulate the maximum bonus on your first deposit. <0>Learn more<0>`
              )}
            >
              <span
                onClick={() => navigate('/deposit-bonus-guide')}
                className="underline decoration-dashed cursor-pointer"
              />
            </Trans>
          </div>
          <Button
            onClick={() => {
              navigate('/dashboard/wallet/deposit');
              Modal.close();
            }}
            size="lg"
          >
            {t('deposit with a 50% bonus')}
          </Button>
        </Modal>
      </>
    );
  }

  return null;
}
