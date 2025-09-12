import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStonksCoin } from '@store/contract';
import { Accordion } from '@components';
import PriceDetail from '@pages/components/PriceDetail';
import { GameTypeNumber } from '@/type';
import HowItWorks from './HowItWorks';
import HowItWorksInStonks from './HowItWorksInStonks';
import Limits from './Limits';
import { RiskyWarning } from './RiskyWarning';
import RoiHelp from './RoiHelp';

function Explain() {
  const isStonks = useStonksCoin();
  const { t } = useTranslation();
  const collapseList = useMemo(() => {
    const howItWork = [
      {
        title: t('How it works'),
        content: <HowItWorks />,
        value: '1',
      },
    ];

    const howItWorkStonks = [
      {
        title: t('How it works'),
        content: <HowItWorksInStonks />,
        value: '1',
      },
    ];

    const base = [
      {
        title: t('ROI Calculator'),
        content: <RoiHelp />,
        value: '2',
      },
      {
        title: t('Price Formulation'),
        content: <PriceDetail gameType={GameTypeNumber.Contract} />,
        value: '3',
      },
      {
        title: t('Limits'),
        content: <Limits />,
        value: '4',
      },
      {
        title: t('Risk Warning'),
        content: <RiskyWarning showFooter={false} />,
        value: '5',
      },
    ];

    return isStonks ? howItWorkStonks.concat(base) : howItWork.concat(base);
  }, [isStonks, t]);

  return <Accordion defaultValue={['1']} items={collapseList} type="multiple" />;
}

export default Explain;
