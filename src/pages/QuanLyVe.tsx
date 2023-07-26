import { Button, Modal, Tag, DatePicker, Checkbox, Col, Row, Table, Pagination } from 'antd';
import { useState} from 'react';
import SearchComponent from '../components/SearchComponent';
import dayjs, { Dayjs } from 'dayjs';
import { Radio } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGoiGiaDinhDataFromFirebase, State as GoiGiaDinhState , TableDataItemGoiGiaDinh,  updateNgaySDInFirebase} from '../store/goiGiaDinhSlice';
import { fetchGoiSuKienDataFromFirebase, State as GoiSuKienState ,TableDataItemGoiSuKien,  updateNgaySDGSKInFirebase} from '../store/goiSuKienSlice';
import { Dispatch } from 'redux';
import Papa from 'papaparse';
import { MoreOutlined } from '@ant-design/icons';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';


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
  goiSuKien: GoiSuKienState;
}

const tinhTrangColors: { [key: string]: string } = {
  'Đã sử dụng': 'blue',
  'Chưa sử dụng': 'green', 
  'Hết hạn':'red'
};

function QuanLyVe() {
  const [isUnusedPackage, setIsUnusedPackage] = useState<boolean>(false);

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
     {
      title: '',
      dataIndex: '',
      key: 'moreOutlined',
      render: (record: any) => {
        if (isUnusedPackage) {
          return <MoreOutlined onClick={() => handleShowModal(record)} />;
        }
        return null;
      },
    },
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
    {
      title: '',
      dataIndex: '',
      key: 'moreOutlined',
      render: (record: any) => {
        if (isUnusedPackage) {
          return <MoreOutlined onClick={() => handleShowModal(record)} />;
        }
        return null;
      },
    },
  ];

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedRowData, setSelectedRowData] = useState<any>(null); 

  const handleModalCancel = () => {
    setModalVisible(false);
  };
  
  const handleShowModal = (record: any) => {
    setSelectedRowData(record);
    if (record.tinhTrangSD === 'Chưa sử dụng') {
      setModalVisible(true);
    }
  };
  
  const formatDateToString = (date: Dayjs | null): string => {
    if (!date) return '';
    return date.format('DD/MM/YYYY');
  };
  
  console.log(formatDateToString(dayjs())); 

  
  const [newNgaySD, setNewNgaySD] = useState<Dayjs | null>(selectedRowData ? dayjs(selectedRowData.ngaySD) : null);

const handleSaveNewNgaySD = () => {
  if(selectedPackage === 'Gói gia đình'){
    if (newNgaySD && selectedRowData) {
      const updatedGoiGiaDinh: TableDataItemGoiGiaDinh = {
        ...selectedRowData,
        ngaySD: formatDateToString(newNgaySD),
      };
  
      dispatch(updateNgaySDInFirebase(updatedGoiGiaDinh) as any); 
      setModalVisible(false);
  
      dispatch(fetchGoiGiaDinhDataFromFirebase() as any);
    }
  }
  else{
    if (newNgaySD && selectedRowData) {
      const updatedGoiSuKien: TableDataItemGoiSuKien = {
        ...selectedRowData,
        ngaySD: formatDateToString(newNgaySD),
      };
  
      dispatch(updateNgaySDGSKInFirebase(updatedGoiSuKien) as any); 
      setModalVisible(false);
  
      dispatch(fetchGoiSuKienDataFromFirebase() as any);
    }
  }
};

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

  const [currentPageGoiGiaDinh, setCurrentPageGoiGiaDinh] = useState<number>(1);
  const [currentPageGoiSuKien, setCurrentPageGoiSuKien] = useState<number>(1);

  const dataSource = selectedPackage === 'Gói gia đình' ? goiGiaDinh : goiSuKien;
  const currentPage = selectedPackage === 'Gói gia đình' ? currentPageGoiGiaDinh : currentPageGoiSuKien;
  const setCurrentPage = selectedPackage === 'Gói gia đình' ? setCurrentPageGoiGiaDinh : setCurrentPageGoiSuKien;

  const pageSize = 5; 
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

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

  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const handleSearch = (value: string) => {
    setSearchKeyword(value.toLowerCase()); 
    console.log('Search value:', value);
  };

  const filteredDataTK = dataSource.filter((TableDataItem) => {
    const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
    return (
      TableDataItem.bookingCode.toLowerCase().includes(lowerCaseSearchKeyword) ||
      TableDataItem.soVe.toLowerCase().includes(lowerCaseSearchKeyword) ||
      TableDataItem.tinhTrangSD.toLowerCase().includes(lowerCaseSearchKeyword) ||
      TableDataItem.congCheckin.toLowerCase().includes(lowerCaseSearchKeyword)
    );
  });

  const paginatedData = filteredDataTK.slice(startIndex, endIndex);

 useEffect(() => {
  const hasUnusedPackage = filteredDataTK.some((item) => item.tinhTrangSD === 'Chưa sử dụng');

  setIsUnusedPackage(hasUnusedPackage);
}, [filteredDataTK]);

const [selectAllChecked, setSelectAllChecked] = useState(false);
const [otherCheckboxesDisabled, setOtherCheckboxesDisabled] = useState(false);

const handleSelectAllChange = (e: any) => {
  const isChecked = e.target.checked;
  setSelectAllChecked(isChecked);
  setOtherCheckboxesDisabled(isChecked); 
};


const [filterOptions, setFilterOptions] = useState({
  fromDate: null,
  toDate: null,
  tinhTrang: null,
  congCheckin: [],
});

const [fromDate, setFromDate] = useState<Dayjs | null>(null);
const [toDate, setToDate] = useState<Dayjs | null>(null);


const handleFromDateChange = (date: Dayjs | null) => {
  setFromDate(date);
};

const handleToDateChange = (date: Dayjs | null) => {
  setToDate(date);
};

const [congCheckin, setCongCheckin] = useState<string[]>([]); 

const [filteredData, setFilteredData] = useState<TableDataItemGoiGiaDinh[] | TableDataItemGoiSuKien[]>([]);

const handleFilterData = () => {
  const filteredData = filteredDataTK.filter((TableDataItem) => {
    if (filterOptions.fromDate && TableDataItem.ngaySD) {
      const ngaySD: Dayjs = dayjs(TableDataItem.ngaySD);
      if (ngaySD.isBefore(filterOptions.fromDate)) {
        return false;
      }
    }

    if (filterOptions.toDate && TableDataItem.ngayXuatVe) {
      const ngayXuatVe: Dayjs = dayjs(TableDataItem.ngayXuatVe);
      if (ngayXuatVe.isAfter(filterOptions.toDate)) {
        return false;
      }
    }

    if (filterOptions.tinhTrang && TableDataItem.tinhTrangSD) {
      if (TableDataItem.tinhTrangSD !== filterOptions.tinhTrang) {
        return false;
      }
    }

    if (filterOptions.congCheckin.length > 0 && TableDataItem.congCheckin) {
      const congCheckinMatch = filterOptions.congCheckin.some((value) =>
        TableDataItem.congCheckin.includes(value)
      );
      if (!congCheckinMatch) {
        return false;
      }
    }

    return true;
  });

  setFilteredData(filteredData);

  console.log(filteredData);
};

  return (
    <div style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', width: '1180px', height: '580px' }}>
      <h1>Danh Sách Vé</h1>
      <div className="" style={{ display: 'flex', marginBottom: '20px' }}>
        <button onClick={() => setSelectedPackage('Gói gia đình')} className={`navmini ${selectedPackage === 'Gói gia đình' ? 'active' : ''}`}>Gói gia đình</button>
        <button onClick={() => setSelectedPackage('Gói sự kiện')} className={`navmini ${selectedPackage === 'Gói sự kiện' ? 'active' : ''}`}>Gói sự kiện</button>
      </div>
      {/* tìm kiếm */}
      <SearchComponent
        placeholder='Tìm kiếm ở đây...'
        size='large'
        onSearch={handleSearch} // Sử dụng hàm xử lý tìm kiếm mới
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
            <DatePicker
  value={fromDate} 
  onChange={handleFromDateChange}
  format="DD/MM/YYYY"
  style={{ marginLeft: '5px', marginRight: '30px' }}
/>
            <p style={{ fontWeight: 'bold', marginTop: '20px', fontSize: '15px' }}>Đến ngày:</p>
            <DatePicker
  value={toDate} 
  onChange={handleToDateChange}
  format="DD/MM/YYYY"
  style={{ marginLeft: '5px', marginRight: '30px' }}
/>
          </div>

        {/* Tình trạng sử dụng */}
<p style={{ fontWeight: 'bold', marginTop: '20px', fontSize: '15px' }}>Tình trạng sử dụng</p>
<Radio.Group style={{ display: 'flex' }} onChange={(e) => setFilterOptions({ ...filterOptions, tinhTrang: e.target.value })}>
  <Radio value={null}>Tất cả</Radio>
  <Radio value="Đã sử dụng">Đã sử dụng</Radio>
  <Radio value="Chưa sử dụng">Chưa sử dụng</Radio>
  <Radio value="Hết hạn">Hết hạn</Radio>
</Radio.Group>

          {/* Cổng check-in */}
          <p style={{ fontWeight: 'bold', marginTop: '20px', fontSize: '15px' }}>Cổng check-in</p>
          <Checkbox.Group
    style={{ width: '100%' }}
    value={congCheckin}
    onChange={(values: CheckboxValueType[]) => setCongCheckin(values as string[])}>
    <Row>
      <Col span={8}>
      <Checkbox value={'Tất cả'} onChange={handleSelectAllChange}>
  Tất cả
</Checkbox>
      </Col>
        <Col span={8} >
        <Checkbox value={'Cổng 1'} disabled={otherCheckboxesDisabled}>
  Cổng 1
</Checkbox>
        </Col>
        <Col span={8} >
        <Checkbox value={'Cổng 2'} disabled={otherCheckboxesDisabled}>
  Cổng 2
</Checkbox>
        </Col>
        <Col span={8} >
          <Checkbox value={'Cổng 3'} disabled={otherCheckboxesDisabled} >
            Cổng 3
          </Checkbox>
        </Col>
        <Col span={8} >
          <Checkbox value={'Cổng 4'} disabled={otherCheckboxesDisabled}>
            Cổng 4
          </Checkbox>
        </Col>
        <Col span={8} >
          <Checkbox  value={'Cổng 5'} disabled={otherCheckboxesDisabled}>
            Cổng 5
          </Checkbox>
        </Col>
    </Row>
  </Checkbox.Group>
  
          {/* Nút lọc */}
          <Button
  size="large"
  style={{
    border: '1px solid rgb(255, 202, 8)',
    fontWeight: '500',
    color: 'orange',
    marginTop: '20px',
    marginLeft: '200px'
  }}
  onClick={() => {
    handleFilterData();
    setVisible(false); 
  }}
>
  Lọc
</Button>
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

<Modal
  visible={modalVisible}
  onCancel={handleModalCancel}
  footer={null}>
  {selectedRowData && (
    <>
    <h1 style={{textAlign:'center'}}>Đổi ngày sử dụng vé</h1>
      <p>Booking Code: {selectedRowData.bookingCode}</p>
      <p>Số vé: {selectedRowData.soVe}</p>
      <p>Cổng check-in: {selectedRowData.congCheckin}</p>
      <p>Hạn sử dụng: 
        <DatePicker value={newNgaySD} onChange={(date, dateString) => setNewNgaySD(date)} format="DD/MM/YYYY" />
        </p>
      <div style={{ display: 'flex', marginTop: '30px', marginLeft: '180px' }}>
        <Button size='large'
          style={{ border: '1px solid orange', color: 'orange', borderRadius: '7px', backgroundColor: 'white', marginRight: '7px'}}
          onClick={() => setModalVisible(false)}>
          Hủy
        </Button>
        <Button size='large'
          style={{ backgroundColor: 'orange', color: 'white', borderRadius: '7px', border: '1px solid orange'}}
          onClick={handleSaveNewNgaySD}
        >
          Lưu
        </Button>
      </div>
    </>
  )}
</Modal>
      </div>
);
}
export default QuanLyVe;
