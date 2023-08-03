import { useEffect, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { fetchDataFromFirebase, State as GoiDichVuState } from '../store/goiDichVuSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { DatePicker } from 'antd';

import dayjs, { Dayjs } from 'dayjs';

function TrangChu() {
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

  const [totalRevenue, setTotalRevenue] = useState<number>(0); // Đặt giá trị mặc định là 0

  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);

  // Tạo một biến tạm thời để lưu trữ doanh thu dự phòng khi chưa có dữ liệu từ Firebase
  const [temporaryTotalRevenue, setTemporaryTotalRevenue] = useState<number>(0);

  // Tạo một biến để lưu trữ trạng thái đã lấy dữ liệu từ Firebase
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const calculateWeeklyRevenue = (data: any[], selectedMonth: Dayjs) => {
    const weeks: any[] = [];
    const firstDayOfMonth = selectedMonth.startOf('month');
    const lastDayOfMonth = selectedMonth.endOf('month');
    const startOfWeeks = [];
    let startOfWeek = firstDayOfMonth.startOf('week');
    while (startOfWeek.isBefore(lastDayOfMonth)) {
      startOfWeeks.push(startOfWeek);
      startOfWeek = startOfWeek.add(1, 'week');
    }
    startOfWeeks.forEach((startOfWeek, index) => {
      const endOfWeek = startOfWeek.clone().endOf('week');
      const weekRevenue = data
        .filter((item) => {
          const dateParts = item.ngayApDung.split('/');
          const date = dayjs(new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0])));
          return date.isAfter(startOfWeek) && date.isBefore(endOfWeek);
        })
        .reduce((total, item) => total + (parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0), 0);
      weeks.push({ name: `Tuần ${startOfWeek.format('DD/MM')} - ${endOfWeek.format('DD/MM')}`, doanhthu: weekRevenue });
    });
    return weeks;
  };

  const onChangeMonth = (date: Dayjs | null, dateString: string) => {
    if (date) {
      const weeksData = calculateWeeklyRevenue(goiDichVu, date);

      // Tính tổng doanh thu từ biểu đồ tháng
      const totalRevenueFromChart = weeksData.reduce((total, item) => total + item.doanhthu, 0);

      // Kiểm tra xem đã lấy dữ liệu từ Firebase chưa, nếu chưa thì dùng doanh thu dự phòng
      const finalTotalRevenue = dataLoaded ? totalRevenueFromChart : temporaryTotalRevenue;

      setTotalRevenue(finalTotalRevenue);

      setWeeklyChartData(weeksData);
    } else {
      // Nếu chưa chọn tháng thì đặt doanh thu mặc định là 0 và không tính toán weeklyChartData
      setTotalRevenue(0);
      setWeeklyChartData([]);
    }
  };
  
  useEffect(() => {
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

  const showLegend = false;

    useEffect(() => {
    // Tính tổng doanh thu từ dữ liệu tháng đã lấy từ Firebase
    const totalRevenueFromData = goiDichVu.reduce((total, item) => total + (parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0), 0);
    setTemporaryTotalRevenue(totalRevenueFromData);

    // Đánh dấu rằng đã lấy dữ liệu từ Firebase
    setDataLoaded(true);
  }, [goiDichVu]);

  //pie
  const filterDataByMonth = (data: any[], selectedMonth: Dayjs) => {
    return data.filter(item => {
      const dateParts = item.ngayApDung.split('/');
      const date = dayjs(new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0])));
      return date.isSame(selectedMonth, 'month');
    });
  };
  
 // State mới để lưu trữ thông tin tháng được chọn từ DatePicker thứ hai
 const [selectedMonthForPie, setSelectedMonthForPie] = useState<Dayjs | null>(null);

 // Nếu chưa lấy dữ liệu từ Firebase hoặc dữ liệu tháng chưa có, đặt dữ liệu cho cả hai biểu đồ Pie về rỗng
 useEffect(() => {
   if (!dataLoaded || !selectedMonthForPie) {
     setPieGoiGiaDinhData([]);
     setPieGoiSuKienData([]);
   }
 }, [dataLoaded, selectedMonthForPie]);

 // Hàm tính toán và cập nhật dữ liệu biểu đồ Pie dựa trên tháng đã chọn
 const handlePieMonthChange = (date: Dayjs | null, dateString: string) => {
   setSelectedMonthForPie(date); // Cập nhật trạng thái khi ngày thay đổi

   if (dataLoaded && date && weeklyChartData.length > 0) {
     // Nếu có dữ liệu từ Firebase, đã chọn tháng từ DatePicker của biểu đồ Pie và weeklyChartData có dữ liệu
     const filteredData = filterDataByMonth(goiDichVu, date);

     if (filteredData.length > 0) {
       const totalRevenue = filteredData.reduce(
         (total, item) => total + (parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0),
         0
       );

       // Tính toán dữ liệu cho biểu đồ Pie - Gói gia đình
       const giaDinhData = [
         {
           name: 'Đang áp dụng',
           value:
             (filteredData.reduce(
               (total, item) =>
                 item.tinhTrang === 'Đang áp dụng' && parseFloat(item.giaVe)
                   ? total + parseFloat(item.giaVe)
                   : total,
               0
             ) /
               totalRevenue) *
             100,
         },
         {
           name: 'Tắt',
           value:
             (filteredData.reduce(
               (total, item) => (item.tinhTrang === 'Tắt' && parseFloat(item.giaVe) ? total + parseFloat(item.giaVe) : total),
               0
             ) /
               totalRevenue) *
             100,
         },
       ];

       // Tính toán dữ liệu cho biểu đồ Pie - Gói sự kiện
       const suKienData = [
         {
           name: 'Đang áp dụng',
           value:
             (filteredData.reduce(
               (total, item) =>
                 item.tinhTrang === 'Đang áp dụng' && parseFloat(item.giaCombo)
                   ? total + parseFloat(item.giaCombo)
                   : total,
               0
             ) /
               totalRevenue) *
             100,
         },
         {
           name: 'Tắt',
           value:
             (filteredData.reduce(
               (total, item) =>
                 item.tinhTrang === 'Tắt' && parseFloat(item.giaCombo) ? total + parseFloat(item.giaCombo) : total,
               0
             ) /
               totalRevenue) *
             100,
         },
       ];

       setTotalRevenue(totalRevenue);
       setPieGoiGiaDinhData(giaDinhData);
       setPieGoiSuKienData(suKienData);
     } else {
       // Nếu không có dữ liệu cho tháng đã chọn, đặt dữ liệu biểu đồ Pie về rỗng
       setTotalRevenue(0);
       setPieGoiGiaDinhData([]);
       setPieGoiSuKienData([]);
     }
   } else {
     // Nếu chưa chọn tháng hoặc weeklyChartData không có dữ liệu, đặt dữ liệu biểu đồ Pie về rỗng
     setTotalRevenue(0);
     setPieGoiGiaDinhData([]);
     setPieGoiSuKienData([]);
   }
 };
 
  return (
    <div style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', width: '1180px', height: '585px' }}>
      <h1 style={{ marginBottom: 0 }}>Thống kê</h1>
      <h5 style={{ float: 'left', marginBottom: '0px' }}>Doanh thu</h5>
      <DatePicker onChange={onChangeMonth} picker="month" format="MM/YYYY" style={{ marginLeft: '930px', marginBottom: '20px' }} />
      <AreaChart width={1150} height={200} data={weeklyChartData}>
  <defs>
    <linearGradient id="weeklyAreaGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="rgba(255, 165, 0, 0.3)" /> {/* Updated stopColor to orange for area */}
      <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
    </linearGradient>
  </defs>
  <XAxis dataKey="name" axisLine={false} tickLine={false} />
  <YAxis axisLine={false} tickLine={false} />
  <CartesianGrid stroke="#ccc" />
  <Tooltip />
  {showLegend && <Legend />}
  <Area type="monotone" dataKey="doanhthu" stroke="orange" fill="url(#weeklyAreaGradient)" strokeWidth={3} /> {/* Set the line color to orange */}
</AreaChart>
      <h3 style={{ marginTop: '10px', marginBottom: '20px' }}>Doanh thu: {totalRevenue} VNĐ</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{}}>
        <DatePicker onChange={handlePieMonthChange} picker="month" format="MM/YYYY" style={{ marginRight: '30px' }} />
        </div>
        {selectedMonthForPie && (
  <div style={{ display: 'flex' }}>
        <div style={{ width: '30%' }}>
      <h3 style={{ marginBottom: '5px', marginTop: '0px' }}>Gói gia đình</h3>
      <PieChart width={350} height={200}>
        {/* Các thành phần Pie, Cell và Tooltip nằm trong PieChart */}
        <Pie
          data={pieGoiGiaDinhData}
          cx={200}
          cy={100}
          innerRadius={30}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={(entry) => ` ${entry.value.toFixed(2)}%`}
          style={{ marginLeft: '30px' }}
        >
          {pieGoiGiaDinhData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
    <div style={{ width: '30%' }}>
      <h3 style={{ marginBottom: '5px', marginTop: '0px', marginLeft:'50px'}}>Gói sự kiện</h3>
      <PieChart width={350} height={200} style={{ marginTop: '0px', marginLeft:'50px' }}>
        {/* Các thành phần Pie, Cell và Tooltip nằm trong PieChart */}
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
  </div>
)}
        <div style={{ width: '30%', marginTop: '30px' }}>
          <div style={{ display: 'flex' }}>
            <div className="dangSD"></div>
            <p style={{ marginTop: '5px' }}>Vé đang sử dụng</p>
          </div>
          <br />
          <div style={{ display: 'flex' }}>
            <div className="tat"></div>
            <p style={{ marginTop: '5px' }}>Vé chưa sử dụng</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrangChu;
