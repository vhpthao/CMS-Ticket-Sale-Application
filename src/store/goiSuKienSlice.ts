import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const fieldToOrderBy = 'STT';

type TableDataItemGoiSuKien = {
  key: string;
  STT: string;
  bookingCode: string;
  soVe: string;
  tenSK: string;
  tinhTrangSD: string;
  ngaySD: string;
  ngayXuatVe: string;
  congCheckin: string;
};

export type State = TableDataItemGoiSuKien[];

const goiSuKienSlice = createSlice({
  name: 'goiSuKien',
  initialState: [] as State,
  reducers: {
    setData: (state, action: PayloadAction<State>) => {
      return action.payload;
    },
  },
});

export const { setData } = goiSuKienSlice.actions;

export const fetchGoiSuKienDataFromFirebase = () => {
  return async (dispatch: Dispatch<any>, getState: () => any) => {
    try {
      const stt = query(collection(db, 'goisukien'), orderBy(fieldToOrderBy, 'asc'));
      const querySnapshot = await getDocs(stt);

      const data: State = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        STT: doc.data().STT,
        bookingCode: doc.data().bookingCode,
        soVe: doc.data().soVe,
        tenSK: doc.data().tenSK,
        tinhTrangSD: doc.data().tinhTrangSD,
        ngaySD: doc.data().ngaySD,
        ngayXuatVe: doc.data().ngayXuatVe,
        congCheckin: doc.data().congCheckin,
      }));

      console.log(data);

      const existingData = getState().goiSuKien;

      const newData = data.filter((item) => !existingData.some((existingItem: TableDataItemGoiSuKien) => existingItem.key === item.key));

      dispatch(setData([...existingData, ...newData]));
    } catch (error) {
      console.log('Error fetching data from Firebase:', error);
    }
  };
};

export default goiSuKienSlice.reducer;
