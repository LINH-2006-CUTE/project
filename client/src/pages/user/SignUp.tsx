import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import "../style/Sign.css";
import axios from "axios";
import type { FieldData } from "rc-field-form/es/interface";

interface SignUpForm {
  id: number;
  fullname?: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  gender: boolean;
  status: boolean;
}

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
////chua @ trong passs
const validPass = (password: string) => {
  const re = /@/;
  return re.test(password);
};

export default function SignUp() {
  const [form] = Form.useForm<SignUpForm>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Xử lý đăng ký
  const onFinish = async (values: SignUpForm) => {
    setLoading(true);
    const errors: FieldData[] = [];

    if (!validateEmail(values.email)) {
      errors.push({
        name: "email",
        errors: ["Vui lòng nhập địa chỉ email hợp lệ"],
      });
    }
    if (values.password.length < 6) {
      errors.push({
        name: "password",
        errors: ["Mật khẩu phải có ít nhất 6 ký tự"],
      });
    }
    if (!validPass(values.password)) {
      errors.push({
        name: "password",
        errors: ["Vui lòng nhập email dung"],
      });
    }
    if (values.password !== values.confirmPassword) {
      errors.push({
        name: "confirmPassword",
        errors: ["Mật khẩu xác nhận không khớp"],
      });
    }

    if (errors.length > 0) {
      form.setFields(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:3001/users");

      const users = res.data;

      const maxId =
        users.length > 0 ? Math.max(...users.map((u: any) => u.id)) : 0;
      const newUser = {
        id: maxId + 1,
        fullname: values.fullname || "",
        email: values.email,
        password: values.password,
        phone: values.phone || "",
        gender: true,
        status: true,
        monthlyCategories: [],
      };

      await axios.post("http://localhost:3001/users", newUser);

      message.success("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");

      navigate("/signin", { replace: true });
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backgoundUser">
      <Form
        form={form}
        name="signup"
        onFinish={onFinish}
        layout="vertical"
        className="signup-form"
      >
        <h2>Đăng Ký</h2>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Vui lòng nhập email!" }]}
        >
          <Input placeholder="Nhập email của bạn..." />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật Khẩu"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu..." />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác Nhận Mật Khẩu"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
        >
          <Input.Password placeholder="Xác nhận mật khẩu..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng Ký
          </Button>
          <p>
            Bạn đã có tài khoản? <a href="/signin">Đăng Nhập</a>
          </p>
        </Form.Item>
      </Form>
    </div>
  );
}
