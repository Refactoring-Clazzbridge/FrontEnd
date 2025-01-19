import {configureStore} from '@reduxjs/toolkit';
import socketReducer from './socketSlice';

export const store = configureStore({
  reducer: {
    socket: socketReducer,
  },
});

export default store;