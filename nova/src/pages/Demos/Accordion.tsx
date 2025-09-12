import { useReducer } from 'react';
import { mock } from 'mockjs';
import { Accordion, Button } from '@components';

const accordions = mock({
  'data|2-4': [
    {
      title: '@title',
      content: '@paragraph(2,5)',
      value: '@uuid',
    },
  ],
}).data as { title: string; content: string; value: string }[];

/**
 * Accordion 组件演示
 */
export default function AccordionDemo() {
  const [show, toggle] = useReducer((show) => !show, false);
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-16 font-500">Accordion</h3>
        <p>惰性加载, 关闭后会卸载content内容。使用场景: 游戏的How It Works</p>
      </div>

      <section>
        <h3 className="mb-4 text-16 font-500">配置属性更简单</h3>
        <Accordion items={accordions} type="single" />
      </section>

      <section>
        <h3 className="mb-4 text-16 font-500">JSX用法更灵活</h3>
        <Accordion type="single">
          {accordions.map((it) => {
            return (
              <Accordion.Item key={it.value} value={it.value}>
                <Accordion.Title>{it.title}</Accordion.Title>
                <Accordion.Content>{it.content}</Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </section>

      <section>
        <h3 className="mb-4 text-16 font-500">可以展开多个</h3>
        <Accordion type="multiple">
          {accordions.map((it) => {
            return (
              <Accordion.Item key={it.value} value={it.value}>
                <Accordion.Title>{it.title}</Accordion.Title>
                <Accordion.Content>{it.content}</Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </section>

      <section>
        <h3 className="mb-4 text-16 font-500">突变内容建议使用Accordion.Collapse, 在切入和切出时会有动画</h3>
        <Button className="mb-2" onClick={toggle}>
          切换
        </Button>
        <Accordion.Collapse defaultOpen={show}>{mock('@paragraph')}</Accordion.Collapse>
      </section>

      <section>
        <h3 className="mb-4 text-16 font-500">单个折叠用例, 下单区手续费切换</h3>

        <Accordion.Collapse content={mock('@paragraph')}>
          <div>Fee Options</div>
        </Accordion.Collapse>
      </section>
    </div>
  );
}
