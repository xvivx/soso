export function urlSplicing(obj: Record<string, string | number>) {
  let str = '?';
  Object.keys(obj).forEach((key) => {
    str += key + '=' + (obj[key] as string) + '&';
  });
  str = str.slice(0, str.length - 1);
  return str;
}

/**
 * 生成uuid
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function convertTime(time: string | number) {
  const secs = Number(time) || 0;
  const seconds = secs % 60;
  const minutes = Math.round((secs - seconds) / 60);

  return [minutes && `${minutes}m`, seconds && `${seconds}s`].filter(Boolean).join(' ');
}

export function getCoinUrl(symbol: string) {
  return `${import.meta.env.REACT_APP_COIN_ICON_URL}/${symbol}@3x.png`;
}

// 增加点debug难度
const btoa = window.btoa.bind(window);
/** 加密字符串的顺序 */
const secrets = [9, 0, 10, 7, 3, 2, 8, 1, 12, -1, -3, -2, -4, -6, -8];
export function createOrderToken(ts: number) {
  const token = btoa([ts, Math.random(), Math.random()].join('')).replace(/=+$/g, '');
  return secrets.reduce((curr, next) => puzzle(curr, next), token);
}

/** 混淆字符串*/
function puzzle(str: string, start: number) {
  const middle = Math.floor(str.length / 2);
  const target = start % 2 === 0 ? middle - start : middle + start;
  return exchange(str, start < 0 ? str.length + start : start, target);
}

/** 交换字符串给定的索引顺序 */
function exchange(text: string, start: number, end: number) {
  let str = '';

  for (let i = 0; i < text.length; i++) {
    if (i === start) {
      str += text[end];
    } else if (i === end) {
      str += text[start];
    } else {
      str += text[i];
    }
  }
  return str;
}

class DetradePortal {
  private static element: HTMLDivElement | null;

  get root() {
    if (!DetradePortal.element) {
      const appRoot = document.createElement('div');
      document.body.appendChild(appRoot);
      DetradePortal.element = appRoot;
    }

    return DetradePortal.element;
  }

  destroy() {
    if (DetradePortal.element) {
      document.body.removeChild(DetradePortal.element);
      DetradePortal.element = null;
    }
  }
}

export const detradePortal = new DetradePortal();

/** 邮箱脱敏处理 */
export function maskEmail(email: string | null) {
  if (!email) return '';
  const [username, domain] = email.split('@');

  if (username.length <= 4) {
    // 如果用户名长度小于等于4，只显示前两位和****
    return `${username.substring(0, 2)}****@${domain}`;
  } else {
    // 否则，显示前两位，中间用****代替，然后显示最后两位
    return `${username.substring(0, 2)}****${username.substring(username.length - 2)}${'@'}${domain}`;
  }
}

/** 获取24h后的UTC时间 */
export function getUtcTime24HoursLater() {
  const now = new Date();
  const nowMilliseconds = now.getTime();
  const laterMilliseconds = nowMilliseconds + 24 * 60 * 60 * 1000;
  const later = new Date(laterMilliseconds);
  const utcTime = later.toUTCString();
  return utcTime;
}

/** 当数字小于10时前面补0 */
export function padNumberWithZero(num: number) {
  return num.toString().padStart(2, '0');
}

/**
 * @description 字符串脱敏处理
 * @param {string} value - 需要脱敏的字符串
 * @param {Object} options - 配置选项
 * @param {number} [options.prefixLength=2] - 保留前几位
 * @param {number} [options.suffixLength=2] - 保留后几位
 * @param {number} [options.maskLength=4] - 脱敏字符的长度
 * @param {string} [options.maskChar='*'] - 脱敏替换字符
 * @returns {string} 脱敏后的字符串
 * @example
 * // 用户ID脱敏
 * maskString('6812345612') // '68****12'
 * maskString('123') // '1*3'
 *
 * // 手机号脱敏
 * maskString('13812345678', { prefixLength: 3, suffixLength: 4, maskLength: 4 }) // '138****5678'
 *
 * // 邮箱脱敏
 * maskString('example@gmail.com', { prefixLength: 3, suffixLength: 7, maskChar: '#' }) // 'exa####@gmail.com'
 */
export const maskString = (
  value: string,
  options: {
    prefixLength?: number;
    suffixLength?: number;
    maskLength?: number;
    maskChar?: string;
  } = {}
): string => {
  if (!value) return '';

  const { prefixLength = 2, suffixLength = 2, maskLength = 4, maskChar = '*' } = options;

  const valueLength = value.length;

  // 处理短字符串情况
  if (valueLength <= prefixLength + suffixLength) {
    if (valueLength <= 3) {
      return value.charAt(0) + maskChar + (valueLength > 1 ? value.charAt(valueLength - 1) : '');
    }
    return value;
  }

  const prefix = value.slice(0, prefixLength);
  const suffix = value.slice(-suffixLength);
  const mask = maskChar.repeat(maskLength);

  return `${prefix}${mask}${suffix}`;
};
