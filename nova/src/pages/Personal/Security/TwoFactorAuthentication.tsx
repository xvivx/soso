import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { useMfaInfo } from '@store/user';
import { Button, message, Switch } from '@components';
import { request } from '@utils/axios';
import { Card } from '@pages/components';
import Bind2fa from '../TwoFA/Bind2fa';
import Remove2fa from '../TwoFA/Remove2fa';

function TwoFactorAuthentication() {
  const { data: mfaInfo } = useMfaInfo();
  return (
    <>
      <Set2FA />
      {mfaInfo.bind && <SetLogin />}
    </>
  );
}

export default TwoFactorAuthentication;

function Set2FA() {
  const { t } = useTranslation();
  const { data: mfaInfo, isLoading: loading } = useMfaInfo();

  return (
    <Card>
      <Card.Title>
        <div className="text-14 s768:text-16 font-700">{t('2FA authentication')}</div>
        <Button
          className={loading ? 'opacity-0' : ''}
          size="lg"
          onClick={() => {
            if (mfaInfo.bind) {
              Remove2fa.openRemoveModal();
            } else {
              Bind2fa.openSetUp();
            }
          }}
        >
          {mfaInfo.bind ? t('Remove') : t('Set up')}
        </Button>
      </Card.Title>
      <div className="text-12 s768:text-14">
        {t(
          'Using two-factor authentication is highly recommended because it protects your account with both your password and your phone.'
        )}
      </div>
    </Card>
  );
}

function SetLogin() {
  const { t } = useTranslation();
  const { data: mfaInfo, mutate } = useMfaInfo();
  const [switchValue, setSwitchValue] = useState(mfaInfo.enableLogin);

  useEffect(() => {
    setSwitchValue(mfaInfo.enableLogin);
  }, [mfaInfo.enableLogin]);

  // 这里用useMemo去替代useCallback, 解决useCallback包裹debounce警告expects an inline function.
  const updateEnableLogin = useMemo(
    () =>
      debounce(async (newValue) => {
        if (newValue !== mfaInfo.enableLogin) {
          await request.post('/api/user/mfa/enableLogin/update', { enableLogin: newValue });
          mutate();

          if (newValue) {
            message.success(t('Now login need 2FA'));
          } else {
            message.success(t('Now login disabled 2FA'));
          }
        }
      }, 500),
    [mutate, t, mfaInfo.enableLogin]
  );
  return (
    <Card className="flex items-center justify-between text-primary text-14 s768:text-16 font-700">
      <div>{t('Login 2FA switch')}</div>
      <Switch
        checked={switchValue}
        onCheckedChange={async (value) => {
          setSwitchValue(value);
          updateEnableLogin(value);
        }}
      />
    </Card>
  );
}
