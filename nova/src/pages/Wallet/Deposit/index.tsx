import { useTranslation } from 'react-i18next';
import { Tabs } from '@components';
import { useInPortal } from '@components/FunctionRender';
import { cn } from '@utils';
import CryptoDeposit from './CryptoTab';
import FiatDeposit from './FiatTab';

export default function Deposit() {
  const { t } = useTranslation();
  const inPortal = useInPortal();
  return (
    <Tabs className={inPortal ? '' : 'detrade-card s768:pb-8'}>
      <Tabs.Header className={cn('w-full', inPortal ? 'darkness bg-layer2' : 's768:w-60')}>
        <Tabs.Item className="flex-1">{t('Crypto')}</Tabs.Item>
        <Tabs.Item className="flex-1">{t('Fiat')}</Tabs.Item>
      </Tabs.Header>

      <Tabs.Panel>
        <CryptoDeposit />
      </Tabs.Panel>
      <Tabs.Panel>
        <FiatDeposit />
      </Tabs.Panel>
    </Tabs>
  );
}
