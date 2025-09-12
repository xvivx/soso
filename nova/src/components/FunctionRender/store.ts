import { Key, ReactElement, ReactNode, useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash-es';

type MessageVmNode = {
  key: Key;
  node: ReactNode;
  type: 'message';
};

export type OverlayVmNode = {
  key: Key;
  type: 'overlay';
  node: ReactElement;
  /** 点击背景是否可以关闭 */
  closable?: boolean;
  onClose?: () => void;
};

type GuideVmNode = {
  key: Key;
  type: 'guide';
  node: ReactElement;
  onClose?: () => void;
};
type VmNode = MessageVmNode | OverlayVmNode | GuideVmNode;

let store: VmNode[] = [];
const listeners: Array<(state: VmNode[]) => void> = [];
function dispatch(action: Action) {
  store = reducer(store, action);
  listeners.forEach((listener) => {
    listener(store);
  });
}

export function useOverlayContext() {
  const [showOverlay, setShowOverlay] = useState(() => Boolean(store.find((it) => it.type === 'overlay')));
  useEffect(() => {
    const listener: (typeof listeners)[number] = (vNodes) => {
      setShowOverlay(Boolean(vNodes.find((it) => it.type === 'overlay')));
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);
  const closeAllOverlays = useCallback(() => render.closeAllOverlays(), []);
  return [showOverlay, closeAllOverlays] as const;
}

export function useRender() {
  const [vmNodes, setVmNodes] = useState(store);

  useEffect(() => {
    const debounceUpdate = debounce(setVmNodes, 100);
    listeners.push(debounceUpdate);
    return () => {
      const index = listeners.indexOf(debounceUpdate);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return [render, vmNodes] as [typeof render, VmNode[]];
}

type Action =
  | {
      type: 'ADD';
      payload: VmNode;
    }
  | {
      type: 'DELETE';
      payload: Key;
    }
  | {
      type: 'CLOSE_ALL_OVERLAYS';
    }
  | {
      type: 'DESTROY';
    };

function reducer(state: VmNode[], action: Action) {
  switch (action.type) {
    case 'ADD': {
      const node = action.payload;
      const index = state.findIndex((item) => item.key === node.key);

      if (index > -1) {
        // 更新节点
        const copy = [...state];
        return copy.splice(index, 1, node), copy;
      } else {
        // 插入节点
        return state.concat(node);
      }
    }

    case 'DELETE': {
      return state.filter((item) => item.key !== action.payload);
    }

    case 'CLOSE_ALL_OVERLAYS': {
      return state.filter((it) => it.type === 'message');
    }

    default: {
      return state;
    }
  }
}

type RenderOption = {
  /** 是否允许点击背景关闭 */
  closable?: boolean;
  /** 如果点击背景可以关闭, 在点击背景时会优先执行该回调,
   ** 用Modal.open({...})调用时, 如果不想点击背景关闭传入 closable: false即可
   ** 用组件调用时<Modal onClose={() => {...}} /> onClose必须传入*/
  onClose?: () => void;
};
/**
 * 用于在函数中渲染组件, 返回销毁方法
 * @param node 要渲染的组件
 */
export function createRender(node: ReactElement, type?: 'message' | 'guide'): () => void;
export function createRender(node: ReactElement, option?: RenderOption): () => void;
export function createRender(node: ReactElement, option?: 'message' | 'guide' | RenderOption) {
  const vm: VmNode = {
    key: node.key || Math.random(),
    node: node,
    ...(option === 'message'
      ? { type: 'message' }
      : option === 'guide'
        ? { type: 'guide' }
        : { ...option, type: 'overlay' }),
  };

  dispatch({ type: 'ADD', payload: vm });
  return () => dispatch({ type: 'DELETE', payload: vm.key });
}

class Render {
  /** 删除指定节点 */
  delete(key: Key) {
    // 正在批量删除或者删除还未进到store中的元素拦截dispatch
    if (this.batching || store.findIndex((it) => it.key === key) === -1) return;
    dispatch({ type: 'DELETE', payload: key });
  }
  /** 是否正在调用close方法, 可能的场景是onClose中调用了该方法, 引发死循环 */
  private closing = false;
  /** 关闭当前显示的overlay元素, 类似pop操作 */
  close(type?: 'overlay' | 'guide') {
    const closeType = type || 'overlay';
    if (this.batching || this.closing) return;
    const lastOverlay = store.filter((it) => it.type === closeType).slice(-1)[0];
    if (!lastOverlay) return;
    this.closing = true;
    'onClose' in lastOverlay && lastOverlay.onClose && lastOverlay.onClose();
    dispatch({ type: 'DELETE', payload: lastOverlay.key });
    this.closing = false;
  }
  /** 是否正在调用closeAllOverlays, 可能的场景是在onClose中调用该方法, 引发死循环 */
  private batching = false;
  /** 清空除message外的所有节点, 一般用于在最后一个弹窗结束所有流程 */
  closeAllOverlays() {
    if (this.batching) return;
    this.batching = true;
    store.forEach((it) => 'onClose' in it && it.onClose && it.onClose());
    dispatch({ type: 'CLOSE_ALL_OVERLAYS' });
    this.batching = false;
  }
}

export const render = new Render();
