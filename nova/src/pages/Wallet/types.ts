export enum TransitionStatus {
  PROCESSING = 1,
  FAILED = 2,
  SUCCESS = 3,
}

export type FiatDepositOrder = {
  amount: number;
  card: string;
  currency: string;
  expiredTime: number;
  createTime: number;
  updateTime: number;
  channel: string;
  id: number;
  mode: 0 | 2;
  payList: string;
  qrCode: string;
  qrCodeContent: string;
  securityCode: string;
  status: TransitionStatus;
  walletUrl: string;
};

export type FiatWithdrawOrder = {
  amount: number;
  channel: string;
  channelId: number;
  createTime: number;
  currency: string;
  expiredTime: number;
  id: number;
  status: TransitionStatus;
  updateTime: number;
  fee: number;
};

export type CryptoOrder = {
  recordId: string;
  id: string;
  status: number;
  currency: string;
  icon: string;
  txId: string;
  fromAddress: string;
  toAddress: string;
  changeType: number;
  amount: number;
  fee: number;
  receiveTime: number;
  createTime: number;
  userId: string;
  showStatus: TransitionStatus;
  gasFee: number;
  withdrawFee: number;
};

export interface BlockHeight {
  chain: string;
  txBlockHeight: number;
  currBlockHeight: number;
  reqConfirmations: number;
}

type NetworkInfo = {
  chain: string;
  isSupportMemo: boolean;
  /* 平均确认时间 */
  confirmationTime: number;
  /** 最小充值金额 */
  minimumDepositAmount: number;
  /** 最小提现金额 */
  minimumWithdrawAmount: number;
  /** 币种全称 */
  chainFullName: string;
  logoUrl: string;
};

export interface CryptoCurrencyDetail {
  symbol: string;
  coinFullName: string;
  logoUrl: string;
  status: string;
  price: string;
  networks: {
    [chainId: string]: NetworkInfo;
  };
  /** 最小提现金额 */
  minWithdrawAmount: number;
}
