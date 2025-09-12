import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { sha256 } from 'js-sha256';
import { useUserApis } from '@store';
import { useUserInfoByInviteCode } from '@store/user';
import { Accordion, Button, FormItem, Input, Modal, SvgIcon, VerifyCodeButton } from '@components';
import { validateEmail } from '@utils';
import passwordValidate from '@utils/passwordValidate';
import PasswordRuleItems from '@pages/components/PasswordRuleItems';
import PasswordStrengthMeter from '@pages/components/PasswordStrengthMeter';
import { VerifyEmailType } from '@/type';
import { AuthLogo, DividerWithText } from './Component';
import Third from './Third';
import { useViewNavigator } from './useViewNavigate';

const classNames = {
  container: 's768:p-15 s768:rounded-5 s768:border s768:border-thirdly bg-layer2 space-y-4 s768:space-y-5',
};

enum RegisterView {
  EMAIL = 'EMAIL',
  CREATE_PASSWORD = 'CREATE_PASSWORD',
}

function Register() {
  const [email, setEmail] = useState('');
  const { currentView, navigateTo, goBack } = useViewNavigator<RegisterView>(RegisterView.EMAIL);

  const renderView = () => {
    switch (currentView) {
      case RegisterView.EMAIL:
        return <Email email={email} onChange={setEmail} navigateTo={navigateTo} />;
      case RegisterView.CREATE_PASSWORD:
        return <CreatePassword email={email} goBack={goBack} />;
    }
  };

  return renderView();
}

function Email({
  email,
  onChange,
  navigateTo,
}: {
  email: string;
  onChange: (email: string) => void;
  navigateTo: (view: RegisterView) => void;
}) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState('');

  // 验证函数
  const validate = useCallback(() => {
    if (!email) {
      setErrors(t('{{field}} is required', { field: t('Email') }));
      return false;
    }
    if (!validateEmail(email)) {
      setErrors(t('Please enter a valid email address'));
      return false;
    }
    setErrors('');
    return true;
  }, [email, t]);

  const onSubmit = useCallback(() => {
    if (!validate()) {
      return;
    }
    navigateTo(RegisterView.CREATE_PASSWORD);
  }, [navigateTo, validate]);

  return (
    <div className={classNames.container}>
      <AuthLogo />
      <div className="text-20 s768:text-28 w-40 s768:w-56 font-700 text-primary mx-auto !mb-8 !s768:mb-12">
        {t('Register to Win Crypto Tokens')}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4 s768:space-y-5"
      >
        <FormItem label={t('Email')} error={errors}>
          <Input
            placeholder={t('Email')}
            value={email}
            onChange={onChange}
            onBlur={validate}
            type="email"
            autoComplete="email"
            size="lg"
            className="bg-layer2"
          />
        </FormItem>
        <Button type="submit" className="w-full" size="lg">
          {t('Continue')}
        </Button>
      </form>
      <DividerWithText />
      <Third />
      <div className="text-tertiary text-12 s768:text-16 font-500 mt-6 text-center">
        {t(`Already have an account?`)}
        <Button asChild theme="text" className="text-primary px-1 s768:px-1">
          <NavLink to="/account/login" replace>
            {t('Login here.')}
          </NavLink>
        </Button>
      </div>
    </div>
  );
}

class Field {
  value: string;
  error: string;
  constructor() {
    this.value = '';
    this.error = '';
  }
}
function CreatePassword({ email, goBack }: { email: string; goBack: () => void }) {
  const { t } = useTranslation();
  const { register } = useUserApis();
  const { search } = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const urlInviteCode = useMemo(() => {
    return new URLSearchParams(search).get('r') || '';
  }, [search]);
  const [formValues, setFormValues] = useState(() => {
    return {
      email: { ...new Field(), value: email },
      password: new Field(),
      code: new Field(),
      inviteCode: { ...new Field(), value: urlInviteCode },
    };
  });
  const { hasValidLength, hasUpperCase, hasLowerCase, hasNumber } = passwordValidate(formValues.password.value);

  // 根据inviteCode查询对应的用户名
  const { nickName } = useUserInfoByInviteCode(formValues.inviteCode.value).data;

  // 校验器
  const validators = useMemo(
    () => ({
      email(value: string) {
        if (!value) return t('{{field}} is required', { field: t('Email') });
        return validateEmail(value) ? '' : t('Invalid email');
      },
      password(password: string) {
        if (!password) return t('{{field}} is required', { field: t('Password') });
        if (!hasValidLength) return t('Minimum {{min}} characters and maximum {{max}} characters', { min: 8, max: 32 });
        if (!(hasUpperCase || hasLowerCase)) return t('Uppercase or lowercase letters');
        if (!hasNumber) return t('At least {{exceed}} number', { exceed: 1 });
        return '';
      },
      code(value: string) {
        return value ? '' : t('{{field}} is required', { field: t('Email Code') });
      },
    }),
    [t, hasValidLength, hasUpperCase, hasLowerCase, hasNumber]
  );

  const validateField = useCallback(
    (key: Exclude<keyof typeof formValues, 'inviteCode'>, value: string) => {
      const error = validators[key](value);
      setFormValues((prev) => ({ ...prev, [key]: { ...prev[key], value, error } }));
    },
    [validators]
  );

  const isFormValid = useMemo(() => {
    const { isMediumStrength } = passwordValidate(formValues.password.value);

    return (
      !validators.email(formValues.email.value) &&
      !validators.password(formValues.password.value) &&
      !validators.code(formValues.code.value) &&
      isMediumStrength
    );
  }, [formValues.email.value, formValues.password.value, formValues.code.value, validators]);

  const onSubmit = useCallback(
    async (event: SyntheticEvent) => {
      event.preventDefault();

      if (!isFormValid) return;

      try {
        setSubmitting(true);
        await register({
          email: formValues.email.value,
          password: sha256(formValues.password.value.trim()),
          code: formValues.code.value,
          inviteCode: formValues.inviteCode.value,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [register, isFormValid, formValues]
  );

  const onValueChange = useCallback((key: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
  }, []);

  return (
    <div className={classNames.container}>
      <div onClick={goBack} className="inline-flex items-center gap-2 cursor-pointer">
        <Button icon={<SvgIcon name="arrow" className="rotate-180" />} size="free" theme="transparent" />
        <div className="font-500 text-secondary">{t('Create Password')}</div>
      </div>
      <form className="flex flex-col flex-1 gap-5" onSubmit={onSubmit}>
        <FormItem label={t('Email')} error={formValues.email.error}>
          <Input
            placeholder={t('Email')}
            value={formValues.email.value}
            onChange={(email) => onValueChange('email', email)}
            onBlur={() => validateField('email', formValues.email.value)}
            autoComplete="off"
            type="email"
            size="lg"
            className="bg-inherit w-full s768:w-96"
            disabled
          />
        </FormItem>

        <FormItem label={t('Email Code')} error={formValues.code.error}>
          <Input
            placeholder={t('Email Code')}
            value={formValues.code.value}
            onChange={(code) => onValueChange('code', code)}
            onBlur={() => validateField('code', formValues.code.value)}
            inputMode="numeric"
            size="lg"
            className="bg-inherit"
            suffix={
              <VerifyCodeButton
                className="w-16 h-full"
                disabled={!formValues.email.value}
                to={formValues.email.value}
                businessType={VerifyEmailType.register}
                onHttpSuccess={() => {
                  setFormValues((prev) => {
                    return {
                      ...prev,
                      code: { ...prev.code, error: '' },
                    };
                  });
                }}
                onHttpError={(message) => {
                  setFormValues((prev) => {
                    return {
                      ...prev,
                      code: { ...prev.code, error: message },
                    };
                  });
                }}
                type="button"
              />
            }
          />
        </FormItem>

        <FormItem label={t('Password')} error={formValues.password.error}>
          <Input.Password
            placeholder={t('Enter your password')}
            value={formValues.password.value}
            onChange={(password) => onValueChange('password', password)}
            onBlur={() => validateField('password', formValues.password.value)}
            size="lg"
            className="bg-inherit"
          />
        </FormItem>

        <PasswordStrengthMeter password={formValues.password.value} className="-mt-2" />
        <PasswordRuleItems password={formValues.password.value} />

        <Button
          disabled={!isFormValid}
          className="sticky bottom-0 z-10 w-full"
          size="lg"
          type="submit"
          loading={submitting}
        >
          {t('Start trading')}
        </Button>
      </form>

      <Accordion.Collapse defaultOpen={!nickName}>
        <Button onClick={() => setShowModal(true)} theme="text" size="lg" className="text-secondary mx-auto block">
          {t('Add referral')}
        </Button>
      </Accordion.Collapse>

      <Accordion.Collapse defaultOpen={Boolean(nickName)} className="text-center">
        <div
          onClick={() => {
            // 如果是邀请链接生成的code, 不允许修改
            if (urlInviteCode) return;
            setShowModal(true);
          }}
          className="text-12 text-secondary text-center cursor-pointer inline-block"
        >
          {t('Referral by')} {nickName}
        </div>
      </Accordion.Collapse>

      <AddReferral
        visible={showModal}
        setVisible={setShowModal}
        value={formValues.inviteCode.value}
        onChange={(inviteCode) => onValueChange('inviteCode', inviteCode)}
      />
    </div>
  );
}

export default Register;

function AddReferral({
  visible,
  setVisible,
  value,
  onChange,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  const [input, setInput] = useState(value);
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      setInput(value);
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} onClose={setVisible} size="sm">
      <div className="w-22 p-6 mx-auto rounded-full border border-thirdly mb-5">
        <Gif />
      </div>
      <div className="text-20 font-600 text-center text-primary mb-12">{t('Add referral code')}</div>
      <Input placeholder={t('Referral')} value={input} onChange={setInput} autoComplete="off" size="lg" />
      <Modal.Footer className="flex items-center gap-4">
        <Button
          size="lg"
          theme="secondary"
          className="flex-1"
          onClick={() => {
            setVisible(false);
          }}
        >
          {t('Cancel')}
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={() => {
            setVisible(false);
            onChange(input);
          }}
        >
          {t('Save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function Gif() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path
        d="M34.9119 9.43289H29.6469C31.209 6.82931 31.2669 4.11003 29.7047 2.6636C27.7376 0.831456 23.9962 1.77646 21.1997 4.80431C20.7369 5.30574 20.3512 5.82646 20.004 6.36646C19.6569 5.82646 19.2712 5.28646 18.8083 4.80431C16.0119 1.77646 12.2897 0.850742 10.3226 2.6636C8.74116 4.11003 8.8183 6.82931 10.3612 9.43289H5.09616C3.0133 9.43289 1.29688 11.13 1.29688 13.2322V16.1057C1.29688 17.9186 2.58902 19.4422 4.28616 19.8086V34.4657C4.28616 36.78 6.15688 38.6507 8.47116 38.6507H31.5176C33.8319 38.6507 35.7026 36.78 35.7026 34.4657V19.8086C37.419 19.4422 38.6919 17.9186 38.6919 16.1057V13.2322C38.7112 11.13 36.9947 9.43289 34.9119 9.43289ZM27.9497 4.5536C28.6054 5.17074 28.3162 7.08003 26.8312 8.98931C26.7154 9.12431 26.6576 9.2786 26.5997 9.43289H21.354C21.6433 8.4686 22.2604 7.44646 23.0704 6.55931C25.0569 4.4186 27.294 3.93646 27.9497 4.5536ZM13.1769 8.98931C11.6919 7.09931 11.4026 5.17074 12.0583 4.5536C12.714 3.93646 14.9512 4.4186 16.9183 6.55931C17.7476 7.44646 18.3454 8.48788 18.6347 9.43289H13.389C13.3504 9.2786 13.2733 9.12431 13.1769 8.98931ZM6.87045 34.485V19.905H18.7312V36.105H8.49045C7.58402 36.0857 6.87045 35.3722 6.87045 34.485ZM31.5176 36.0857H21.2769V19.8857H33.1376V34.4657C33.1376 35.3722 32.424 36.0857 31.5176 36.0857ZM36.1269 16.1057C36.1269 16.7807 35.5676 17.34 34.8926 17.34H5.09616C4.42116 17.34 3.86187 16.7807 3.86187 16.1057V13.2322C3.86187 12.5572 4.42116 11.9979 5.09616 11.9979H34.9119C35.5869 11.9979 36.1462 12.5572 36.1462 13.2322V16.1057H36.1269Z"
        fill="#849194"
      />
    </svg>
  );
}
