import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button, Input, message, Modal } from '@components';
import { validateEmail } from '@utils';
import { request } from '@utils/axios';

// ----------------------------------------------------------------------

export default function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state.email as string);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const onSendCode = async () => {
    if (!email) {
      message.error(t('Please enter you remail'));
      return;
    }
    if (!validateEmail(email)) {
      message.error(t('Invalid email'));
      return;
    }
    try {
      setIsSubmitting(true);
      await request.post('/api/user/password/reset', {
        email,
      });
      message.success(t('Password reset link sent. Check your email inbox.'));
      Modal.close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="text-secondary text-14 mb-1.5">{t('Email')}</div>
      <Input
        autoFocus
        placeholder={t('Email')}
        value={email}
        onChange={setEmail}
        className="text-16 border border-input"
      />
      <div className="text-secondary text-12 mt-1.5 mb-5">
        {t(`Enter your email and we'll send you a new password`)}
      </div>
      <div className="gap-5 flex">
        <Button loading={isSubmitting} onClick={onSendCode} className="h-12 text-16 flex-1">
          {t('Reset password')}
        </Button>
      </div>
    </div>
  );
}
