export interface LevelConfig {
  createTime: string;
  feeDiscountRate: number;
  id: number;
  level: number;
  levelBonusAmount: number;
  maxWithdrawUsdAmount: number;
  needSettleAmount: number;
  updateTime: string;
}
export interface VIPInfo {
  denominator: number;
  expirationTime: string;
  feeDiscountRate: number;
  level: number;
  levelCount: number;
  maxWithdrawUsdAmount: number;
  nextLevel: number;
  numerator: number;
  previousDenominator: number;
  supreme: boolean;
  levelCfgs: LevelConfig[];
}

export type LevelReceiveType = 'LEVEL_BONUS' | 'SIGN_IN_BONUS';

export interface LevelReceive {
  level: number;
  received: boolean;
  type: LevelReceiveType;
}
