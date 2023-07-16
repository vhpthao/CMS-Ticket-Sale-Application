import { configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import quanLyVeReducer from './quanLyVeSlice';
import doiSoatVeReducer from './doiSoatVeSlice'

const store = configureStore({
  reducer: {
    quanLyVe: quanLyVeReducer, 
    doiSoatVe: doiSoatVeReducer,

  },
  middleware: [thunkMiddleware],
});

export default store;
