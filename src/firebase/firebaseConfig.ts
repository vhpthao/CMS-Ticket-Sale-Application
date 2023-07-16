import { initializeApp } from "firebase/app";
import { getFirestore} from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyASEI5jjGyoDNclw3nwms8U8R7PKFr4sDM",
  authDomain: "fir-13bdc.firebaseapp.com",
  projectId: "fir-13bdc",
  storageBucket: "fir-13bdc.appspot.com",
  messagingSenderId: "4245302195",
  appId: "1:4245302195:web:e5a487360dbf37288bb9c6",
  measurementId: "G-6W8ECK8XYM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
