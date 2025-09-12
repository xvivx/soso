import { RefObject, useEffect, useState } from 'react';
import { useWebsocket } from '@store/ws';
import { apis, formatChartData } from '../../ThirdPlatform/common';

export const DEFAULT_SYMBOL = 'BTC-USD';
export const KLINE_PARAMS = { timeunit: 'minute', interval: 1 };

export function useGuideChart(iframeRef: RefObject<HTMLIFrameElement>, symbol: string = DEFAULT_SYMBOL) {
  const [data, setData] = useState<ReturnType<typeof formatChartData>>([]);
  const [iframeReady, setIframeReady] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const { sendMessage, useOnMessage, readyState } = useWebsocket();

  // 监听 iframe ready 及模拟标志
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      let message = event.data;
      if (typeof message === 'string') {
        try {
          message = JSON.parse(message);
        } catch {
          // 兼容自定义信号
          if (message === 'guide-simulating-start') setIsSimulating(true);
          if (message === 'guide-simulating-end') setIsSimulating(false);
          return;
        }
      }
      if (message?.type === 'ready-to-create') setIframeReady(true);
      if (message?.type === 'guide-simulating') setIsSimulating(!!message.payload);
    };
    window.addEventListener('message', onMessage, false);
    return () => window.removeEventListener('message', onMessage, false);
  }, []);

  // 加载历史数据
  useEffect(() => {
    apis.initial(symbol, KLINE_PARAMS).then(setData);
  }, [symbol]);

  // 推送初始化数据和订阅 ws
  useEffect(() => {
    if (!iframeReady || !data.length || readyState !== 1) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(JSON.stringify({ type: 'set-theme', payload: { theme: 'lighten' } }), '*');
    win.postMessage(
      JSON.stringify({
        type: 'render',
        payload: { symbol, periodicity: '500ms', mode: 'basic' },
      }),
      '*'
    );
    setTimeout(() => {
      win.postMessage(JSON.stringify({ type: 'initial', payload: data }), '*');
    }, 100);
    const subCmd = `/kline/${symbol.replace('/', '-')}/ticker/subscribe`;
    sendMessage(subCmd);
    return () => {
      sendMessage(`/kline/${symbol.replace('/', '-')}/ticker/unsubscribe`);
    };
  }, [iframeReady, data, sendMessage, readyState, symbol, iframeRef]);

  // ws 实时推送
  useOnMessage((message) => {
    if (!iframeReady || readyState !== 1) return;
    if (isSimulating) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const klineCmd = `/kline/${symbol.replace('/', '-')}/ticker`;
    if (message.cmd === klineCmd) {
      const kline = formatChartData([message.resp]);
      win.postMessage(JSON.stringify({ type: 'draw', payload: kline }), '*');
    }
  });

  return { data, iframeReady };
}
