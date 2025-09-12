/**
 * 登陆的表单数据、submit方法, 切换视图等方法的provider
 */

import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react';
import { sha256 } from 'js-sha256';
import { useUserApis } from '@store/user';
import { LoginType } from '@/type';

// 不同的视图状态
export enum LoginView {
  Email,
  LoginWithEmailCode,
  LoginWithPassword,
  TwoFA,
}

// 表单类型
interface LoginFormValues {
  email: string;
  loginType?: LoginType;
  password?: string;
  verificationCode?: string; // 邮箱验证码
  mfaCode?: string; // 2FA验证码
}

interface LoginContextType {
  email: string;
  setEmail: (value: string) => void;
  handleLogin: ({ loginType, verificationCode, password, mfaCode }: Omit<LoginFormValues, 'email'>) => Promise<void>;
  navigateTo: (view: LoginView, params?: Record<string, string>) => void;
  getCurrentParams: () => Record<string, string>;
  goBack: () => void;
  submitting: boolean;
}

const LoginContext = createContext<LoginContextType | null>(null);

interface LoginProviderProps extends PropsWithChildren {
  getCurrentParams: () => Record<string, string>;
  navigateTo: (view: LoginView, params?: Record<string, string>) => void;
  goBack: () => void;
}

export const LoginProvider = ({ children, navigateTo, goBack, getCurrentParams }: LoginProviderProps) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useUserApis();

  const handleLogin = useCallback(
    async ({ loginType, verificationCode, password, mfaCode }: Omit<LoginFormValues, 'email'>) => {
      try {
        setSubmitting(true);
        // 优先使用外部传入的字段值
        await login({
          email,
          password: password ? sha256(password.trim()) : '',
          verificationCode,
          mfaCode: mfaCode,
          loginType: loginType || LoginType.MAILBOX,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [email, login]
  );

  const contextValue = {
    email,
    setEmail,
    handleLogin,
    navigateTo,
    getCurrentParams,
    goBack,
    submitting,
  };
  return <LoginContext.Provider value={contextValue}>{children}</LoginContext.Provider>;
};

export function useLoginContext() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLoginContext must be used within a LoginProvider');
  }
  return context;
}
