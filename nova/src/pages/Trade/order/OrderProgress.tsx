import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatter } from '@utils';
import { getServerTime } from '@utils/axios';

export const OrderProgress = memo((props: { duration: number; startTime: number }) => {
  // 以服务器时间作为开始时间
  const serverTime = getServerTime();
  const [time, setTime] = useState(props.startTime + props.duration * 1000 - serverTime + 1000); // 补充1秒通信耗时

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((time) => {
        if (time <= 1) {
          clearInterval(timer);
          return 0;
        }
        return time - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="items-center flex-row justify-end">
      <div className="text-14 text-primary">{formatter.countdown(time, 'mm:ss')}</div>
      <div
        className="bg-warn/30 rounded-full"
        style={{
          position: 'relative',
          height: 4,
          width: '64px',
          overflow: 'hidden',
          minWidth: '64px',
        }}
      >
        <motion.div
          className="w-full h-1 bg-warn translate-x-full rounded-full"
          initial={{ x: 0 }}
          animate={{ x: '100%' }}
          transition={{ duration: time / 1000, ease: 'linear' }}
        />
      </div>
    </div>
  );
});
