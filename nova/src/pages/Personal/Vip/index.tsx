import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '@components';
import LevelAssessmentUpdate from '@components/SvgIcon/private/levelAssessmentUpdate.svg';
import BenefitContent from './components/BenefitContent';
import VipCard from './components/VipCard';
import { useVipInfo } from './useVipInfo';

function Vip() {
  const { t } = useTranslation();
  const { data: vipInfo } = useVipInfo();
  const [curTabIndex, setCurTabIndex] = useState<number>(0);

  const levelNames = useMemo(
    () => [
      t('Bronze'),
      t('Silver'),
      t('Gold'),
      t('Platinum'),
      `${t('Platinum')}+`,
      t('Diamond'),
      `${t('Diamond')}+ (${t('Invite only')})`,
    ],
    [t]
  );

  const levelName = useMemo(() => {
    return levelNames[vipInfo.level - 1];
  }, [levelNames, vipInfo]);

  useEffect(() => {
    setCurTabIndex(vipInfo.level - 1);
  }, [vipInfo.level]);

  return (
    <div>
      <VipCard vipInfo={vipInfo} levelName={levelName} levelNames={levelNames} />
      <Tabs
        className="mt-3 bg-layer3 rounded-3 overflow-hidden px-4 s1024:px-8"
        theme="chip"
        selectedIndex={curTabIndex}
        onChange={setCurTabIndex}
        tabs={levelNames.map((name, index) => ({
          title: name,
          content: <BenefitContent vipInfo={vipInfo} level={index + 1} />,
        }))}
      />
      <div className="mt-3 flex gap-3">
        <LevelAssessmentUpdate className="size-6 s1024:size-8 shrink-0 text-tertiary" />
        <div>
          <div className="text-14 font-600 text-primary">{t('Level assessment & update')}</div>
          <div className="text-secondary text-12">
            <span>{t('Your account level is assessed and updated on the')}</span>
            <span className="text-brand font-600"> {t('16th of every month')}, </span>
            <span>{t('based on your latest performance and activity. Stay engaged and climb the ranks!')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Vip);
