import { useMemo } from 'react';
import { mock } from 'mockjs';
import { ScrollArea } from '@components';

export default function ScrollAreaDemo() {
  const text = useMemo(() => mock('@paragraph(10)'), []);
  return (
    <div>
      <h3 className="text-20 font-600 mb-2">ScrollArea</h3>
      <p>消除各平台浏览器滚动条差异, 可定制滚动行为和滚动条显示时机</p>
      <br />
      <div className="flex gap-2">
        <div>
          <h4 className="text-14 text-secondary mb-2">始终显示滚动条</h4>
          <ScrollArea className="w-50 h-50 p-3 bg-layer1" enableX type="always">
            <div className="w-screen h-screen">{text}</div>
          </ScrollArea>
        </div>
        <div>
          <h4 className="text-14 text-secondary mb-2">Hover显示滚动条</h4>
          <ScrollArea className="w-50 h-50 p-3 bg-layer1" type="hover" enableX>
            <div className="w-screen h-screen">{text}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
