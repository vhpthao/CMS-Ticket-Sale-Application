import React, { useState } from 'react';
import { DatePicker, Table, Tag, TimePicker, Input, Button, Modal, Checkbox, Select, Space } from 'antd';
import SearchComponent from '../components/SearchComponent';
import { FormOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.locale('vi');
dayjs.extend(localizedFormat);

// Dữ liệu giả của bảng
const data = [
  {
    key: '1',
    STT: '1',
    maGoi: 'PT2003',
    tenGoi: 'Gói gia đình',
    ngayApDung: '25/08/2023',
    gioApDung: '09:00',
    ngayHetHan: '25/08/2023',
    gioHetHan: '18:00',
    giaVe: '90.000 VNĐ',
    giaCombo: '360.000 VNĐ/ 4 vé',
    tinhTrang: ['● Đang áp dụng'],
  },
  {
    key: '2',
    STT: '2',
    maGoi: 'PT2005',
    tenGoi: 'Gói cá nhân',
    ngayApDung: '25/08/2023',
    gioApDung: '09:00',
    ngayHetHan: '25/08/2023',
    gioHetHan: '18:00',
    giaVe: '50.000 VNĐ',
    giaCombo: '',
    tinhTrang: ['● Tắt'],
  },
];

const pageSize = 10; // Số dòng dữ liệu hiển thị trên mỗi trang

function GoiDichVu() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const showAddModal = () => {
    setIsModalOpen(true);
  };

  const handleAddModalOk = () => {
    setIsModalOpen(false);
  };

  const handleAddModalCancel = () => {
    setIsModalOpen(false);
  };

  const showUpdateModal = (item: any) => {
    setSelectedItem(item);
    setIsUpdateModalOpen(true);
    console.log('Nút cập nhật đã được nhấn!');
  };

  const handleUpdateModalOk = () => {
    // Xử lý logic cập nhật dữ liệu
    console.log('Đã lưu cập nhật:', selectedItem);
    setIsUpdateModalOpen(false);
  };

  const handleUpdateModalCancel = () => {
    setIsUpdateModalOpen(false);
  };

  const handleChangeSelectTinhTrang = (value: string) => {
    console.log(`selected ${value}`);
  };

  const handleChangePage = (page: number) => {
    // Xử lý thay đổi trang
    console.log('Trang hiện tại:', page);
  };

  // Thiết lập định dạng theo ngày tháng năm
  // Ngày áp dụng
  const [DateApDung, setDateApDung] = useState<Dayjs | null>(null);

  const handleDateApDungChange = (date: Dayjs | null, dateString: string) => {
    setDateApDung(date);
    // Thực hiện các xử lý khác tại đây
  };

  // Ngày hết hạn
  const [DateHetHan, setDateHetHan] = useState<Dayjs | null>(null);

  const handleDateHetHanChange = (date: Dayjs | null, dateString: string) => {
    setDateHetHan(date);
    // Thực hiện các xử lý khác tại đây
  };

  // Giờ áp dụng
  const [TimeApDung, setTimeApDung] = useState<Dayjs | null>(null);

  const handleTimeApDungChange = (time: Dayjs | null, timeString: string) => {
    setTimeApDung(time);
    // Thực hiện các xử lý khác tại đây
  };

  // Giờ hết hạn
  const [TimeHetHan, setTimeHetHan] = useState<Dayjs | null>(null);

  const handleTimeHetHanChange = (time: Dayjs | null, timeString: string) => {
    setTimeHetHan(time);
    // Thực hiện các xử lý khác tại đây
  };

  // Sự kiện của bảng
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ marginLeft: '10px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '7px', width: '1180px', height: '560px' }}>
      <h1>Danh Sách Gói Vé</h1>
      {/* Tìm kiếm */}
      <SearchComponent
        placeholder='Tìm kiếm ở đây...'
        size='large'
        onSearch={(value: string) => {
          console.log('Search value:', value);
        }}
        style={{ width: '350px', marginLeft: '0px', marginRight: '300px' }}
      />
      {/* Nút xuất file và nút modal để thêm gói vé */}
      <div className="" style={{ float: 'right' }}>
        <Button size={'large'} style={{ border: '1px solid rgb(255, 202, 8)', fontWeight: '500', color: 'orange' }}>Xuất file(.csv)</Button>
        <Button type="primary" onClick={showAddModal} style={{ backgroundColor: 'orange', color: 'white', fontWeight: '500', marginLeft: '10px', marginBottom: '50px' }} size='large'>
          Thêm gói vé
        </Button>
      </div>
      <Modal title="Thêm Gói Vé Mới" visible={isModalOpen} onOk={handleAddModalOk} onCancel={handleAddModalCancel} width={1000}>
        {/* Nội dung modal thêm gói vé */}
        <h1 style={{ textAlign: 'center' }}>Thêm Gói Vé Mới</h1>
        {/* tên gói vé */}
        <p className='label'>Tên gói vé</p>
        <Input placeholder="Nhập tên gói vé" style={{ width: '50%' }} size='large' />

        {/* ngày áp dụng đến ngày hết hạn */}
        <div style={{ display: 'inline-flex', marginTop: '20px' }}>
          <p className='label'>Ngày áp dụng</p> <br />
          <div style={{ display: 'flex', marginLeft: '10px' }}>
            <DatePicker style={{ marginRight: '10px' }} value={DateApDung} onChange={handleDateApDungChange} format="DD/MM/YYYY" /> <TimePicker style={{ marginRight: '20px' }} />
          </div>
          <p className='label'>Ngày hết hạn</p>
          <div style={{ display: 'flex', marginLeft: '10px' }}>
            <DatePicker style={{ marginRight: '10px' }} value={DateHetHan} onChange={handleDateHetHanChange} format="DD/MM/YYYY" /> <TimePicker />
          </div>
        </div>

        {/* giá vé áp dụng */}
        <p className='label'>Giá vé áp dụng</p>
        <div style={{ display: 'flex' }}>
          <Checkbox ><p style={{ marginBottom: '0px' }}>Vé lẻ (vnđ/vé) với giá</p></Checkbox>
          <Input placeholder="Giá vé" type='number' style={{ width: '25%', marginRight: '10px' }} />
          <p>/vé</p>
        </div>
        <div style={{ display: 'flex', marginTop: '20px' }}>
          <Checkbox ><p style={{ marginBottom: '0px' }}>Combo vé với giá</p></Checkbox>
          <Input placeholder="Giá vé" type='number' style={{ width: '25%', marginRight: '10px' }} />
          <p> / </p> <Input placeholder="Giá vé" type='number' style={{ width: '25%', marginRight: '10px', marginLeft: '10px' }} />
          <p>vé</p>
        </div>

        {/* tình trạng */}
        <p className='label'>Tình trạng</p>
        <Space wrap>
          <Select
            defaultValue="Đang áp dụng"
            style={{ width: 180, marginTop: '0px' }}
            onChange={handleChangeSelectTinhTrang}
            options={[
              { value: 'Đang áp dụng', label: 'Đang áp dụng' },
              { value: 'Tắt', label: 'Tắt' },
            ]}

          />
          <p style={{ fontStyle: 'italic', float: 'left' }}>là thông tin bắt buộc</p>
        </Space>
      </Modal>
      <Table
        dataSource={paginatedData}
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
            title: 'Ngày áp dụng',
            dataIndex: 'ngayApDung',
            key: 'ngayApDung',
          },
          {
            title: 'Giờ áp dụng',
            dataIndex: 'gioApDung',
            key: 'gioApDung',
         
          },
          {
            title: 'Ngày hết hạn',
            dataIndex: 'ngayHetHan',
            key: 'ngayHetHan',
          },
          {
            title: 'Giờ hết hạn',
            dataIndex: 'gioHetHan',
            key: 'gioHetHan',
          
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
            render: (tags: any) => (
              <span>
                {tags.map((tag: any) => (
                  <Tag key={tag} color='success'>{tag}</Tag>
                ))}
              </span>
            )
          },
          {
            title: 'Cập nhật',
            key: 'action',
            render: (text, record) => (
              <Button style={{ color: 'orange', fontWeight: '500', border: '1px solid orange' }} onClick={() => showUpdateModal(record)}>
                <FormOutlined />
                Cập nhật
              </Button>
            ),
          },
        ]}
        pagination={{
          pageSize: pageSize,
          total: data.length,
          onChange: handleChangePage,
        }}
      />
      <Modal title="Cập nhật Gói Vé" visible={isUpdateModalOpen} onOk={handleUpdateModalOk} onCancel={handleUpdateModalCancel} width={1000} >
        {selectedItem && (
                   <div>
                   <h1 style={{ textAlign: 'center' }}>Cập nhật Gói Vé</h1>
                   <div style={{display:'flex'}}>
                   <p className='label' style={{marginRight:'10px'}}>Mã sự kiện</p>
                   <Input placeholder="Mã sự kiện" style={{ width: '20%' }} size='large' value={selectedItem.tenGoi} />
                   <p className='label' style={{marginLeft:'20px', marginRight:'10px'}}>Tên sự kiện</p>
                   <Input placeholder="Tên sự kiện" style={{ width: '50%' }} size='large' value={'Hội nghị phát triển thể thao môn Cầu Lông Quốc Gia'}/>
                   </div>
                     {/* ngày áp dụng đến ngày hết hạn */}
               <div style={{ display: 'inline-flex', marginTop: '20px' }}>
                 <p className='label'>Ngày áp dụng</p> <br />
                 <div style={{ display: 'flex', marginLeft: '10px' }}>
                   <DatePicker style={{ marginRight: '10px' }} value={DateApDung} onChange={handleDateApDungChange} format="DD/MM/YYYY" /> <TimePicker style={{ marginRight: '20px' }} value={TimeApDung} onChange={handleTimeApDungChange}/>
                 </div>
                 <p className='label'>Ngày hết hạn</p>
                 <div style={{ display: 'flex', marginLeft: '10px' }}>
                   <DatePicker style={{ marginRight: '10px' }} value={DateHetHan} onChange={handleDateHetHanChange} format="DD/MM/YYYY" /> <TimePicker style={{ marginRight: '20px' }}  value={TimeHetHan} onChange={handleTimeHetHanChange}/>
                 </div>
               </div>
       
               {/* giá vé áp dụng */}
               <p className='label'>Giá vé áp dụng</p>
               <div style={{ display: 'flex' }}>
                 <Checkbox ><p style={{ marginBottom: '0px' }}>Vé lẻ (vnđ/vé) với giá</p></Checkbox>
                 <Input placeholder="Giá vé" type='number' style={{ width: '25%', marginRight: '10px' }} />
                 <p>/vé</p>
               </div>
               <div style={{ display: 'flex', marginTop: '20px' }}>
                 <Checkbox ><p style={{ marginBottom: '0px' }}>Combo vé với giá</p></Checkbox>
                 <Input placeholder="Giá vé" type='number' style={{ width: '25%', marginRight: '10px' }} />
                 <p> / </p> <Input placeholder="Giá vé" type='number' style={{ width: '25%', marginRight: '10px', marginLeft: '10px' }} />
                 <p>vé</p>
               </div>
       
               {/* tình trạng */}
               <p className='label'>Tình trạng</p>
               <Space wrap>
                 <Select
                   defaultValue="Đang áp dụng"
                   style={{ width: 180, marginTop: '0px' }}
                   onChange={handleChangeSelectTinhTrang}
                   options={[
                     { value: 'Đang áp dụng', label: 'Đang áp dụng' },
                     { value: 'Tắt', label: 'Tắt' },
                   ]}
       
                 />
                 <p style={{ fontStyle: 'italic', float: 'left' }}>là thông tin bắt buộc</p>
                 </Space>
                 
                 </div>
               )}
        <Button type="primary" onClick={handleUpdateModalOk} style={{ backgroundColor: 'orange', color: 'white', fontWeight: '500', marginTop: '50px', marginLeft: '450px' }} size='large'>
          Lưu
        </Button>
      </Modal>
    </div>
  );
}

export default GoiDichVu;
