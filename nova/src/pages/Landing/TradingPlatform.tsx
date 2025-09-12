import { useTranslation } from 'react-i18next';
import Image from '@components/image';
import MobileImage from './img/mobile.png';
import PcImage from './img/pc.png';
import QuickDemo from './QuickDemo';

function TradingPlatform() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mx-auto px-3.5 pt-9 s768:pt-21 pb-9 s768:pb-21" style={{ maxWidth: 1200 }}>
        <div className="text-32 s768:text-44 mb-8 s768:mb-15 text-center font-700">{t('Trading Platform')}</div>
        <div className="flex justify-between flex-col s768:flex-row gap-6">
          <div className="flex-1">
            <div className="h-[204px] s768:h-[330px] bg-[#101725] overflow-hidden rounded-4 px-4 s768:px-15 pt-6">
              <Image src={PcImage} alt="" />
            </div>
            <div style={{ maxWidth: 392 }}>
              <div className="mt-5 mb-7 h-20">
                <div className="text-22 mb-1">{t('Website for PC')}</div>
                <div className="text-14 text-secondary">{t('Computers and smartphones are fully functional')}</div>
              </div>
              <div className="text-16 mb-2">{t('Major features:')}</div>
              <div className="text-14 leading-6">
                <div className="flex items-baseline gap-2">
                  <div className="w-2 h-2 bg-brand rounded-6" />
                  <div>{t('Simple and intuitive usable interface')}</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="w-2 h-2 bg-brand rounded-6" />
                  <div>{t('Intuitive trading trend display and analysis tools')}</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="w-2 h-2 bg-brand rounded-6" />
                  <div>{t('Intuitive trader transaction data display and statistics')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-[204px] s768:h-[330px] bg-[#101725] overflow-hidden rounded-4 px-10 s768:px-15 pt-6">
              <Image src={MobileImage} alt="" />
            </div>
            <div style={{ maxWidth: 392 }}>
              <div className="mt-5 mb-7 h-20">
                <div className="text-22 mb-1">{t('Website for smartphones')}</div>
                <div className="text-14 text-secondary">
                  {t(`No installation is required and you can trade via your smartphone's web browser.`)}
                </div>
              </div>
              <div className="text-16 mb-2">{t('Major features:')}</div>
              <div className="text-14 leading-6">
                <div className="flex items-baseline gap-2">
                  <div className="w-2 h-2 bg-brand rounded-6" />{' '}
                  <div>{t('Responsive and secure trading platform')}</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="w-2 h-2 bg-brand rounded-6" />
                  <div>{t('Easy access from your smartphone')}</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="w-2 h-2 bg-brand rounded-6" />
                  <div>{t('No downloads or updates required')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <QuickDemo />
    </div>
  );
}
export default TradingPlatform;
