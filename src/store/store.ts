import { configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import doiSoatVeReducer from './doiSoatVeSlice';
import goiDichVuReducer from './goiDichVuSlice';
import giaDinhReducer from './goiGiaDinhSlice'
import suKienReducer from './goiSuKienSlice'


const store = configureStore({
  reducer: {
    goiGiaDinh: giaDinhReducer,
    goiSuKien: suKienReducer,
    doiSoatVe: doiSoatVeReducer,
    goiDichVu: goiDichVuReducer,

  },

  middleware: [thunkMiddleware],
});

export default store;

