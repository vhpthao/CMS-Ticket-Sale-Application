import React, { } from 'react';
import {
  FileSyncOutlined,
  FileTextOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import type { MenuProps } from 'antd/es/menu';

import { Link } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label
  } as MenuItem;
}

const items: MenuItem[] = [
  // Định nghĩa đường dẫn '/trangchu' cho Trang Chủ
  getItem('Trang Chủ', '1', (
    <Link to="/trangchu">
      <HomeOutlined />
    </Link>
  )),

  // Định nghĩa đường dẫn '/quanlyve' cho Quản Lý Vé
  getItem('Quản Lý Vé', '2', (
    <Link to="/quanlyve">
      <FileTextOutlined />
    </Link>
  )),

  // Định nghĩa đường dẫn '/doisoatve' cho Đổi Soát Vé
  getItem('Đổi Soát Vé', '3', (
    <Link to="/doisoatve">
      <FileSyncOutlined />
    </Link>
  )),

  // Định nghĩa đường dẫn '/caidat' cho Cài Đặt
  getItem('Cài Đặt', '4', <SettingOutlined />, [
    getItem('Gói Dịch Vụ', undefined, (
      <Link to="/goidichvu">
      </Link>
    )),
  ]),

];


function Navbar() {
  return (
    <div>
      <Menu
        style={{ width: 230, backgroundColor: '#F9F6F4' }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        items={items}
      />
    </div>
  );
}


export default Navbar