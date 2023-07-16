import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const fieldToOrderBy = 'STT';

type TableDataItemQuanLyVe = {
  key: string;
  STT: string;
  bookingCode: string;
  soVe: string;
  tenSK: string;
  tinhtrangSD: string;
  ngaySD: string;
  ngayXuatVe: string;
  congCheckin: string;
};

export type State = TableDataItemQuanLyVe[];

const quanLyVeSlice = createSlice({
  name: 'quanLyVe',
  initialState: [] as State,
  reducers: {
    setData: (state, action: PayloadAction<State>) => {
      return action.payload;
    },
  },
});

export const { setData } = quanLyVeSlice.actions;

export const fetchDataFromFirebase = () => {
  return async (dispatch: Dispatch<any>, getState: () => any) => {
    try {
      const stt = query(collection(db, 'quanlyve'), orderBy(fieldToOrderBy, 'asc'));
      const querySnapshot = await getDocs(stt);

      const data: State = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        STT: doc.data().STT,
        bookingCode: doc.data().bookingCode,
        soVe: doc.data().soVe,
        tenSK: doc.data().tenSK,
        tinhtrangSD: doc.data().tinhtrangSD,
        ngaySD: doc.data().ngaySD,
        ngayXuatVe: doc.data().ngayXuatVe,
        congCheckin: doc.data().congCheckin,
      }));

      console.log(data); 

      const existingData = getState().quanLyVe;

      const newData = data.filter((item) => !existingData.some((existingItem: TableDataItemQuanLyVe) => existingItem.key === item.key));

      dispatch(setData([...existingData, ...newData]));
    } catch (error) {
      console.log('Error fetching data from Firebase:', error);
    }
  };
};

export default quanLyVeSlice.reducer;
