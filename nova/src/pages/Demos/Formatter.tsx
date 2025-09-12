import { formatter } from '@utils';

export default function Formatter() {
  const number = 123456789.1234567;
  return (
    <div>
      <div className="text-18 font-700">数字{number}</div>
      <div>做为6位价格格式化: {formatter.price(number, 6).toText()}</div>
      <div>做为USD金额格式化: {formatter.amount(number, 'USDFIAT').toText()}</div>
      <div>做为BTC金额格式化: {formatter.amount(number, 'BTC').toText()}</div>
      <br />
      <div>
        <div className="text-18 font-700">时间{Date.now()}</div>
        <div>只有日期: {formatter.time(Date.now(), 'date')}</div>
        <div>只有时间: {formatter.time(Date.now() + 12 * 3600 * 1000, 'time')}</div>
        <div>全部显示: {formatter.time(Date.now())}</div>
      </div>
    </div>
  );
}
