/**
 * @fileoverview Intercom 聊天按钮组件
 */
import { useEffect, useRef } from 'react';
import { useUserInfo } from '@store/user';
import { Button, SvgIcon } from '@components';
import { type Service } from '@utils/customerService';

/**
 * @description 客服系统触发按钮组件
 */
const CustomerServiceButton = () => {
  const serviceRef = useRef<Service>();
  const { type } = useUserInfo().data;

  useEffect(() => {
    import('@utils/customerService').then(({ customerService }) => {
      serviceRef.current = customerService;
    });

    return () => {
      serviceRef.current && serviceRef.current.destroy();
    };
  }, [type]);

  return (
    <Button
      onClick={() => serviceRef.current && serviceRef.current.open()}
      aria-label="Open chat"
      className="fixed z-30 p-2 bottom-5 right-5 bg-layer4 text-brand shadow"
      theme="transparent"
      icon={<SvgIcon name="intercom" className="text-brand size-5" />}
    />
  );
};

export default CustomerServiceButton;
