import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GameType = 'HIGH_LOW' | 'SPREAD' | 'FUTURES' | 'UP_DOWN' | 'TAP_TRADING';

interface GuideState {
  completedGames: Record<GameType, boolean>;
}

const initialState: GuideState = {
  completedGames: {
    HIGH_LOW: false,
    SPREAD: false,
    FUTURES: false,
    UP_DOWN: false,
    TAP_TRADING: false,
  },
};

const guideSlice = createSlice({
  name: 'guide',
  initialState,
  reducers: {
    markGameCompleted: (state, action: PayloadAction<GameType>) => {
      state.completedGames[action.payload] = true;
    },
    resetGameGuide: (state, action: PayloadAction<GameType>) => {
      state.completedGames[action.payload] = false;
    },
    resetAllGuides: (state) => {
      state.completedGames = initialState.completedGames;
    },
  },
});

export const { markGameCompleted, resetGameGuide, resetAllGuides } = guideSlice.actions;
export default guideSlice.reducer;
