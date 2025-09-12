// 带有路由功能的Tab，二级菜单需要用, Tab+Router
import { LazyExoticComponent, memo, Suspense, useMemo } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import useNavigate from '@hooks/useNavigate';
import { Loading, Tabs } from '@components';
import Page404 from '@pages/Page404';
import RouteGuard from '@/routes/RouteGuard';

interface Props {
  tabs: {
    label: string;
    route: string;
    element: LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>;
    auth?: boolean; // 当前Tab是否需要登陆
  }[];
}
function RouterTab(props: Props) {
  const { tabs } = props;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const selectedIndex = useMemo(() => {
    return tabs.findIndex((tab) => pathname === tab.route);
  }, [pathname, tabs]);
  return (
    <Tabs
      className="space-y-0"
      theme="chip"
      selectedIndex={selectedIndex}
      onChange={(index) => {
        navigate(tabs[index].route, { replace: true });
      }}
    >
      {/* 手机端使用margin突破RouterLayout手机端padding限制; */}
      <div className="sticky z-30 top-12 s1024:top-16 -mt-4 py-4 bg-layer2">
        <Tabs.Header className="border-layer4">
          {tabs.map((tab, key) => {
            return (
              <Tabs.Item key={key} className="flex-1 s768:flex-none">
                {tab.label}
              </Tabs.Item>
            );
          })}
        </Tabs.Header>
      </div>

      <Suspense
        fallback={
          // 给个高度让loading在适当位置
          <div className="relative h-72">
            <Loading />
          </div>
        }
      >
        <Switch>
          {tabs.map((tab) => (
            <Route key={tab.route} path={tab.route} exact>
              {tab.auth ? (
                <RouteGuard.RealLogin>
                  <tab.element />
                </RouteGuard.RealLogin>
              ) : (
                <tab.element />
              )}
            </Route>
          ))}
          <Route component={Page404} />
        </Switch>
      </Suspense>
    </Tabs>
  );
}

export default memo(RouterTab);
