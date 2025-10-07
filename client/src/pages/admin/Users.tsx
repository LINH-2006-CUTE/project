import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Input, Row, Col, Tag, message } from 'antd';
import HeaderAdmin from '../../components/HeaderAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';
import { setUsers } from '../../features/usersSlice';
import { type RootState } from '../../store/store';
import activeIcon from '../../assets/icon/active.png';
import deactivateIcon from '../../assets/icon/deactivate.png';

const { Search } = Input;

interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
  phone: string;
  gender: boolean;
  status: boolean;
}

export default function Users() {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);

  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data: User[] = await response.json();
        dispatch(setUsers(data));
      } catch (error) {
        console.error('Lỗi khi fetch users:', error);
      }
    };
    fetchUsers();
  }, [dispatch]);

  // Filter khi search thay đổi
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchText, users]);

  //  Hàm đổi trạng thái (true ↔ false)
  const toggleStatus = async (record: User) => {
    try {
      const updatedStatus = !record.status;
      const response = await fetch(`http://localhost:3000/users/${record.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: updatedStatus }),
      });

      if (!response.ok) throw new Error('Cập nhật thất bại');

      // Cập nhật lại Redux store
      const updatedUsers = users.map((user) =>
        user.id === record.id ? { ...user, status: updatedStatus } : user
      );
      dispatch(setUsers(updatedUsers));
      message.success('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      message.error('Không thể cập nhật trạng thái!');
    }
  };

  // Cấu hình các cột của bảng
  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: boolean) => (gender ? 'Male' : 'Female'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) =>
        status ? (
          <Tag
            style={{
              border: '1px solid #52c41a',
              borderRadius: '15px',
              padding: '2px 10px',
              color: '#52c41a',
              fontWeight: 500,
              backgroundColor: '#f6ffed',
            }}
          >
            ● Active
          </Tag>
        ) : (
          <Tag
            style={{
              border: '1px solid #ff4d4f',
              borderRadius: '15px',
              padding: '2px 10px',
              color: '#ff4d4f',
              fontWeight: 500,
              backgroundColor: '#fff1f0',
            }}
          >
            ● Deactivate
          </Tag>
        ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: User) => (
        <img
          src={record.status ? activeIcon : deactivateIcon}
          alt={record.status ? 'Active' : 'Deactivate'}
          style={{ width: 24, height: 24, cursor: 'pointer' }}
          onClick={() => toggleStatus(record)}
        />
      ),
    },
  ];

  return (
    <div>
      <HeaderAdmin />
      <Row>
        <Col span={4}>
          <SidebarAdmin />
        </Col>
        <Col span={20} style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <p></p>
            <Search
              placeholder="Search here..."
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ pageSize: 8 }}
          />
        </Col>
      </Row>
    </div>
  );
}
