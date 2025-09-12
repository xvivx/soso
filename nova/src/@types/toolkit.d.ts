import { EqualityFn } from 'react-redux';
import { AsyncThunk, AsyncThunkOptions, AsyncThunkPayloadCreator } from '@reduxjs/toolkit/dist/createAsyncThunk';
import type { Dispatch } from 'redux';

declare module '@reduxjs/toolkit' {
  type AsyncThunkConfig = {
    state?: unknown;
    dispatch?: Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
  };

  export declare function createAsyncThunk<
    Returned,
    ThunkArg = void,
    ThunkApiConfig extends AsyncThunkConfig = { state: RootState },
  >(
    typePrefix: string,
    payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>,
    options?: AsyncThunkOptions<ThunkArg, ThunkApiConfig>
  ): AsyncThunk<Returned, ThunkArg, ThunkApiConfig>;
}

declare module 'react-redux' {
  export declare const useSelector: <TState = StoreState, Selected = unknown>(
    selector: (state: TState) => Selected,
    equalityFn?: EqualityFn<Selected> | undefined
  ) => Selected;
}
