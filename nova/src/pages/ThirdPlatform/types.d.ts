type AppPostRenderOptions = Omit<ChartOptions, 'container' | 'fetchInitial' | 'fetchPagination' | 'onLoadingChange'>;
type AppPostRenderEvent = { type: 'render'; payload: AppPostRenderOptions };
type AppPostPaginationEvent = { type: 'pagination'; payload: ChartIqKlineItem[] };
type AppPostInitialEvent = { type: 'initial'; payload: ChartIqKlineItem[] };
type AppPostDrawEvent = { type: 'draw'; payload: ChartIqKlineItem[] };
type AppPostAddMarkerEvent = { type: 'addMarker'; payload: MarkerOptions[] };
type AppPostRemoveMarkerDrawEvent = { type: 'removeMarker'; payload: string[] };
type AppPostPositionOrderEvent = { type: 'positionOrder'; payload: PositionMarker[] };
type AppPostPositionSpacingEvent = { type: 'positionSpacing'; payload: PositionSpacing[] };
type AppPostDrawSpreadLineEvent = { type: 'drawSpreadLine'; payload: number };
type AppPostDrawSpreadOrderLineEvent = { type: 'drawSpreadOrderLine'; payload: SpreadOrderLine[] };
type AppPostSetThemeEvent = {
  type: 'set-theme';
  payload: {
    klineBorderColor?: string;
    klineBottomColor?: string;
    klineTopColor?: string;
    klineWidth?: string;
    theme?: 'lighten' | 'darken';
  };
};

// app向iframe发送的事件
export type AppPostEvent =
  | AppPostRenderEvent
  | AppPostPaginationEvent
  | AppPostInitialEvent
  | AppPostDrawEvent
  | AppPostAddMarkerEvent
  | AppPostRemoveMarkerDrawEvent
  | AppPostPositionOrderEvent
  | AppPostPositionSpacingEvent
  | AppPostDrawSpreadLineEvent
  | AppPostDrawSpreadOrderLineEvent
  | AppPostSetThemeEvent;

type IframePostInitialEvent = {
  type: 'initial';
  payload: {
    symbol: string;
    start: number;
    end: number;
    params: {
      timeunit: string;
      interval: number;
    };
  };
};
type IframePostReadyEvent = { type: 'ready-to-create' };
type IframePostPaginationEvent = {
  type: 'pagination';
  payload: {
    symbol: string;
    start: number;
    end: number;
    params: {
      timeunit: string;
      interval: number;
    };
  };
};
type IframePostLoadingChangeEvent = { type: 'loading-change'; payload: boolean };
// iframe中向父级抛出的事件
export type IframePostEvent =
  | IframePostInitialEvent
  | IframePostReadyEvent
  | IframePostPaginationEvent
  | IframePostLoadingChangeEvent;

type AppReceiveInitialEvent = IframePostInitialEvent;
type AppReceivePaginationEvent = IframePostPaginationEvent;
type AppReceiveReadyEvent = IframePostReadyEvent;
type AppReceiveLoadingChangeEvent = IframePostLoadingChangeEvent;
// app中接收到的事件
export type AppReceiveEvent =
  | AppReceiveInitialEvent
  | AppReceivePaginationEvent
  | AppReceiveReadyEvent
  | AppReceiveLoadingChangeEvent;
