import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setMaintenance } from '@store/system';

export default function useMaintenance() {
  // 监听路由变化，重置 isMaintenance 状态
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  useEffect(() => {
    dispatch(setMaintenance(false));
  }, [pathname, dispatch]);
}
