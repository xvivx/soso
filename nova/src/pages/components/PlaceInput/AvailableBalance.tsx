import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserInfo } from '@store/user';
import { useActiveAsset } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import useNavigate from '@hooks/useNavigate';
import { Button, SvgIcon, Tooltip } from '@components';
import { formatter } from '@utils';

function AvailableBalance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isTemporary } = useUserInfo().data;
  const handleNavigate = useMemoCallback(() => {
    if (isTemporary) {
      navigate('/account/login', { from: '#/wallet/deposit' });
    } else {
      navigate('#/wallet/deposit');
    }
  });
  const { amount, currency } = useActiveAsset();
  return (
    <div className="flex items-center justify-between gap-1 w-full text-12 text-primary whitespace-nowrap">
      <Tooltip side="top" align="start" content={t('The amount you currently have available to place an order.')}>
        <div className="text-secondary  border-b border-second border-dotted">{t('Available')}</div>
      </Tooltip>
      <div className="flex gap-1 items-center whitespace-nowrap">
        <span>{formatter.amount(amount, currency).floor().toText()}</span>
        <Button
          className="text-brand"
          theme="transparent"
          size="free"
          onClick={handleNavigate}
          icon={<SvgIcon className="text-brand" name="add" />}
        />
      </div>
    </div>
  );
}

export default memo(AvailableBalance);
