import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const fieldToOrderBy = 'STT';

type TableDataItemGoiGiaDinh = {
  key: string;
  STT: string;
  bookingCode: string;
  soVe: string;
  tinhTrangSD: string;
  ngaySD: string;
  ngayXuatVe: string;
  congCheckin: string;
};

export type State = TableDataItemGoiGiaDinh[];

const goiGiaDinhSlice = createSlice({
  name: 'goiGiaDinh',
  initialState: [] as State,
  reducers: {
    setData: (state, action: PayloadAction<State>) => {
      return action.payload;
    },
  },
});

export const { setData } = goiGiaDinhSlice.actions;

export const fetchGoiGiaDinhDataFromFirebase = () => {
  return async (dispatch: Dispatch<any>, getState: () => any) => {
    try {

      const stt = query(collection(db, 'goigiadinh'), orderBy(fieldToOrderBy, 'asc'));
      const querySnapshot = await getDocs(stt);

      const data: State = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        STT: doc.data().STT,
        bookingCode: doc.data().bookingCode,
        soVe: doc.data().soVe,
        tinhTrangSD: doc.data().tinhTrangSD,
        ngaySD: doc.data().ngaySD,
        ngayXuatVe: doc.data().ngayXuatVe,
        congCheckin: doc.data().congCheckin,
      }));

      console.log(data);

      const existingData = getState().goiGiaDinh;

      const newData = data.filter((item) => !existingData.some((existingItem: TableDataItemGoiGiaDinh) => existingItem.key === item.key));

      dispatch(setData([...existingData, ...newData]));
    } catch (error) {
      console.log('Error fetching data from Firebase:', error);
    }
  };
};

export default goiGiaDinhSlice.reducer;
