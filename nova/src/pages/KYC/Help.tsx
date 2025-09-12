import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useKYCInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { Button, Modal, SvgIcon } from '@components';
import SvgKYC from '@components/SvgIcon/private/kyc.svg';
import { cn } from '@utils';

export function Help() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { verified } = useKYCInfo();

  return (
    <div className="space-y-4">
      <div className="text-primary text-12 font-500">
        {t('For the safety of your funds, must complete the following binding')}
      </div>
      <CheckItem
        typeIcon={<SvgKYC className="size-5" />}
        StatusIcon={<VerifyIcon status={verified} className="size-6" />}
      >
        {t('KYC authentication')}
      </CheckItem>
      <Modal.Footer>
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            Modal.closeAll();
            navigate('/dashboard/personal');
          }}
        >
          {t('Go bind')}
        </Button>
      </Modal.Footer>
    </div>
  );
}

function CheckItem(props: { typeIcon: ReactNode; children: ReactNode; StatusIcon: ReactNode }) {
  const { typeIcon, children, StatusIcon } = props;
  return (
    <div className="flex items-center h-12 py-1 pl-3 pr-1 bg-layer3 rounded-2">
      {typeIcon}
      <div className="ml-3 mr-auto text-14 text-primary">{children}</div>
      {StatusIcon}
    </div>
  );
}

function VerifyIcon(props: { status: boolean; className?: string }) {
  const { status, className } = props;
  if (status) {
    return <SvgIcon name="check" className={className} />;
  }
  return <SvgIcon name="remind" className={cn(className, 'text-warn hover:text-warn')} />;
}
