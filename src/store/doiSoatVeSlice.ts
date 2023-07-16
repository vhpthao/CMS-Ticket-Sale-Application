import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const fieldToOrderBy = 'STT';

type TableDataItemDoiSoatVe = {
  key: string;
  STT: string;
  soVe: string;
  tenSK: string;
  ngaySD: string;
  tenLoaiVe: string;
  congCheckin: string;
  trangThai: string;
};

export type State = TableDataItemDoiSoatVe[];

const doiSoatVeSlice = createSlice({
  name: 'doiSoatVe',
  initialState: [] as State,
  reducers: {
    setData: (state, action: PayloadAction<State>) => {
      return action.payload;
    },
  },
});

export const { setData } = doiSoatVeSlice.actions;

export const fetchDataFromFirebase = () => {
  return async (dispatch: Dispatch<any>, getState: () => any) => {
    try {
       const stt = query(collection(db, 'doisoatve'), orderBy(fieldToOrderBy, 'asc'));
       const querySnapshot = await getDocs(stt);

      const data: State = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        STT: doc.data().STT,
        soVe: doc.data().soVe,
        tenSK: doc.data().tenSK,
        ngaySD: doc.data().ngaySD,
        tenLoaiVe: doc.data().tenLoaiVe,
        congCheckin: doc.data().congCheckin,
        trangThai: doc.data().trangThai,   
      }));

      console.log(data);
      const existingData = getState().doiSoatVe;

      const newData = data.filter((item) => !existingData.some((existingItem: TableDataItemDoiSoatVe) => existingItem.key === item.key));

      dispatch(setData([...existingData, ...newData]));
    } catch (error) {
      console.log('Error fetching data from Firebase:', error);
    }
  };
};

export default doiSoatVeSlice.reducer;
