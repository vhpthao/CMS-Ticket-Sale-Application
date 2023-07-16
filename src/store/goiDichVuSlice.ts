import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

type TableDataItemGoiDichVu = {
  key: string;
  STT: string;
  maGoi: string;
  tenGoi: string;
  ngayApDung: string;
  ngayHetHan: string;
  giaVe: string;
  giaCombo: string;
  tinhTrang: string;
};

export type State = TableDataItemGoiDichVu[];

const goiDichVuSlice = createSlice({
  name: 'goiDichVu',
  initialState: [] as State,
  reducers: {
    setData: (state, action: PayloadAction<State>) => {
      return action.payload;
    },
  },
});


export const { setData } = goiDichVuSlice.actions;

export const fetchDataFromFirebase = () => {
  return async (dispatch: Dispatch<any>, getState: () => any) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'goidichvu'));

      const data: State = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        STT: doc.data().STT,
        maGoi: doc.data().maGoi,
        tenGoi: doc.data().ngaySD,
        ngayApDung: doc.data().tenLoaiVe,
        ngayHetHan: doc.data().congCheckin,
        giaVe: doc.data().trangThai,  
        giaCombo: doc.data().giaCombo,
        tinhTrang: doc.data().tinhTrang,
      }));

      console.log(data);

      const existingData = getState().goiDichVu;

      const newData = data.filter((item) => !existingData.some((existingItem: TableDataItemGoiDichVu) => existingItem.key === item.key));

      dispatch(setData([...existingData, ...newData]));
    } catch (error) {
      console.log('Error fetching data from Firebase:', error);
    }
  };
};

export default goiDichVuSlice.reducer;
