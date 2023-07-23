import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { fetchDataFromFirebase, State as GoiDichVuState } from "../store/goiDichVuSlice";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { DatePicker, DatePickerProps } from "antd";

function TrangChu() {
  // Dữ liệu cho Line Chart (ban đầu để rỗng)
  const [lineChartData, setLineChartData] = useState<any[]>([]);

  // Dữ liệu cho Pie Chart "Gói gia đình"
  const [pieGoiGiaDinhData, setPieGoiGiaDinhData] = useState<any[]>([]);

  // Dữ liệu cho Pie Chart "Gói sự kiện"
  const [pieGoiSuKienData, setPieGoiSuKienData] = useState<any[]>([]);

  const COLORS = ["#0088FE", "#FFA05F", "#FFBB28", "#FF8042"];

  interface RootState {
    goiDichVu: GoiDichVuState;
  }

  const dispatch = useDispatch<Dispatch<any>>();
  const goiDichVu = useSelector((state: RootState) => state.goiDichVu);
  console.log(goiDichVu);
  useEffect(() => {
    // Gọi hàm fetchDataFromFirebase() để lấy dữ liệu từ Firestore
    dispatch(fetchDataFromFirebase());
  }, [dispatch]);

  // Tạo state để lưu tổng doanh thu
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  useEffect(() => {
    // Cập nhật lại lineChartData với dữ liệu doanh thu từng ngày
    const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

    // Tạo kiểu dữ liệu cho biến revenueByDay
    interface RevenueByDay {
      [key: string]: number;
    }

    // Tạo bản đồ từ tên ngày đến tổng doanh thu tương ứng
    const revenueByDay: RevenueByDay = goiDichVu.reduce((result, item) => {
      const revenue = parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0;

      // Chuyển đổi dữ liệu ngày tháng năm từ gói dịch vụ thành đối tượng Date
      const dateParts = item.ngayApDung.split("/");
      const date = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

      // Lấy thứ của ngày từ đối tượng Date và sử dụng nó làm key trong bản đồ revenueByDay
      const dayOfWeek = days[date.getDay()];
      result[dayOfWeek] = (result[dayOfWeek] || 0) + revenue;

      return result;
    }, {} as RevenueByDay);

    // Cập nhật lại lineChartData với dữ liệu doanh thu từng ngày
    const lineData = days.map((day) => ({
      name: day,
      doanhthu: revenueByDay[day] || 0,
    }));
    setLineChartData(lineData);

    // Tính tổng doanh thu từng ngày trong tuần
    const dailyTotalRevenue = days.map((day) => revenueByDay[day] || 0).reduce((sum, value) => sum + value, 0);

    // Cập nhật tổng doanh thu vào state
    setTotalRevenue(dailyTotalRevenue);

    // Cập nhật lại pieGoiGiaDinhData và pieGoiSuKienData sau khi lấy được dữ liệu từ Firebase
    const giaDinhData = [
      {
        name: "Đang áp dụng",
        value: goiDichVu.reduce(
          (total, item) =>
            item.tenGoi === "Gói gia đình" && item.tinhTrang === "Đang áp dụng"
              ? total + (parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0)
              : total,
          0
        ),
      },
      {
        name: "Tắt",
        value: goiDichVu.reduce(
          (total, item) =>
            item.tenGoi === "Gói gia đình" && item.tinhTrang === "Tắt"
              ? total + (parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0)
              : total,
          0
        ),
      },
    ];
    setPieGoiGiaDinhData(giaDinhData);

    const suKienData = [
      {
        name: "Đang áp dụng",
        value: goiDichVu.reduce(
          (total, item) =>
            item.tenGoi === "Gói sự kiện" && item.tinhTrang === "Đang áp dụng"
              ? total + (parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0)
              : total,
          0
        ),
      },
      {
        name: "Tắt",
        value: goiDichVu.reduce(
          (total, item) =>
            item.tenGoi === "Gói sự kiện" && item.tinhTrang === "Tắt"
              ? total + (parseFloat(item.giaVe) || parseFloat(item.giaCombo) || 0)
              : total,
          0
        ),
      },
    ];
    setPieGoiSuKienData(suKienData);
  }, [goiDichVu]);

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };

  const showLegend = false;

  return (
    <div style={{ marginLeft: "10px", backgroundColor: "#FFFFFF", padding: "10px", borderRadius: "7px", width: "1180px", height: "580px"}}>
      <h1 style={{ marginBottom: 0 }}>Thống kê</h1>
      <h5 style={{ float: "left" , marginBottom:'0px'}}>Doanh thu</h5>
      <h5 style={{ float: "right" }}>
        <DatePicker onChange={onChange} />
      </h5>
      <LineChart width={1150} height={180} data={lineChartData}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
        {showLegend && <Legend />}
        <Line type="monotone" dataKey="doanhthu" stroke="#FFA05F" />
      </LineChart>
      <h3 style={{marginTop:'80px', marginBottom:'0px'}}>Doanh thu: {totalRevenue} VNĐ</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width:'35%',marginRight: "10px"}}>
          <h3 style={{ marginBottom: '0px' }}>Gói gia đình</h3>
          <PieChart width={400} height={200}>
            <Pie
              data={pieGoiGiaDinhData}
              cx={200}
              cy={100}
              innerRadius={30}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({value }) => ` ${value.toFixed(2)} VNĐ`}
            >
              {pieGoiGiaDinhData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div style={{ width:'40%' , marginRight: "10px"}}>
          <h3 style={{ marginBottom: '0px' }}>Gói sự kiện</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={pieGoiSuKienData}
              cx={200}
              cy={100}
              innerRadius={30}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ value }) => `${value.toFixed(2)} VNĐ`}   
            >
              {pieGoiSuKienData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          </div>
          <div style={{width:'20%', marginTop:'30px', marginRight: "10px"}}>
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
