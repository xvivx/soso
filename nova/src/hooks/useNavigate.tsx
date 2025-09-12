// eslint-disable-next-line no-restricted-imports
import { LocationState, useHistory, useLocation } from 'react-router';
import { Modal } from '@components';
import useMemoCallback from './useMemoCallback';
import { useMediaQuery } from './useResponsive';

export { useNavigateContext } from '@/NavigateContext';

export default function useNavigate() {
  const history = useHistory();
  const { mobile } = useMediaQuery();
  const { pathname, search, hash } = useLocation();

  function navigate(path: number): void;
  function navigate(path: string, state?: LocationState): void;
  function navigate(path: number | string, state?: LocationState): void {
    function jump() {
      if (typeof path === 'number') return history.go(path);

      const [name, query] = path.split('?');
      const params = new window.URLSearchParams();
      const isHashRoute = name.startsWith('#');

      [search, query]
        // 哈希路由合并原来的查询参数, 正常路由覆盖查询参数
        .slice(isHashRoute ? 0 : 1)
        .map((param) => new URLSearchParams(param))
        .forEach((item) => {
          item.forEach((value, key) => {
            if (params.has(key)) {
              params.set(key, value);
            } else {
              params.append(key, value);
            }
          });
        });

      const querystring = params.toString();
      const replace = state ? state.replace : false;
      const url = isHashRoute ? pathname : name;
      const location = { pathname: url, hash: isHashRoute ? name : '', search: querystring };
      if (replace || name === hash || name === pathname) {
        history.replace(location, state);
      } else {
        history.push(location, state);
      }
    }
    if (mobile) {
      // 手机端跳转前要关闭弹窗, 因为弹窗的层级很高会遮挡新链接内容
      Modal.closeAll();
      // 关闭弹窗时会引起一次go back, 这里延迟一点执行
      setTimeout(jump, 30);
    } else {
      jump();
    }
  }

  return useMemoCallback(navigate);
}
