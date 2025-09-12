/**
 * 这个文件中所有引入的文件会在iframe中加载,
 * 尽量保证小体积, 不要把react和其他第三方包引进来
 */
import 'chartiq/css/normalize.css';
import {
  ActiveChart,
  type ChartFeed,
  type ChartIqKlineItem,
  type IframePostEvent,
  type IframeReceiveEvent,
  type IframeReceiveRenderOptions,
  type QuoteFeedFunction,
} from './main';
import './chart.css';

class IframeQuoteFeed implements ChartFeed {
  options: IframeReceiveRenderOptions;
  chart: ActiveChart;
  constructor() {
    this.options = {};
    this.bindEvent();
    this.chart = new ActiveChart({
      container: document.getElementById('chart-container')!,
      fetchInitial: this.fetchInitialData,
      fetchPagination: this.fetchPaginationData,
      onLoadingChange: this.onLoadingChange,
    });
  }

  private onMessage = (e: MessageEvent) => {
    if (typeof e.data !== 'string') return;
    try {
      const event = JSON.parse(e.data) as IframeReceiveEvent;

      if (event.type === 'initial') {
        // 初始化图表数据
        this.fetchInitialResolve(event.payload);
      } else if (event.type === 'pagination') {
        // 往左滑动分页数据
        this.fetchPaginationResolve(event.payload);
      } else if (event.type === 'draw') {
        // 更新图表最新点
        this.chart.draw(event.payload);
      } else if (event.type === 'render') {
        this.render(event.payload);
      } else if (event.type === 'addMarker') {
        this.chart.addMarker(event.payload);
      } else if (event.type === 'removeMarker') {
        this.chart.removeMarker(event.payload);
      } else if (event.type === 'positionOrder') {
        this.chart.positionMarker(event.payload);
      } else if (event.type === 'positionSpacing') {
        this.chart.positionSpacing(event.payload);
      } else if (event.type === 'drawSpreadLine') {
        this.chart.drawSpreadLine(event.payload);
      } else if (event.type === 'drawSpreadOrderLine') {
        this.chart.drawSpreadOrderLine(event.payload);
      } else if (event.type === 'set-theme') {
        const { klineBottomColor, klineTopColor, klineBorderColor, klineWidth, theme } = event.payload;
        klineBottomColor && document.body.style.setProperty('--kline-bottom-color', klineBottomColor);
        klineTopColor && document.body.style.setProperty('--kline-top-color', klineTopColor);
        klineBorderColor && document.body.style.setProperty('--kline-border-color', klineBorderColor);
        klineWidth && document.body.style.setProperty('--kline-width', klineWidth);
        this.render({ theme });
        document.body.className = theme || '';
      }
    } catch (error) {
      console.error(error);
    }
  };

  private bindEvent() {
    window.addEventListener('message', this.onMessage, false);
    dispatchMessage({ type: 'ready-to-create' });
  }

  fetchInitialResolve!: (value: ChartIqKlineItem[] | PromiseLike<ChartIqKlineItem[]>) => void;

  fetchInitialData: QuoteFeedFunction = async (
    symbol,
    start,
    end,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: { interval: string; period: number; stx: any },
    cb
  ) => {
    const data = await new Promise<ChartIqKlineItem[]>((resolve) => {
      this.fetchInitialResolve = resolve;

      setTimeout(() => {
        // 切换chart的mode时这个事件太快了, 会冲掉loading-change
        dispatchMessage({
          type: 'initial',
          payload: {
            symbol,
            start: start.getTime(),
            end: end.getTime(),
            params: {
              timeunit: params.interval,
              interval: params.period,
            },
          },
        });
      }, 100);
    });
    cb({ quotes: data });
    return data;
  };

  fetchPaginationResolve!: (value: ChartIqKlineItem[] | PromiseLike<ChartIqKlineItem[]>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchPaginationData: QuoteFeedFunction = async (symbol, startDate, endDate, params: any, cb) => {
    const data = await new Promise<ChartIqKlineItem[]>((resolve) => {
      this.fetchPaginationResolve = resolve;
      dispatchMessage({
        type: 'pagination',
        payload: {
          start: startDate.getTime(),
          end: endDate.getTime(),
          symbol,
          params: {
            timeunit: params.interval,
            interval: params.period,
          },
        },
      });
    });
    cb({ quotes: data });
    return data;
  };

  destroy() {
    this.chart.destroy();
    window.removeEventListener('message', this.onMessage);
  }

  onLoadingChange(loading: boolean) {
    dispatchMessage({ type: 'loading-change', payload: loading });
  }

  /**
   * 创建chart, 更新chart配置
   */
  render(options: IframeReceiveRenderOptions) {
    Object.assign(this.options, options);
    this.chart.render(this.options);
  }
}

export default new IframeQuoteFeed();

function dispatchMessage(event: IframePostEvent) {
  window.parent.postMessage(JSON.stringify(event), { targetOrigin: '*' });
}

window.onerror = () => true;
