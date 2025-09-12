import { useSelector } from 'react-redux';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationType } from './type';

const initialState: NotificationState = {
  userId: '',
  marquee: {
    closedId: 0, // 当前关闭的通知栏id
  },
  announce: {
    readIds: [],
  },
  inbox: {
    readIds: [],
  },
  system: {
    readIds: [],
  },
};

const slice = createSlice({
  name: 'notificationStore',
  initialState,
  reducers: {
    setMarqueeClosedId(state, action: PayloadAction<number>) {
      state.marquee.closedId = action.payload;
    },
    setUserId(state, action: PayloadAction<string>) {
      if (state.userId !== action.payload) {
        state.marquee.closedId = 0;
        state.announce.readIds = [];
        state.inbox.readIds = [];
        state.system.readIds = [];
        state.userId = action.payload;
      }
    },
    markAsRead(state, action: PayloadAction<[NotificationType, number]>) {
      const [type, id] = action.payload;

      if (type === NotificationType.Announcements) {
        if (!state.announce.readIds?.includes(id)) {
          state.announce.readIds.push(id);
        }
      } else if (type === NotificationType.InboxMessage) {
        if (!state.inbox.readIds?.includes(id)) {
          state.inbox.readIds.push(id);
        }
      } else if (type === NotificationType.System) {
        if (!state.system.readIds?.includes(id)) {
          state.system.readIds.push(id);
        }
      }
    },
    markMultipleAsRead(state, action: PayloadAction<[NotificationType, number[]]>) {
      const [type, ids] = action.payload;

      if (type === NotificationType.Announcements) {
        ids.forEach((id) => {
          if (!state.announce.readIds.includes(id)) {
            state.announce.readIds.push(id);
          }
        });
      } else if (type === NotificationType.InboxMessage) {
        ids.forEach((id) => {
          if (!state.inbox.readIds.includes(id)) {
            state.inbox.readIds.push(id);
          }
        });
      } else if (type === NotificationType.System) {
        ids.forEach((id) => {
          if (!state.system.readIds.includes(id)) {
            state.system.readIds.push(id);
          }
        });
      }
    },
  },
});

export default slice.reducer;

export const { setMarqueeClosedId, markAsRead, markMultipleAsRead, setUserId } = slice.actions;

/** 获取每个类型的已读ID集合（转换为Set以便使用） */
const readIdsSelector = createSelector(
  [
    (state: StoreState) => state.notification.announce.readIds,
    (state: StoreState) => state.notification.inbox.readIds,
    (state: StoreState) => state.notification.system.readIds,
  ],
  (announceReadIds, inboxReadIds, systemReadIds) => {
    return [new Set(announceReadIds), new Set(inboxReadIds), new Set(systemReadIds)];
  }
);
export const useReadIds = () => useSelector(readIdsSelector);

interface NotificationState {
  userId: string;
  marquee: {
    closedId: number;
  };
  announce: {
    readIds: number[];
  };
  inbox: {
    readIds: number[];
  };
  system: {
    readIds: number[];
  };
}
