import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { collection, getDocs, orderBy, query, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const fieldToOrderBy = 'STT';

type TableDataItemGoiDichVu = {
  key: string;
  STT: string;
  maGoi: string;
  tenGoi: string;
  ngayApDung: string;
  tgApDung: string;
  ngayHetHan: string;
  tgHetHan: string;
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
    addGoiDichVu: (state, action: PayloadAction<TableDataItemGoiDichVu>) => {
      state.push(action.payload);
    },
    updateGoiDichVu: (state, action: PayloadAction<TableDataItemGoiDichVu>) => {
      const { key } = action.payload;
      const index = state.findIndex((item) => item.key === key);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { setData, addGoiDichVu, updateGoiDichVu } = goiDichVuSlice.actions;

export const fetchDataFromFirebase = () => {
  return async (dispatch: Dispatch<any>, getState: () => any) => {
    try {
      const stt = query(collection(db, 'goidichvu'), orderBy(fieldToOrderBy, 'asc'));
      const querySnapshot = await getDocs(stt);

      const data: State = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        STT: doc.data().STT,
        maGoi: doc.data().maGoi,
        tenGoi: doc.data().tenGoi,
        ngayApDung: doc.data().ngayApDung,
        tgApDung: doc.data().tgApDung,
        ngayHetHan: doc.data().ngayHetHan,
        tgHetHan: doc.data().tgHetHan,
        giaVe: doc.data().giaVe,
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

export const addGoiDichVuToFirebase = (goiDichVu: TableDataItemGoiDichVu) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      const docRef = await addDoc(collection(db, 'goidichvu'), {
        STT: goiDichVu.STT,
        maGoi: goiDichVu.maGoi,
        tenGoi: goiDichVu.tenGoi,
        ngayApDung: goiDichVu.ngayApDung,
        tgApDung: goiDichVu.tgApDung,
        ngayHetHan: goiDichVu.ngayHetHan,
        tgHetHan: goiDichVu.tgHetHan,
        giaVe: goiDichVu.giaVe,
        giaCombo: goiDichVu.giaCombo,
        tinhTrang: goiDichVu.tinhTrang,
      });

      dispatch(addGoiDichVu({ ...goiDichVu, key: docRef.id }));
    } catch (error) {
      console.log('Error adding goiDichVu to Firebase:', error);
    }
  };
};

export const updateGoiDichVuInFirebase = (goiDichVu: TableDataItemGoiDichVu) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      const goiDichVuRef = doc(db, 'goidichvu', goiDichVu.key);
      await updateDoc(goiDichVuRef, {
        STT: goiDichVu.STT,
        maGoi: goiDichVu.maGoi,
        tenGoi: goiDichVu.tenGoi,
        ngayApDung: goiDichVu.ngayApDung,
        tgApDung: goiDichVu.tgApDung,
        ngayHetHan: goiDichVu.ngayHetHan,
        tgHetHan: goiDichVu.tgHetHan,
        giaVe: goiDichVu.giaVe,
        giaCombo: goiDichVu.giaCombo,
        tinhTrang: goiDichVu.tinhTrang,
      });

      // Sau khi cập nhật thành công, dispatch action để cập nhật state trong Redux
      dispatch(updateGoiDichVu(goiDichVu));
    } catch (error) {
      console.log('Error updating goiDichVu in Firebase:', error);
    }
  };
};

export default goiDichVuSlice.reducer;
