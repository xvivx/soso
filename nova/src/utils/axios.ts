import axios, { AxiosRequestConfig } from 'axios';
import { store } from '@store';
import bridge from '@store/bridge';
import { setMaintenance } from '@store/system';
import { logout } from '@store/user';
import { message } from '@components';
import Captcha from '@components/Captcha';
import i18n from '@/i18n';

// 和服务器的时间差
let timeDiff = 0;

export function getServerTime() {
  return Date.now() - timeDiff;
}

// 后台响应数据格式
interface ResponseTypes<T> {
  code: number;
  msg: string;
  data: T;
}
// ----------------------------------------------------------------------
// 默认请求超时时间
const timeout = 15 * 1000;

// 创建axios实例
const service = axios.create({
  timeout,
  baseURL: import.meta.env.REACT_APP_BACKEND_BASE,
});

//统一请求拦截
service.interceptors.request.use(
  (config) => {
    const { account, user, system } = store.getState();
    config.headers.Authorization = user.token;
    config.headers['Account-Type'] = import.meta.env.REACT_APP_SDK ? undefined : account.type;
    config.headers['Accept-Language'] = system.lang;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

type AxiosType = AxiosRequestConfig;
const requestHandler = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  params: any = {},
  config: AxiosType = {}
): Promise<T> => {
  function promise() {
    switch (method) {
      case 'get':
        return service.get<ResponseTypes<T>>(url, { params, ...config });
      case 'post':
        return service.post<ResponseTypes<T>>(url, params, { ...config });
      case 'put':
        return service.put<ResponseTypes<T>>(url, params, { ...config });
      case 'delete':
        return service.delete<ResponseTypes<T>>(url, { params, ...config });
    }
  }

  const response = await promise();
  const { data } = response;
  const serverTime = response.headers['timestamp'] || response.headers['Timestamp'];

  if (serverTime) {
    timeDiff = Date.now() - serverTime;
  }

  if (data.code !== 0) {
    // 推特登陆后端获取不到邮箱会返回这个code
    if (data.code === 200042) {
      return data.data;
    } else if (data.code === 611) {
      // 第三方登录code失效
      const { onTokenExpired } = bridge.get();
      onTokenExpired && onTokenExpired();
    } else if (data.code === 503) {
      // 维护
      appDispatch(setMaintenance(true));
    } else if (data.code === 603) {
      const { micro, onLogin } = bridge.get();
      // 登录失效
      if (!micro) {
        logout();
      } else {
        onLogin && onLogin();
      }
    } else if (data.code === 608) {
      // 人机验证
      await Captcha.verify();
      return await requestHandler<T>(method, url, params, config);
    } else if (data.code === 10033) {
      // 2fa为空时不需要弹出报错信息, 抛出异常让前端跳转页面
      return Promise.reject(data);
    } else {
      // 需要弹出message的报错
      type ErrorKey = Parameters<typeof i18n.ts>[0];
      const code = String(data.code);
      let error_msg = i18n.ts(code as ErrorKey, { ns: 'error' });
      if (code === '20110' || code === '20050' || code === '20051') {
        const match = data.msg.match(/\d+\.?\d+/);
        error_msg = i18n.ts(code as ErrorKey, {
          ns: 'error',
          num: match ? Number(match[0]) : 0,
        });
      }
      // 如果没有配置error.json用后端返回的文案兜底
      error_msg = error_msg === code ? data.msg : error_msg;
      !config.silence && message.error(error_msg || i18n.ts('612', { ns: 'error' }));
    }
    return Promise.reject(data);
  } else {
    // 数据请求正确
    return data.data;
  }
};

const request = {
  get: <T>(url: string, params?: object, config?: AxiosType) => requestHandler<T>('get', url, params, config),
  post: <T>(url: string, params?: any, config?: AxiosRequestConfig) => requestHandler<T>('post', url, params, config),
  put: <T>(url: string, params?: object, config?: AxiosRequestConfig) => requestHandler<T>('put', url, params, config),
  delete: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
    requestHandler<T>('delete', url, params, config),
};

export { request };
