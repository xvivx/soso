import { memo, PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { LocationState, useHistory, useLocation } from 'react-router';
import usePrevious from '@hooks/usePrevious';
import { Systems } from '@utils';
import NavigateContext from '@/NavigateContext';

type Location = ReturnType<typeof useLocation<LocationState>>;

function NavigateProvider(props: PropsWithChildren) {
  const history = useHistory();
  const location = useLocation();
  const { state } = location;
  const [disableAnimation, setDisableAnimation] = useState(false);
  const queryTime = (state && state.ts) || 0;
  const prevQueryTime = usePrevious(queryTime) || 0;
  const [historyReady, setHistoryReady] = useState(false);

  let isPopAction: boolean;
  if (state && state.action === 'FORCE-POP') {
    isPopAction = true;
  } else if (history.action === 'PUSH' || history.action === 'REPLACE') {
    isPopAction = false;
  } else {
    isPopAction = queryTime < prevQueryTime;
  }

  const fromRef = useRef(location);
  fromRef.current = location;

  useLayoutEffect(() => {
    const primitivePush = history.push.bind(history);
    const primitiveReplace = history.replace.bind(history);
    history.push = (location: Location, state: LocationState) => {
      const [target, states] = resolveRouteParams(location, fromRef.current, state);
      primitivePush(target, states);
    };
    history.replace = (location: Location, state: LocationState) => {
      const [target, states] = resolveRouteParams(location, fromRef.current, state);
      // A -> B -> C, 在B处replace到A, 再前进到C, 动画还应该是前进方向
      const ts = window.history.state ? window.history.state.state.ts : 0;
      primitiveReplace(target, { ...states, ts: ts || Date.now() });
    };
    setHistoryReady(true);
    return () => {
      history.push = primitivePush;
      history.replace = primitiveReplace;
    };
  }, [history]);

  useEffect(() => {
    if (Systems.device.isIOS) {
      let timer: NodeJS.Timeout;
      let moving = false;

      const onTouchstart = () => {
        clearTimeout(timer);
      };
      // 监听ios屏幕滑动, 为动画播放提供判断依据(ios手势返回自带动画和上个页面的快照, 此时不应播放动画)
      const onTouchmove = () => {
        if (moving) return;
        setDisableAnimation((moving = true));
      };
      const onTouchend = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          // 要延迟处理, touchend触发早于popstate事件, 得让它在popstate之后触发
          setDisableAnimation((moving = false));
        }, 500);
      };

      window.addEventListener('touchstart', onTouchstart, false);
      window.addEventListener('touchmove', onTouchmove, false);
      window.addEventListener('touchend', onTouchend, false);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('touchstart', onTouchstart);
        window.removeEventListener('touchmove', onTouchmove);
        window.removeEventListener('touchend', onTouchend);
      };
    }
  }, []);

  return (
    <NavigateContext.Provider value={{ isPopAction, disableAnimation }}>
      {historyReady && props.children}
    </NavigateContext.Provider>
  );
}

export default memo(NavigateProvider);

function resolveRouteParams(location: Location, prev: Location, state?: LocationState) {
  // 传入的pathname可能是/a#b, 分离出hash, 不然跳转会无效, 因为路由中不存在/a#b这样的path
  const [pathname, hash] = location.pathname.split('#');

  return [
    { pathname, hash: hash || location.hash, search: location.search },
    {
      ts: Date.now(),
      ...state,
      from: calcRedirect(location, prev, state),
    },
  ];
}

function calcRedirect(location: Location, prev: Location, state?: LocationState) {
  const { from = '' } = state || {};
  // 优先使用用户传入的from
  if (from.startsWith('#')) {
    return prev.pathname + prev.search + from;
  } else if (from) {
    return from;
  }

  /** 没有传入from需要自动填充
   ** 1. 进入到/account路由如果上一次路由有from直接使用
   **    1.1. 如果上次路由也是/account, 比如从login到register, 返回空
   **    1.2. 如果上次路由也是/account, 比如从login到register, 返回空
   ** 2. 如果当前不是/account路由，理论上从任何路由到登陆后都应该重定向到这个路由
   */
  if (location.pathname.startsWith('/account') && prev.pathname.startsWith('/account')) {
    return (prev.state && prev.state.from) || '';
  } else {
    return prev.pathname + prev.search + prev.hash;
  }
}
