import { useMemo, useState } from 'react';
import { mock } from 'mockjs';
import { Radio } from '@components';

export default function RadioDemo() {
  const options = useMemo(
    () => mock({ 'data|2-5': [{ label: '@word(3,10)', value: '@uuid' }] }).data as { label: string; value: string }[],
    []
  );

  const [value, setValue] = useState(options[0].value);

  return (
    <div>
      <div className="mb-4">更简单</div>
      <Radio.Group value={value} onValueChange={setValue} options={options} />

      <br />

      <div className="mb-4">更灵活</div>
      <Radio.Group value={value} onValueChange={setValue} orientation="vertical">
        {options.map((item) => (
          <Radio key={item.value} value={item.value}>
            {item.label}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
}
