import React, { useEffect, useState } from 'react';
import { Table, Input, Row, Col, Tag, Button, Modal, Form, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import HeaderAdmin from '../../components/HeaderAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';

const { Search } = Input;

interface Category {
  id: number;
  name: string;
  imageUrl: string;
  status: boolean;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/category');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Filter by search
  useEffect(() => {
    const filtered = categories.filter((c) =>
      c.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchText, categories]);

  // Toggle status
  const toggleStatus = async (record: Category) => {
    try {
      const updatedStatus = !record.status;
      const res = await fetch(`http://localhost:3000/category/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = categories.map((c) =>
        c.id === record.id ? { ...c, status: updatedStatus } : c
      );
      setCategories(updated);
    } catch (error) {
      console.log(error);
      
    }
  };

  // Upload to Cloudinary
  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', "project");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dzpyhb4rc/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setImageUrl(data.secure_url);
      message.success('Upload thành công!');
    } catch (error) {
     console.log(error);
     
    } finally {
      setUploading(false);
    }
    return false; // ngăn upload mặc định của AntD
  };

  // Add category
  const handleAddCategory = async () => {
    try {
      const values = await form.validateFields();
      if (!imageUrl) {
        message.error('Vui lòng upload ảnh!');
        return;
      }
      const maxId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) : 0;
      const newCategory = {
        id: maxId + 1,
        name: values.name,
        imageUrl: imageUrl,
        status: true,
      };
      const res = await fetch('http://localhost:3000/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) throw new Error('Add failed');
      setCategories([...categories, newCategory]);
      message.success('Thêm category thành công!');
      setIsModalOpen(false);
      form.resetFields();
      setImageUrl(null);
    } catch (error) {
      console.log(error);
      
    }
  };

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
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover' }} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) =>
        status ? (
          <Tag color="green" style={{borderRadius:"8px"}}>● Active</Tag>
        ) : (
          <Tag color="red" style={{borderRadius:"8px"}}>● Deactivate</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Category) => (
        <Button
          type="primary"
          danger={!record.status} 
          style={{ backgroundColor: record.status ? '#ff4d4f' : '#52c41a' }}
          onClick={() => toggleStatus(record)}
        >
          {record.status ? 'Block' : 'UnBlock'}
        </Button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Add Category
            </Button>
            <Search
              placeholder="Search by name..."
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </div>

          {/* Phân trang */}
          <Table columns={columns} dataSource={filteredCategories} rowKey="id" pagination={{ pageSize: 8 }} />
          {/* Modal */}
          <Modal
            title="Add Category"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onOk={handleAddCategory}
            confirmLoading={uploading}
          >
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Category Name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Upload Image">
                <Upload beforeUpload={handleUpload} showUploadList={false}>
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
                {imageUrl && <img src={imageUrl} alt="preview" style={{ marginTop: 10, width: 100, height: 100 }} />}
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </div>
  );
}
