import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMfaInfo, useUserInfo } from '@store/user';
import { Modal, Tabs } from '@components';
import Crypto from './CryptoTab';
import Fiat from './FiatTab';
import { Help } from './WithdrawHelp';

export default function Withdraw() {
  const { t } = useTranslation();
  const { data: mfa, isValidating: mfaLoading } = useMfaInfo();
  const { data: user, isValidating: userLoading } = useUserInfo();
  const loading = mfaLoading || userLoading;
  useEffect(() => {
    if (loading) return;
    if (!user.email || !mfa.bind) {
      return Modal.open({
        title: t('Verification'),
        children: <Help />,
        size: 'sm',
      });
    }
  }, [user, mfa, loading, t]);

  return (
    <Tabs className="detrade-card s768:pb-8">
      <Tabs.Header className="w-full s768:w-60">
        <Tabs.Item className="flex-1">{t('Crypto')}</Tabs.Item>
        <Tabs.Item className="flex-1">{t('Fiat')}</Tabs.Item>
      </Tabs.Header>

      <Tabs.Panel>
        <Crypto />
      </Tabs.Panel>
      <Tabs.Panel>
        <Fiat />
      </Tabs.Panel>
    </Tabs>
  );
}
