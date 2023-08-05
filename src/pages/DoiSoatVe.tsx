import { Button, Table, Pagination, Radio, DatePicker, Select } from 'antd';
import { useState, useEffect } from 'react';
import SearchComponent from '../components/SearchComponent';
import { Dayjs } from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDataFromFirebase, State as DoiSoatVeState } from '../store/doiSoatVeSlice';
import { Dispatch } from 'redux';
import type { RadioChangeEvent } from 'antd';
import Papa from 'papaparse';

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
  doiSoatVe: DoiSoatVeState;
}

const columnsDoiSoatVe = [
  { title: 'STT', dataIndex: 'STT', key: 'STT' },
  { title: 'Số vé', dataIndex: 'soVe', key: 'soVe' },
  { title: 'Tên sự kiện', dataIndex: 'tenSK', key: 'tenSK', flex: 1 },
  { title: 'Ngày sử dụng', dataIndex: 'ngaySD', key: 'ngaySD' },
  { title: 'Tên loại vé', dataIndex: 'tenLoaiVe', key: 'tenLoaiVe', flex: 1 },
  { title: 'Cổng check-in', dataIndex: 'congCheckin', key: 'congCheckin' },
  { title: '', dataIndex: 'trangThai', key: 'trangThai', flex: 1,
  render: (text:any, record:any) => (
    <span style={{ color: record.textColor || 'inherit' }}>{text}</span>
  ), },
];

function filterData(
  data: any[],
  searchKeyword: string,
  selectedEvent: string | null,
  selectedTinhTrangDS: number,
  fromDate: Dayjs | null,
  toDate: Dayjs | null
) {
  return data.filter((item) => {
    const isMatchEvent = selectedEvent === 'Tất cả' || !selectedEvent || item.tenSK === selectedEvent;
    const isMatchTinhTrangDS =
      selectedTinhTrangDS === 1
        ? true
        : selectedTinhTrangDS === 2 && item.trangThai === 'Đã đối soát'
        ? true
        : selectedTinhTrangDS === 3 && item.trangThai === 'Chưa đối soát';

    // Chuyển đổi fromDate và toDate sang dạng chuỗi 'DD/MM/YYYY'
    const fromDateStr = fromDate?.format('DD/MM/YYYY');
    const toDateStr = toDate?.format('DD/MM/YYYY');

    // Nếu ngày trong khoảng (fromDate, toDate) của item nằm trong khoảng (fromDate, toDate) đã chọn, thì return true, ngược lại return false
    const isMatchDate =
      (!fromDateStr || item.ngaySD >= fromDateStr) && (!toDateStr || item.ngaySD <= toDateStr);

    // Kiểm tra nếu tên sự kiện hoặc cổng checkin chứa từ khóa tìm kiếm (không phân biệt chữ hoa, chữ thường)
    const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
    const isMatchSearchKeyword =
      item.soVe.toLowerCase().includes(lowerCaseSearchKeyword) ||
      item.tenSK.toLowerCase().includes(lowerCaseSearchKeyword) ||
      item.congCheckin.toLowerCase().includes(lowerCaseSearchKeyword);

    return isMatchEvent && isMatchTinhTrangDS && isMatchDate && isMatchSearchKeyword;
  });
}

function DoiSoatVe() {
  const dispatch = useDispatch<Dispatch>();
  const doiSoatVe = useSelector((state: RootState) => state.doiSoatVe);
  const [isChotDoiSoat, setIsChotDoiSoat] = useState(false); // Thêm trạng thái
  
  // Bạn sẽ cần thêm một state để lưu trữ dữ liệu đã lọc
  const [filteredDataLoc, setFilteredDataLoc] = useState(doiSoatVe);
  const [searchKeywordTK, setSearchKeywordTK] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedTinhTrangDS, setSelectedTinhTrangDS] = useState<number>(1);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Sau khi nhận dữ liệu từ Firebase, lọc và cập nhật filteredDataLoc
  useEffect(() => {
    dispatch(fetchDataFromFirebase() as any); // ép kiểu thành any
  }, [dispatch, doiSoatVe]);

  // Hàm lọc dữ liệu theo từ khóa tìm kiếm và các điều kiện lọc
  const handleFilterData = () => {
    const filteredData = filterData(doiSoatVe, searchKeywordTK, selectedEvent, selectedTinhTrangDS, fromDate, toDate);
    setFilteredDataLoc(filteredData);
    setCurrentPage(1);
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchKeywordTK(value.toLowerCase());
    handleFilterData();
  };

  // Hàm xử lý thay đổi giá trị trong Select
  const handleChangeEvent = (value: string) => {
    setSelectedEvent(value);
    handleFilterData();
  };

  // Hàm xử lý thay đổi giá trị trong Radio
  const handleChangeTinhTrangDS = (e: RadioChangeEvent) => {
    setSelectedTinhTrangDS(e.target.value);
    handleFilterData();
  };

  // Hàm xử lý thay đổi giá trị trong DatePicker
  const handleChangeFromDate = (date: Dayjs | null) => {
    setFromDate(date);
    handleFilterData();
  };

  // Hàm xử lý thay đổi giá trị trong DatePicker
  const handleChangeToDate = (date: Dayjs | null) => {
    setToDate(date);
    handleFilterData();
  };

// Xử lý xuất dữ liệu ra file CSV khi người dùng click vào nút "Xuất CSV"
const handleExportCSV = () => {
  // Tạo danh sách các tên cột
  const columnNames = [
    'STT',
    'Số vé',
    'Tên sự kiện',
    'Ngày sử dụng',
    'Tên loại vé',
    'Cổng check-in',
    '',
  ];

  // Sử dụng dữ liệu từ Redux store trực tiếp
  const dataWithoutKeysAndTextColor = doiSoatVe.map(({ key, textColor, ...rest }) => rest);

  // Tạo dữ liệu cho file CSV bằng cách tạo mảng dữ liệu mới với các tên cột và dữ liệu tương ứng
  const dataWithColumnNames = dataWithoutKeysAndTextColor.map((item) => [
    item.STT,
    item.soVe,
    item.tenSK,
    item.ngaySD,
    item.tenLoaiVe,
    item.congCheckin,
    item.trangThai,
  ]);

  // Thêm danh sách tên cột vào đầu mảng dữ liệu
  dataWithColumnNames.unshift(columnNames);

  exportAsCSV(dataWithColumnNames, 'doi-soat-ve.csv');
  setIsChotDoiSoat(false);
  setIsChotDoiSoat(true);
};

  // Tính toán chỉ số bắt đầu và kết thúc của dữ liệu hiển thị trên trang hiện tại
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Lấy dữ liệu hiển thị trên trang hiện tại từ mảng filteredDataLoc
  const currentPageData = filteredDataLoc.slice(startIndex, endIndex);


  // Hàm xử lý khi trang được thay đổi trong phân trang
const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Danh sách tên sự kiện để hiển thị trong Select
  const eventNames = Array.from(new Set(doiSoatVe.map((item) => item.tenSK)));
  const eventOptions = [{ value: 'Tất cả', label: 'Tất cả' }, ...eventNames.map((eventName) => ({ value: eventName, label: eventName }))];
  
  const handleChotDoiSoat = () => {
    const updatedData = filteredDataLoc.map(item => {
      if (item.trangThai === 'Chưa đối soát') {
        return { ...item, trangThai: 'Đã đối soát', textColor: 'red' };
      }
      return item;
    });

    const allAreDaDoiSoat = updatedData.every(item => item.trangThai === 'Đã đối soát');

    if (allAreDaDoiSoat) {
      const allDaDoiSoatData = updatedData.map(item => ({
        ...item,
        textColor: 'red'
      }));
      setFilteredDataLoc(allDaDoiSoatData);
    } else {
      setFilteredDataLoc(updatedData);
    }

    setIsChotDoiSoat(true); // Đã chốt đối soát
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Phần hiển thị danh sách vé */}
      <div
        className=""
        style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', paddingBottom: '50px', width: '800px', height: '540px' }}
      >
        <h1>Đối Soát Vé</h1>
  
        {/* Tìm kiếm */}
        <SearchComponent
          placeholder='Tìm bằng số vé...'
          size='large'
          onSearch={handleSearch} // Sử dụng hàm xử lý tìm kiếm mới
          style={{ width: '350px', marginLeft: '0px', marginRight: '0px' }}
        />
  {/* Nút "Xuất file(.csv)" */}
  <Button
          size={'large'}
          style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'white', backgroundColor: 'orange', float: 'right', display: isChotDoiSoat ? 'none' : 'block' }}
          onClick={handleChotDoiSoat}
        >
          Chốt đối soát
        </Button>
        <Button
          size={'large'}
          style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'orange', float: 'right', display: isChotDoiSoat ? 'block' : 'none' }}
          onClick={handleExportCSV}
        >
          Xuất file(.csv)
        </Button>

        {/* Bảng dữ liệu danh sách vé */}
        <Table dataSource={currentPageData} columns={columnsDoiSoatVe} pagination={false} style={{ marginTop: '30px' }} />
        {/* Phân trang */}
        <Pagination current={currentPage} pageSize={pageSize} total={filteredDataLoc.length} onChange={onPageChange} style={{ marginTop: '10px', textAlign: 'center',borderColor: 'orange'}} />
      </div>
  
      {/* Phần lọc vé */}
      <div
        className=""
        style={{ backgroundColor: '#FFFFFF', marginLeft: '20px', padding: '10px', width: '350px', height: '580px' }}
      >
        <h1>Lọc vé</h1>
  
        {/* Dropdown chọn sự kiện */}
        <Select
          defaultValue={selectedEvent || undefined}
          style={{ width: 250 }}
          onChange={handleChangeEvent}
          options={eventOptions}
        />
  
        {/* Tình trạng đối soát */}
        <div style={{ display: 'flex' }}>
          <p className='label' style={{ float: 'left' }}>Tình trạng đối soát</p>
          <Radio.Group onChange={handleChangeTinhTrangDS} value={selectedTinhTrangDS} style={{ float: 'right', marginLeft: '20px', marginTop: '20px' }}>
            <Radio value={1}>Tất cả</Radio> <br />
            <Radio value={2}>Đã đối soát</Radio> <br />
            <Radio value={3}>Chưa đối soát</Radio> <br />
          </Radio.Group>
          <br />
        </div>
  
        {/* Loại vé */}
        <p className='label'>Loại vé:  <span style={{ marginLeft: '50px', fontWeight: 450 }}>Vé cổng</span></p>
  
        {/* Từ ngày và đến ngày */}
        <div style={{ display: 'flex' }}>
          <p className='label'>Từ ngày: </p>
          <DatePicker value={fromDate} onChange={handleChangeFromDate} format="DD/MM/YYYY" style={{ marginLeft: '30px' }} />
        </div>
        <div style={{ display: 'flex', marginTop: '20px' }}>
          <p className='label'>Đến ngày:</p>
          <DatePicker value={toDate} onChange={handleChangeToDate} format="DD/MM/YYYY" style={{ marginLeft: '20px' }} />
        </div>
        {/* Nút lọc */}
        <Button
          size={'large'}
          style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'orange', marginLeft: '150px', marginTop: '50px' }}
          onClick={handleFilterData}
        >
          Lọc
        </Button>
      </div>
    </div>
  );
}

export default DoiSoatVe;
