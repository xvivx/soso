import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { mock } from 'mockjs';
import { Button, Modal } from '@components';

export default function ModalDemo() {
  const [showSimpleModal, setShowSimpleModal] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [modal, contextModal] = Modal.useModal();
  return (
    <div className="p-4 bg-layer5">
      <div className="text-20 font-600 mb-2">Modal</div>
      <div className="flex flex-col s768:flex-row gap-4">
        <Button onClick={() => setShowSimpleModal(true)}>最常见的弹窗</Button>
        <Button
          onClick={() => {
            modal.open({
              title: mock('@word(5,9)'),
              children: (
                <div className="detrade-table overflow-auto">
                  <code>通过Modal.open()打开</code>
                  <br />
                  <p>
                    不要刻意依赖方法式调用, 它会有一定的局限性, 丧失热更新, 脱离渲染树等。
                    只有在这种方式调用非常方便的时候才这样做, 否则尽可能使用JSX的方式调用
                  </p>
                </div>
              ),
            });
          }}
        >
          方法调用
        </Button>

        <Button
          onClick={() => {
            Modal.open({
              title: mock('@word(5,9)'),
              children: (
                <div>
                  <Button
                    onClick={() => {
                      Modal.open({
                        title: mock('@word(5,9)'),
                        onClose() {
                          Modal.closeAll();
                        },
                        children: (
                          <div>
                            <div>第二层弹窗</div>
                            <div>点击关闭按钮会调用Modal.closeAll()关闭所有弹窗</div>
                          </div>
                        ),
                      });
                    }}
                  >
                    再打开一个弹窗
                  </Button>
                </div>
              ),
            });
          }}
        >
          嵌套弹窗
        </Button>

        <Button onClick={() => setShowFooterModal(true)}>带有Footer的弹窗</Button>
      </div>

      <Modal visible={showSimpleModal} title={mock('@word(5,9)')} onClose={setShowSimpleModal}>
        <div className="mb-2">{mock('@title')}</div>
        <div className="text-primary">
          <code>通过JSX打开</code>
          <Button
            size="sm"
            onClick={() => {
              setShowSimpleModal(false);
            }}
          >
            关闭
          </Button>
        </div>
      </Modal>
      <Modal title="带有Footer的弹窗" visible={showFooterModal} onClose={setShowFooterModal}>
        {new Array(50).fill(1).map((_, key) => (
          <div key={key}>{mock('@sentence')}</div>
        ))}

        <Modal.Footer>Footer在弹窗滚动时会吸附在底部</Modal.Footer>
      </Modal>

      <div className="mt-4 text-18 font-600 mb-2">保留上下文</div>
      <p className="text-14 text-secondary mb-2">
        使用JSX方式会自动保留所有上下文, 使用Modal.open调用时只能访问到最顶级的上下文(Redux, Router等),
        使用hook的方式调用可以保留所有上下文
      </p>

      <div className="flex flex-col s768:flex-row gap-4">
        <Button onClick={() => setShowContextModal(true)}>使用JSX</Button>
        <Button
          onClick={() => {
            modal.open({
              title: '使用Hook调用',
              children: <DemoConsumer />,
            });
          }}
        >
          使用Hook
        </Button>
      </div>

      <DemoProvider>
        <Modal title="JSX调用" visible={showContextModal} onClose={setShowContextModal}>
          <DemoConsumer />
        </Modal>
        {contextModal}
      </DemoProvider>
    </div>
  );
}

const DemoContext = createContext<{ name: string }>();
const DemoProvider = (props: PropsWithChildren) => {
  return <DemoContext.Provider value={{ name: mock('@name') }}>{props.children}</DemoContext.Provider>;
};

const DemoConsumer = () => {
  const { name } = useContext(DemoContext);
  return (
    <div>
      Hello, <span className="text-brand font-500">{name}</span>
    </div>
  );
};
