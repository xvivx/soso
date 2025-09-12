import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMfaInfo, useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { Button, ButtonProps, Modal, SvgIcon } from '@components';
import { cn } from '@utils';

export function Help() {
  const { data: userInfo } = useUserInfo();
  const { data: mfaInfo } = useMfaInfo();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="text-primary text-12 font-500">
        {t('For the safety of your funds, withdrawals must complete the following binding')}
      </div>
      <CheckItem
        typeIcon={<SvgIcon name="email" className="text-brand size-10" />}
        StatusIcon={<VerifyIcon status={!!userInfo.email} className="size-6" />}
      >
        {t('Email')}
      </CheckItem>
      <CheckItem
        typeIcon={<SvgIcon name="google" className="size-10" />}
        StatusIcon={<VerifyIcon status={mfaInfo.bind} className="size-6" />}
      >
        {t('Two-Factor authentication')}
      </CheckItem>
      <Modal.Footer>
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            Modal.closeAll();
            navigate('/dashboard/personal/security');
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

export function WithdrawButton({ onClick, ...props }: ButtonProps) {
  const { t } = useTranslation();
  const { data: userInfo } = useUserInfo();
  const { data: mfaInfo } = useMfaInfo();

  return (
    <Button
      {...props}
      onClick={(event) => {
        if (!userInfo.email || !mfaInfo.bind) {
          event.preventDefault();
          Modal.open({
            title: t('Verification'),
            children: <Help />,
            size: 'sm',
          });
        } else {
          return onClick && onClick(event);
        }
      }}
    />
  );
}
