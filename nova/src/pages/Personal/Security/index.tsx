import { useTranslation } from 'react-i18next';
import { useUserInfo } from '@store/user';
import { Card } from '@pages/components';
import ChangePassword from './ChangePassword';
import LoginHistory from './LoginHistory';
import SetPassword from './SetPassword';
import TwoFactorAuthentication from './TwoFactorAuthentication';

function Security() {
  const { t } = useTranslation();
  const { data: userInfo } = useUserInfo();
  const { ifPassword } = userInfo;
  return (
    <div className="[&>.detrade-card]:s768:px-8 [&>.detrade-card]:s768:py-4 space-y-3">
      {/* 变更密码, 设置密码 */}
      <Card
        title={ifPassword ? t('Change password') : t('Set password')}
        className="text-14 s768:text-16 mb-3 s768:mb-4 font-700"
      >
        {ifPassword ? <ChangePassword /> : <SetPassword />}
      </Card>

      {/* 2fa */}
      <TwoFactorAuthentication />
      {/* 登录历史 */}
      <Card title={<span className="text-14 s768:text-16 font-700">{t('Login history')}</span>}>
        <LoginHistory />
      </Card>
    </div>
  );
}

export default Security;
