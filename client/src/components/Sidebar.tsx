import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/home', icon: <HomeOutlined />, label: 'Information' },
    { key: '/category-users', icon: <FolderOpenOutlined />, label: 'Category' },
    { key: '/history', icon: <HistoryOutlined />, label: 'History' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <Sider
      width={220}
      style={{
        minHeight: '88vh',
        background: 'transparent', 
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
        }))}
        onClick={handleMenuClick}
        style={{
          background: 'transparent', 
          color: '#333', 
          fontWeight: 500,
        }}
      />
    </Sider>
  );
}
