/**
 * @file useContact Hook
 * @description 封装处理联系我们逻辑的自定义 Hook
 */

import { useCallback } from 'react';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from './useResponsive';

/**
 * @description 自定义 Hook，处理联系我们逻辑
 * @returns {object} 提供的函数，包括打开联系我们和其他方法
 */
export const useCustomerService = () => {
  // 明确返回类型
  const { mobile } = useMediaQuery();
  const navigate = useNavigate();

  /**
   * @description 打开联系我们的函数
   */
  const open = useCallback(async () => {
    const { customerService } = await import('@utils/customerService');
    await customerService.open();
    mobile && navigate('#/customerService', { action: 'FORCE-POP' });
  }, [mobile, navigate]);

  return {
    open,
  };
};
