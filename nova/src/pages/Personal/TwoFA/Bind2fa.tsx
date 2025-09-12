import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useMfaInfo } from '@store/user';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, FormItem, Image, Input, InputOtp, message, Modal } from '@components';
import { cn } from '@utils';
import { request } from '@utils/axios';
import CopyButton from '@pages/components/CopyButton';
import i18n from '@/i18n';

function openSetUp() {
  Modal.open({
    title: i18n.ts('Set up Google Authenticator'),
    children: <SetUp />,
    size: 'md',
  });
}
function SetUp() {
  const { t } = useTranslation();
  const [twoFaCode, setTwoFaCode] = useState('');
  const { mobile } = useMediaQuery();
  const { mutate } = useMfaInfo();
  const { data: mfa, isValidating: loading } = useSWR(
    ['user-mfa-code'],
    () => request.get<{ qrcode: string; secret: string }>('/api/user/mfa/secretWithQrcode/get'),
    { fallbackData: { qrcode: '', secret: '' }, revalidateOnFocus: false }
  );

  const url = useMemo(() => {
    const { userAgent } = navigator;
    if (/iPad|iPhone|iPod|Mac/.test(userAgent)) {
      return 'https://apps.apple.com/us/app/google-authenticator/id388497605';
    } else {
      return 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en';
    }
  }, []);

  const [error, setError] = useState('');
  const onBind = async () => {
    if (error) return;
    try {
      await request.post('/api/user/mfa/bind', { code: twoFaCode });
      message.success(t('Bind Success'));
      // 更新mfa信息
      await mutate();
      Modal.close();
    } catch (error) {
      setError(error.msg);
    }
  };

  return (
    <div className="space-y-5 text-14">
      <div className="flex">
        <StepNumber step="1" />
        <div className="flex-1">
          <div className="text-primary">{t('Download the Google Authenticator app')}</div>
          <a className="underline text-brand" target="_blank" href={url} rel="noreferrer">
            {t('Google Authenticator can be downloaded from the App store or Google Play.')}
            <br />
            {t('search “Google Authenticator” and proceed to download.')}
          </a>
        </div>
      </div>
      <div className="flex">
        <StepNumber step="2" />
        <div className="flex-1 overflow-hidden text-14 text-secondary">
          <div className="mb-2.5 text-primary">
            {t('Add key phrase into Google Authenticator and remember the key phrase')}
          </div>

          <div className="mb-1.5">{t('Copy this code to your authenticator app')}</div>
          <Input
            className="gap-2 mb-2.5"
            type="hidden"
            prefix={<div className="flex-1 text-primary truncate font-600">{mfa.secret}</div>}
            suffix={<CopyButton className="shrink-0 h-full px-1" size="free" value={mfa.secret} />}
          />

          <div>
            {t(
              'Open Google Authenticator, scan the QR code below or manually enter the key phrase to activate the verification token'
            )}
          </div>
        </div>
      </div>

      <div className="relative py-6 rounded-3 bg-layer3">
        <Image src={mfa.qrcode} className={cn('size-44 rounded-2 mx-auto', loading && 'opacity-50')} />
        <div className="px-4 text-center text-14 text-secondary">{t("Don't let anyone see this!")}</div>
      </div>

      <FormItem label={null} error={error}>
        <div className="flex items-center mb-3">
          <StepNumber step="3" />
          <div className="flex-1 text-primary">{t('Please enter an 2FA code')}</div>
        </div>
        <InputOtp
          className="text-28 text-brand"
          value={twoFaCode}
          size={mobile ? 48 : 58}
          onChange={(value) => {
            value.length === 6 && setError('');
            setTwoFaCode(value);
          }}
        />
      </FormItem>

      <Modal.Footer className="flex gap-6">
        <Button onClick={onBind} size="lg" disabled={twoFaCode.length < 6} className="flex-1">
          {t('Confirm')}
        </Button>
        <Button onClick={() => Modal.close()} size="lg" className="flex-1" theme="secondary">
          {t('Cancel')}
        </Button>
      </Modal.Footer>
    </div>
  );
}

function StepNumber({ step }: { step: string }) {
  return <div className="flex items-center justify-center mr-3 rounded-full size-6 bg-tab_selected">{step}</div>;
}

const Bind2fa = { openSetUp };
export default Bind2fa;
