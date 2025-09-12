import { useTranslation } from 'react-i18next';
import { Image } from '@components';
import authLogo from './img/logo.png';

export function DividerWithText() {
  const { t } = useTranslation();
  return (
    <div className="relative flex items-center">
      <div className="flex-grow border-t border-thirdly" />
      <span className="mx-5 text-14 s768:text-16 text-secondary">{t('or')}</span>
      <div className="flex-grow border-t border-thirdly" />
    </div>
  );
}

export function AuthLogo() {
  return <Image src={authLogo} className="h-11 w-10 s768:h-13 s768:w-12 mx-auto" />;
}
