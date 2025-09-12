import { useEffect, useState } from 'react';
import { mock } from 'mockjs';
import { AnimateNumber } from '@components';

export default function AnimateNumberDemo() {
  const [value, setValue] = useState(100);
  useEffect(() => {
    const timer = setInterval(() => {
      setValue(mock('@integer(1000, 1000000)') as number);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="space-y-8">
      <h3>数字动画</h3>
      <AnimateNumber value={value} precision={0} immediate />
      <AnimateNumber value={value} precision={0} immediate={false} />
    </div>
  );
}
