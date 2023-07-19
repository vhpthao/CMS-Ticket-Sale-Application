import { Button, Modal, Tag, DatePicker, Checkbox, Col, Row, Table, Pagination } from 'antd';
import { useState } from 'react';
import SearchComponent from '../components/SearchComponent';
import { Dayjs } from 'dayjs';
import { RadioChangeEvent } from 'antd/lib/radio';
import { Radio } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGoiGiaDinhDataFromFirebase, State as GoiGiaDinhState } from '../store/goiGiaDinhSlice';
import { fetchGoiSuKienDataFromFirebase, State as GoiSuKienState } from '../store/goiSuKienSlice';
import { Dispatch } from 'redux';
import Papa from 'papaparse';

const exportAsCSV = (data: any, filename: string) => {
    const csv = Papa.unparse(data, { header: true });
    const csvWithBom = '\uFEFF' + csv; 
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob); 
    const link = document.createElement('a'); 
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden'; 
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link); 
  };

interface RootState {
  goiGiaDinh: GoiGiaDinhState;
}
interface RootState {
  goiSuKien: GoiSuKienState;
}


const tinhTrangColors: { [key: string]: string } = {
  'Đã sử dụng': 'blue',
  'Chưa sử dụng': 'green', 
  'Hết hạn':'red'
};

const columnsGoiSuKien = [
  { title: 'STT', dataIndex: 'STT', key: 'STT' },
  { title: 'Booking Code', dataIndex: 'bookingCode', key: 'bookingCode' },
  { title: 'Số vé', dataIndex: 'soVe', key: 'soVe' },
  { title: 'Tên sự kiện', dataIndex: 'tenSK', key: 'tenSK' },
  {
    title: 'Tình trạng sử dụng',
    dataIndex: 'tinhTrangSD',
    key: 'tinhTrangSD',
    render: (tinhTrang: string) => (
      <Tag color={tinhTrangColors[tinhTrang] || 'default'}>
        {tinhTrang}
      </Tag>
    ),
  },
  { title: 'Ngày sử dụng', dataIndex: 'ngaySD', key: 'ngaySD'},
  { title: 'Ngày xuất vé', dataIndex: 'ngayXuatVe', key: 'ngayXuatVe' },
  { title: 'Cổng check-in', dataIndex: 'congCheckin', key: 'congCheckin' },
];

const columnsGoiGiaDinh = [
  { title: 'STT', dataIndex: 'STT', key: 'STT' },
  { title: 'Booking Code', dataIndex: 'bookingCode', key: 'bookingCode' },
  { title: 'Số vé', dataIndex: 'soVe', key: 'soVe' },
  {
    title: 'Tình trạng sử dụng',
    dataIndex: 'tinhTrangSD',
    key: 'tinhTrangSD',
    render: (tinhTrang: string) => (
      <Tag color={tinhTrangColors[tinhTrang] || 'default'}>
        {tinhTrang}
      </Tag>
    ),
  },
  { title: 'Ngày sử dụng', dataIndex: 'ngaySD', key: 'ngaySD', },
  { title: 'Ngày xuất vé', dataIndex: 'ngayXuatVe', key: 'ngayXuatVe' },
  { title: 'Cổng check-in', dataIndex: 'congCheckin', key: 'congCheckin' },
];

function QuanLyVe() {

  const dispatch = useDispatch<Dispatch>();

  const goiGiaDinh = useSelector((state: RootState) => state.goiGiaDinh);
  
  useEffect(() => {
    dispatch(fetchGoiGiaDinhDataFromFirebase() as any);
  }, [dispatch]);

  const goiSuKien = useSelector((state: RootState) => state.goiSuKien);
  
  useEffect(() => {
    dispatch(fetchGoiSuKienDataFromFirebase() as any);
  }, [dispatch]);

  const [selectedPackage, setSelectedPackage] = useState<string>('Gói gia đình');

  const columns = selectedPackage === 'Gói gia đình' ? columnsGoiGiaDinh : columnsGoiSuKien;

  // phân trang
  const [currentPageGoiGiaDinh, setCurrentPageGoiGiaDinh] = useState<number>(1);
  const [currentPageGoiSuKien, setCurrentPageGoiSuKien] = useState<number>(1);

  // Lựa chọn dữ liệu hiển thị trong bảng và trang hiện tại dựa vào loại gói đang chọn
  const dataSource = selectedPackage === 'Gói gia đình' ? goiGiaDinh : goiSuKien;
  const currentPage = selectedPackage === 'Gói gia đình' ? currentPageGoiGiaDinh : currentPageGoiSuKien;
  const setCurrentPage = selectedPackage === 'Gói gia đình' ? setCurrentPageGoiGiaDinh : setCurrentPageGoiSuKien;

  const pageSize = 5; // Số dòng dữ liệu trên mỗi trang
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = dataSource.slice(startIndex, endIndex);

  // Sự kiện hiển thị modal lọc vé
  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  // Thiết lập định dạng cho ngày tháng năm
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const handleFromDateChange = (date: Dayjs | null, dateString: string) => {
    setFromDate(date);
    // Thực hiện xử lý khác (nếu có)
  };

  const handleToDateChange = (date: Dayjs | null, dateString: string) => {
    setToDate(date);
    // Thực hiện xử lý khác (nếu có)
  };

  // Sự kiện cho radio button
  const [value, setValue] = useState<number>(1);

  const onChangeRadioTinhTrangSD = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  // Sự kiện cho checkbox cổng check-in
  const onChangeCheckBox = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
  };


  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

// Hàm xử lý khi nút "Xuất file(.csv)" được nhấn
const handleExportCSV = () => {
    const dataToExport = paginatedData.map((item) => ({
      'STT': item.STT,
      'Booking Code': item.bookingCode,
      'Số vé': item.soVe,
      'Tình trạng sử dụng': item.tinhTrangSD,
      'Ngày sử dụng': item.ngaySD,
      'Ngày xuất vé': item.ngayXuatVe,
      'Cổng check-in': item.congCheckin,
    }));
    exportAsCSV(dataToExport, 'danh_sach_ve.csv');
  };

  return (
    <div style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', width: '1180px', height: '580px' }}>
      <h1>Danh Sách Vé</h1>
      <div className="" style={{ display: 'flex', marginBottom: '20px' }}>
        <button onClick={() => setSelectedPackage('Gói gia đình')} className={`navmini ${selectedPackage === 'Gói gia đình' ? 'active' : ''}`}>Gói gia đình</button>
        <button onClick={() => setSelectedPackage('Gói sự kiện')} className={`navmini ${selectedPackage === 'Gói sự kiện' ? 'active' : ''}`}>Gói sự kiện</button>
      </div>
      {/* Tìm kiếm */}
      <SearchComponent placeholder='Tìm kiếm ở đây...' size='large'
        onSearch={(value: string) => {
          console.log('Search value:', value);
        }}
        style={{ width: '350px', marginLeft: '0px', marginRight: '0px' }}
      />

      {/* Modal lọc vé */}
      <div style={{ float: 'right' }}>
        <Button type="primary" onClick={showModal} style={{ marginRight: '10px', backgroundColor: 'orange', fontWeight: 500 }} size='large'>
          Lọc vé
        </Button>
        <Modal title="Lọc vé"  visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null} >
          <h1 style={{ textAlign: 'center', marginTop: '0px' }}>Lọc Vé</h1>
          <div style={{ display: 'flex' }}>
            <p style={{ fontWeight: 'bold', marginTop: '20px', fontSize: '15px' }}>Từ ngày:</p>
            <DatePicker value={fromDate} onChange={handleFromDateChange} format="DD/MM/YYYY" style={{ marginLeft: '5px', marginRight: '30px' }} />
            <p style={{ fontWeight: 'bold', marginTop: '20px', fontSize: '15px' }}>Đến ngày:</p>
            <DatePicker value={toDate} onChange={handleToDateChange} format="DD/MM/YYYY" style={{ marginLeft: '5px' }} />
          </div>

          {/* Tình trạng sử dụng */}
          <p style={{ fontWeight: 'bold', marginTop: '20px', fontSize: '15px' }}>Tình trạng sử dụng</p>
          <Radio.Group onChange={onChangeRadioTinhTrangSD} value={value} style={{ display: 'flex' }}>
            <Radio value={1}>Tất cả</Radio>
            <Radio value={2}>Đã sử dụng</Radio>
            <Radio value={3}>Chưa sử dụng</Radio>
            <Radio value={4}>Hết hạn</Radio>
          </Radio.Group>

          {/* Cổng check-in */}
          <p style={{ fontWeight: 'bold', marginTop: '20px', fontSize: '15px' }}>Cổng check-in</p>
          <Checkbox.Group style={{ width: '100%' }} onChange={onChangeCheckBox}>
            <Row>
              <Col span={8}>
                <Checkbox value="Tất cả">Tất cả</Checkbox>
              </Col>
              <Col span={8}>
	                <Checkbox value="Cổng 1">Cổng 1</Checkbox>
	              </Col>
	              <Col span={8}>
	                <Checkbox value="Cổng 2">Cổng 2</Checkbox>
	              </Col>
              <Col span={8}>
	                <Checkbox value="Cổng 3">Cổng 3</Checkbox>
              </Col>
              <Col span={8}>
               <Checkbox value="Cổng 4">Cổng 4</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="Cổng 5">5</Checkbox>
              </Col>
            </Row>
	          </Checkbox.Group>

          {/* Nút lọc */}
          <Button size={'large'} className='btnLoc' style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'orange' }}>Lọc</Button>
        </Modal>
        {/* Nút "Xuất file(.csv)" */}
    <Button size={'large'} style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'orange' }} onClick={handleExportCSV}>
  Xuất file(.csv)
	</Button>
      </div>

	    {/* Bảng dữ liệu danh sách vé */}
	    <Table dataSource={paginatedData} columns={columns} pagination={false} style={{ marginTop: '30px' }} />
      {/* Phân trang */}
	      <Pagination
        current={currentPage }  pageSize={pageSize}
        total={dataSource.length}        onChange={setCurrentPage}
        style={{ marginTop: '10px', textAlign: 'center' }}/>
	    </div>
);
}
	
export default QuanLyVe;
