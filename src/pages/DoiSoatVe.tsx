import { Button, Table, Pagination, Radio , DatePicker, Select} from 'antd';
import { useState } from 'react';
import SearchComponent from '../components/SearchComponent';
import { Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDataFromFirebase, State as DoiSoatVeState } from '../store/doiSoatVeSlice';
import { Dispatch } from 'redux';

import type { RadioChangeEvent } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';


interface RootState {
  doiSoatVe: DoiSoatVeState;
}
 
const columnsDoiSoatVe = [
  { title: 'STT', dataIndex: 'STT', key: 'STT' },
  { title: 'Số vé', dataIndex: 'soVe', key: 'soVe' },
  { title: 'Tên sự kiện', dataIndex: 'tenSK', key: 'tenSK',flex: 1, },
  { title: 'Ngày sử dụng', dataIndex: 'ngaySD', key: 'ngaySD' },
  { title: 'Tên loại vé', dataIndex: 'tenLoaiVe', key: 'tenLoaiVe',flex: 1, },
  { title: 'Cổng check-in', dataIndex: 'congCheckin', key: 'congCheckin' },
  { title: '', dataIndex: 'trangThai', key: 'trangThai',flex: 1, },
];

function DoiSoatVe() {
  const dispatch = useDispatch<Dispatch>();
  const doiSoatVe = useSelector((state: RootState) => state.doiSoatVe);
  
  useEffect(() => {
    dispatch(fetchDataFromFirebase() as any); // ép kiểu thành any
  }, [dispatch]);

  // select
  const handleChange = (value: string) => {
  console.log(`selected ${value}`);
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
  const [value, setValue] = useState(1);

  const onChangeRadioTinhTrangSD = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  // Cổng check-in
  const onChangeCheckBox = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
  };



  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5; // Số dòng dữ liệu trên mỗi trang

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = doiSoatVe.slice(startIndex, endIndex);

  return (
    <div style={{ display: 'flex' }}>
            <div className="" style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', paddingBottom: '50px', width:'800px', height: '540px' }}>
      <h1>Đối Soát Vé</h1>

      {/* Tìm kiếm */}
      <SearchComponent placeholder='Tìm kiếm ở đây...' size='large'
        onSearch={(value: string) => {
          console.log('Search value:', value);
        }}
        style={{ width: '350px', marginLeft: '0px', marginRight: '0px' }}
      />

        {/* Nút chốt đối soát */}
        <Button size={'large'} style={{ fontWeight: '500', backgroundColor: 'orange', color: 'white', float: 'right' }}>
          Đối soát vé
        </Button>

     {/* Bảng dữ liệu danh sách vé */}
     <Table dataSource={paginatedData} columns={columnsDoiSoatVe} pagination={false} style={{ marginTop: '30px' }} />
{/* Phân trang */}
<Pagination
        current={currentPage}
        pageSize={pageSize}
        total={doiSoatVe.length}
        onChange={onPageChange}
        style={{ marginTop: '10px', textAlign: 'center' }}
      />
      </div>

<div className="" style={{ backgroundColor: '#FFFFFF', marginLeft: '20px', padding: '10px', width: '350px', height: '580px' }}>
        <h1>Lọc vé</h1>
           <Select
      defaultValue="Hội Thể Thao Quốc Gia 2023"
      style={{ width: 250 }}
      onChange={handleChange}
      options={[
        { value: 'Hội Thể Thao Quốc Gia 2023', label: 'Hội Thể Thao Quốc Gia 2023' },
        { value: 'Hội Cầu Lông Việt Nam 2023', label: 'Hội Cầu Lông Việt Nam 2023' },
        { value: 'Phương Thảo', label: 'Phương Thảo' },
        
      ]}
    />
        {/* Tình trạng đối soát */}
        <div style={{ display: 'flex' }}>
          <p className='label' style={{ float: 'left' }}>Tình trạng đối soát</p>
          <Radio.Group onChange={onChangeRadioTinhTrangSD} value={value} style={{ float: 'right', marginLeft: '20px', marginTop: '20px' }}>
            <Radio value={1}>Tất cả</Radio> <br />
            <Radio value={2}>Đã sử dụng</Radio> <br />
            <Radio value={3}>Chưa sử dụng</Radio> <br />
            <Radio value={4}>Hết hạn</Radio>
          </Radio.Group>
          <br />
        </div>

        {/* Loại vé */}
        <p className='label'>Loại vé:  <span style={{ marginLeft: '50px', fontWeight: 450 }}>Vé cổng</span></p>

        {/* Từ ngày và đến ngày */}
        <div style={{ display: 'flex' }}>
          <p className='label'>Từ ngày: </p>
          <DatePicker value={fromDate} onChange={handleFromDateChange} format="DD/MM/YYYY" style={{ marginLeft: '30px' }} />
        </div>
        <div style={{ display: 'flex', marginTop: '20px' }}>
          <p className='label'>Đến ngày:</p>
          <DatePicker value={toDate} onChange={handleToDateChange} format="DD/MM/YYYY" style={{ marginLeft: '20px' }} />
        </div>

        {/* Nút lọc */}
        <Button size={'large'} style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'orange', marginLeft: '150px', marginTop: '50px' }}>Lọc</Button>
</div>
      </div>
  );
}

export default DoiSoatVe;