import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Button,
  Form,
  Input,
  DatePicker,
  message,
  Modal,
  Select,
} from "antd";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import axios from "axios";
import { type RootState } from "../store/store";
import { setUser } from "../features/userSlice";
import { setUsers } from "../features/usersSlice";

const { Content } = Layout;

interface Category {
  id: number;
  categoryId: number;
  budget: number;
}

interface MonthlyCategory {
  id: number;
  month: string;
  categories: Category;
}

interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
  phone: string;
  gender: boolean;
  status: boolean;
  monthlyCategories: MonthlyCategory[];
}

export default function Home() {
  const user = useSelector(
    (state: RootState) => state.user.user
  ) as User | null;
  const dispatch = useDispatch();

  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [currentBudget, setCurrentBudget] = useState<number>(0);
  const [newBudget, setNewBudget] = useState<string>("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const apiUrl = "http://localhost:3000/users";

  // Lấy ngân sách tháng hiện tại
  useEffect(() => {
    if (user?.monthlyCategories?.length) {
      const currentMonth = selectedMonth.format("YYYY-MM");
      const current = user.monthlyCategories.find(
        (item) => dayjs(item.month).format("YYYY-MM") === currentMonth
      );
      setCurrentBudget(current ? current.categories.budget : 0);
    }
  }, [user, selectedMonth]);

  // Set dữ liệu vào form khi mở modal
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullname: user.fullname || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender ? "Male" : "Female",
      });
    }
  }, [user, form]);

  // Cập nhật thông tin
  const handleUpdateInfo = async (values: {
    fullname: string;
    phone: string;
    email: string;
    gender: string;
  }) => {
    if (!user) return;
    try {
      const updatedUser = {
        ...user,
        ...values,
        gender: values.gender === "Male",
      };
      await axios.put(`${apiUrl}/${user.id}`, updatedUser);

      // Lấy lại danh sách user mới
      const res = await axios.get(apiUrl);
      dispatch(setUser(updatedUser));
      dispatch(setUsers(res.data));

      message.success("Cập nhật thông tin thành công!");
      setIsEditModalVisible(false);
    } catch (error) {
      message.error("Cập nhật thông tin thất bại!");
      console.error(error);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!user) return;
    try {
      if (values.oldPassword !== user.password) {
        message.error("Mật khẩu cũ không đúng!");
        return;
      }
      if (values.newPassword !== values.confirmPassword) {
        message.error("Mật khẩu xác nhận không khớp!");
        return;
      }
      const updatedUser = { ...user, password: values.newPassword };
      await axios.put(`${apiUrl}/${user.id}`, updatedUser);

      const res = await axios.get(apiUrl);
      dispatch(setUser(updatedUser));
      dispatch(setUsers(res.data));

      message.success("Đổi mật khẩu thành công!");
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error("Đổi mật khẩu thất bại!");
      console.error(error);
    }
  };

  // Lưu ngân sách
  const handleSaveBudget = async () => {
    if (!user || !newBudget) {
      message.error("Vui lòng nhập ngân sách!");
      return;
    }
    try {
      const newMonth = selectedMonth.format("YYYY-MM-DD");
      const existingMonth = user.monthlyCategories?.find(
        (item) =>
          dayjs(item.month).format("YYYY-MM") ===
          selectedMonth.format("YYYY-MM")
      );

      let updatedUser = { ...user };

      if (existingMonth) {
        const updatedCategories = {
          ...existingMonth.categories,
          budget: existingMonth.categories.budget + Number(newBudget),
        };
        const updatedMonthlyCategories = user.monthlyCategories.map((item) =>
          item.id === existingMonth.id
            ? { ...item, categories: updatedCategories }
            : item
        );
        updatedUser = { ...user, monthlyCategories: updatedMonthlyCategories };
      } else {
        const nextId =
          user.monthlyCategories.length > 0
            ? Math.max(...user.monthlyCategories.map((c) => c.id)) + 1
            : 1;
        const newCategory: MonthlyCategory = {
          id: nextId,
          month: newMonth,
          categories: {
            id: nextId,
            categoryId: 1,
            budget: Number(newBudget),
          },
        };
        updatedUser = {
          ...user,
          monthlyCategories: [...(user.monthlyCategories || []), newCategory],
        };
      }

      await axios.put(`${apiUrl}/${user.id}`, updatedUser);

      const res = await axios.get(apiUrl);
      dispatch(setUser(updatedUser));
      dispatch(setUsers(res.data));

      setNewBudget("");
      message.success("Cập nhật ngân sách thành công!");
    } catch (error) {
      message.error("Cập nhật ngân sách thất bại!");
      console.error(error);
    }
  };

  return (
    <Layout>
      <Layout>
        <Header />
        <Layout
          style={{
            padding: "24px",
            background: "#f0f2f5",
            alignContent: "center",
          }}
        >
          <Sidebar />
          <Content>
            <div
              style={{
                marginBottom: 16,
                backgroundColor: "#4F46E5",
                width: "50%",
                padding: "15px",
                color: "white",
                borderRadius: "10px",
                paddingLeft: "13%",
                marginLeft: "25%",
              }}
            >
              <h2 style={{ fontSize: "24px" }}>
                🎯 Kiểm soát chi tiêu thông minh
              </h2>
              <p style={{ paddingLeft: "27px" }}>
                Theo dõi ngân sách và thu chi hằng tháng dễ dàng
              </p>
            </div>
            <p
              style={{ fontSize: "30px", padding: "10px", paddingLeft: "37%" }}
            >
              📊 Quản Lý Tài Chính Cá Nhân
            </p>

            {/*Thông tin ngân sách */}
            <Card style={{ width: "50%", marginLeft: "25%" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "24px" }}>Số tiền còn lại</p>
                <h3 style={{ color: "#52c41a", fontSize: "24px" }}>
                  {currentBudget.toLocaleString() || "0"} VND
                </h3>
              </div>
            </Card>
            <br />
            <Card
              style={{ paddingLeft: "16%", width: "50%", marginLeft: "25%" }}
            >
              📅 Chọn tháng:
              <DatePicker
                picker="month"
                format="MMMM YYYY"
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date || dayjs())}
                style={{ marginRight: "8px" }}
              />
            </Card>
            <br />
            <Card
              style={{ paddingLeft: "12%", width: "50%", marginLeft: "25%" }}
            >
              💰 Ngân sách tháng:
              <Input
                type="number"
                placeholder="Nhập ngân sách..."
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                style={{ width: "200px", marginRight: "8px" }}
              />
              <Button type="primary" onClick={handleSaveBudget}>
                Lưu
              </Button>
            </Card>
            <br />
            {/*  Thông tin cá nhân*/}
            <div style={{ marginLeft: "25%" }}>
              <h2
                style={{
                  fontSize: "20px",
                  color: "#4F46E5",
                  paddingLeft: "23%",
                }}
              >
                Quản Lý Thông tin cá nhân
              </h2>
              <Form
                layout="vertical"
                style={{ marginTop: "20px", display: "flex", gap: "10px" }}
              >
                <div>
                  <Form.Item label="Name">
                    <Input
                      value={user?.fullname || ""}
                      style={{ width: "400px" }}
                    />
                  </Form.Item>
                  <Form.Item label="Email">
                    <Input value={user?.email || ""} />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={() => setIsEditModalVisible(true)}
                      style={{
                        marginRight: "8px",
                        width: "400px",
                        borderColor: "#4F46E5",
                        backgroundColor: "white",
                        color: "#4F46E5",
                      }}
                    >
                      Change Information
                    </Button>
                  </Form.Item>
                </div>
                <div>
                  <Form.Item label="Phone">
                    <Input
                      value={user?.phone || ""}
                      style={{ width: "400px" }}
                    />
                  </Form.Item>
                  <Form.Item label="Gender">
                    <Input value={user?.gender ? "Male" : "Female"} />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={() => setIsPasswordModalVisible(true)}
                      style={{
                        width: "400px",
                        borderColor: "#4F46E5",
                        backgroundColor: "white",
                        color: "#4F46E5",
                      }}
                    >
                      Change Password
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>

            {/* Modal sửa thông tin */}
            <Modal
              title="Sửa thông tin cá nhân"
              open={isEditModalVisible}
              onCancel={() => {
                setIsEditModalVisible(false);
                form.resetFields();
              }}
              footer={null}
            >
              <Form
                form={form}
                onFinish={handleUpdateInfo}
                layout="vertical"
                initialValues={{
                  fullname: user?.fullname,
                  phone: user?.phone,
                  email: user?.email,
                  gender: user?.gender ? "Male" : "Female",
                }}
              >
                <Form.Item
                  label="Họ tên"
                  name="fullname"
                  rules={[{ required: true, message: "Không được để trống!" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính!" },
                  ]}
                >
                  <Select>
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Female">Female</Select.Option>
                  </Select>
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Lưu
                </Button>
              </Form>
            </Modal>

            {/* ==== Modal đổi mật khẩu ==== */}
            <Modal
              title="Đổi mật khẩu"
              open={isPasswordModalVisible}
              onCancel={() => {
                setIsPasswordModalVisible(false);
                passwordForm.resetFields();
              }}
              footer={null}
            >
              <Form
                form={passwordForm}
                onFinish={handleChangePassword}
                layout="vertical"
              >
                <Form.Item
                  label="Mật khẩu cũ"
                  name="oldPassword"
                  rules={[{ required: true, message: "Nhập mật khẩu cũ!" }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Nhập mật khẩu mới!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Nhập lại mật khẩu mới"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Xác nhận mật khẩu mới!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu không khớp!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Đổi mật khẩu
                </Button>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
