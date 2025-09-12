/**
 * @description KOL/KOC推广合作卡片组件
 * @returns {JSX.Element}
 */

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerService } from '@hooks/useIntercom';
import useNavigate from '@hooks/useNavigate';
import { Button } from '@components';
import kolKocImg from './imgs/kol-koc.png';

interface AffiliateCardProps {
  enableLink?: boolean;
}

const AffiliateCard = memo(({ enableLink = true }: AffiliateCardProps) => {
  const { open } = useCustomerService();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toPartnershipProgram = () => {
    navigate('/dashboard/partnership-program');
  };

  return (
    <section className="grid grid-cols-1 gap-4 s768:grid-cols-2 s768:gap-6 s1024:gap-8">
      {/* 左侧卡片 */}
      <article className="relative flex justify-between px-4 overflow-hidden h-36 rounded-3 referral-gradient">
        {/* 左侧图片区域 */}
        <div className="flex items-end">
          <img src={kolKocImg} alt="kol-koc" className="object-contain object-bottom w-auto h-full" />
        </div>
        {/* 右侧文字区域 */}
        <div className="flex flex-col justify-center pl-6 s768:pl-8">
          <h3 className="text-24 s768:text-28 s1024:text-36 text-primary font-800">{t('KOL KOC')}</h3>
          <p className="text-12 s768:text-13 s1024:text-14 text-primary font-800">{t('Content creators program')}</p>
        </div>
      </article>

      {/* 右侧内容区域 */}
      <article className="flex flex-col items-center justify-between gap-6 s768:items-start">
        <p className="text-left text-12 s768:text-14 s1024:text-16">
          <span>{t('If you are a content creator, make sure to check out our')}</span>
          {enableLink ? (
            <span className="ml-1 cursor-pointer text-brand" onClick={toPartnershipProgram}>
              {t('Partnership Program')}
            </span>
          ) : (
            <span className="ml-1">{t('Partnership Program')}</span>
          )}
        </p>
        <Button className="w-full s768:w-auto" size="lg" onClick={() => open()}>
          {t('Live chat')}
        </Button>
      </article>
    </section>
  );
});

AffiliateCard.displayName = 'AffiliateCard';

export default AffiliateCard;
