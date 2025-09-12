import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useUserInfo } from '@store/user';
import useMemoCallback from '@hooks/useMemoCallback';
import useNavigate from '@hooks/useNavigate';

export default function useAfterLogin() {
  const token = useSelector((state) => state.user.token);
  const navigate = useNavigate();
  const location = useLocation();
  const { isTemporary } = useUserInfo().data;
  const toRedirectPath = useMemoCallback(() => {
    // 新注册用户从注册页面登录成功后跳转到引导页
    if (location.pathname === '/account/register') {
      navigate('/guide', { replace: true });
    } else {
      navigate((location.state && location.state.from) || '/trade-center', { replace: true, action: 'FORCE-POP' });
    }
  });

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  useEffect(() => {
    !isTemporary && toRedirectPath();
  }, [isTemporary, toRedirectPath]);
}
