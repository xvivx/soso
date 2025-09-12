/**
 * 获取验证码倒计时按钮
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils';
import { request } from '@utils/axios';
import { VerifyEmailType } from '@/type';
import Button, { ButtonProps } from './Button';
import message from './FunctionRender/Message';

const COUNTDOWN_SECONDS = 60;

interface Props extends ButtonProps {
  to?: string;
  businessType: VerifyEmailType;
  onHttpError?: (message: string) => void;
  onHttpSuccess?: () => void;
  auth?: boolean;
  /** 是否在挂载时自动发送一次验证码（默认不自动） */
  autoSendOnMount?: boolean;
}

const VerifyCodeButton: React.FC<Props> = (props) => {
  const {
    className,
    disabled,
    businessType,
    to,
    onHttpError,
    onHttpSuccess,
    children,
    auth = false, // 默认调用无auth的接口
    autoSendOnMount = false,
    ...rests
  } = props;
  const [countdown, setCountdown] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const [tapTimes, setTapTimes] = useState(0);
  const { t } = useTranslation();
  const hasAutoSentRef = useRef(false);

  const handleClick = useCallback(async () => {
    try {
      // 重置倒计时
      setCountdown(0);
      clearInterval(timerRef.current);

      // 邮件验证接口
      if (businessType === VerifyEmailType.emailVerify) {
        if (!to) return;
        await request.post('/api/user/email/bind/send', {
          email: to,
          redirectUrl: window.location.origin + '/verify/bind-email',
        });
      } else {
        // 其他类型根据auth调用接口
        const url = auth ? '/api/user/verificationCode/hasAuth/send' : '/api/user/verificationCode/noAuth/send';
        await request.post(url, {
          bizType: businessType,
          to,
        });
      }

      message.success(t('Verification email sent. Check your inbox.'));
      onHttpSuccess && onHttpSuccess();
      setTapTimes((times) => times + 1);
      setCountdown(COUNTDOWN_SECONDS);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(timerRef.current);
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      onHttpError && onHttpError(typeof error === 'string' ? error : ((error.message || error.msg) as string));
    }
  }, [businessType, to, auth, t, onHttpError, onHttpSuccess]);

  useEffect(() => {
    if (autoSendOnMount && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      handleClick();
    }
    return () => clearInterval(timerRef.current);
  }, [handleClick, autoSendOnMount]);

  return (
    <Button
      className={cn('shrink-0', className)}
      onClick={handleClick}
      disabled={disabled || countdown > 0}
      // 有倒计时禁用loading
      loading={countdown > 0 ? false : undefined}
      {...rests}
    >
      {countdown === 0 ? children || (tapTimes > 0 ? t('ReSend') : t('Send')) : `${countdown}s`}
    </Button>
  );
};

export default VerifyCodeButton;
