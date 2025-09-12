import { useTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';
import { useMediaQuery } from '@hooks/useResponsive';
import LoginPage from '@pages/Account/Login';
import Register from '@pages/Account/Register';
import candle from './img/candle.png';
import useAfterLogin from './useAfterLogin';

function AuthLayout() {
  const { mobile } = useMediaQuery();
  useAfterLogin();
  const Layout = mobile ? MobileLayout : PcLayout;
  return <Layout />;
}

export default AuthLayout;

function PcLayout() {
  const { t } = useTranslation();
  return (
    <div
      className="relative min-h-screen flex flex-col gap-10 py-10 bg-layer1 bg-fixed bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url(${candle})`,
      }}
    >
      <div className="flex-1 flex-center mx-auto" style={{ maxWidth: 510 }}>
        <Routes />
      </div>
      <div className="text-14 text-quarterary text-center">
        {t('This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.')}
      </div>
    </div>
  );
}

function MobileLayout() {
  const { t } = useTranslation();
  return (
    <div className="pt-8 px-8 pb-3 h-screen flex flex-col gap-10">
      <Routes />
      <div className="text-10 text-center text-quarterary mt-auto">
        {t('This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.')}
      </div>
    </div>
  );
}

function Routes() {
  return (
    <Switch>
      <Route path="/account/login" component={LoginPage} />
      <Route path="/account/register" component={Register} />
    </Switch>
  );
}
