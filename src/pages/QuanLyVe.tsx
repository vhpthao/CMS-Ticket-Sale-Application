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

// Hàm để xuất dữ liệu dưới dạng file CSV với encoding UTF-8 và BOM
const exportAsCSV = (data: any, filename: string) => {
    const csv = Papa.unparse(data, { header: true }); // Chuyển đổi dữ liệu thành chuỗi CSV
    const csvWithBom = '\uFEFF' + csv; // Thêm BOM vào đầu chuỗi CSV
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' }); // Tạo đối tượng Blob từ chuỗi CSV với encoding UTF-8 và BOM
    const url = URL.createObjectURL(blob); // Tạo URL từ Blob
    const link = document.createElement('a'); // Tạo thẻ a để tạo liên kết tải xuống
    link.setAttribute('href', url); // Thiết lập đường dẫn của liên kết
    link.setAttribute('download', filename); // Thiết lập tên file khi tải xuống
    link.style.visibility = 'hidden'; // Ẩn liên kết
    document.body.appendChild(link); // Thêm thẻ a vào body
    link.click(); // Kích hoạt sự kiện click trên thẻ a (tải xuống)
    document.body.removeChild(link); // Xóa thẻ a sau khi hoàn thành
  };

interface RootState {
  goiGiaDinh: GoiGiaDinhState;
  goiSuKien: GoiSuKienState;
}

// Định nghĩa màu tương ứng cho từng giá trị "tinhTrang"
const tinhTrangColors: { [key: string]: string } = {
  'Đã sử dụng': 'blue',
  'Chưa sử dụng': 'green', 
  'Hết hạn':'red'
};

function QuanLyVe() {
  // Thêm biến trạng thái để xác định gói có trạng thái "Chưa sử dụng"
  const [isUnusedPackage, setIsUnusedPackage] = useState<boolean>(false);

// Thay đổi cách render nút "moreOutlined" trong cả hai bảng dữ liệu
const renderMoreOutlined = (record: any) => {
  if (record.tinhTrangSD === 'Đã sử dụng' || record.tinhTrangSD === 'Hết hạn') {
    // Ẩn nút "moreOutlined" nếu gói vé có trạng thái "Đã sử dụng" hoặc "Hết hạn"
    return null;
  }

  // Ngược lại, hiển thị nút "moreOutlined" cho các trạng thái khác
  return <MoreOutlined onClick={() => handleShowModal(record)} />;
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
    {
      title: '',
      dataIndex: '',
      key: 'moreOutlined',
      render: renderMoreOutlined,
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
    // Thêm cột render cho nút "moreOutlined"
  {
    title: '',
    dataIndex: '',
    key: 'moreOutlined',
    render: renderMoreOutlined,
  },
  ];

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedRowData, setSelectedRowData] = useState<any>(null); // Replace 'any' with the appropriate type of your row data

  const handleModalCancel = () => {
    setModalVisible(false);
  };
  
  const handleShowModal = (record: any) => {
    setSelectedRowData(record);
    // Kiểm tra trạng thái gói vé, nếu là "Chưa sử dụng" thì hiển thị modal
    if (record.tinhTrangSD === 'Chưa sử dụng') {
      setModalVisible(true);
    }
  };
  
  const formatDateToString = (date: Dayjs | null): string => {
    if (!date) return '';
    return date.format('DD/MM/YYYY');
  };
  
  console.log(formatDateToString(dayjs())); // Kết quả nên khớp với định dạng mong muốn.

  
// modal đổi ngày sử dụng vé
  const [newNgaySD, setNewNgaySD] = useState<Dayjs | null>(selectedRowData ? dayjs(selectedRowData.ngaySD) : null);

const handleSaveNewNgaySD = () => {
  if(selectedPackage === 'Gói gia đình'){
    if (newNgaySD && selectedRowData) {
      const updatedGoiGiaDinh: TableDataItemGoiGiaDinh = {
        ...selectedRowData,
        ngaySD: formatDateToString(newNgaySD),
      };
  
      dispatch(updateNgaySDInFirebase(updatedGoiGiaDinh) as any); // Dispatch the update action
      setModalVisible(false);
  
      // Sau khi cập nhật thành công, cập nhật lại danh sách gói gia đình
      dispatch(fetchGoiGiaDinhDataFromFirebase() as any);
    }
  }
  else{
    if (newNgaySD && selectedRowData) {
      const updatedGoiSuKien: TableDataItemGoiSuKien = {
        ...selectedRowData,
        ngaySD: formatDateToString(newNgaySD),
      };
  
      dispatch(updateNgaySDGSKInFirebase(updatedGoiSuKien) as any); // Dispatch the update action
      setModalVisible(false);
  
      // Sau khi cập nhật thành công, cập nhật lại danh sách gói gia đình
      dispatch(fetchGoiSuKienDataFromFirebase() as any);
    }
  }
};

  // gọi dữ liệu từ firebase trang quản lý vé
  const dispatch = useDispatch<Dispatch>();

  const goiGiaDinh = useSelector((state: RootState) => state.goiGiaDinh);
  const goiSuKien = useSelector((state: RootState) => state.goiSuKien);
  
  useEffect(() => {
    dispatch(fetchGoiGiaDinhDataFromFirebase() as any);
    dispatch(fetchGoiSuKienDataFromFirebase() as any);
  }, [dispatch]);
  
  const [filterOptions, setFilterOptions] = useState({
    fromDate: null,
    toDate: null,
    tinhTrang: null,
    congCheckin: [],
  });

    // Tạo state để lưu từ khóa tìm kiếm
    const [searchKeyword, setSearchKeyword] = useState<string>('');

    // Hàm xử lý tìm kiếm
    const handleSearch = (value: string) => {
      setSearchKeyword(value.toLowerCase()); // Chuyển đổi thành chữ thường và lưu từ khóa tìm kiếm
      console.log('Search value:', value);
    };

    
  // Sau khi dữ liệu đã được gọi từ Firebase, bạn có thể cập nhật state dataSource và filteredDataTK.
  // Sử dụng useSelector để lấy dữ liệu từ store và gán cho dataSource và filteredDataTK.
  const [selectedPackage, setSelectedPackage] = useState<string>('Gói gia đình');

  // Lựa chọn cột dữ liệu hiển thị trong bảng dựa vào loại gói đang chọn
  const columns = selectedPackage === 'Gói gia đình' ? columnsGoiGiaDinh : columnsGoiSuKien;

  const dataSource = selectedPackage === 'Gói gia đình' ? goiGiaDinh : goiSuKien;
  const filteredDataTK = dataSource.filter((TableDataItem) => {
  // Áp dụng các điều kiện lọc dữ liệu dựa trên giá trị từ Modal và gói dữ liệu đang được hiển thị
  if (filterOptions.tinhTrang && TableDataItem.tinhTrangSD) {
    if (TableDataItem.tinhTrangSD !== filterOptions.tinhTrang) {
      return false; // Không lấy các phần tử có trạng thái khác với tùy chọn lọc "Tình trạng sử dụng"
    }
  }

  if (filterOptions.fromDate && TableDataItem.ngaySD) {
    const ngaySD: Dayjs = dayjs(TableDataItem.ngaySD);
    if (ngaySD.isBefore(filterOptions.fromDate)) {
      return false; // Không lấy các phần tử có ngày sử dụng trước ngày bắt đầu lọc
    }
  }

  if (filterOptions.toDate && TableDataItem.ngayXuatVe) {
    const ngayXuatVe: Dayjs = dayjs(TableDataItem.ngayXuatVe);
    if (ngayXuatVe.isAfter(filterOptions.toDate)) {
      return false; // Không lấy các phần tử có ngày xuất vé sau ngày kết thúc lọc
    }
  }

  if (filterOptions.congCheckin.length > 0 && TableDataItem.congCheckin) {
    const congCheckinMatch = filterOptions.congCheckin.some((value) =>
      TableDataItem.congCheckin.includes(value)
    );
    if (!congCheckinMatch) {
      return false; // Không lấy các phần tử không chứa cổng check-in trong danh sách lọc
    }
  }

  // Kiểm tra nếu số vé hoặc cổng checkin chứa từ khóa tìm kiếm (không phân biệt chữ hoa, chữ thường)
  if (searchKeyword) {
    const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
    return (
      TableDataItem.bookingCode.toLowerCase().includes(lowerCaseSearchKeyword) ||
      TableDataItem.soVe.toLowerCase().includes(lowerCaseSearchKeyword) ||
      TableDataItem.tinhTrangSD.toLowerCase().includes(lowerCaseSearchKeyword) ||
      TableDataItem.congCheckin.toLowerCase().includes(lowerCaseSearchKeyword)
    );
  }

  // Nếu không có bất kỳ điều kiện lọc nào, trả về true để giữ lại tất cả các phần tử
  return true;
});

  // phân trang
  const [currentPageGoiGiaDinh, setCurrentPageGoiGiaDinh] = useState<number>(1);
  const [currentPageGoiSuKien, setCurrentPageGoiSuKien] = useState<number>(1);

  // Lựa chọn dữ liệu hiển thị trong bảng và trang hiện tại dựa vào loại gói đang chọn
  const currentPage = selectedPackage === 'Gói gia đình' ? currentPageGoiGiaDinh : currentPageGoiSuKien;
  const setCurrentPage = selectedPackage === 'Gói gia đình' ? setCurrentPageGoiGiaDinh : setCurrentPageGoiSuKien;

  const pageSize = 5; // Số dòng dữ liệu trên mỗi trang
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

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

// Hàm xử lý khi nút "Xuất file(.csv)" được nhấn
const handleExportCSV = () => {
    const dataToExport = paginatedData.map((item) => ({
      // Customize the mapping based on your table data
      'STT': item.STT,
      'Booking Code': item.bookingCode,
      'Số vé': item.soVe,
      'Tình trạng sử dụng': item.tinhTrangSD,
      'Ngày sử dụng': item.ngaySD,
      'Ngày xuất vé': item.ngayXuatVe,
      'Cổng check-in': item.congCheckin,
    }));
    exportAsCSV(dataToExport, 'danh_sach_ve.csv'); // Gọi hàm xuất file CSV
  };


  // Phân trang cho dữ liệu đã lọc
  const paginatedData = filteredDataTK.slice(startIndex, endIndex);

 // Kiểm tra xuất hiện nút ba chấm
 useEffect(() => {
  // Kiểm tra xem có ít nhất một gói nào có trạng thái "Chưa sử dụng" không
  const hasUnusedPackage = filteredDataTK.some((item) => item.tinhTrangSD === 'Chưa sử dụng');

  // Cập nhật giá trị cho biến trạng thái
  setIsUnusedPackage(hasUnusedPackage);
}, [filteredDataTK]);

// sự kiện modal lọc và chức năng lọc
// Add a state to track the status of "Select All" checkbox and disabled checkboxes
const [selectAllChecked, setSelectAllChecked] = useState(false);
const [otherCheckboxesDisabled, setOtherCheckboxesDisabled] = useState(false);

// Function to handle the "Select All" checkbox change event
const handleSelectAllChange = (e: any) => {
  const isChecked = e.target.checked;
  setSelectAllChecked(isChecked);
  setOtherCheckboxesDisabled(isChecked); // Disable other checkboxes when "Select All" is checked
};



// Khởi tạo fromDate và toDate ban đầu với giá trị null
const [fromDate, setFromDate] = useState<Dayjs | null>(null);
const [toDate, setToDate] = useState<Dayjs | null>(null);

// Các hàm xử lý thay đổi giá trị fromDate và toDate
const handleFromDateChange = (date: Dayjs | null) => {
  setFromDate(date);
};

const handleToDateChange = (date: Dayjs | null) => {
  setToDate(date);
};

const [congCheckin, setCongCheckin] = useState<string[]>([]); 

// vừa thêm
const [filteredData, setFilteredData] = useState<TableDataItemGoiGiaDinh[] | TableDataItemGoiSuKien[]>([]);

// Hàm thực hiện việc lọc dữ liệu
// Hàm xử lý lọc dữ liệu
const handleFilterData = () => {
  const filteredData = filteredDataTK.filter((TableDataItem) => {
    // Áp dụng các điều kiện lọc dữ liệu dựa trên giá trị từ Modal và gói dữ liệu đang được hiển thị
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

    // Kiểm tra nếu số vé hoặc cổng checkin chứa từ khóa tìm kiếm (không phân biệt chữ hoa, chữ thường)
    if (searchKeyword) {
      const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
      return (
        TableDataItem.bookingCode.toLowerCase().includes(lowerCaseSearchKeyword) ||
        TableDataItem.soVe.toLowerCase().includes(lowerCaseSearchKeyword) ||
        TableDataItem.tinhTrangSD.toLowerCase().includes(lowerCaseSearchKeyword) ||
        TableDataItem.congCheckin.toLowerCase().includes(lowerCaseSearchKeyword)
      );
    }

    return true;
  });

  // Lưu kết quả vào state 'filteredData'
  setFilteredData(filteredData);

  // Khi có dữ liệu đã lọc, bạn có thể làm gì đó với nó, ví dụ hiển thị lên UI.
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
  value={fromDate} // Sử dụng giá trị 'fromDate' ở đây
  onChange={handleFromDateChange}
  format="DD/MM/YYYY"
  style={{ marginLeft: '5px', marginRight: '30px' }}
/>
            <p style={{ fontWeight: 'bold', marginTop: '20px', fontSize: '15px' }}>Đến ngày:</p>
            <DatePicker
  value={toDate} // Sử dụng giá trị 'fromDate' ở đây
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
    handleFilterData(); // Gọi hàm xử lý lọc dữ liệu ở đây
    setVisible(false); // Đóng modal sau khi lọc
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
        total={dataSource.length}        onChange={setCurrentPage} // Sử dụng setState tương ứng với loại gói đang chọn
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
          onClick={handleSaveNewNgaySD} // Gọi hàm xử lý lưu ngày sử dụng mới khi nhấn nút "Lưu"
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
