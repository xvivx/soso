// 优先在store按模块定义，跟模块无关的再定义到此处

// 买涨跌
export enum Direction {
  BuyRise = 1,
  BuyFall = 2,
}

// 玩法类型
export enum GameTypeNumber {
  Binary = 1,
  Contract = 2,
  BinarySpread = 3,
  Updown = 4,
  TapTrading = 5,
}

export type WebSocketRequest = {
  cmd: string;
  cid: string;
  token: string;
  req: string;
};

export type WebSocketResponse = {
  cmd: string;
  status: number;
  error: string;
  resp: any;
  code?: number;
};

export enum ChartAppearType {
  kline = 'kline',
  candle = 'candle',
}

export interface Kline {
  c: string; // 24h change/close
  p: string; // price
  s: string; // symbol: BTC-USD
  t: number; // time
  h: string; // high
  l: string; // low
  o: string; // open
  type?: ChartAppearType;
}

export enum VerifyEmailType {
  emailVerify = 0, // 前端添加, 用于邮件验证链接
  register = 1,
  forgetPassword = 2,
  modifyPassword = 3,
  login = 4,
  withdraw = 5,
  mfa = 6,
  unbind = 7,
}

export enum LoginType {
  MAILBOX = 'MAILBOX',
  MAIL = 'MAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  DISCORD = 'DISCORD',
  TELEGRAM = 'TELEGRAM',
  TWITTER = 'TWITTER',
  TWITTER_WEB = 'TWITTER_WEB',
  META_MASK = 'META_MASK',
}

/** 消息通知、chat聊天文本类型 */
export enum ContentType {
  Text = 'TEXT',
  Image = 'IMAGE',
  Emoji = 'EMOJI',
  Link = 'LINK',
  RichText = 'RICH_TEXT',
}

export enum LeaderBoardSort {
  pnl = 'PNL',
  roi = 'ROI',
}

export enum LeaderBoardTimeType {
  day = 'DAY',
  week = 'WEEK',
  month = 'MONTH',
}
