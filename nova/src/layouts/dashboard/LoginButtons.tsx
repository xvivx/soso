import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Button } from '@components';

function LoginButtons() {
  const { t } = useTranslation();

  return (
    <div className="space-x-2">
      <Button asChild theme="ghost">
        <NavLink to="/account/login">{t('Sign in')}</NavLink>
      </Button>
      <Button asChild>
        <NavLink to="/account/register">{t('Register')}</NavLink>
      </Button>
    </div>
  );
}
export default LoginButtons;
