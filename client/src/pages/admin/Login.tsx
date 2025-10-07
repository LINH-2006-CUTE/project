import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
interface Admin {
  usename: string;
  password: string;
}

interface FormValues {
  username: string;
  password: string;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/admin');
      const admins: Admin[] = await response.json();

      const admin = admins.find(
        (admin) => admin.usename === values.username && admin.password === values.password
      );

      if (admin) {
        message.success('Đăng nhập thành công!');
        navigate('/users');
      } else {
        message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      console.log(error);
      message.error('Có lỗi xảy ra khi đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff'}}>
      <Row>
        <Col style={{ textAlign: 'center' }}>
        <div style={{display:"flex", gap:"10px",paddingLeft:"30px"}}>
            <h1>
            Financial 
          </h1>
          <h1 style={{color: "#4338CA"}}>
            Manager
          </h1>
        </div>
          <p style={{ marginBottom: '24px',paddingLeft:"30px" }}>Please sign in</p>
          <Form
            name="login"
            onFinish={onFinish}
            style={{ maxWidth: '300px', width: '150%' }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
            >
              <Input placeholder="Please enter your username ..." />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập password!' }]}
            >
              <Input.Password placeholder="Please enter your password ..." />
            </Form.Item>

            <Form.Item>
              <Row justify="space-between" align="middle">
                <Col>
                  <Checkbox>Remember me</Checkbox>
                </Col>
              </Row>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block style={{ background: "#4338CA" }} loading={loading}>
                Log in
              </Button>
            </Form.Item>
          </Form>
          <p style={{ marginTop: '16px' }}>© 2025 - Rikkei Education</p>
        </Col>
      </Row>
    </div>
  );
}