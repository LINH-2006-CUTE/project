import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Modal, Space, type MenuProps } from 'antd';
import ".././style/account.css";
import { useNavigate } from 'react-router-dom';
import { useDispatch} from 'react-redux';
import { useState } from 'react';
import { clearUser } from '../features/userSlice';
const items: MenuProps['items'] = [
  {
    key: '1',
    label: 'My Account',
    disabled: true,
  },
  {
    type: 'divider',
  },
  {
    key: '2',
    label: 'Log out',
  },
  {
    key: '3',
    label: 'Settings',
    icon: <SettingOutlined />,
  },
];

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showModal,setShowModal] = useState(false);

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    if (key === '2') {
      setShowModal(true); 
    }
  };

  const handleLogoutConfirm = async () => {
    dispatch(clearUser());
    navigate('/signin', { replace: true }); 
    setShowModal(false); 
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <div className='Header'>
      <div>📒 Tài Chính Cá Nhân K24_Rikkei</div>
      <Dropdown menu={{ items, onClick: handleClick }}>
        <a onClick={(e) => e.preventDefault()}>
          <Space style={{color:"white"}}>
            Tài khoản
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
      {/* Modal */}
      <Modal
        title="Xác nhận đăng xuất"
        open={showModal}
        onOk={handleLogoutConfirm}
        onCancel={handleCancel}
        okText="Đăng xuất"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn đăng xuất?</p>
      </Modal>
    </div>
  )
}
