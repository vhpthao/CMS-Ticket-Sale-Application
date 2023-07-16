import React from 'react';
import './App.css';
import {Routes, Route} from 'react-router-dom'
import DoiSoatVe from './pages/DoiSoatVe';
import GoiDichVu from './pages/GoiDichVu';
import TrangChu from './pages/TrangChu';
import QuanLyVe from './pages/QuanLyVe';


function App() {
  return (
    <div className="App">
       <Routes>
       <Route path="/trangchu" element={<TrangChu/>}/>
        <Route path="/quanlyve" element={<QuanLyVe/>}/>
        <Route path="/doisoatve" element={<DoiSoatVe/>}/>
        <Route path="/goidichvu" element={<GoiDichVu/>}/>
      </Routes>
    </div>
  );
}

export default App;
