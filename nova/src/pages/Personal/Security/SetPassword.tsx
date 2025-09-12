import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sha256 } from 'js-sha256';
import { mutate } from 'swr';
import useMemoCallback from '@hooks/useMemoCallback';
import { Accordion, Button, FormItem, Input, message } from '@components';
import { request } from '@utils/axios';
import passwordValidate from '@utils/passwordValidate';
import PasswordRuleItems from '@pages/components/PasswordRuleItems';
import PasswordStrengthMeter from '@pages/components/PasswordStrengthMeter';

function Password() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [blur, setBlur] = useState(false);

  const onSubmit = useMemoCallback(async () => {
    await request.post('/api/user/password/set', { password: sha256(password.trim()) });
    message.success(t('Set successfully'));
    mutate((key: string[]) => key && key[0] === 'user-info');
  });

  const isFormValid = useMemo(() => {
    const validation = passwordValidate(password);

    return password.length > 0 && validation.isMediumStrength;
  }, [password]);

  return (
    <>
      <FormItem
        label={null}
        error={
          blur &&
          (!password || !passwordValidate(password).hasValidLength) &&
          t('New password is {{exceed}} length', { exceed: '8-32' })
        }
      >
        <div className="flex flex-col gap-3 s768:flex-row">
          <Input.Password
            className="s768:flex-1 bg-layer2"
            value={password}
            onChange={setPassword}
            onBlur={() => setBlur(true)}
            placeholder={t('Enter your password')}
            autoComplete="new-password"
            size="lg"
          />
          <Button disabled={!isFormValid} onClick={onSubmit} className="w-full s768:w-auto" size="lg">
            {t('Confirm')}
          </Button>
        </div>
      </FormItem>
      <Accordion.Collapse defaultOpen={blur} className="space-y-3 mt-3">
        <PasswordStrengthMeter password={password} className="w-64" />
        <PasswordRuleItems password={password} />
      </Accordion.Collapse>
    </>
  );
}

export default memo(Password);
