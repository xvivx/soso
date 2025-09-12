import { useCallback, useEffect, useRef, useState } from 'react';
import useNavigate from '@hooks/useNavigate';
import { Loading } from '@components';
import { customerService } from '@utils/customerService';

/**
 * @component CustomerService
 * @description 客服系统组件，用于管理客服系统生命周期和交互
 * 功能：
 * 1. 组件加载时打开客服系统
 * 2. 显示loading状态
 * 3. 监听客服系统关闭事件并返回上一页
 * 4. 组件卸载时关闭客服系统
 */
const CustomerService = () => {
  const navigate = useNavigate();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // 添加一个标记来防止多次触发
  const isClosingRef = useRef(false);

  /**
   * @description 处理客服系统关闭事件，执行返回操作
   */
  const handleIntercomClose = useCallback(() => {
    // 防止多次触发返回操作
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;
    navigate(-1);
  }, [navigate]);

  /**
   * @description 初始化客服系统并设置关闭事件监听
   */
  const initCustomerService = useCallback(async () => {
    setIsLoading(true);
    try {
      // 如果已有订阅，先取消订阅
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      await customerService.open();

      isClosingRef.current = false;
      // 监听客服系统关闭事件
      unsubscribeRef.current = customerService.onClose(handleIntercomClose);
    } finally {
      setIsLoading(false);
    }
  }, [handleIntercomClose]);

  useEffect(() => {
    // 使用 requestAnimationFrame 可以确保 初始化客服系统 在 DOM 更新后被调用。
    const frameId = requestAnimationFrame(() => {
      initCustomerService();
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        customerService.close();
      }
    };
  }, [initCustomerService]);

  if (isLoading) {
    return <Loading />;
  }
  return null;
};

export default CustomerService;
