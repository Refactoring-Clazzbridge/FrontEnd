import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    socket: null,
    isConnected: false,
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
  },
});

export const { setSocket, setConnected } = socketSlice.actions;

export default socketSlice.reducer;