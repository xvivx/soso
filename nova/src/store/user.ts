/**
 * 用户信息
 */
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import useSWR from 'swr';
import useMemoCallback from '@hooks/useMemoCallback';
import { request } from '@utils';
import { LoginType } from '@/type';
import bridge from './bridge';
import { AccountType, changeAccountType, setCurrency } from './wallet';

const inThirdPlatform = bridge.get().micro;
interface LoginParams {
  email?: string;
  password?: string;
  verificationCode?: string; // 验证码
  loginType: string;
  code?: string; // 第三方登陆参数 json
  mfaCode?: string;
}

interface RegistParams {
  email: string;
  password: string;
  code: string;
  inviteCode: string;
}

type User = {
  type: 'ANONYMOUS' | 'REGISTER' | 'THIRD_PARTY' | 'WALLET';
  isTemporary: boolean;
  id: string;
  email: string;
  nickName: string;
  avatar: string;
  ifPassword: boolean;
  inviteCode: string;
  privateHide: boolean;
  createTime: string;
};

type UserSliceState = {
  token: string;
  info: User;
};

type LevelType = 'BASIC' | 'ADVANCED';
type LevelStatus = 'INIT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'TEMPORARY_REJECTED';
type KYCLevel = {
  desc: string;
  level: LevelType;
  status: LevelStatus;
};

const DefaultUser: User = {
  type: 'ANONYMOUS',
  isTemporary: true,
  id: '',
  email: '',
  nickName: '',
  avatar: '',
  ifPassword: false,
  inviteCode: '',
  privateHide: false,
  createTime: '',
};

const initialState = {
  token: inThirdPlatform ? '' : localStorage.getItem('token') || '',
  info: DefaultUser,
};

const slice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserSliceState['token']>) {
      state.token = action.payload;
    },
    logout(state) {
      state.info = DefaultUser;
      state.token = '';
    },
    setInfo(state, action: PayloadAction<UserSliceState['info']>) {
      state.info = action.payload;
    },
  },
});

export function useUserApis() {
  const dispatch = useDispatch();
  const loginRealAccount = useMemoCallback(async function (params: LoginParams) {
    const { token } = await request.post<{ token: string }>('/api/user/auth/login', params);
    dispatch(slice.actions.login(token));
    dispatch(changeAccountType(AccountType.REAL));
  });

  return useMemo(() => {
    return {
      /** 常规登录  */
      login: loginRealAccount,
      /** 注册 */
      async register(params: RegistParams) {
        dispatch(slice.actions.login((await request.post<{ token: string }>('/api/user/register', params)).token));
      },
      logout,
      async loginWithMetaMask(payload: { code: string }) {
        await loginRealAccount({
          code: payload.code,
          loginType: LoginType.META_MASK,
        });
      },
      async loginWithGoogle(payload: { code: string; username?: string }) {
        await loginRealAccount({
          code: payload.code,
          email: payload.username,
          loginType: LoginType.GOOGLE,
        });
      },
      async loginWithTwitter(payload: { oauthToken: string; oauthVerifier: string; username?: string }) {
        await loginRealAccount({
          code: window.btoa(JSON.stringify(payload)),
          loginType: LoginType.TWITTER_WEB,
          email: payload.username,
        });
      },
      async loginWithFacebook(payload: { code: string; username?: string }) {
        await loginRealAccount({
          code: payload.code,
          loginType: LoginType.FACEBOOK,
          email: payload.username,
        });
      },
    };
  }, [dispatch, loginRealAccount]);
}

export default slice.reducer;

export const logout = () => {
  appDispatch(slice.actions.logout());
  appDispatch(changeAccountType(AccountType.DEMO));
  appDispatch(setCurrency('USDT'));
};

export enum UserLoginType {
  DEME = 0,
  Regist = 1,
  PlatForm = 2,
  Wallet = 3,
}

export function useTemporaryToken() {
  const dispatch = useDispatch();
  const { data: token } = useSWR(
    ['user-temporary-login'],
    async () => {
      const { token } = await fetchRetry(() => request.post<{ token: string }>('/api/user/temporary/create'));
      return token;
    },
    {
      suspense: true,
      dedupingInterval: 3600 * 1000,
    }
  );

  useEffect(() => {
    dispatch(slice.actions.login(token));
  }, [dispatch, token]);
}

export function useAccessCodeAuth(accessCode: string) {
  const dispatch = useDispatch();
  return useSWR(
    ['user-login', accessCode],
    async () => {
      const { token, currency } = await fetchRetry(() => {
        const url = accessCode ? '/api/tob/thirdParty/login/verify' : '/api/user/temporary/create';
        const params = accessCode ? { accessCode } : undefined;
        return request.post<{ token: string; currency?: string }>(url, params);
      });

      dispatch(slice.actions.login(token));
      if (currency) {
        dispatch(setCurrency(currency));
        dispatch(changeAccountType(AccountType.REAL));
      }
      return accessCode;
    },
    {
      suspense: true,
      revalidateOnFocus: false,
      dedupingInterval: 3600 * 1000,
    }
  );
}

export function useUserInfo() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const userInfo = useSelector((state) => state.user.info);
  return useSWR(
    token ? ['user-info', token] : null,
    async () => {
      const detail = await request.get<User>('/api/user/info');
      const info = { ...DefaultUser, ...detail, isTemporary: detail.type === 'ANONYMOUS' };
      dispatch(slice.actions.setInfo(info));
      return info;
    },
    { fallbackData: userInfo }
  );
}

export function useMfaInfo() {
  return useSWR(
    ['mfa-info'],
    async () => {
      return await request.get<{ bind: boolean; enableLogin: boolean }>('/api/user/mfa/info');
    },
    { fallbackData: { bind: false, enableLogin: false } }
  );
}

export function useUserInfoByInviteCode(inviteCode: string) {
  return useSWR(
    inviteCode ? ['user-info-by-inviteCode', inviteCode] : null,
    async () => {
      return await request.get<User>('/api/user/getByInviteCode', { inviteCode });
    },
    {
      fallbackData: DefaultUser,
    }
  );
}

function fetchRetry<T>(fetcher: () => Promise<T>, retryTimes = 3, interval = 5000) {
  return new Promise<T>((resolve, reject) => {
    (function start() {
      fetcher().then(resolve, (err) => {
        if (retryTimes === 0) {
          reject(err);
        } else {
          retryTimes--;
          setTimeout(start, interval);
        }
      });
    })();
  });
}

export function useKYCInfo() {
  const { data, ...rest } = useSWR(['user-kyc-status'], () => {
    return request.get<KYCLevel[]>(`/api/user/kyc/user/level/status`);
  });

  const verified = useMemo(() => {
    return data?.some((item) => item.status === 'APPROVED') || false;
  }, [data]);

  return { data, verified, ...rest };
}
