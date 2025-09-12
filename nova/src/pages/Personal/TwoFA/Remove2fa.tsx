import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMfaInfo } from '@store/user';
import { Button, InputOtp, message, Modal } from '@components';
import { request } from '@utils/axios';
import { getUtcTime24HoursLater } from '@utils/others';
import i18n from '@/i18n';

function openRemoveModal() {
  Modal.open({
    children: <RemoveModal />,
    size: 'md',
  });
}

function RemoveModal() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <svg
        className="mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
      >
        <path
          d="M29.9599 3.75781C23.2587 3.75781 16.5576 6.30351 11.4288 11.4323C1.20862 21.6525 1.20862 38.2743 11.4288 48.4944C16.5576 53.6232 23.2587 56.1689 29.9599 56.1689C36.661 56.1689 43.3621 53.6232 48.4909 48.4944C58.7111 38.2743 58.7111 21.6525 48.4909 11.4323C43.3621 6.30351 36.661 3.75781 29.9599 3.75781ZM29.9599 6.3784C33.0297 6.3784 36.0246 6.97739 38.8323 8.10049C41.7523 9.29848 44.3729 11.0205 46.6191 13.3042C48.9027 15.5504 50.6248 18.1709 51.8228 21.091C52.9459 23.8987 53.5449 26.8936 53.5449 29.9634C53.5449 33.0332 52.9459 36.0281 51.8228 38.8358C50.6248 41.7559 48.9028 44.3764 46.6191 46.6226C44.3729 48.9062 41.7524 50.6283 38.8323 51.8263C36.0246 52.9494 33.0297 53.5484 29.9599 53.5484C26.8901 53.5484 23.8951 52.9494 21.0874 51.8263C18.1674 50.6283 15.5468 48.9063 13.3006 46.6226C11.017 44.3764 9.29492 41.7559 8.09693 38.8358C6.97384 36.0281 6.37484 33.0332 6.37484 29.9634C6.37484 26.8936 6.97384 23.8987 8.09693 21.091C9.29492 18.171 11.017 15.5504 13.3006 13.3042C15.5468 11.0206 18.1673 9.29848 21.0874 8.10049C23.8951 6.97739 26.8901 6.3784 29.9599 6.3784Z"
          fill="#24EE89"
        />
        <path
          d="M30.2711 41.7844C31.0461 41.7844 31.7115 42.0549 32.2672 42.596C32.8229 43.1371 33.1007 43.7951 33.1007 44.5702C33.1007 45.3598 32.8229 46.0216 32.2672 46.5553C31.7115 47.0891 31.0461 47.356 30.2711 47.356C29.496 47.356 28.8307 47.0891 28.275 46.5553C27.7193 46.0216 27.4414 45.3598 27.4414 44.5702C27.4414 43.7951 27.7193 43.1371 28.275 42.596C28.8307 42.0549 29.496 41.7844 30.2711 41.7844ZM32.4207 12.8516L31.9382 37.156H28.4723L27.9898 12.8516H32.4207Z"
          fill="#24EE89"
        />
      </svg>
      <div className="text-center text-primary text-20 s768:text-24">
        {t('Confirm removing Google 2FA authentication?')}
      </div>
      <div className="p-3 rounded-3 bg-layer3">
        <div className="mb-1 text-brand text-16">{t('Note')}</div>
        <div className="text-secondary text-14">
          {t(
            `To ensure the safety of your account, withdrawals will be suspended for 24 hours once the Google 2FA authentication is removed.`
          )}
        </div>
      </div>
      <Modal.Footer className="flex gap-6">
        <Button onClick={() => Modal.close()} className="flex-1" theme="secondary" size="lg">
          {t('Cancel')}
        </Button>
        <Button onClick={openVerify2fa} className="flex-1" theme="primary" size="lg">
          {t('Remove')}
        </Button>
      </Modal.Footer>
    </div>
  );
}

function openVerify2fa() {
  Modal.open({
    title: i18n.t('Security Verification'),
    children: <Verify2fa />,
    size: 'sm',
  });
}

function Verify2fa() {
  const { t } = useTranslation();
  const [twoFaCode, setTwoFaCode] = useState('');
  const [error, setError] = useState({
    code: '',
  });
  const { mutate } = useMfaInfo();

  const onUnBind = async () => {
    if (!twoFaCode || twoFaCode.length < 6) {
      setError((prev) => {
        return { ...prev, code: t('Verification code failed') };
      });
      return;
    }
    const params = {
      code: twoFaCode,
    };
    try {
      await request.post('/api/user/mfa/unBind', params);
      message.success(t('Remove 2fa Success'));
      Modal.close();
      openNoWithdrawalWarn();
      // 更新mfa信息
      await mutate();
    } catch (error) {
      setError((prev) => {
        return { ...prev, code: error.msg };
      });
    }
  };

  useEffect(() => {
    setError({
      code: '',
    });
  }, [twoFaCode]);

  const disabled = !twoFaCode || twoFaCode.length < 6;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-14 text-primary">{t(`Google 2FA code`)}</div>
        <InputOtp onChange={setTwoFaCode} size="md" className="mb-1" />
        {error.code && <div className="text-error">{error.code}</div>}
      </div>
      <Button onClick={onUnBind} disabled={disabled} size="lg" className="w-full">
        {t('Next')}
      </Button>
    </div>
  );
}

function openNoWithdrawalWarn() {
  Modal.open({
    title: i18n.t('Security Verification'),
    children: <NoWithdrawalWarn />,
    size: 'md',
  });
}

function NoWithdrawalWarn() {
  const { t } = useTranslation();
  const time = getUtcTime24HoursLater();

  return (
    <div>
      <WarningIcon className="mx-auto mb-3" />
      <div className="flex flex-col gap-5">
        <div className="text-primary text-20 s768:text-24">{t('No withdrawal of coins within 24 hours')}</div>
        <div className="text-secondary text-14">
          {t(
            `24 Hours Withdrawal Restriction Notice Our system has identified changes to important information in your account, and so we are temporarily suspending the withdrawal feature of your account while we take steps to secure your assets.Restrictions will be automatically lifted at UTC time {{time}}`,
            { time }
          )}
        </div>
        <Button onClick={() => Modal.closeAll()} size="lg">
          {t('Confirm')}
        </Button>
      </div>
    </div>
  );
}

const Remove2fa = { openRemoveModal };
export default Remove2fa;

function WarningIcon(props: BaseProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none" {...props}>
      <path
        d="M29.9599 3.75781C23.2587 3.75781 16.5576 6.30351 11.4288 11.4323C1.20862 21.6525 1.20862 38.2743 11.4288 48.4944C16.5576 53.6232 23.2587 56.1689 29.9599 56.1689C36.661 56.1689 43.3621 53.6232 48.4909 48.4944C58.7111 38.2743 58.7111 21.6525 48.4909 11.4323C43.3621 6.30351 36.661 3.75781 29.9599 3.75781ZM29.9599 6.3784C33.0297 6.3784 36.0246 6.97739 38.8323 8.10049C41.7523 9.29848 44.3729 11.0205 46.6191 13.3042C48.9027 15.5504 50.6248 18.1709 51.8228 21.091C52.9459 23.8987 53.5449 26.8936 53.5449 29.9634C53.5449 33.0332 52.9459 36.0281 51.8228 38.8358C50.6248 41.7559 48.9028 44.3764 46.6191 46.6226C44.3729 48.9062 41.7524 50.6283 38.8323 51.8263C36.0246 52.9494 33.0297 53.5484 29.9599 53.5484C26.8901 53.5484 23.8951 52.9494 21.0874 51.8263C18.1674 50.6283 15.5468 48.9063 13.3006 46.6226C11.017 44.3764 9.29492 41.7559 8.09693 38.8358C6.97384 36.0281 6.37484 33.0332 6.37484 29.9634C6.37484 26.8936 6.97384 23.8987 8.09693 21.091C9.29492 18.171 11.017 15.5504 13.3006 13.3042C15.5468 11.0206 18.1673 9.29848 21.0874 8.10049C23.8951 6.97739 26.8901 6.3784 29.9599 6.3784Z"
        fill="#24EE89"
      />
      <path
        d="M30.2701 41.7844C31.0451 41.7844 31.7105 42.0549 32.2662 42.596C32.8219 43.1371 33.0998 43.7951 33.0998 44.5702C33.0998 45.3598 32.8219 46.0216 32.2662 46.5553C31.7105 47.0891 31.0451 47.356 30.2701 47.356C29.4951 47.356 28.8297 47.0891 28.274 46.5553C27.7183 46.0216 27.4404 45.3598 27.4404 44.5702C27.4404 43.7951 27.7183 43.1371 28.274 42.596C28.8297 42.0549 29.4951 41.7844 30.2701 41.7844ZM32.4198 12.8516L31.9372 37.156H28.4714L27.9888 12.8516H32.4198Z"
        fill="#24EE89"
      />
    </svg>
  );
}
