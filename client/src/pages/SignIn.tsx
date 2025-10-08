import { Button, Form, Input } from "antd";
import axios from "axios";
import type { FieldData } from "rc-field-form/es/interface";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Sign.css";
import { setUser } from "../features/userSlice";
import { useDispatch } from "react-redux";

interface SignInForm {
  email: string;
  password: string;
}

export default function SignIn() {
  const [form] = Form.useForm<SignInForm>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await axios.get("http://localhost:3000/users");
      } catch (error) {
        console.log("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchUsers();
  }, []);

  const onFinish = async (values: SignInForm) => {
    const errors: FieldData[] = [];

    const validateEmail = (email: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    if (!validateEmail(values.email)) {
      errors.push({
        name: ["email"],
        errors: ["Vui lòng nhập địa chỉ email hợp lệ"],
      });
    }

    try {
      const response = await axios.get("http://localhost:3000/users");
      const users = response.data;
      const user = users.find(
        (u: any) => u.email === values.email && u.password === values.password
      );
      // check signin
      if (!user) {
        errors.push({
          name: ["email"],
          errors: ["Email hoặc mật khẩu không đúng!"],
        });
        errors.push({
          name: ["password"],
          errors: ["Email hoặc mật khẩu không đúng!"],
        });
      } else {
        dispatch(setUser(user));
      }
    } catch (error) {
      console.log(error);
    }

    if (errors.length > 0) {
      form.setFields(errors);
      return;
    }
    navigate("/home", { replace: true });
  };
  return (
    <div className="backgoundUser" style={{ color: "white" }}>
      <Form
        form={form}
        name="signin"
        onFinish={onFinish}
        layout="vertical"
        className="signin-form"
      >
        <h2>Đăng Nhập</h2>
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
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng Nhập
          </Button>
          <p>
            Bạn chưa có tài khoản? <a href="/signup">Đăng Ký</a>
          </p>
        </Form.Item>
      </Form>
    </div>
  );
}
