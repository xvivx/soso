import { useState } from 'react';
import { Button } from '@components';
import { BetButton } from '@pages/components';
import { Direction } from '@/type';

function ButtonDemo() {
  const [loading, setLoading] = useState(false);

  /**
   * @description 模拟异步操作
   */
  const handleAsyncClick = async () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  };

  return (
    <div className="space-y-8">
      <h2>Button Demo</h2>
      {/* 主题样式展示 */}
      <section>
        <div className="flex gap-4">
          <Button asChild>
            <a href="https://example.com" target="_blank" rel="noreferrer">
              链接按钮asChild
            </a>
          </Button>
          <Button>
            <a href="https://example.com" target="_blank" rel="noreferrer">
              链接按钮
            </a>
          </Button>
          <Button theme="transparent">透明按钮</Button>
          <Button theme="secondary">次要按钮</Button>
          <Button theme="ghost">Ghost按钮</Button>
        </div>
      </section>

      {/* 尺寸展示 */}
      <section>
        <h3 className="mb-4 font-bold text-14">按钮尺寸</h3>
        <div className="flex items-center gap-4">
          <Button size="lg">大按钮</Button>
          <Button size="md">普通按钮</Button>
          <Button size="sm">小按钮</Button>
          <Button size="free" className="w-20 h-12">
            自由尺寸
          </Button>
        </div>
      </section>

      {/* 加载状态展示 */}
      <section>
        <h3 className="mb-4 font-bold text-14">加载状态</h3>
        <div className="flex gap-4">
          <Button loading>受控加载</Button>
          <Button onClick={handleAsyncClick}>点击异步加载</Button>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
          >
            状态控制加载
          </Button>
        </div>
      </section>

      {/* 禁用状态 */}
      <section>
        <h3 className="mb-4 font-bold text-14">禁用状态</h3>
        <div className="flex gap-4">
          <Button disabled>禁用按钮</Button>
          <Button theme="transparent" disabled>
            禁用透明按钮
          </Button>
          <Button theme="secondary" disabled>
            禁用次要按钮
          </Button>
        </div>
      </section>

      {/* 表单类型 */}
      <section>
        <h3 className="mb-4 font-bold text-14">表单类型</h3>
        <div className="flex gap-4">
          <Button type="submit">提交按钮</Button>
          <Button type="reset">重置按钮</Button>
        </div>
      </section>

      <section>
        <div className="flex h-12 -space-x-2 rounded-2 overflow-hidden ">
          <BetButton
            className="flex-row-reverse gap-3"
            iconClassName="size-6"
            skewClassName="skew-x-[23deg]"
            direction={Direction.BuyRise}
          >
            <div className="relative">Up</div>
          </BetButton>
          <BetButton
            className="gap-2"
            iconClassName="size-6"
            skewClassName="skew-x-[23deg]"
            direction={Direction.BuyFall}
          >
            <div className="relative">Down</div>
          </BetButton>
        </div>
      </section>
    </div>
  );
}

export default ButtonDemo;
