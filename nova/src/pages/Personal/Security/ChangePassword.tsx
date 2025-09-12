import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sha256 } from 'js-sha256';
import { Accordion, Button, FormItem, Input, message } from '@components';
import { request } from '@utils/axios';
import passwordValidate from '@utils/passwordValidate';
import PasswordRuleItems from '@pages/components/PasswordRuleItems';
import PasswordStrengthMeter from '@pages/components/PasswordStrengthMeter';

function ChangePassword() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [blur, setBlur] = useState({
    oldPassword: false,
    newPassword: false,
  });

  const isFormValid = useMemo(() => {
    const { oldPassword, newPassword } = form;
    const validation = passwordValidate(newPassword);

    return (
      oldPassword.length > 0 && newPassword.length > 0 && validation.isMediumStrength && newPassword !== oldPassword
    );
  }, [form]);

  return (
    <div className="space-y-3">
      <FormItem
        label={<span className="font-700">{t('Old Password')}</span>}
        error={
          blur.oldPassword &&
          (!form.oldPassword || !passwordValidate(form.oldPassword).hasValidLength) &&
          t('Old password is {{exceed}} length', { exceed: '8-32' })
        }
      >
        <Input.Password
          className="bg-layer2"
          value={form.oldPassword}
          onChange={(value) => setForm((prev) => ({ ...prev, oldPassword: value }))}
          onBlur={() => setBlur((prev) => ({ ...prev, oldPassword: true }))}
          autoComplete="old-password"
          placeholder={t('Enter your old password')}
          size="lg"
        />
      </FormItem>

      <FormItem
        label={<span className="font-700">{t('New Password')}</span>}
        error={
          blur.newPassword &&
          (((!form.newPassword || !passwordValidate(form.newPassword).hasValidLength) &&
            t('New password is {{exceed}} length', { exceed: '8-32' })) ||
            (form.newPassword === form.oldPassword && t('Passwords must differ')))
        }
      >
        <Input.Password
          className="bg-layer2"
          value={form.newPassword}
          onChange={(value) => setForm((prev) => ({ ...prev, newPassword: value }))}
          onBlur={() => setBlur((prev) => ({ ...prev, newPassword: true }))}
          autoComplete="new-password"
          placeholder={t('Enter your new password')}
          size="lg"
        />
      </FormItem>
      <Accordion.Collapse defaultOpen={blur.newPassword} className="space-y-3">
        <PasswordStrengthMeter password={form.newPassword} className="w-64" />
        <PasswordRuleItems password={form.newPassword} />
      </Accordion.Collapse>
      <div className="flex flex-col-reverse items-center justify-between gap-3 s768:flex-row">
        <div className="text-secondary text-12 s768:text-14 font-500">
          {t(
            'To protect the security of your account, withdrawals will be disabled for 24 hours after you change your password.'
          )}
        </div>
        <Button
          disabled={!isFormValid}
          className="w-full s768:w-auto"
          size="lg"
          onClick={async () => {
            const { oldPassword, newPassword } = form;
            await request.post('/api/user/password/update', {
              oldPassword: sha256(oldPassword.trim()),
              newPassword: sha256(newPassword.trim()),
            });
            message.success('Modified successfully');
          }}
        >
          {t('Change password')}
        </Button>
      </div>
    </div>
  );
}

export default ChangePassword;
