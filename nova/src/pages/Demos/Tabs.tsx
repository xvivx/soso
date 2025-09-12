import { useMemo } from 'react';
import { mock } from 'mockjs';
import { Tabs } from '@components';

function TabsDemo() {
  const tabs = useMemo(() => {
    return mock({
      'data|2-5': [
        {
          title: '@word(5,10)',
          content: '@paragraph',
        },
      ],
    }).data as { title: string; content: string }[];
  }, []);
  return (
    <div className="space-y-8">
      <h2>Tabs Demo</h2>

      <div>
        <p className="mb-4">横向</p>
        <Tabs tabs={tabs} direction="horizontal" />
      </div>

      <div>
        <p className="mb-4">纵向: 多用于导航</p>
        <Tabs tabs={tabs} direction="vertical" />
      </div>

      <div>
        <p className="mb-4">另一种主题</p>
        <Tabs tabs={tabs} theme="chip" />
      </div>

      <div>
        <p className="mb-4">JSX用法(最灵活)</p>
        <Tabs tabs={tabs} direction="horizontal">
          <Tabs.Header className="flex">
            {tabs.map((tab) => (
              <Tabs.Item key={tab.title} className="flex-1">
                {tab.title}
              </Tabs.Item>
            ))}
          </Tabs.Header>

          {tabs.map((tab) => (
            <Tabs.Panel key={tab.title}>{tab.content}</Tabs.Panel>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default TabsDemo;
