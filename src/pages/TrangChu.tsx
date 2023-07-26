import React, { useEffect, useState } from 'react';
import {Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { fetchDataFromFirebase, State as GoiDichVuState } from '../store/goiDichVuSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { DatePicker} from 'antd';

import { Dayjs } from 'dayjs';

function TrangChu() {
  const [areaChartData, setAreaChartData] = useState<any[]>([]); 
  
  const [pieGoiGiaDinhData, setPieGoiGiaDinhData] = useState<any[]>([]);

  const [pieGoiSuKienData, setPieGoiSuKienData] = useState<any[]>([]);

  const COLORS = ['#0088FE', '#FFA05F', '#FFBB28', '#FF8042'];

  interface RootState {
    goiDichVu: GoiDichVuState;
  }

  const dispatch = useDispatch<Dispatch<any>>();
  const goiDichVu = useSelector((state: RootState) => state.goiDichVu);
  console.log(goiDichVu);
  useEffect(() => {
    dispatch(fetchDataFromFirebase());
  }, [dispatch]);

   const [totalRevenue, setTotalRevenue] = useState<number>(0);

   useEffect(() => {
    const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

    interface RevenueByDay {
      [key: string]: number;
    }

    const revenueByDay: RevenueByDay = goiDichVu.reduce((result, item) => {
      const revenue = parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0;


      const dateParts = item.ngayApDung.split('/');
      const date = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

      const dayOfWeek = days[date.getDay()];
      result[dayOfWeek] = (result[dayOfWeek] || 0) + revenue;

      return result;
    }, {} as RevenueByDay);


    const lineData = days.map((day) => ({
      name: day,
      doanhthu: revenueByDay[day] || 0,
    }));
    setAreaChartData(lineData);
    const dailyTotalRevenue = days.map((day) => revenueByDay[day] || 0).reduce((sum, value) => sum + value, 0);

    setTotalRevenue(dailyTotalRevenue);

    const totalRevenue = goiDichVu.reduce((total, item) => total + (parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0), 0);
    const giaDinhData = [
      { name: 'Đang áp dụng', value: (goiDichVu.reduce((total, item) => (item.tinhTrang === 'Đang áp dụng' && parseFloat(item.giaVe)) ? total + parseFloat(item.giaVe) : total, 0) / totalRevenue) * 100 },
      { name: 'Tắt', value: (goiDichVu.reduce((total, item) => (item.tinhTrang === 'Tắt' && parseFloat(item.giaVe)) ? total + parseFloat(item.giaVe) : total, 0) / totalRevenue) * 100 },
    ];
    setPieGoiGiaDinhData(giaDinhData);

    const suKienData = [
      { name: 'Đang áp dụng', value: (goiDichVu.reduce((total, item) => (item.tinhTrang === 'Đang áp dụng' && parseFloat(item.giaCombo)) ? total + parseFloat(item.giaCombo) : total, 0) / totalRevenue) * 100 },
      { name: 'Tắt', value: (goiDichVu.reduce((total, item) => (item.tinhTrang === 'Tắt' && parseFloat(item.giaCombo)) ? total + parseFloat(item.giaCombo) : total, 0) / totalRevenue) * 100 },
    ];
    setPieGoiSuKienData(suKienData);
  }, [goiDichVu]);

  const onChange = (date: Dayjs | null, dateString: string) => {
    console.log(date, dateString);
  };

  const showLegend = false;


  return (
    <div style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', width: '1180px', height: '585px' }}>
    <h1 style={{ marginBottom: 0 }}>Thống kê</h1>
    <h5 style={{ float: 'left', marginBottom:'0px' }}>Doanh thu</h5>
    <h5 style={{ float: 'right', marginRight: '30px', marginBottom:'30px' }}>
        <DatePicker onChange={onChange} picker="month" format="MM/YYYY" />
      </h5>

    <AreaChart width={1150} height={200} data={areaChartData}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(250, 160, 95, 0.26)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
        {showLegend && <Legend />} 
        <Area type="monotone" dataKey="doanhthu" stroke="#FFA05F" fill="url(#areaGradient)" strokeWidth={3} /> 
        <Line type="monotone" dataKey="doanhthu" stroke="#FFA05F" strokeWidth={3} /> 
      </AreaChart>

    <h3 style={{marginTop:'80px', marginBottom:'0px'}}>Doanh thu: {totalRevenue} VNĐ</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width:'35%' }}>
          <h3 style={{ marginBottom: '5px', marginTop:'0px' }}>Gói gia đình</h3>
          <PieChart width={400} height={200} >
            <Pie      
            data={pieGoiGiaDinhData}
            cx={200}
            cy={100}
            innerRadius={30}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={(entry) => ` ${entry.value.toFixed(2)}%`}
          >
            {pieGoiGiaDinhData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
</div>
<div style={{ width:'40%' }}>
          <h3 style={{ marginBottom: '0px', marginTop:'0px'  }}>Gói sự kiện</h3>
          <PieChart width={400} height={200}  style={{marginTop:'0px'}}>
            <Pie
            data={pieGoiSuKienData}
            cx={200}
            cy={100}
            innerRadius={30}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={(entry) => `${entry.value.toFixed(2)}%`}
          >
            {pieGoiSuKienData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
</div>
<div style={{width:'20%', marginTop:'30px'}}>
            <div style={{display:'flex'}}>
            <div className="dangSD"></div>
            <p style={{marginTop:'5px'}}>Vé đang sử dụng</p>
          </div>
          <br />
          <div style={{display:'flex'}}>
            <div className="tat"></div>
            <p style={{marginTop:'5px'}}>Vé chưa sử dụng</p>
          </div>
          </div>

    </div>
    </div>
  );
}

export default TrangChu;
