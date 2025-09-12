import { useState } from 'react';
import { AmountInput, Input } from '@components';
import BetInput from '@pages/components/BetInput';

/**
 * @description Input 组件使用示例
 */
function InputDemo() {
  const [amount, setAmount] = useState('');
  return (
    <div className="space-y-8">
      <p>有各种变体, 常用于各种输入, 金额、密码、数字、邮箱等</p>
      <Input placeholder="普通用法" />
      <Input.Search placeholder="带前缀" />
      <Input.Password placeholder="密码带后缀" autoComplete="new-password" />
      <Input value={amount} onChange={setAmount} placeholder="只能输入数字" inputMode="numeric" />
      <AmountInput value={amount} onChange={setAmount} placeholder="金额输入框, 带有格式化功能, 只能输入数字" />
      <BetInput value={amount} onChange={setAmount} min={1} max={1000000} />
      <Input.Textarea />
    </div>
  );
}

export default InputDemo;
