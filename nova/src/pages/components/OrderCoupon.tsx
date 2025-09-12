import { useTranslation } from 'react-i18next';
import useNavigate from '@hooks/useNavigate';
import { Button, SvgIcon } from '@components';

function OrderCoupon() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Button
      onClick={() => navigate('/dashboard/campaign/reward-center', { tab: 1 })}
      theme="transparent"
      size="free"
      className="bg-warn/10 text-warn text-10 rounded px-1"
    >
      {t('Bonus Trial')}
      <SvgIcon name="arrow" className="text-warn size-3" />
    </Button>
  );
}

export default OrderCoupon;
