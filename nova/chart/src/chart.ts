/* eslint max-lines: "off" */
import 'chartiq/css/chartiq.css';
import 'chartiq/css/stx-chart.css';
import './chart.css';
import { CIQ } from 'chartiq/js/componentUI';
import 'chartiq/js/advanced';
import 'chartiq/js/components';
import 'chartiq/js/addOns';
// @ts-expect-error 这个库的类型定义有bug, 后面升级后看能否移除
import defaultConfig from 'chartiq/js/defaultConfiguration';
import 'chartiq/js/deprecated'; // 影响x轴时间显示
import getLicenseKey from 'chartiq/key';
import { merge } from 'lodash-es';
import {
  ChartMode,
  formatQuoteFeedReturn,
  PeriodicityMap,
  type ChartFeed,
  type ChartIqKlineItem,
  type ChartOptions,
  type MarkerOptions,
  type PositionMarker,
  type PositionSpacing,
  type SpreadOrderLine,
} from './common';
import getTemplate from './template';

getLicenseKey(CIQ);
CIQ.logVersion = () => null;

type Function = () => void;

class ActiveChart {
  public chart?: SimpleChart | AdvancedChart;

  private options: ChartOptions;

  private clearDrawSpread: Function[];

  private positionMarkerOption: PositionMarker[];

  private positionSpacingOption: PositionSpacing[];

  private spreadOrderLine: SpreadOrderLine[];

  constructor(options: ChartOptions) {
    this.options = options;
    this.clearDrawSpread = [];
    this.positionMarkerOption = [];
    this.positionSpacingOption = [];
    this.spreadOrderLine = [];
  }

  draw([data]: ChartIqKlineItem[]) {
    this.chart?.stxx.updateChartData({
      Last: (data.Close || 0) * 1000,
      DT: new Date(data.DT!).getTime(),
    });
  }

  destroy() {
    this.clearDrawSpread.forEach((clear) => clear());
    CIQ.ChartEngine.prototype.remove('draw');

    if (this.chart) {
      this.chart.stxx.markers = {};
      this.chart.destroy();
    }
  }

  private create(): ActiveChart['chart'] {
    if (this.options.mode === ChartMode.advanced) {
      return new AdvancedChart(this.options);
    } else if (this.options.mode === ChartMode.basic) {
      return new SimpleChart(this.options);
    }
  }

  private createOrRecreate(options: Partial<ActiveChart['options']>) {
    if (!this.chart) {
      const tempOptions = Object.assign({}, this.options, options);
      // 有symbol, mode, periodicity, theme这些因素时才能准确创建, 不然创建完还要销毁
      return Boolean(tempOptions.symbol && tempOptions.mode && tempOptions.periodicity && tempOptions.theme);
    } else {
      return (
        // 普通/高级模式改变
        Boolean(options.mode && options.mode !== this.options.mode) ||
        // 时间组改变
        Boolean(options.periodicity && options.periodicity !== this.options.periodicity) ||
        // symbol改变
        Boolean(options.symbol && options.symbol !== this.options.symbol) ||
        // theme改变 不然无法更新kline的背景色
        Boolean(options.theme && options.theme !== this.options.theme)
      );
    }
  }

  render(options: Partial<ActiveChart['options']>) {
    const creatable = this.createOrRecreate(options);
    // 创建前必须合并options才能拿到完整的配置信息
    Object.assign(this.options, options);

    if (creatable) {
      this.chart && this.chart.destroy();
      this.chart = this.create();
    }

    this.chart && this.chart.render(this.options);
  }

  /** 批量画marker */
  addMarker(options: MarkerOptions[]) {
    if (!this.chart) {
      throw new Error(`chart not build`);
    }
    if (!this.chart.stxx) {
      throw new Error(`stxx not build`);
    }
    options.forEach((option) => {
      const { markerType, label, x, y, innerHTML } = option;
      const node = document.getElementById(markerType) as HTMLElement;
      if (!node || !this.chart) return;

      CIQ.Marker.removeByLabel(this.chart.stxx, label);

      const newNode = node.cloneNode(false) as HTMLElement;
      newNode.innerHTML = innerHTML;

      const params = {
        stx: this.chart.stxx,
        xPositioner: 'date',
        x: new Date(x),
        yPositioner: 'on_candle',
        y,
        label,
        node: newNode,
      };

      new CIQ.Marker(params);
    });

    this.chart.stxx.draw();
  }

  /** 批量删除marker */
  removeMarker(ids: string[]) {
    if (!this.chart) {
      throw new Error(`chart not build`);
    }
    if (!this.chart.stxx) {
      throw new Error(`stxx not build`);
    }
    ids.forEach((id) => {
      CIQ.Marker.removeByLabel(this.chart!.stxx, id);
    });
  }

  // 玩法2画开始价，爆仓价，止盈，止损价(最多4条水平线，只显示一条订单的线
  positionMarker(options: PositionMarker[]) {
    this.positionMarkerOption = options;

    const mark = CIQ.ChartEngine.prototype.append('draw', () => {
      this.positionMarkerOption.forEach((marker) => {
        const { color, label, price } = marker;
        if (!this.chart) {
          return;
        }
        if (!this.chart.stxx) {
          return;
        }
        if (!color || !label || !price) return;
        if (!marker.show) return;
        const { panel } = this.chart.stxx.chart;

        const y = this.chart.stxx.pixelFromPrice(price * 1000, panel); // 扩大1000倍

        const parameters = {
          x0: 0,
          x1: 1,
          y0: y,
          y1: y,
          color,
          type: 'line',
        };

        try {
          this.chart.stxx.startClip();
          this.chart.stxx.plotLine(parameters);
          this.chart.stxx.endClip();
          this.chart.stxx.createYAxisLabel(panel, label, y, color, '#000');
        } catch (error) {
          console.error(error);
        }
      });
    });

    if (!options.length) {
      CIQ.ChartEngine.prototype.removeInjection(mark);
    }
  }

  // 玩法1画开始价格线，结束时间线（所有订单的线
  positionSpacing(options: PositionSpacing[]) {
    this.positionSpacingOption = options;
    const mark = CIQ.ChartEngine.prototype.append('draw', () => {
      this.positionSpacingOption.forEach((marker) => {
        const { color, price, startTime, endTime, show } = marker;
        if (!this.chart) {
          return;
        }
        if (!this.chart.stxx) {
          return;
        }

        if (!color || !price || !startTime || !endTime) return;
        if (!show) return;
        const { panel } = this.chart.stxx.chart;

        const y = this.chart.stxx.pixelFromPrice(price * 1000, panel); // 扩大1000倍
        const x0 = this.chart.stxx.pixelFromDate(new Date(startTime), this.chart.stxx.chart);
        // -500ms hack画线老是晚了500ms
        const x1 = this.chart.stxx.pixelFromDate(new Date(endTime - 500), this.chart.stxx.chart);

        // 水平线段
        const parametersX = {
          x0: x0,
          x1: x1,
          y0: y,
          y1: y,
          color,
          type: 'segment',
        };

        // 结束时间垂直线
        const parametersY = {
          x0: x1,
          x1: x1,
          y0: 0,
          y1: 1,
          color,
          type: 'line',
        };

        try {
          this.chart.stxx.startClip();
          this.chart.stxx.plotLine(parametersY);
          this.chart.stxx.plotLine(parametersX);
          this.chart.stxx.endClip();
        } catch (error) {
          console.error(error);
        }
      });
    });

    if (!options.length) {
      CIQ.ChartEngine.prototype.removeInjection(mark);
    }
  }

  // 玩法1spread画点差与marker之间线，开始价格线，结束时间线（所有订单的线
  drawSpreadOrderLine(options: SpreadOrderLine[]) {
    this.spreadOrderLine = options;
    const mark = CIQ.ChartEngine.prototype.append('draw', () => {
      this.spreadOrderLine.forEach((marker) => {
        const { color, startPrice, spreadPrice, startTime, endTime, show } = marker;
        if (!this.chart) {
          return;
        }
        if (!this.chart.stxx) {
          return;
        }

        if (!show || !color || !startPrice || !spreadPrice || !startTime || !endTime) return;
        const { panel } = this.chart.stxx.chart;
        const y0 = this.chart.stxx.pixelFromPrice(startPrice * 1000, panel);
        const y1 = this.chart.stxx.pixelFromPrice(spreadPrice * 1000, panel);
        const x0 = this.chart.stxx.pixelFromDate(new Date(startTime), this.chart.stxx.chart);
        // -500ms hack画线老是晚了500ms
        const x1 = this.chart.stxx.pixelFromDate(new Date(endTime - 500), this.chart.stxx.chart);

        // 开始时间到结束时间的水平线段
        const parametersX = {
          x0: x0,
          x1: x1,
          y0: y1,
          y1: y1,
          color,
          type: 'segment',
          opacity: 0.5,
        };

        // 结束时间垂直线
        const parametersY = {
          x0: x1,
          x1: x1,
          y0: 0,
          y1: 1,
          color,
          type: 'line',
          opacity: 0.5,
        };

        // 开始价格到spread价格的垂直线
        const parametersY2 = {
          x0: x0,
          x1: x0,
          y0: y0,
          y1: y1,
          color,
          type: 'segment',
          pattern: 'dashed',
          opacity: 0.5,
        };

        try {
          this.chart.stxx.startClip();
          this.chart.stxx.plotLine(parametersY);
          this.chart.stxx.plotLine(parametersX);
          this.chart.stxx.plotLine(parametersY2);
          this.chart.stxx.endClip();
        } catch (error) {
          console.error(error);
        }
      });
    });

    if (!options.length) {
      CIQ.ChartEngine.prototype.removeInjection(mark);
    }
  }

  // 点差玩法点差线
  drawSpreadLine(spread: number) {
    if (this.clearDrawSpread.length) {
      this.clearDrawSpread.forEach((clear) => clear());
    }
    const draw = CIQ.ChartEngine.prototype.append('drawCurrentHR', () => {
      if (spread <= 0 || !this.chart || !this.chart.stxx) return;

      const current = this.chart.stxx.currentQuote() as {
        DT: Date;
        Open: number;
        Close: number;
        High: number;
        Low: number;
      };
      if (!current) return;
      const close = current.Close / 1000;
      const { panel } = this.chart.stxx.chart;
      const x1 = this.chart.stxx.pixelFromDate(current.DT, this.chart.stxx.chart);

      const yMax = this.chart.stxx.pixelFromPrice(this.chart.stxx.chart.yAxis.high, panel); // 0
      const yMin = this.chart.stxx.pixelFromPrice(this.chart.stxx.chart.yAxis.low, panel); // 289
      const yUp = this.chart.stxx.pixelFromPrice((close + spread) * 1000, panel);
      const yDown = this.chart.stxx.pixelFromPrice((close - spread) * 1000, panel);
      const yUpReal = Math.max(yUp, yMax);
      const yDownReal = Math.min(yDown, yMin);

      // 绘制矩形区域
      const canvasWidth = this.chart.stxx.chart.width;
      const rectParam = {
        x: 0,
        y: yUpReal,
        width: canvasWidth,
        height: yDownReal - yUpReal,
        fillColor: 'rgba(100, 100, 100, 0.15)',
      };
      const upParam = {
        x0: 0,
        x1: x1,
        y0: yUpReal,
        y1: yUpReal,
        color: 'rgba(46, 204, 113, 0.5)',
        type: 'line',
        // pattern: 'dashed',
      };
      const downParam = {
        x0: 0,
        x1: x1,
        y0: yDownReal,
        y1: yDownReal,
        color: 'rgba(255, 84, 73, 0.5)',
        type: 'line',
        // pattern: 'dashed',
      };
      try {
        this.chart.stxx.startClip();
        // 绘制矩形（只填充，不描边）
        const ctx = this.chart.stxx.chart.context;
        ctx.save();
        ctx.beginPath();
        ctx.rect(rectParam.x, rectParam.y, rectParam.width, rectParam.height);
        ctx.fillStyle = rectParam.fillColor;
        ctx.fill();
        ctx.restore();
        // 绘制上下两条水平线
        this.chart.stxx.plotLine(upParam);
        this.chart.stxx.plotLine(downParam);
        this.chart.stxx.endClip();
      } catch (error) {
        console.error(error);
      }
    });

    this.clearDrawSpread.push(() => CIQ.ChartEngine.prototype.removeInjection(draw));
  }
}

export default ActiveChart;

abstract class Base {
  options: ChartOptions;

  stxx: CIQ.ChartEngine;

  feed: Partial<ChartFeed>;

  clearFunctions: Function[];

  constructor(options: ChartOptions) {
    this.clearFunctions = [];
    this.options = options;
    this.feed = {
      fetchInitialData: formatQuoteFeedReturn(options.fetchInitial),
      fetchPaginationData: formatQuoteFeedReturn(options.fetchPagination),
    };
    this.stxx = this.create();
    this.init();
  }

  /** 创建图表引擎 */
  abstract create(): CIQ.ChartEngine;

  private init() {
    const { onLoadingChange, symbol, theme } = this.options;

    // 设置图表动画
    new CIQ.Animation({
      stx: this.stxx,
      animationParameters: { tension: 0.3 },
      easeMachine: new CIQ.EaseMachine('easeInOutQuad', 500),
    });

    // 处理loading
    onLoadingChange && onLoadingChange(true);
    this.stxx.loadChart(symbol!, undefined, () => {
      onLoadingChange && onLoadingChange(false);
    });

    this.setTheme(theme);
    this.bindDrawResetLine();
    this.fixDrawCurrentPriceLine();
  }

  fixDrawCurrentPriceLine() {
    CIQ.ChartEngine.prototype.drawCurrentPriceLine = function () {
      // if (!(this.preferences.currentPriceLine === true && this.isHome())) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { currentHRParams } = this as any;
      if (currentHRParams) {
        for (const chartName in currentHRParams) {
          const { panel, y, backgroundColor } = currentHRParams[chartName];
          this.plotLine({
            x0: panel.left,
            x1: panel.right,
            y0: y,
            y1: y,
            color: backgroundColor,
            type: 'line',
            pattern: 'dashed',
            lineWidth: 1,
            opacity: 0.8,
            context: panel.chart.context,
          });
        }
      }
    };
  }

  bindDrawResetLine() {
    const clear = CIQ.ChartEngine.prototype.append('draw', () => {
      if (this.options.symbol !== 'STONKS/USD') return;

      const zeroTimes = this.stxx.chart.dataSegment.filter((item) => item);
      const day = 86400000;
      const start = new Date(zeroTimes[0].DT).setUTCHours(0, 0, 0, 0);
      const end = new Date(zeroTimes[zeroTimes.length - 1].DT).setUTCHours(0, 0, 0, 0);

      for (let time = start; time <= end; ) {
        const x = this.stxx.pixelFromDate(new Date(time), this.stxx.chart);
        this.stxx.plotLine({
          x0: x,
          x1: x,
          y0: 0,
          y1: 1,
          color: '#ffe500',
          type: 'line',
          confineToPanel: true,
          pattern: 'dashed',
        });

        this.stxx.createXAxisLabel({
          // @ts-expect-error 这个库的类型定义不对
          panel: this.stxx.panels.chart,
          txt: 'Reset',
          color: '#111',
          backgroundColor: '#ffe500',
          pointed: false,
          padding: 4,
          x,
        });

        time += day;
      }
    });

    this.clearFunctions.push(() => CIQ.ChartEngine.prototype.removeInjection(clear));
  }

  destroy() {
    if (!this.stxx) return;

    this.clearFunctions.forEach((clear) => clear());
    this.stxx.clear();
    this.stxx.detachQuoteFeed(this.feed);
    this.stxx.destroy();
    this.options.container.innerHTML = '';
  }

  private setTheme(theme: ChartOptions['theme']) {
    if (this.options.mode !== ChartMode.advanced) return;
    const context = this.options.container.querySelector('cq-context')!;

    if (theme === 'lighten') {
      context.classList.remove('ciq-night');
      context.classList.add('ciq-day');
    } else {
      context.classList.remove('ciq-day');
      context.classList.add('ciq-night');
    }

    this.stxx.draw();
  }

  get context() {
    if (this.options.mode !== ChartMode.advanced) return;
    return this.options.container.querySelector('cq-context')!;
  }

  render(options: Partial<ChartOptions>) {
    if (options.theme && options.theme !== this.options.theme) {
      this.setTheme(options.theme);
    }

    // 更新请求数据的接口
    if (options.fetchInitial && options.fetchInitial !== this.options.fetchInitial) {
      this.feed.fetchInitialData = formatQuoteFeedReturn(options.fetchInitial);
    }
    // 更新分页数据接口
    if (options.fetchPagination && options.fetchInitial !== this.options.fetchPagination) {
      this.feed.fetchPaginationData = formatQuoteFeedReturn(options.fetchPagination);
    }

    Object.assign(this.options, options);
  }
}

interface ConfigOptions {
  periodicity: keyof typeof PeriodicityMap;
}

function getConfig(options: ConfigOptions) {
  const { periodicity } = options;
  const { interval, period, timeUnit } = PeriodicityMap[periodicity].value;
  return {
    streamParameters: {
      maxWait: 0,
      maxTicks: 100,
    },
    layout: {
      chartType: periodicity === '500ms' ? 'mountain' : 'candle',
      crosshair: CIQ.isMobile ? false : true,
      candleWidth: 10,
      interval: `${interval}`,
      periodicity: period,
      timeUnit: timeUnit,
    },
    // 蜡烛图最小宽度
    minimumCandleWidth: 5,
    maximumCandleWidth: 20,
    yaxisLabelStyle: 'roundRectArrow',
    // x轴高度, 37会显示两行
    xaxisHeight: 18,
    preferences: {
      currentPriceLine: true,
      whitespace: CIQ.isMobile ? 0 : 40, // 最后一个点距离y轴的距离
    },
    chart: {
      yAxis: {
        justifyRight: true,
        displayGridLines: false,
        displayBorder: false,
        // 最高点距离画布上面的距离
        initialMarginTop: 12,
        // 最低点距离画布下面的距离
        initialMarginBottom: 12,
        goldenRatioYAxis: false,
        priceFormatter: (_: CIQ.ChartEngine, __: CIQ.ChartEngine.Panel, price: number) => {
          const value = price / 1000;
          const precision = Math.max(calcPricePrecision(value), 2);
          return value.toLocaleString('en-US', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          });
        },
      },
      xAxis: {
        displayGridLines: false,
        displayBorder: false,
        fitLeftToRight: true,
      },
    },
  };
}

class SimpleChart extends Base {
  create() {
    const { periodicity = '500ms' } = this.options;
    const stxx = new CIQ.ChartEngine({
      ...getConfig({ periodicity }),
      quoteFeed: this.feed,
      container: this.options.container,
    });

    stxx.attachQuoteFeed(this.feed, { refreshInterval: 0 });
    return stxx;
  }
}

class AdvancedChart extends Base {
  create() {
    this.options.container.innerHTML = getTemplate();

    const { periodicity = '500ms' } = this.options;
    const config = defaultConfig();

    config.initialSymbol = null;
    config.enabledAddOns.fullScreen = window === window.parent;
    config.enabledAddOns.animation = true;
    config.enabledAddOns.extendedHours = false;
    // iframe中禁用缓存, 不然隐身模式下会不允许第三方cookie会报错
    config.restore = false;

    const context = new CIQ.UI.Chart().createChartAndUI({
      config,
      container: this.options.container.querySelector('cq-context') as HTMLElement,
    });

    context.stx.attachQuoteFeed(this.feed, { refreshInterval: 0 });
    merge(context.stx, getConfig({ periodicity }));

    return context.stx;
  }
}

// rollbit精度计算公式
function calcPricePrecision(price: number) {
  const t = Math.abs(price);
  // prettier-ignore
  return t === 0 ? 2 : t >= 1e5 ? 0 : t >= 1e4 ? 1 : t >= 1e3 ? 2 : t >= 100 ? 3 : t >= 10 ? 4 : t >= 1 ? 5 : t >= .1 ? 6 : t >= .01 ? 7 : t >= .001 ? 8 : 9
}
