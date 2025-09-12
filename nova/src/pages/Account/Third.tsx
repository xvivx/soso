import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserApis } from '@store';
import useNavigate from '@hooks/useNavigate';
import { Button, message } from '@components';
import { request } from '@utils/axios';
import { loadScript } from '@utils/script';
import { GoogleSvg, TwitterSvg } from './Svg';

export default function Third() {
  const { loginWithGoogle, loginWithTwitter } = useUserApis();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // 添加一个状态来标记是否使用了推特登录
  const [isTwitterLogin, setIsTwitterLogin] = useState(false);

  // 推特登录接收message
  useEffect(() => {
    if (!isTwitterLogin) return;
    const onMessage = async (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'string') return;
      try {
        const data = JSON.parse(e.data);
        if (!data.oauthToken || !data.oauthVerifier) return;
        await loginWithTwitter({ oauthToken: data.oauthToken, oauthVerifier: data.oauthVerifier });
      } catch (error) {
        console.error('Error parsing message data:', error);
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [loginWithTwitter, navigate, isTwitterLogin]);

  const thirds = [
    {
      label: t('Continue with Google'),
      icon: GoogleSvg,
      onClick: async () => {
        const token = await waitGoogleToken();
        await loginWithGoogle({ code: token });
      },
    },
    {
      label: t('Continue with X'),
      icon: TwitterSvg,
      onClick: async () => {
        // 点击推特登录时，设置状态为 true
        setIsTwitterLogin(true);
        try {
          // Safari 对异步 window.open 的拦截最严格, 这里使用同步打开空白窗口 + 异步跳转
          const popup = window.open('about:blank', 'Twitter Auth', 'width=420,height=740');
          if (!popup) {
            message.error('Please allow pop-ups to continue Twitter login');
            return;
          }
          // 打开小弹窗调用后端生成的授权页 => 授权完成进入redirectUrl回调页 => 回调页发回消息到登录页
          const authUri = await request.get<string>('/api/user/auth/twitter/getUrl', {
            redirectUrl: window.location.origin + '/twitter/callback',
          });
          popup.location.href = authUri;
        } catch (error) {
          console.error('Failed to get Twitter auth URL:', error);
        }
      },
    },
    // {
    //   icon: MetaMaskSvg,
    //   onClick: async () => {
    //     try {
    //       const { account, sign } = await getLoginSign();
    //       await loginWithMetaMask({
    //         code: JSON.stringify({
    //           address: account,
    //           signature: sign,
    //         }),
    //         loginType: LoginType.META_MASK,
    //       });
    //     } catch (error) {
    //       message.error(error.message);
    //     }
    //   },
    // },
  ];

  return (
    <>
      {thirds.map((third) => (
        <Button
          theme="ghost"
          size="lg"
          className="flex items-center border w-full s768:w-96"
          key={third.label}
          onClick={third.onClick}
          loading={false}
        >
          <third.icon className="size-10 text-white" />
          <div className="text-14 s768:text-16 font-700 mx-auto">{third.label}</div>
        </Button>
      ))}
    </>
  );
}

async function waitGoogleToken() {
  await loadGoogleAuthClient();
  let loginResolve: (token: string) => void;
  const loginPromise = new Promise<string>((resolve) => (loginResolve = resolve));

  window.google.accounts.id.initialize({
    client_id: import.meta.env.REACT_APP_GOOGLE_LOGIN_KEY,
    callback: async (response: { credential: string }) => {
      loginWrapper && document.body.removeChild(loginWrapper);
      loginResolve(response.credential);
    },
  });

  let loginWrapper = document.getElementById('google-login-wrapper');
  if (!loginWrapper) {
    loginWrapper = document.createElement('div');
    loginWrapper.style.display = 'none';
    document.body.appendChild(loginWrapper);
  }
  window.google.accounts.id.renderButton(loginWrapper, { theme: 'filled_blue' });
  const loginTriggerBtn = loginWrapper.querySelector('div[role=button]');
  (loginTriggerBtn as HTMLDivElement).click();
  return loginPromise;
}

const loadGoogleAuthClient = singleAsyncCall(() => {
  return loadScript('https://accounts.google.com/gsi/client');
});

function singleAsyncCall<T = any>(asyncFunction: () => Promise<T>) {
  let loadingPromise: Promise<T> | null = null;

  return async () => {
    if (!loadingPromise) {
      loadingPromise = new Promise((resolve) => {
        asyncFunction().then(resolve);
      });
    }

    return loadingPromise;
  };
}
