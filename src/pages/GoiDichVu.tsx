import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { fetchDataFromFirebase, State as GoiDichVuState, addGoiDichVuToFirebase, updateGoiDichVuInFirebase, updateGoiDichVu } from '../store/goiDichVuSlice';
import { Button, Modal, Tag, DatePicker, Checkbox, Input, Select, Table, Pagination, Space, TimePicker } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import SearchComponent from '../components/SearchComponent';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
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

// Định nghĩa màu tương ứng cho từng giá trị "tinhTrang"
const tinhTrangColors: { [key: string]: string } = {
  'Tắt': 'red',
  'Đang áp dụng': 'green', 
};

type TableDataItemGoiDichVu = {
  key: string;
  STT: string;
  maGoi: string;
  tenGoi: string;
  ngayApDung: string;
  tgApDung: string;
  ngayHetHan: string;
  tgHetHan: string;
  giaVe: string;
  giaCombo: string;
  tinhTrang: string;
};

interface RootState {
  goiDichVu: GoiDichVuState;
}

function GoiDichVu() {
  // cập nhật các state trong modal
  const [selectedItem, setSelectedItem] = useState<TableDataItemGoiDichVu | null>(null);
  const [DateApDung, setDateApDung] = useState<Dayjs | null>(null);
  const [DateHetHan, setDateHetHan] = useState<Dayjs | null>(null);
  const [TimeApDung, setTimeApDung] = useState<Dayjs | null>(null);
  const [TimeHetHan, setTimeHetHan] = useState<Dayjs | null>(null);
  const [selectedTinhTrang, setSelectedTinhTrang] = useState<string>("Đang áp dụng");

  // Thêm state và hàm lấy giá trị số vé
const [soVe, setSoVe] = useState<number | null>(null);
const handleChangeSoVe = (value: string | number | null) => {
  if (typeof value === 'number') {
    setSoVe(value);
  }
};

  ///
  //sự kiện khi cập nhật modal
  const handleDateApDungChange = (date: Dayjs | null) => {
    if (date) {
      setDateApDung(date);
    }
  }
  const handleDateHetHanChange = (date: Dayjs | null) => {
    if (date) {
      setDateHetHan(date);
    }
  };

  const handleTimeApDungChange = (time: Dayjs | null) => {
    if (time) {
      setTimeApDung(time);
    }
  };

  const handleTimeHetHanChange = (time: Dayjs | null) => {
    if (time) {
      setTimeHetHan(time);
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedItem((prevSelectedItem) => ({
      ...prevSelectedItem,
      [name]: value,
    }) as TableDataItemGoiDichVu); // Thêm "as TableDataItemGoiDichVu" để chỉ định kiểu dữ liệu của prevSelectedItem
  };

  const handleChangeSelectTinhTrang = (value: string) => {
    setSelectedTinhTrang(value); // Cập nhật giá trị của selectedTinhTrang
  };

  ///
  const dispatch = useDispatch<Dispatch<any>>();
  const goiDichVu = useSelector((state: RootState) => state.goiDichVu);

  useEffect(() => {
    dispatch(fetchDataFromFirebase());
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

  // tách 2 modal làm riêng lẻ
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddModalOk = () => {
    setIsAddModalOpen(false);
  };

  const handleAddModalCancel = () => {
    setIsAddModalOpen(false);
  };

  // Trước khi mở modal cập nhật, xác định đối tượng cần cập nhật bằng hàm showUpdateModal
  const showUpdateModal = (item: TableDataItemGoiDichVu) => {
    setSelectedItem(item); // Lưu đối tượng cần cập nhật vào state selectedItem
    setIsUpdateModalOpen(true); // Mở modal cập nhật
  };

  const handleUpdateModalOk = () => {
    // Xử lý logic cập nhật dữ liệu
    console.log('Đã lưu cập nhật:', selectedItem);
    setIsUpdateModalOpen(false);
  };

  // cập nhật
  const handleUpdateGoiDichVu = () => {
    if (selectedItem) {
      const updatedGoiDichVu: TableDataItemGoiDichVu = {
        ...selectedItem,
        ngayApDung: DateApDung ? DateApDung.format('DD/MM/YYYY') : '',
        tgApDung: TimeApDung ? TimeApDung.format('HH:mm') : '',
        ngayHetHan: DateHetHan ? DateHetHan.format('DD/MM/YYYY') : '',
        tgHetHan: TimeHetHan ? TimeHetHan.format('HH:mm') : '',
        tinhTrang: selectedTinhTrang
      };
  
      dispatch(updateGoiDichVuInFirebase(updatedGoiDichVu) as any); // Dispatch the update action
      setIsUpdateModalOpen(false);
  
      // Sau khi cập nhật thành công, cập nhật lại danh sách gói dịch vụ
      dispatch(fetchDataFromFirebase());
    }
  };
  
  

  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 3; // Số dòng dữ liệu trên mỗi trang

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = goiDichVu.slice(startIndex, endIndex);


  const handleUpdateModalCancel = () => {
    setIsUpdateModalOpen(false);
  };

  const handleChangePage = (page: number) => {
    // Xử lý thay đổi trang
    console.log('Trang hiện tại:', page);
  };

  const handleAddGoiDichVu = () => {
    // Chắc chắn rằng đã cập nhật giá trị selectedTinhTrang
    setSelectedTinhTrang(selectedTinhTrang);
      // Tìm gói có STT lớn nhất trong dữ liệu hiện tại
  const maxSTT = goiDichVu.reduce((max, item) => Math.max(max, parseInt(item.STT)), 0);

  // Tạo giá trị STT mới cho gói mới
  const newSTT = (maxSTT + 1).toString();

    const newGoiDichVu: TableDataItemGoiDichVu = {
      key: '',
      STT: newSTT, // Gán STT mới cho gói mới
      maGoi: selectedItem?.maGoi || '',
      tenGoi: selectedItem?.tenGoi || '',
      ngayApDung: DateApDung ? DateApDung.format('DD/MM/YYYY') : '',
      tgApDung: TimeApDung ? TimeApDung.format('HH:mm') : '',
      ngayHetHan: DateHetHan ? DateHetHan.format('DD/MM/YYYY') : '',
      tgHetHan: TimeHetHan ? TimeHetHan.format('HH:mm') : '',
      giaVe: selectedItem?.giaVe || '',
      giaCombo: selectedItem?.giaCombo || '',
      tinhTrang: selectedTinhTrang, // Cập nhật giá trị tình trạng từ state selectedTinhTrang
    };
  
    dispatch(addGoiDichVuToFirebase(newGoiDichVu) as any);
  
    // Sau khi thêm gói vé thành công, cập nhật lại trang hiện tại
    const totalPages = Math.ceil((goiDichVu.length + 1) / pageSize);
    setCurrentPage(totalPages);
  
    console.log('Đang thêm gói vé...');
    setSelectedItem(newGoiDichVu);
  };
  
  // Hàm xử lý khi nút "Xuất file(.csv)" được nhấn
const handleExportCSV = () => {
  const dataToExport = paginatedData.map((item) => ({
    'STT': item.STT,
    'Mã gói': item.maGoi,
    'Tên gói': item.tenGoi,
    'Ngày áp dụng': item.ngayApDung,
    'Giờ áp dụng': item.tgApDung,
    'Ngày hết hạn': item.ngayHetHan,
    'Giờ hết hạn': item.tgHetHan,
    'Giá vé': item.giaVe,
    'Giá Combo': item.giaCombo,
    'Tình trạng':item.tinhTrang
  }));
  exportAsCSV(dataToExport, 'danh_sach_ve.csv'); // Gọi hàm xuất file CSV
};

// Tạo state để lưu từ khóa tìm kiếm
const [searchKeyword, setSearchKeyword] = useState<string>('');

// Hàm xử lý tìm kiếm
const handleSearch = (value: string) => {
  setSearchKeyword(value.toLowerCase()); // Chuyển đổi thành chữ thường và lưu từ khóa tìm kiếm
  console.log('Search value:', value);
};

// Hàm lọc dữ liệu theo từ khóa tìm kiếm
const filteredData = goiDichVu.filter((item) => {
  const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
  // Kiểm tra nếu tên sự kiện hoặc cổng checkin chứa từ khóa tìm kiếm (không phân biệt chữ hoa, chữ thường)
  return (
    item.maGoi.toLowerCase().includes(lowerCaseSearchKeyword) ||
    item.tenGoi.toLowerCase().includes(lowerCaseSearchKeyword) ||
    item.tinhTrang.toLowerCase().includes(lowerCaseSearchKeyword)
  );
});

// Phân trang cho dữ liệu đã lọc
const paginatedFilteredData = filteredData.slice(startIndex, endIndex);

  return (
    <div style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', width: '1180px', height: '580px' }}>
      <h1>Danh Sách Vé</h1>

     {/* Tìm kiếm */}
     <SearchComponent
        placeholder='Tìm kiếm ở đây...'
        size='large'
        onSearch={handleSearch} // Sử dụng hàm xử lý tìm kiếm mới
        style={{ width: '350px', marginLeft: '0px', marginRight: '0px' }}
      />

      {/* Nút xuất file và nút modal để thêm gói vé */}
      <div className="" style={{ float: 'right' }}>
           {/* Nút "Xuất file(.csv)" */}
    <Button size={'large'} style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'orange' }} onClick={handleExportCSV}>
  Xuất file(.csv)
</Button>
        <Button type="primary" onClick={showAddModal} style={{ backgroundColor: 'orange', color: 'white', fontWeight: '500', marginLeft: '10px', marginBottom: '50px' }} size='large'>
          Thêm gói vé
        </Button>
      </div>

      <Modal title="Thêm Gói Vé Mới" visible={isAddModalOpen}
        onCancel={handleAddModalCancel}
        footer={null}  width={1000} style={{height:580}}>
        {/* Nội dung modal thêm gói vé */}
        <h1 style={{ textAlign: 'center' }}>Thêm Gói Vé Mới</h1>
        <div className="" style={{display:'flex'}}>
        <p className='label' style={{marginRight:'10px'}}>Mã gói vé</p>
       <Input
  placeholder="Nhập mã gói vé"
  style={{ width: '20%' }}
  size='large'
  name="maGoi" // Thêm props name cho trường nhập liệu
  value={selectedItem?.maGoi} // Sử dụng giá trị từ state selectedItem
  onChange={handleChangeInput} // Gọi hàm handleChangeInput khi thay đổi giá trị
/>
        {/* tên gói vé */}
        <p className='label' style={{marginLeft:'30px', marginRight:'10px'}}>Tên gói vé</p>
       <Input
  placeholder="Nhập tên gói vé"
  style={{ width: '50%' }}
  size='large'
  name="tenGoi" // Thêm props name cho trường nhập liệu
  value={selectedItem?.tenGoi} // Sử dụng giá trị từ state selectedItem
  onChange={handleChangeInput} // Gọi hàm handleChangeInput khi thay đổi giá trị
/>
</div>
<div style={{ display: 'inline-flex', marginTop: '20px' }}>
  <p className='label'>Ngày áp dụng</p> <br />
  <div style={{ display: 'flex', marginLeft: '10px' }}>
    <DatePicker
      style={{ marginRight: '10px' }}
      value={DateApDung}
      onChange={handleDateApDungChange}
      format="DD/MM/YYYY"
    />
    <TimePicker
      style={{ marginRight: '20px' }}
      value={TimeApDung}
      onChange={handleTimeApDungChange}
    />
  </div>
  <p className='label'>Ngày hết hạn</p>
  <div style={{ display: 'flex', marginLeft: '10px' }}>
    <DatePicker
      style={{ marginRight: '10px' }}
      value={DateHetHan}
      onChange={handleDateHetHanChange}
      format="DD/MM/YYYY"
    />
    <TimePicker
      value={TimeHetHan}
      onChange={handleTimeHetHanChange}
    />
  </div>
</div>

        {/* giá vé áp dụng */}
        <p className='label'>Giá vé áp dụng</p>
<div style={{ display: 'flex' }}>
  <Checkbox>
    <p style={{ marginBottom: '0px' }}>Vé lẻ (vnđ/vé) với giá</p>
  </Checkbox>
  <Input
    placeholder="Giá vé"
    type='number'
    style={{ width: '25%', marginRight: '10px' }}
    name="giaVe" // Thêm props name cho trường nhập liệu
    value={selectedItem?.giaVe} // Sử dụng giá trị từ state selectedItem
    onChange={handleChangeInput} // Gọi hàm handleChangeInput khi thay đổi giá trị
  />
  <p>/vé</p>
</div>
<div style={{ display: 'flex', marginTop: '20px' }}>
  <Checkbox>
    <p style={{ marginBottom: '0px' }}>Combo vé với giá</p>
  </Checkbox>
  <Input
    placeholder="Giá vé"
    type='number'
    style={{ width: '25%', marginRight: '10px' }}
    name="giaCombo" // Thêm props name cho trường nhập liệu
    value={selectedItem?.giaCombo} // Sử dụng giá trị từ state selectedItem
    onChange={handleChangeInput} // Gọi hàm handleChangeInput khi thay đổi giá trị
  />
  <p> / </p>
  <Input
    placeholder="Giá vé"
    type='number'
 value={soVe ?? ''} // Sử dụng toán tử ?? để gán giá trị mặc định ''
  onChange={(e) => handleChangeSoVe(parseInt(e.target.value))}
    style={{ width: '25%', marginRight: '10px', marginLeft: '10px' }}
  />
  <p>vé</p>
</div>
        {/* tình trạng */}
        <p className='label'>Tình trạng</p>
<Space wrap>
<Select
  value={selectedTinhTrang}
  style={{ width: 180, marginTop: '0px', float:'left' }}
  onChange={handleChangeSelectTinhTrang}
  options={[
    { value: 'Đang áp dụng', label: 'Đang áp dụng' },
    { value: 'Tắt', label: 'Tắt' },
  ]}
/>
</Space>
<br />
  <p style={{ fontStyle: 'italic'}}><span style={{color:'red'}}>*</span> là thông tin bắt buộc</p>
<br />
<Button
  type="primary"
  onClick={handleAddGoiDichVu}
  style={{ backgroundColor: 'orange', color: 'white', fontWeight: '500', marginLeft:'450px' }}
  size='large'
>
  Thêm
</Button>
      </Modal>

      <Table
        dataSource={paginatedFilteredData} 
        pagination={false} // Ẩn phân trang mặc định
        columns={[
          // Các cột dữ liệu
          {
            title: 'STT',
            dataIndex: 'STT',
            key: 'STT',
          },
          {
            title: 'Mã gói',
            dataIndex: 'maGoi',
            key: 'maGoi',
          },
          {
            title: 'Tên gói',
            dataIndex: 'tenGoi',
            key: 'tenGoi',
          },
          {
            title: 'Ngày áp dụng',
            dataIndex: 'ngayApDung',
            key: 'ngayApDung',
          },
          {
            title: 'Giờ áp dụng',
            dataIndex: 'tgApDung',
            key: 'tgApDung',

          },
          {
            title: 'Ngày hết hạn',
            dataIndex: 'ngayHetHan',
            key: 'ngayHetHan',
          },
          {
            title: 'Giờ hết hạn',
            dataIndex: 'tgHetHan',
            key: 'tgHetHan',

          },
          {
            title: 'Giá vé (VNĐ/vé)',
            dataIndex: 'giaVe',
            key: 'giaVe',
          },
          {
            title: 'Giá Combo (VNĐ/combo)',
            dataIndex: 'giaCombo',
            key: 'giaCombo',
          },
          {
            title: 'Tình trạng',
            dataIndex: 'tinhTrang',
            key: 'tinhTrang',
            render: (tinhTrang: string) => (
              <Tag color={tinhTrangColors[tinhTrang] || 'default'}>
                {tinhTrang}
              </Tag>
            ),
          },
          {
            title: '',
            key: 'action',
            render: (text, record) => (
              <Button style={{ color: 'orange', fontWeight: '500', border: '1px solid orange' }} onClick={() => showUpdateModal(record)}>
                <FormOutlined />
                Cập nhật
              </Button>
            ),
          },
        ]}

      />

      {/* Phân trang */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={goiDichVu.length}
        onChange={onPageChange}
        style={{ marginTop: '10px', textAlign: 'center' }}
      />

<Modal   title="Cập nhật Gói Vé"
  visible={isUpdateModalOpen} // Sửa đổi thuộc tính visible thành isUpdateModalOpen
  onCancel={handleUpdateModalCancel}
  footer={null}
  width={1000} >
        {selectedItem && (
          <div>
            <h1 style={{ textAlign: 'center' }}>Cập nhật Gói Vé</h1>
            <div style={{ display: 'flex' }}>
              <p className='label' style={{ marginRight: '10px' }}>Mã gói</p>
              <Input
                placeholder="Mã gói"
                style={{ width: '20%' }}
                size='large'
                name="maGoi"
                value={selectedItem.maGoi}
                onChange={handleChangeInput} // Gọi hàm handleChangeInput khi thay đổi giá trị
              />
              <p className='label' style={{ marginLeft: '20px', marginRight: '10px' }}>Tên sự kiện</p>
              <Input
                placeholder="Tên gói"
                style={{ width: '50%' }}
                size='large'
                name="tenGoi"
                value={selectedItem.tenGoi}
                onChange={handleChangeInput} // Gọi hàm handleChangeInput khi thay đổi giá trị
              />
            </div>
            {/* ngày áp dụng đến ngày hết hạn */}
            <div style={{ display: 'inline-flex', marginTop: '20px' }}>
              <p className='label'>Ngày áp dụng</p> <br />
              <div style={{ display: 'flex', marginLeft: '10px' }}>
                <DatePicker style={{ marginRight: '10px' }} value={DateApDung} onChange={handleDateApDungChange} format="DD/MM/YYYY" /> <TimePicker style={{ marginRight: '20px' }} value={TimeApDung} onChange={handleTimeApDungChange} />
              </div>
              <p className='label'>Ngày hết hạn</p>
              <div style={{ display: 'flex', marginLeft: '10px' }}>
                <DatePicker style={{ marginRight: '10px' }} value={DateHetHan} onChange={handleDateHetHanChange} format="DD/MM/YYYY" /> <TimePicker style={{ marginRight: '20px' }} value={TimeHetHan} onChange={handleTimeHetHanChange} />
              </div>
            </div>

            {/* giá vé áp dụng */}
            <p className='label'>Giá vé áp dụng</p>
            <div style={{ display: 'flex' }}>
              <Checkbox ><p style={{ marginBottom: '0px' }}>Vé lẻ (vnđ/vé) với giá</p></Checkbox>
              <Input placeholder="Giá vé" type='number' style={{ width: '25%', marginRight: '10px' }} 
               name="giaVe"
               value={selectedItem.giaVe}
               onChange={handleChangeInput} />
              <p>/vé</p>
            </div>
            <div style={{ display: 'flex', marginTop: '20px' }}>
              <Checkbox ><p style={{ marginBottom: '0px' }}>Combo vé với giá</p></Checkbox>
              <Input placeholder="Giá vé" type='number' style={{ width: '25%', marginRight: '10px' }} 
               name="giaCombo"
               value={selectedItem.giaCombo}
               onChange={handleChangeInput}
               />
              <p> / </p> <Input placeholder="Số vé" type='number' style={{ width: '25%', marginRight: '10px', marginLeft: '10px' }}/>
              <p>vé</p>
            </div>

            {/* tình trạng */}
            <p className='label'>Tình trạng</p>
            <Space wrap>
              <Select
                defaultValue="Đang áp dụng"
                style={{ width: 180, marginTop: '0px', float:'left' }}
                onChange={handleChangeSelectTinhTrang}
                options={[
                  { value: 'Đang áp dụng', label: 'Đang áp dụng' },
                  { value: 'Tắt', label: 'Tắt' },
                ]}

              />
               </Space>
               <br />
              <p style={{ fontStyle: 'italic', float: 'left' }}><span style={{color:'red'}}>*</span> là thông tin bắt buộc</p>
           

          </div>
        )}
 <Button
    type="primary"
    onClick={handleUpdateGoiDichVu}
    style={{
      backgroundColor: 'orange',
      color: 'white',
      fontWeight: '500',
      marginTop: '50px',
      marginLeft: '300px',
    }}
    size="large"
  >
    Lưu
  </Button>
      </Modal>
    </div>
  );
}

export default GoiDichVu;
