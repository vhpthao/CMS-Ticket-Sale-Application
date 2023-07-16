import { Button, Modal, Tag, DatePicker, Checkbox, Col, Row, Table, Pagination } from 'antd';
import { useState } from 'react';
import SearchComponent from '../components/SearchComponent';
import { Dayjs } from 'dayjs';
import { RadioChangeEvent } from 'antd/lib/radio';
import { Radio } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDataFromFirebase, State as QuanLyVeState } from '../store/quanLyVeSlice';
import { Dispatch } from 'redux';

interface RootState {
  quanLyVe: QuanLyVeState;
}

const columnsQuanLyVe = [
  { title: 'STT', dataIndex: 'STT', key: 'STT' },
  { title: 'Booking Code', dataIndex: 'bookingCode', key: 'bookingCode' },
  { title: 'Số vé', dataIndex: 'soVe', key: 'soVe' },
  { title: 'Tên sự kiện', dataIndex: 'tenSK', key: 'tenSK' },
  {
    title: 'Tình trạng sử dụng',
    dataIndex: 'tinhtrangSD',
    key: 'tinhtrangSD',
    render: (tag: string) => (
      <>
        <Tag color="green" key={tag}>
          {tag}
        </Tag>
      </>
    ),
  },
  { title: 'Ngày sử dụng', dataIndex: 'ngaySD', key: 'ngaySD' },
  { title: 'Ngày xuất vé', dataIndex: 'ngayXuatVe', key: 'ngayXuatVe' },
  { title: 'Cổng check-in', dataIndex: 'congCheckin', key: 'congCheckin' },
];

function QuanLyVe() {
  const dispatch = useDispatch<Dispatch>();
  const quanLyVe = useSelector((state: RootState) => state.quanLyVe);
  
  useEffect(() => {
    dispatch(fetchDataFromFirebase() as any); // ép kiểu thành any
  }, [dispatch]);

  // Sự kiện hiển thị modal lọc vé
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
  console.log(quanLyVe);

  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5; // Số dòng dữ liệu trên mỗi trang

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = quanLyVe.slice(startIndex, endIndex);

  return (
    <div style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', width: '1180px', height: '560px' }}>
      <h1>Danh Sách Vé</h1>

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
        <Modal title="Lọc vé" visible={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={600}>
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
        <Button size={'large'} style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'orange' }}>Xuất file(.csv)</Button>
      </div>

     {/* Bảng dữ liệu danh sách vé */}
     <Table dataSource={paginatedData} columns={columnsQuanLyVe} pagination={false} style={{ marginTop: '30px' }} />
{/* Phân trang */}
<Pagination
        current={currentPage}
        pageSize={pageSize}
        total={quanLyVe.length}
        onChange={onPageChange}
        style={{ marginTop: '10px', textAlign: 'center' }}
      />
    </div>
  );
}

export default QuanLyVe;