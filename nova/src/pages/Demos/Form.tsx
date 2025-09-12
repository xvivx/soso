import { useMemo, useState } from 'react';
import { mock } from 'mockjs';
import { Checkbox } from '@components';

export default function FormDemo() {
  const options = useMemo(
    () =>
      mock({ 'data|2-5': [{ label: '@word(3,6)', value: '@word(3,6)' }] }).data as { label: string; value: string }[],
    []
  );

  const [value, setValue] = useState<string[]>([]);

  return (
    <div className="text-14">
      <div className="flex gap-4">
        <Checkbox>单个Checkbox</Checkbox>
        <Checkbox checked>选中状态(受控)</Checkbox>
      </div>
      <br />
      <div className="mb-4">简单用法</div>
      <Checkbox.Group value={value} onChange={setValue} options={options} />

      <br />

      <div className="mb-4">灵活用法</div>
      <Checkbox.Group value={value} onChange={setValue}>
        {options.map((item) => (
          <Checkbox key={item.value} value={item.value}>
            {item.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
}
