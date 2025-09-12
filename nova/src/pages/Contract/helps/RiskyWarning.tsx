import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setLeverageConfig } from '@store/system';
import { Button, Checkbox, SvgIcon } from '@components';
import Modal from '@components/FunctionRender/Modal';
import PriceDetail from '@pages/components/PriceDetail';
import i18n from '@/i18n';
import { GameTypeNumber } from '@/type';
import HowItWorks from './HowItWorks';
import { showRoiHelp } from './RoiHelp';

export function openRiskWarning(showFooter: boolean) {
  Modal.open({
    title: (
      <div className="flex items-center gap-2.5 text-16">
        <SvgIcon name="attention" />
        <span>{i18n.t('Risk Warning')}</span>
      </div>
    ),
    children: <RiskyWarning showFooter={showFooter} />,
  });
}

export function RiskyWarning({ showFooter = false }: { showFooter?: boolean }) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();

  function openHowItWork() {
    Modal.open({
      title: t('How it works'),
      children: <HowItWorks />,
    });
  }

  function openPriceFormulation() {
    Modal.open({
      title: t('Price Formulation'),
      children: <PriceDetail gameType={GameTypeNumber.Contract} />,
    });
  }

  return (
    <div className="text-secondary text-12 s768:text-14 font-400 space-y-5">
      <div>
        {t(
          'Cryptocurrency contract trading carries a high level of risk, and you may lose your entire trade amount. The higher the leverage you use, the greater the risk. However, under no circumstances can you lose more than your initial trade amount.'
        )}
      </div>
      <div className="text-warn">
        {t('If your position stays open for over 8 hours, hourly funding fees apply based on market conditions.')}
      </div>
      <div className="text-warn">
        {t(
          'These are deducted from your account balance, and insufficient funds will result in automatic position closure.'
        )}
      </div>
      <div>
        {t(
          'Using multiple accounts to bypass trading limits is strictly prohibited and may result in account suspension or penalties.'
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <span>{t('More')}: </span>
        <span onClick={openHowItWork} className="text-up underline cursor-pointer">
          {t('How it works')}
        </span>
        <span onClick={showRoiHelp} className="text-up underline cursor-pointer">
          {t('ROI calculator')}
        </span>
        <span onClick={openPriceFormulation} className="text-up underline cursor-pointer">
          {t('Price formulation')}
        </span>
      </div>
      {showFooter && (
        <Modal.Footer>
          <Checkbox className="mb-4" checked={checked} onCheckedChange={(checked) => setChecked(Boolean(checked))}>
            {t(`Don't show again`)}
          </Checkbox>
          <Button
            onClick={() => {
              // 勾选了"不再显示"才更新store状态
              if (checked) dispatch(setLeverageConfig({ doNotShowRiskyWarning: true }));
              Modal.close();
            }}
            className="p-3 uppercase w-full"
            size="lg"
          >
            {t('I acknowledge')}
          </Button>
        </Modal.Footer>
      )}
    </div>
  );
}
