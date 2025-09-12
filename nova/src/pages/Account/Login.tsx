import { SyntheticEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import useNavigate from '@hooks/useNavigate';
import { Button, FormItem, Input, InputOtp, SvgIcon, VerifyCodeButton } from '@components';
import { request, validateEmail } from '@utils';
import { LoginType, VerifyEmailType } from '@/type';
import { AuthLogo, DividerWithText } from './Component';
import { LoginProvider, LoginView, useLoginContext } from './LoginProvider';
import Third from './Third';
import { useViewNavigator } from './useViewNavigate';

function LoginPage() {
  const { currentView, navigateTo, goBack, getCurrentParams } = useViewNavigator<LoginView>(LoginView.Email);

  // 根据当前视图状态渲染对应的组件
  const renderView = () => {
    switch (currentView) {
      case LoginView.Email:
        return <Email />;
      case LoginView.LoginWithEmailCode:
        return <LoginWithEmailCode />;
      case LoginView.LoginWithPassword:
        return <LoginWithPassword />;
      case LoginView.TwoFA:
        return <TwoFA />;
    }
  };

  return (
    <LoginProvider navigateTo={navigateTo} goBack={goBack} getCurrentParams={getCurrentParams}>
      {renderView()}
    </LoginProvider>
  );
}

const classNames = {
  title: 'text-20 s768:text-28 font-700 text-primary text-center !mb-8 !s768:mb-12',
  container: 's768:p-15 s768:rounded-5 s768:border s768:border-thirdly bg-layer2 space-y-4 s768:space-y-5',
};
function Email() {
  const { email, setEmail, navigateTo } = useLoginContext();
  const { t } = useTranslation();
  const [errors, setErrors] = useState('');
  const [loading, setLoading] = useState(false);

  // 表单验证
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

  // 后端验证email是否存在
  const verifyEmail = useCallback(async () => {
    try {
      setLoading(true);
      await request.get('/api/user/email/verify', {
        email,
      });
      return true;
    } catch (error) {
      setErrors(error.msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [email]);

  const onSubmit = useCallback(async () => {
    // 先做基础表单验证
    if (!validate()) {
      return;
    }

    // 再做API验证
    const isValid = await verifyEmail();
    if (!isValid) return;

    // 跳转下一步
    navigateTo(LoginView.LoginWithEmailCode);
  }, [validate, verifyEmail, navigateTo]);

  return (
    <div className={classNames.container}>
      <AuthLogo />
      <div className={classNames.title}>{t('Login to Detrade')}</div>
      <Third />
      <DividerWithText />
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
            onChange={setEmail}
            onBlur={() => {
              validate();
            }}
            type="email"
            autoComplete="email"
            size="lg"
            className="bg-layer2"
          />
        </FormItem>
        <Button loading={loading} type="submit" className="w-full" size="lg">
          {t('Continue')}
        </Button>
      </form>
      <NoAccountLinkToRegister />
    </div>
  );
}

function LoginWithEmailCode() {
  const { t } = useTranslation();
  const { email, submitting, handleLogin, navigateTo, goBack } = useLoginContext();
  const [emailCode, setEmailCode] = useState('');

  return (
    <div className={classNames.container}>
      <Button
        onClick={goBack}
        icon={<SvgIcon name="arrow" className="rotate-180 size-5" />}
        size="free"
        theme="transparent"
      />
      <div className="text-18 s768:text-24">
        {t('Enter the 6-digit code sent to')}
        <div className="text-brand_alt">{email}</div>
      </div>
      <InputOtp
        value={emailCode}
        onChange={async (value: string) => {
          setEmailCode(value);
          // 当输入满6位时自动提交
          if (value.length === 6) {
            await handleLogin({ loginType: LoginType.MAIL, verificationCode: value });
          }
        }}
        size="md"
        className="w-full s768:w-96"
      />
      <VerifyCodeButton size="lg" theme="ghost" businessType={VerifyEmailType.login} to={email} autoSendOnMount />
      <Button
        onClick={async () => await handleLogin({ loginType: LoginType.MAIL, verificationCode: emailCode })}
        loading={submitting}
        size="lg"
        className="w-full"
      >
        {t('Login')}
      </Button>
      <DividerWithText />
      <Button
        onClick={() => {
          navigateTo(LoginView.LoginWithPassword);
        }}
        theme="text"
        className="text-secondary mx-auto block"
        size="lg"
      >
        {t('Login with password')}
      </Button>
    </div>
  );
}

function LoginWithPassword() {
  const { email, setEmail, submitting, handleLogin, navigateTo } = useLoginContext();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  // 验证函数
  const validateField = useCallback(
    (field: 'email' | 'password', value: string) => {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          [field]: t('{{field}} is required', { field: t(field === 'email' ? 'Email' : 'Password') }),
        }));
        return false;
      }
      if (field === 'email' && !validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: t('Please enter a valid email address') }));
        return false;
      }
      setErrors((prev) => ({ ...prev, [field]: '' }));
      return true;
    },
    [t]
  );

  const onSubmit = useCallback(
    async (event: SyntheticEvent): Promise<void> => {
      event.preventDefault();

      // 提交时验证所有字段
      const isEmailValid = validateField('email', email);
      const isPasswordValid = validateField('password', password);

      if (!isEmailValid || !isPasswordValid) return;

      try {
        await handleLogin({ password });
      } catch (error) {
        if (error.code === 10033) {
          // 密码登陆 - 需输入2fa - 跳转2fa视图
          navigateTo(LoginView.TwoFA, { password });
        }
      }
    },
    [email, password, navigateTo, handleLogin, validateField]
  );

  return (
    <div className={classNames.container}>
      <AuthLogo />
      <div className={classNames.title}>{t('Login to Detrade')}</div>
      <Third />
      <DividerWithText />
      <form className="flex flex-col flex-1 gap-4 s768:gap-5" onSubmit={onSubmit}>
        <FormItem label={t('Email')} error={errors.email}>
          <Input
            placeholder={t('Email')}
            value={email}
            onChange={setEmail}
            onBlur={() => validateField('email', email)}
            type="email"
            size="lg"
            className="bg-layer2"
          />
        </FormItem>
        <FormItem
          className="[&>label]:flex"
          label={
            <div className="w-full flex justify-between">
              <div>{t('Password')}</div>
              <Button
                onClick={(event: SyntheticEvent) => {
                  event.preventDefault();
                  navigate('#/login/reset-password', { email });
                }}
                theme="text"
                size="free"
                className="text-secondary"
                type="button"
              >
                {t('Forgot?')}
              </Button>
            </div>
          }
          error={errors.password}
        >
          <Input.Password
            placeholder={t('Enter your password')}
            value={password}
            onChange={setPassword}
            onBlur={() => validateField('password', password)}
            autoComplete="on"
            size="lg"
            className="bg-layer2"
          />
        </FormItem>
        <Button className="sticky bottom-0 z-10 w-full" size="lg" type="submit" loading={submitting}>
          {t('Login')}
        </Button>
      </form>
      <Button
        onClick={() => {
          navigateTo(LoginView.LoginWithEmailCode);
        }}
        theme="text"
        className="text-secondary mx-auto block"
        size="lg"
      >
        {t('Login with email code')}
      </Button>
      <NoAccountLinkToRegister />
    </div>
  );
}

function TwoFA() {
  const { submitting, handleLogin, navigateTo, goBack, getCurrentParams } = useLoginContext();
  const { t } = useTranslation();
  const [mfaCode, setMfaCode] = useState('');

  const { password } = getCurrentParams();

  return (
    <div className={classNames.container}>
      <Button onClick={goBack} icon={<SvgIcon name="arrow" className="rotate-180" />} size="free" theme="transparent" />
      <div className="text-18 s768:text-24">{t('Enter the 2FA code ')}</div>
      <InputOtp
        value={mfaCode}
        onChange={async (value: string) => {
          setMfaCode(value);
          // 当输入满6位时自动提交
          if (value.length === 6) {
            await handleLogin({ mfaCode: value, password });
          }
        }}
        size="md"
        className="w-full s768:w-96"
      />
      <Button
        onClick={async () => await handleLogin({})}
        disabled={mfaCode.length !== 6}
        loading={submitting}
        size="lg"
        className="w-full"
      >
        {t('Login')}
      </Button>
      <DividerWithText />
      <Button
        onClick={() => {
          navigateTo(LoginView.LoginWithEmailCode);
        }}
        theme="text"
        className="text-secondary mx-auto block"
        size="lg"
      >
        {t('Login with email code')}
      </Button>
    </div>
  );
}

function NoAccountLinkToRegister() {
  const { t } = useTranslation();

  return (
    <div className="text-tertiary text-12 s768:text-16 font-500 mt-6 text-center">
      <span>{t(`Don't have an account?`)}</span>
      <Button asChild theme="text" className="text-primary px-1 s768:px-1 underline" size="free">
        <NavLink to="/account/register" replace>
          {t('Register for Detrade.')}
        </NavLink>
      </Button>
    </div>
  );
}

export default LoginPage;
