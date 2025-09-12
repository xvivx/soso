import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '@components';
import { useGameContext } from '@pages/components/GameProvider';
import PriceDetail from '@pages/components/PriceDetail';
import HowItWorks from './HowItWorks';

function Explain() {
  const { t } = useTranslation();
  const { type: gameType } = useGameContext();
  const collapses = useMemo(() => {
    return [
      {
        title: t('How it works'),
        content: <HowItWorks />,
        value: '1',
      },
      {
        title: t('Price Formulation'),
        content: <PriceDetail gameType={gameType} />,
        value: '2',
      },
    ];
  }, [t, gameType]);

  return <Accordion defaultValue={'1'} items={collapses} type="single" />;
}
export default Explain;
