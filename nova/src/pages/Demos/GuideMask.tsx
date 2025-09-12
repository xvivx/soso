import React from 'react';
import { Button } from '@components';
import guideMask from '@components/FunctionRender/GuideMask';

function GuideMaskDemo() {
  const handleStartGuide = () => {
    guideMask.show({
      steps: [
        {
          selectorIds: ['demo-header1'],
          title: '欢迎使用 GuideMask',
          content: '这是一个基于 message 组件模式的引导遮罩组件。',
          placement: 'bottom',
        },
        {
          selectorIds: ['demo-header2'],
          title: '欢迎使用 GuideMask',
          content: '这是一个基于 message 组件模式的引导遮罩组件。',
          placement: 'bottom',
        },
        {
          selectorIds: ['demo-header3'],
          title: '欢迎使用 GuideMask',
          content: '这是一个基于 message 组件模式的引导遮罩组件。',
          placement: 'bottom',
        },
      ],
    });
  };
  return (
    <div className="space-y-8">
      <h2>GuideMask 演示</h2>

      {/* 控制按钮区域 */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="mb-4 font-bold text-16">GuideMask 控制</h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleStartGuide} theme="primary">
            开始引导
          </Button>
        </div>
        <p className="mt-4 text-sm text-gray-600">点击上方按钮开始 GuideMask 演示。支持 ESC 关闭和点击背景关闭。</p>
      </section>
      <div id="demo-header1" className="lg:col-span-4 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">GuideMask 演示页面</h1>
        <p className="text-gray-600 mt-2">1这是一个完整的 GuideMask 组件演示页面</p>
      </div>
      <div id="demo-header2" className="lg:col-span-4 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">GuideMask 演示页面</h1>
        <p className="text-gray-600 mt-2">2这是一个完整的 GuideMask 组件演示页面</p>
      </div>
      <div id="demo-header3" className="lg:col-span-4 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">GuideMask 演示页面</h1>
        <p className="text-gray-600 mt-2">3这是一个完整的 GuideMask 组件演示页面</p>
      </div>
    </div>
  );
}

export default GuideMaskDemo;
