import { Fragment, lazy, memo, PropsWithChildren, Suspense, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, CustomerServiceButton, Loading, SvgIcon } from '@components';
import Logo from '@pages/components/Logo';
import NotificationTrigger from '../pages/Notification/NotificationTrigger';
import { LangSelect, Menus } from './dashboard/header';
import AvatarDropdown from './dashboard/header/AvatarDropdown';
import LoginButtons from './dashboard/LoginButtons';
import Footer from './Footer';

function LandingLayout() {
  const { mobile } = useMediaQuery();
  const Container = mobile ? MobileContainer : PcContainer;

  return (
    <Container>
      <Header />
      <Routes />
    </Container>
  );
}

function PcContainer(props: PropsWithChildren) {
  const { children } = props;

  return (
    <div className="bg-layer1 light:bg-white">
      <CustomerServiceButton />
      <Suspense fallback={<Loading.Screen />}>{children}</Suspense>
      <hr className="border-thirdly mx-auto" style={{ maxWidth: 1200 }} />
      <Footer className="shrink-0 w-full bg-layer1" />
    </div>
  );
}

function MobileContainer({ children }: PropsWithChildren) {
  return (
    <Fragment>
      <Suspense fallback={<Loading.Screen />}>{children}</Suspense>
      <Footer className="shrink-0 w-full bg-layer1" />
    </Fragment>
  );
}

export default memo(LandingLayout);

function Header() {
  const { isTemporary } = useUserInfo().data;
  const { mobile } = useMediaQuery();
  const navigate = useNavigate();
  const [headerOpacity, setHeaderOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollY } = window;
      const threshold = 200; // 滚动 200px 后完全显现
      const opacity = Math.min(scrollY / threshold, 1);
      setHeaderOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-3 h-12 px-4 s1024:h-16 s1024:px-3 shadow-lg"
      style={{
        // 将--bg-layer3颜色按照headerOpacity的比例与透明色混合, 以实现带有透明度的背景色
        background: `color-mix(in srgb, var(--bg-layer3) calc(${headerOpacity} * 100%), transparent)`,
        ['--tw-shadow-color' as string]: `rgb(0 0 0 / ${headerOpacity * 0.1})`,
        ['--tw-shadow' as string]: `0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color)`,
      }}
    >
      {mobile ? <Logo className="w-5 mr-auto" /> : <Menus />}

      {/* 未登录: pc(登录注册、多语言) mobile(登录注册) */}
      {isTemporary ? (
        <Fragment>
          <LoginButtons />
          {!mobile && <LangSelect />}
        </Fragment>
      ) : (
        // 已登录: pc(头像、多语言、通知) mobile(通知)
        <Fragment>
          {!mobile && (
            <Fragment>
              <AvatarDropdown />
              <LangSelect />
            </Fragment>
          )}
          <NotificationTrigger />
        </Fragment>
      )}

      {/* 菜单只在mobile端显示, 不关乎登录状态 */}
      {mobile && (
        <Button
          className="size-9 s768:size-10"
          theme="secondary"
          icon={<SvgIcon className="size-5" name="menuOff" />}
          onClick={() => navigate('#/menu')}
        />
      )}
    </header>
  );
}

const HomePage = lazy(() => import('@pages/Landing'));
const ContactUs = lazy(() => import('@pages/Landing/ContactUs'));
const ProductDescription = lazy(() => import('@pages/Landing/ProductDescription'));
const Service = lazy(() => import('@pages/Landing/Service'));
const TradingPlatform = lazy(() => import('@pages/Landing/TradingPlatform'));
const LicenseInformation = lazy(() => import('@pages/Landing/LicenseInfo'));
const FirstDepositBonusGuide = lazy(() => import('@pages/Landing/FirstDepositBonusGuide'));
const AMLAndKYC = lazy(() => import('@pages/Protocol/AMLAndKYC'));
const PrivacyPolicy = lazy(() => import('@pages/Protocol/PrivacyPolicy'));
const UserAgreement = lazy(() => import('@pages/Protocol/UserAgreement'));

function Routes() {
  return (
    <Switch>
      {/* 首页 */}
      <Route path="/" component={HomePage} exact />
      {/* 其他页面 */}
      <Route path="/service" component={Service} />
      <Route path="/platform" component={TradingPlatform} />
      <Route path="/product" component={ProductDescription} />
      <Route path="/contact/us" component={ContactUs} />
      <Route path="/license" component={LicenseInformation} />
      <Route path="/deposit-bonus-guide" component={FirstDepositBonusGuide} />
      <Route path="/protocol/agreement" component={UserAgreement} />
      <Route path="/protocol/privacy" component={PrivacyPolicy} />
      <Route path="/protocol/kyc" component={AMLAndKYC} />
    </Switch>
  );
}
