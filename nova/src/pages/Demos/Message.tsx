import { useEffect, useMemo, useState } from 'react';
import { mock } from 'mockjs';
import { Button, Message, message } from '@components';

export default function MessageDemo() {
  useEffect(() => {
    message.success(mock('@title(2,5)'));
    message.error(mock('@title(2,5)'));
  }, []);

  const text = useMemo(() => mock('@paragraph(1,3)'), []);
  const [count, setCount] = useState(1);

  return (
    <div className="space-y-8">
      <p>
        使用时如果传入key或者字符串时, 在消息组件销毁前调用会更新组件, 而不是弹出新的,
        比如后端报错如果频繁触发相同的消息只会弹一条, 如果想相同的文字也想弹出新的组件, 可以传入一个变化的key,
        比如用户赢钱或者下单时的提示, 应该每一个动作都要弹出提示。
      </p>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => {
            setCount((count) => count + 1);
            message.error(`Hello world ${count}`);
          }}
        >
          无Key、文案变
        </Button>
        <Button
          onClick={() => {
            message.error(`Hello world`);
          }}
        >
          无Key、文案不变
        </Button>
        <Button
          onClick={() => {
            setCount((count) => count + 1);
            message.error({ content: `Hello world ${count}`, key: 'count' });
          }}
        >
          有Key、文案变
        </Button>
      </div>

      <div>
        <div className="mb-4">成功样式</div>
        <Message type="success">{text}</Message>
      </div>
      <div>
        <div className="mb-4">错误样式</div>
        <Message type="error">{text}</Message>
      </div>
      <div>
        <div className="mb-4">警告样式(待设计补充)</div>
        <Message type="warning">{text}</Message>
      </div>
    </div>
  );
}
