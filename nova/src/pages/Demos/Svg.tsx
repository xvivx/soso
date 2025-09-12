/**
 * @file Svg.tsx
 * @description SVG图标展示组件 - 展示两种不同的SVG处理方案对比
 */

import { SvgIcon } from '@components';
import * as icons from '@components/SvgIcon/public';
import { Direction } from '@/type';

const SvgDemo = () => {
  const getAllIconNames = () => Object.keys(icons);
  return (
    <div className="p-6 space-y-12">
      <h2 className="text-xl font-semibold">SVG图标使用指南</h2>
      {/* 方案：SVGR Components Demo  */}
      <div className="space-y-4 ">
        <h3 className="text-lg font-medium">方案示例</h3>
        <div className="p-4 space-y-6 border rounded-lg bg-gray-50">
          {/* 基础用法 */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">所有图标默认用法：</p>
            <div className="grid grid-cols-8 gap-4">
              {getAllIconNames().map((iconName) => (
                <div key={iconName} className="flex flex-col items-center gap-1">
                  <SvgIcon name={iconName as keyof typeof icons} />
                  <span className="text-xs">{iconName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 自定义颜色 */}
          <div className="space-y-2">
            <p className="text-sm ">自定义颜色：</p>
            <div className="flex items-center space-x-4">
              <SvgIcon name="attention" className="size-8 text-warn" />
              <SvgIcon name="integration" className="text-brand" />
              <SvgIcon name="arrow" className="text-brand" />
              <SvgIcon name="referral" className="text-[#22c55e]" />
              <SvgIcon name="chat" className="text-[#3b82f6]" />
            </div>
          </div>

          {/* 自定义大小 */}
          <div className="space-y-2">
            <p className="text-sm">自定义大小：</p>
            <div className="flex items-center space-x-4">
              <SvgIcon name="integration" className="size-8" />
              <SvgIcon name="referral" className="size-10" />
              <SvgIcon name="chat" className="size-12" />
            </div>
          </div>

          {/* 组合使用 */}
          <div className="space-y-2">
            <p className="text-sm">组合使用（颜色+大小）：</p>
            <div className="flex items-center space-x-4">
              <SvgIcon name="arrow" className="size-10 text-brand" />
            </div>
            <SvgIcon.Direction direction={Direction.BuyRise} />
            <SvgIcon.Direction direction={Direction.BuyFall} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SvgDemo;
