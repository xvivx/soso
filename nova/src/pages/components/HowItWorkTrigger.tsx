import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import useMemoCallback from '@hooks/useMemoCallback';
import { Button, Modal, SvgIcon } from '@components';
import ContractExplain from '@pages/Contract/helps/Explain';
import ContractHowItWorksInStonks from '@pages/Contract/helps/HowItWorksInStonks';
import HowTapWorks from '@pages/TapTrading/HowItWorks';
import HiLowAndSpreadExplain from '@pages/Trade/explain';
import BinaryHowItWorksInStonks from '@pages/Trade/explain/HowItWorksInStonks';
import HotItWorks from '@pages/UpAndDown/HotItWorks';
import { GameTypeNumber } from '@/type';

function HowItWorkTrigger({ gameType, tradingPair }: { gameType: GameTypeNumber; tradingPair: SymbolInfo }) {
  const { t } = useTranslation();
  const isStonks = tradingPair.symbol === 'STONKS/USD';
  const [modal, contextHolder] = Modal.useModal();
  const handleClick = useMemoCallback(() => {
    switch (gameType) {
      case GameTypeNumber.Contract:
        if (isStonks) {
          modal.open({
            title: t('How it works'),
            children: <ContractHowItWorksInStonks />,
            size: 'lg',
          });
        } else {
          modal.open({
            title: t('Explain'),
            children: <ContractExplain />,
            size: 'md',
          });
        }

        break;
      case GameTypeNumber.Binary:
      case GameTypeNumber.BinarySpread:
        if (isStonks) {
          modal.open({
            title: t('How it works'),
            children: <BinaryHowItWorksInStonks />,
            size: 'lg',
          });
        } else {
          modal.open({
            title: t('Explain'),
            children: <HiLowAndSpreadExplain />,
          });
        }
        break;
      case GameTypeNumber.Updown:
        Modal.open({
          title: t('How it works'),
          size: 'lg',
          children: <HotItWorks />,
        });
        break;
      case GameTypeNumber.TapTrading:
        Modal.open({
          title: t('How it works'),
          size: 'lg',
          children: <HowTapWorks />,
        });
        break;
      default:
        break;
    }
  });
  return (
    <>
      <Button
        className="ml-auto s768:order-last"
        size="free"
        theme="text"
        onClick={handleClick}
        icon={<SvgIcon name="book" className="size-5" />}
      />
      {contextHolder}
    </>
  );
}

export default memo(HowItWorkTrigger);
