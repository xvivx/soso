import { precisions } from '@store/wallet';
import i18n from '@/i18n';

type RoundingMode = 'floor' | 'ceil' | 'round';
type TimePattern = 'date' | 'time' | 'short' | 'duration';

function takePrecision(value: number, precision = 5, mode: RoundingMode = 'round') {
  const tenPower = Math.pow(10, precision);
  const safeNumber = Number((value * tenPower).toFixed(14));
  value = value || 0;
  if (mode === 'ceil') {
    value = Math.ceil(safeNumber) / tenPower;
  } else if (mode === 'floor') {
    value = Math.floor(safeNumber) / tenPower;
  } else if (mode === 'round') {
    value = Math.round(safeNumber) / tenPower;
  }
  return value;
}

class Amount {
  private value: number;
  private options: Intl.NumberFormatOptions;
  constructor(value: number, currency: string) {
    this.value = value;
    this.options = {
      style: currency.endsWith('FIAT') ? 'currency' : 'decimal',
      currency: currency.replace('FIAT', ''),
      minimumFractionDigits: precisions[currency], // 强制保留小数点后位数
      maximumFractionDigits: precisions[currency],
      numberingSystem: 'latn',
    };
  }
  private take(mode: RoundingMode) {
    const precision = this.options.maximumFractionDigits!;
    this.value = takePrecision(this.value, precision, mode);
    return this;
  }
  floor() {
    return this.take('floor');
  }
  ceil() {
    return this.take('ceil');
  }
  round() {
    return this.take('round');
  }
  sign() {
    this.options.signDisplay = 'exceptZero';
    return this;
  }
  toNumber() {
    return this.value;
  }
  private toLocaleString(options: Intl.NumberFormatOptions) {
    /* eslint-disable no-restricted-syntax */
    return this.value.toLocaleString(i18n.language, options);
  }
  /**
   *
   * @param decimal 是否是数字类型(true - 不带货币单位; false - 带货币单位)
   * @returns
   */
  toText(decimal = false) {
    if (decimal) {
      this.options.style = 'decimal';
      this.options.currency = '';
    }

    if (this.options.style === 'currency') {
      return this.toLocaleString(this.options);
    } else {
      const { currency, ...opts } = this.options;
      const suffix = currency ? ` ${currency}` : '';
      // value = 0, 不按小数点位数格式化
      if (this.value === 0) return '0' + suffix;
      const text = this.toLocaleString(opts);
      return text + suffix;
    }
  }
}

class Price {
  private value: number;
  private options: Intl.NumberFormatOptions;
  constructor(value: number, precision: number) {
    this.value = takePrecision(value, precision, 'floor');
    this.options = {
      style: 'decimal',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
      numberingSystem: 'latn',
    };
  }
  toNumber() {
    return this.value;
  }
  toText() {
    return this.value.toLocaleString(i18n.language, this.options);
  }
}

export default {
  /**
   * @param value 被格式化的金额值
   * @param currency 需要看value的单位: 法币则传入本地化货币(使用useLocalCurrency取);虚拟币则传入虚拟币
   * @returns NumberFormatter
   */
  amount(value: string | number, currency: string) {
    return new Amount(Number(value) || 0, currency);
  },
  price(value: string | number, precision = 2) {
    return new Price(Number(value) || 0, precision);
  },
  percent(value: string | number, sign: boolean | 'fixed' = false) {
    value = Number(value) || 0;
    return value.toLocaleString(i18n.language, {
      minimumFractionDigits: sign === 'fixed' ? 2 : 0,
      maximumFractionDigits: 2,
      style: 'percent',
      numberingSystem: 'latn',
      signDisplay: sign === true ? 'exceptZero' : undefined,
    });
  },
  /**
   *
   * @param value 被格式化的数字(例如次数)
   * @param precision 精度
   * @returns string
   */
  stringify(value: number, precision = 0) {
    return value.toLocaleString(i18n.language, {
      style: 'decimal',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
      numberingSystem: 'latn',
    });
  },
  kbm(value: number) {
    if (value < 0) return this.stringify(0);

    let unit = '';
    if (value >= 1e9) {
      value /= 1e9;
      unit = 'B';
    } else if (value >= 1e6) {
      value /= 1e6;
      unit = 'M';
    } else if (value >= 1000) {
      value /= 1000;
      unit = 'K';
    }
    return this.stringify(value, 2) + unit;
  },
  /**
   * @param ts 时间戳（支持字符串或数字格式）或 时间跨度毫秒数（用于 duration 模式）
   * @param pattern 格式方式:
   *   date -> 只有日期,
   *   time -> 只有时间,
   *   short -> 智能短格式(如果是今天就只显示时间，否则显示日期和时间),
   *   duration：时间跨度描述（如 1小时3分钟4秒）
   *   默认 -> 完整的日期和时间
   * @returns 格式化后的时间字符串
   */
  time(ts: string | number, pattern?: TimePattern) {
    if (!ts) return '';
    // 处理 duration 模式：生成时间跨度描述（1hours3minutes4seconds）
    if (pattern === 'duration') {
      return formatTimeDuration(Number(ts));
    }
    // 瑞典语采用国际标准日期格式，yyyy-MM-dd, 避免歧义
    const locale = 'sv-SE';
    const date = new Date(ts);
    if (pattern === 'date') {
      return date.toLocaleDateString(locale, timeOptions.date);
    } else if (pattern === 'time') {
      return date.toLocaleTimeString(locale, timeOptions.time);
    } else if (pattern === 'short') {
      if (new Date().toDateString() === date.toDateString()) {
        return date.toLocaleTimeString(locale, timeOptions.time);
      }
    }
    return date.toLocaleString(locale, timeOptions.full);
  },
  countdown(time: number, pattern: 'hh:mm:ss' | 'mm:ss' = 'hh:mm:ss') {
    const total = Math.floor(time / 1000);
    const seconds = total % 60;

    let hms: number[];
    if (pattern === 'hh:mm:ss') {
      hms = [Math.floor(total / 3600), Math.floor((total % 3600) / 60), seconds];
    } else {
      hms = [Math.floor(total / 60), seconds];
    }

    return hms.map((it) => (it < 10 ? `0${it}` : it)).join(':');
  },
};

const timeOptions: Record<'full' | 'date' | 'time', Intl.DateTimeFormatOptions> = {
  full: {
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  },
  date: {
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  time: {
    calendar: 'gregory',
    numberingSystem: 'latn',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  },
};

/**
 * @description 将时间跨度（毫秒）格式化为 "X小时Y分钟Z秒" 的形式
 * @param ms 时间跨度的毫秒数
 * @returns
 */
function formatTimeDuration(ms: number): string {
  const timestamp = Math.max(0, ms);
  if (timestamp === 0) return '';

  const hours = Math.floor(timestamp / 3600000);
  const remainingAfterHours = timestamp % 3600000; // 小时后剩余毫秒数

  const minutes = Math.floor(remainingAfterHours / 60000);
  const remainingAfterMinutes = remainingAfterHours % 60000; // 分钟后剩余毫秒数

  // 不足一秒，向上取整
  const seconds = remainingAfterMinutes > 0 ? Math.ceil(remainingAfterMinutes / 1000) : 0;

  const getUnitText = (count: number, key: 'hour' | 'minute' | 'second') => {
    if (count === 0) return '';
    switch (key) {
      case 'hour':
        if (count <= 1) {
          return `${count}${i18n.ts('hour')}`;
        } else {
          return `${count}${i18n.ts('hours')}`;
        }
      case 'minute':
        if (count <= 1) {
          return `${count}${i18n.ts('minute')}`;
        } else {
          return `${count}${i18n.ts('minutes')}`;
        }

      case 'second':
        if (count <= 1) {
          return `${count}${i18n.ts('second')}`;
        } else {
          return `${count}${i18n.ts('seconds')}`;
        }
    }
  };

  // 拼接结果（过滤空字符串，确保无0值单位）
  const parts = [getUnitText(hours, 'hour'), getUnitText(minutes, 'minute'), getUnitText(seconds, 'second')].filter(
    Boolean
  );

  return parts.join(' ');
}
