/**
 * 当前服务器时间距离目标对应utc时间还剩的d:h:m:s
 */
import { useEffect, useState } from 'react';
import { getServerTime } from '@utils/axios';
import { padNumberWithZero } from '@utils/others';

/**
 *
 * @param targetUTCTime 目标结束UTC时间(时间戳)
 * @returns
 */
function useCountDownTimeByUTC(targetUTCTime: number | undefined) {
  const [time, setTime] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    if (!targetUTCTime) return;
    const tick = () => {
      const { days, hours, minutes, seconds } = calcDiffTime(targetUTCTime);
      setTime({ days, hours, minutes, seconds });
    };
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [targetUTCTime]);

  return time;
}

/**
 * 计算目标UTC与当前服务器时间的时间差
 * @param targetUTCTime 目标UTC时间
 * @returns
 */
function calcDiffTime(targetUTCTime: number) {
  // 当前服务器时间
  const serverTime = getServerTime();
  const timeDiff = targetUTCTime - serverTime;
  let days = '00';
  let hours = '00';
  let minutes = '00';
  let seconds = '00';

  if (timeDiff > 0) {
    const timeInSeconds = Math.floor(timeDiff / 1000);
    // 1h=3600s
    days = padNumberWithZero(Math.floor(timeInSeconds / (3600 * 24)));
    hours = padNumberWithZero(Math.floor((timeInSeconds % (3600 * 24)) / 3600));
    minutes = padNumberWithZero(Math.floor((timeInSeconds % 3600) / 60));
    seconds = padNumberWithZero(timeInSeconds % 60);
  }

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export default useCountDownTimeByUTC;
