import { Fragment, memo, ReactNode, useEffect, useId, useRef } from 'react';
import { getI18n } from 'react-i18next';
import { cn } from '@utils';
import Button from '../Button';
import { ScrollArea } from '../ScrollArea';
import SvgIcon from '../SvgIcon';
import { createRender, render } from './store';
import useContextHolder from './useContextHolder';
// eslint-disable-next-line no-restricted-imports
import useDevice from './useDevice';

export interface ModalProps {
  className?: string;
  title?: ReactNode;
  children: ReactNode;
  /** 是否可以点击背景或者按下ESC关闭, 默认是true */
  closable?: boolean;
  /** 用户点击x按钮的回调
   *
   *  如果closable是true点击背景或者按下ESC也会触发这个回调 */
  onClose: (visible: false) => void;
  size?: 'sm' | 'md' | 'lg';
  unstyled?: boolean;
  scrollable?: boolean;
}

function genKey() {
  return `Modal-${Math.random().toString(32).slice(2)}`;
}

function Modal(props: ModalProps & { visible: boolean }) {
  // 设置弹窗的唯一key
  const key = useId();
  const [contextHolder, contextWrapper] = useContextHolder();

  useEffect(() => {
    const { visible, closable = true, onClose, ...others } = props;
    if (visible) {
      createRender(contextWrapper(<ModalCore key={key} onClose={methods.close} {...others} />), {
        closable,
        onClose: () => onClose(false),
      });
    } else {
      render.delete(key);
    }
  }, [key, props, contextWrapper]);

  useEffect(() => {
    // 卸载时清除掉节点, 比如页面跳转时
    return () => render.delete(key);
  }, [key]);

  return contextHolder;
}

function ModalCore(props: ModalProps) {
  const { className, size, title, onClose, children, unstyled, scrollable = true } = props;
  const { mobile } = useDevice();
  const Container = scrollable ? ScrollArea : 'div';
  return (
    <Container
      className={cn(
        'detrade-modal safe-bottom-area relative max-w-full font-500 bg-layer2 border-layer2',
        !unstyled && 'max-h-[70vh] py-4 s768:py-6 text-secondary text-12',
        !unstyled &&
          (mobile
            ? 'w-full'
            : [
                size === 'sm' && 'w-100',
                size === 'md' && 'w-[600px]',
                size === 'lg' && 'w-[800px]',
                !size && 's768:w-100 s1366:w-[600px]',
              ]),
        mobile ? 'rounded-t-2' : 'rounded-2',
        className
      )}
    >
      {title && (
        <Fragment>
          <div className="sticky -top-px pb-4 pl-4 z-modal-down s768:pl-6 pr-14 s768:pr-18 bg-layer2 text-20 font-500 text-primary">
            {title}
          </div>
          <Button
            className="absolute top-0 right-0 z-modal p-4 s768:p-6 text-secondary hover:text-primary"
            theme="transparent"
            size="free"
            hoverable={false}
            onClick={() => onClose(false)}
          >
            <SvgIcon name="close" className="size-5" />
          </Button>
        </Fragment>
      )}
      {unstyled ? children : <div className="px-4 s768:px-6">{children}</div>}
    </Container>
  );
}

function Footer(props: { className?: string; children: ReactNode }) {
  const { className, children } = props;
  return <div className={cn('detrade-modal-footer', className)}>{children}</div>;
}

interface ModalMethods {
  /** 打开一个弹窗, 同时会返回关闭该弹窗的方法 */
  open: (options: Omit<ModalProps, 'onClose'> & { key?: string; onClose?: () => void }) => () => void;
  /** 关闭当前弹窗 */
  close: () => void;
  /** 关闭所有弹窗 */
  closeAll: () => void;
  confirm: (options: Omit<ModalProps, 'onClose'> & { onConfirm: () => Promise<void> | void }) => void;
}

const methods: ModalMethods = {
  open: (options) => showModal(options),
  close: () => render.close(),
  closeAll: () => render.closeAllOverlays(),
  confirm(options) {
    return confirmModal(options);
  },
};

export default Object.assign(memo(Modal), {
  displayName: 'Modal',
  ...methods,
  useModal() {
    const [contextHolder, contextWrapper] = useContextHolder();
    const closeRef = useRef<() => void>();
    // hook销毁时要执行清理
    useEffect(() => () => closeRef.current && closeRef.current(), []);
    return [
      {
        ...methods,
        open(options) {
          return (closeRef.current = showModal(options, contextWrapper));
        },
        confirm(options) {
          return (closeRef.current = confirmModal(options, contextWrapper));
        },
      },
      contextHolder,
    ] as [ModalMethods, ReactNode];
  },
  Footer: memo(Footer),
});

type ContextHolderWrapper = ReturnType<typeof useContextHolder>[1];

function showModal(options: Parameters<ModalMethods['open']>[0], wrapper?: ContextHolderWrapper) {
  const { onClose, key, closable = true, ...rests } = options;
  const content = <ModalCore key={key || genKey()} onClose={onClose || (() => close())} {...rests} />;
  const close = createRender(wrapper ? wrapper(content) : content, {
    closable,
    onClose,
  });
  return close;
}

function confirmModal(options: Parameters<ModalMethods['confirm']>[number], wrapper?: ContextHolderWrapper) {
  const { children, onConfirm, ...rests } = options;
  const { t } = getI18n();
  return showModal(
    {
      ...rests,
      children: (
        <>
          {children}
          <Footer className="flex gap-3">
            <Button theme="secondary" className="w-1/2" size="lg" onClick={methods.close}>
              {t('Cancel')}
            </Button>
            <Button className="w-1/2" size="lg" onClick={onConfirm}>
              {t('Confirm')}
            </Button>
          </Footer>
        </>
      ),
    },
    wrapper
  );
}
