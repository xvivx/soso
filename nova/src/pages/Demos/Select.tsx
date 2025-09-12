import { useState } from 'react';
import { mock } from 'mockjs';
import { Select } from '@components';

const options = mock({
  'group|10-20': [
    {
      label: '@word(5,10)',
      value: '@id',
      'children|5-10': [
        {
          label: '@word(5,15)',
          value: '@id',
        },
      ],
    },
  ],
  'simple|10-20': [
    {
      label: '@word(5,10)',
      value: '@id',
    },
  ],
});

export default function SelectDemo() {
  const [simpleValue, setSimpleValue] = useState<string>();
  const [groupValue, setGroupValue] = useState('');
  return (
    <div className="space-y-8">
      <div className="text-20 font-600 mb-2">Select</div>
      <ul className="list-disc list-inside space-y-1 mb-2 text-secondary">
        <li>PC底层基于Popover实现, 移动端基于Modal实现</li>
        <li>用placeholder代替选择所有, 如果是必须要选一个值不要传入placeholder, 比如玩法一的图表时间下拉选择</li>
        <li>{`搜索过滤优先级option.filter > onSearch > option.label`}</li>
      </ul>
      <div className="flex flex-col s768:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <div>最简单的用法</div>
          <Select options={options.simple} placeholder="请选择" value={simpleValue} onChange={setSimpleValue} />
        </div>
        <div className="flex-1 space-y-2">
          <div>带搜索功能</div>
          <Select
            options={options.simple}
            searchable
            placeholder="请选择"
            value={simpleValue}
            onChange={setSimpleValue}
          />
        </div>
        <div className="flex-1 space-y-2">
          <div>带分组功能</div>
          <Select options={options.group} placeholder="请选择" value={groupValue} onChange={setGroupValue} />
        </div>
        <div className="flex-1 space-y-2">
          <div>带分组和搜索功能</div>
          <Select
            options={options.group}
            searchable
            placeholder="请选择"
            value={groupValue}
            onChange={setGroupValue}
            align="end"
          />
        </div>
      </div>
    </div>
  );
}
