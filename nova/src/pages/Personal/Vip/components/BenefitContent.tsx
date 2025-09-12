import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ActivityPriorityAccess from '@components/SvgIcon/private/activityPriorityAccess.svg';
import CommunityAccess from '@components/SvgIcon/private/communityAccess.svg';
import CustomServices from '@components/SvgIcon/private/customServices.svg';
import DedicatedCustomerSupport from '@components/SvgIcon/private/dedicatedCustomerSupport.svg';
import MaxWithdrawalLimit from '@components/SvgIcon/private/maxWithdrawalLimit.svg';
import MonthlyCashbackCap from '@components/SvgIcon/private/monthlyCashbackCap.svg';
import WheatEarsLeft from '@components/SvgIcon/private/wheatEarsLeft.svg';
import WithdrawalFeeDiscount from '@components/SvgIcon/private/withdrawalFeeDiscount.svg';
import { cn } from '@utils';
import format from '@utils/formatter';
import { useLevelBenefit } from '../hooks';
import { VIPInfo } from '../types';
import BenefitBadge from './BenefitBadge';

interface BenefitContentProps {
  vipInfo: VIPInfo;
  level?: number;
}

function BenefitContent(props: BenefitContentProps) {
  const { t } = useTranslation();
  const { vipInfo, level = 1 } = props;
  const { MWLLabel, DCSlabel, APALabel, CALabel, CSLabel, MCCLabel } = useLevelBenefit(level);

  const isValidForOneLevel = useMemo(() => !!level && level > 1, [level]);

  const isValidForThreeLevel = useMemo(() => !!level && level > 3, [level]);

  const levelConfig = useMemo(() => vipInfo.levelCfgs[level - 1], [level, vipInfo.levelCfgs]);

  const benefitConfigs = useMemo(
    () => [
      {
        level,
        validLevel: 1,
        label: t('Withdrawal fee discount'),
        content:
          level === 7 ? (
            <WithdrawalFeeDiscount className="size-7 text-primary" />
          ) : (
            format.percent(levelConfig.feeDiscountRate)
          ),
      },
      {
        level,
        label: MWLLabel,
        content:
          level === 7 ? (
            <MaxWithdrawalLimit className="size-7 text-primary" />
          ) : (
            '$' + format.kbm(levelConfig.maxWithdrawUsdAmount)
          ),
        validLevel: 1,
      },
      {
        level,
        validLevel: 2,
        label: MCCLabel,
        content:
          level === 1 || level === 7 ? (
            <MonthlyCashbackCap className={cn('size-7', isValidForOneLevel && 'text-primary')} />
          ) : (
            '$' + format.kbm(levelConfig.levelBonusAmount || 0)
          ),
      },
      {
        level,
        validLevel: 2,
        label: DCSlabel,
        content: <DedicatedCustomerSupport className={cn('size-7', isValidForOneLevel && 'text-primary')} />,
      },
      {
        level,
        validLevel: 2,
        label: APALabel,
        content: <ActivityPriorityAccess className={cn('size-7', isValidForOneLevel && 'text-primary')} />,
      },
      {
        level,
        validLevel: 2,
        label: CALabel,
        content: <CommunityAccess className={cn('size-7', isValidForOneLevel && 'text-primary')} />,
      },
      {
        level,
        validLevel: 4,
        label: CSLabel,
        content: <CustomServices className={cn('size-7', isValidForThreeLevel && 'text-primary')} />,
      },
    ],
    [
      APALabel,
      CALabel,
      CSLabel,
      DCSlabel,
      MCCLabel,
      MWLLabel,
      isValidForOneLevel,
      isValidForThreeLevel,
      level,
      levelConfig,
      t,
    ]
  );

  const validBenefitCount = useMemo(
    () => benefitConfigs.reduce((acc, cur) => acc + (cur.validLevel <= level ? 1 : 0), 0),
    [benefitConfigs, level]
  );

  return (
    <div className="pb-8 flex flex-col">
      <div className="flex items-center justify-center gap-2.5 py-2">
        <WheatEarsLeft className="h-4 text-warning_brighter" />
        <span className="text-warning_brighter text-12 font-700">
          {validBenefitCount} {t('perks in total')}
        </span>
        <WheatEarsLeft className="h-4 text-warning_brighter -scale-x-100" />
      </div>
      {level === 7 ? (
        <div className="mt-2.5 mb-8 py-3 px-6 text-center text-12 text-secondary bg-white/5 light:bg-black/5 rounded-2 self-center">
          <span className="font-600">{t('Unlock Diamond')}+: </span>
          <span>
            {t('hold Diamond for 3 months — our VIP manager will invite you to access tailored Diamond+ privileges.')}
          </span>
        </div>
      ) : null}
      <div className="mt-3 grid grid-cols-3 gap-y-8 s1024:flex s1024:gap-8 s1024:justify-center">
        {benefitConfigs
          .filter((item) => item.validLevel <= level)
          .map((item, index) => (
            <BenefitBadge
              key={index}
              level={item.level}
              label={item.label}
              content={item.content}
              isValid={item.validLevel <= level}
            />
          ))}
      </div>
    </div>
  );
}

export default memo(BenefitContent);
