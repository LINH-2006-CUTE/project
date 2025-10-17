import { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Button,
  Input,
  DatePicker,
  message,
  Select,
  Row,
  Col,
  // Modal,
} from "antd";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import axios from "axios";
import { type RootState } from "../../store/store";
import { setUser } from "../../features/userSlice";
import { setUsers } from "../../features/users_Slice";
import { GoGoal } from "react-icons/go";
import { DollarOutlined } from "@ant-design/icons";
const { Content } = Layout;
const { Option } = Select;

interface Category {
  id: number;
  name: string;
  limit: number;
}

interface CategoryBudget {
  id: number;
  categoryId: number;
  budget: number;
}

interface MonthlyCategory {
  id: number;
  month: string;
  categories: CategoryBudget;
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

export default function CategoryUsers() {
  const user = useSelector(
    (state: RootState) => state.user.user
  ) as User | null;
  const dispatch = useDispatch();

  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [currentBudget, setCurrentBudget] = useState<number>(0);
  const [newBudget, setNewBudget] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [monthlyBudget, setMonthlyBudget] = useState<string>("");

  const apiUrl = "http://localhost:3001/users";

  useEffect(() => {
    fetch("http://localhost:3001/userCategories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => message.error("Không thể tải danh mục"));
  }, []);

  // Tính toán ngân sách còn lại
  useEffect(() => {
    if (user?.monthlyCategories?.length) {
      const currentMonth = selectedMonth.format("YYYY-MM");
      const monthlyList = user.monthlyCategories.filter(
        (item) => dayjs(item.month).format("YYYY-MM") === currentMonth
      );

      const baseBudget =
        monthlyList.find((m) => m.categories.categoryId === 1)?.categories
          .budget || 0;

      const totalCategorySpending = monthlyList
        .filter((m) => m.categories.categoryId !== 1)
        .reduce((sum, m) => sum + m.categories.budget, 0);

      setCurrentBudget(baseBudget - totalCategorySpending);
    } else {
      setCurrentBudget(0);
    }
  }, [user, selectedMonth]);

  // Lưu ngân sách tổng tháng
  const handleSaveBudget = async () => {
    if (!user || !newBudget) {
      message.error("Vui lòng nhập ngân sách!");
      return;
    }

    try {
      const newMonth = selectedMonth.format("YYYY-MM-DD");
      const existingMonth = user.monthlyCategories.find(
        (item) =>
          dayjs(item.month).format("YYYY-MM") ===
            selectedMonth.format("YYYY-MM") && item.categories.categoryId === 1
      );

      let updatedUser = { ...user };

      if (existingMonth) {
        // Cập nhật ngân sách tổng
        const updatedMonthlyCategories = user.monthlyCategories.map((item) =>
          item.id === existingMonth.id
            ? {
                ...item,
                categories: { ...item.categories, budget: Number(newBudget) },
              }
            : item
        );
        updatedUser = { ...user, monthlyCategories: updatedMonthlyCategories };
      } else {
        // Tạo mới ngân sách tổng
        const nextId =
          user.monthlyCategories.length > 0
            ? Math.max(...user.monthlyCategories.map((c) => c.id)) + 1
            : 1;

        const newCategory: MonthlyCategory = {
          id: nextId,
          month: newMonth,
          categories: { id: nextId, categoryId: 1, budget: Number(newBudget) },
        };

        updatedUser = {
          ...user,
          monthlyCategories: [...user.monthlyCategories, newCategory],
        };
      }

      await axios.put(`${apiUrl}/${user.id}`, updatedUser);
      const res = await axios.get(apiUrl);
      dispatch(setUser(updatedUser));
      dispatch(setUsers(res.data));

      message.success("Cập nhật ngân sách tháng thành công!");
      setNewBudget("");
    } catch (error) {
      console.error(error);
      message.error("Cập nhật thất bại!");
    }
  };

  // Thêm danh mục tháng
  const handleAddMonthlyCategory = async () => {
    if (!user || !selectedCategoryId || !monthlyBudget) {
      message.warning("Vui lòng chọn danh mục và nhập ngân sách");
      return;
    }

    if (Number(monthlyBudget) > currentBudget) {
      message.error(
        `Danh mục vượt quá ngân sách còn lại: ${Number(
          monthlyBudget
        ).toLocaleString()} / ${currentBudget.toLocaleString()}`
      );
      return;
    }

    try {
      const newMonth = selectedMonth.format("YYYY-MM-DD");
      const nextId =
        user.monthlyCategories.length > 0
          ? Math.max(...user.monthlyCategories.map((c) => c.id)) + 1
          : 1;

      const newCategory: MonthlyCategory = {
        id: nextId,
        month: newMonth,
        categories: {
          id: nextId,
          categoryId: selectedCategoryId,
          budget: Number(monthlyBudget),
        },
      };

      const updatedUser = {
        ...user,
        monthlyCategories: [...user.monthlyCategories, newCategory],
      };

      await axios.put(`${apiUrl}/${user.id}`, updatedUser);
      // thêm vào bảng
      const selectedCatName =
        categories.find((c) => c.id === selectedCategoryId)?.name ||
        "Không xác định";
      // history
      const historyRecord = {
        id: Date.now(),
        userId: user.id,
        category: selectedCatName,
        budget: Number(monthlyBudget),
        note: `Tạo danh mục "${selectedCatName}" tháng ${selectedMonth.format(
          "MM/YYYY"
        )}`,
        month: selectedMonth.format("YYYY-MM"),
        createdAt: new Date().toISOString(),
      };

      await axios.post("http://localhost:3001/transactions", historyRecord);
      const res = await axios.get(apiUrl);
      dispatch(setUser(updatedUser));
      dispatch(setUsers(res.data));

      message.success("Thêm danh mục tháng thành công!");
      setSelectedCategoryId(null);
      setMonthlyBudget("");
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi thêm danh mục tháng!");
    }
  };

  // Sửa danh mục
  // const handleEdit = (mc: MonthlyCategory) => {
  //   Modal.confirm({
  //     title: "Sửa ngân sách danh mục",
  //     content: (
  //       <Input
  //         defaultValue={mc.categories.budget}
  //         type="number"
  //         onChange={(e) => setMonthlyBudget(e.target.value)}
  //       />
  //     ),
  //     onOk: async () => {
  //       if (!user || !monthlyBudget) return;
  //       const updatedUser = {
  //         ...user,
  //         monthlyCategories: user.monthlyCategories.map((item) =>
  //           item.id === mc.id
  //             ? {
  //                 ...item,
  //                 categories: {
  //                   ...item.categories,
  //                   budget: Number(monthlyBudget),
  //                 },
  //               }
  //             : item
  //         ),
  //       };
  //       await axios.put(`${apiUrl}/${user.id}`, updatedUser);
  //       const res = await axios.get(apiUrl);
  //       dispatch(setUser(updatedUser));
  //       dispatch(setUsers(res.data));
  //       message.success("Cập nhật danh mục thành công!");
  //       setMonthlyBudget(""); // Reset sau edit
  //     },
  //   });
  // };

  // Xóa danh mục
  // const handleDelete = async (id: number) => {
  //   Modal.confirm({
  //     title: "Xóa danh mục này?",
  //     onOk: async () => {
  //       if (!user) return;
  //       const updatedUser = {
  //         ...user,
  //         monthlyCategories: user.monthlyCategories.filter(
  //           (mc) => mc.id !== id
  //         ),
  //       };
  //       await axios.put(`${apiUrl}/${user.id}`, updatedUser);
  //       dispatch(setUser(updatedUser));
  //       message.success("Đã xóa danh mục!");
  //     },
  //   });
  // };

  const filteredMonthlyCategories =
    user?.monthlyCategories?.filter(
      (mc) =>
        dayjs(mc.month).format("YYYY-MM") === selectedMonth.format("YYYY-MM") &&
        mc.categories.categoryId !== 1
    ) || [];

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 16px",
  };

  const cardStyle = {
    width: "100%",
    marginBottom: "16px",
  };

  const sectionStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 0",
  };

  return (
    <Layout style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <Layout>
        <Header />
        <Layout style={{ padding: "24px", background: "#f0f2f5" }}>
          <Sidebar />
          <Content style={{ padding: "0 24px" }}>
            {/* banner */}
            <div style={{ ...containerStyle, marginBottom: 16 }}>
              <div
                style={{
                  backgroundColor: "#4F46E5",
                  padding: "20px",
                  color: "white",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <h2 style={{ fontSize: "24px", margin: 0 }}>
                  <GoGoal /> Kiểm soát chi tiêu thông minh
                </h2>
                <p style={{ margin: "8px 0 0 0", fontSize: "16px" }}>
                  Theo dõi ngân sách và thu chi hằng tháng dễ dàng
                </p>
              </div>
            </div>

            {/* title */}
            <div style={containerStyle}>
              <h1
                style={{
                  textAlign: "center",
                  fontSize: "30px",
                  margin: "20px 0",
                }}
              >
                📊 Quản Lý Tài Chính Cá Nhân
              </h1>

              {/* ngân sách còn lại */}
              <Card style={cardStyle}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "24px", margin: 0 }}>Số tiền còn lại</p>
                  <h3
                    style={{
                      color: "#52c41a",
                      fontSize: "24px",
                      margin: "8px 0 0 0",
                    }}
                  >
                    {currentBudget.toLocaleString()} VND
                  </h3>
                </div>
              </Card>

              {/* chọn tháng */}
              <Card style={cardStyle}>
                <div style={sectionStyle}>
                  <span style={{ fontSize: "18px" }}>📅 Chọn tháng:</span>
                  <DatePicker
                    picker="month"
                    format="MMMM YYYY"
                    value={selectedMonth}
                    onChange={(date) => setSelectedMonth(date || dayjs())}
                  />
                </div>
              </Card>

              {/* ngân sách tháng */}
              <Card style={cardStyle}>
                <div style={sectionStyle}>
                  <span style={{ fontSize: "18px" }}>💰 Ngân sách tháng:</span>
                  <Input
                    type="number"
                    placeholder="Nhập ngân sách..."
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    style={{ width: "200px" }}
                  />
                  <Button type="primary" onClick={handleSaveBudget}>
                    Lưu
                  </Button>
                </div>
              </Card>

              {/* danh mục */}
              <Card style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ padding: "30px 0" }}>
                  <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                    📊 Quản lý danh mục (Theo tháng)
                  </h2>

                  {/* nhập danh mục */}
                  <Row
                    gutter={16}
                    style={{ marginBottom: "20px", justifyContent: "center" }}
                  >
                    <Col span={8}>
                      <Select
                        value={selectedCategoryId ?? undefined}
                        onChange={(value) =>
                          setSelectedCategoryId(value as number)
                        }
                        placeholder="Chọn danh mục"
                        style={{ width: "100%" }}
                      >
                        {categories.map((cat) => (
                          <Option key={cat.id} value={cat.id}>
                            {cat.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={8}>
                      <Input
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(e.target.value)}
                        placeholder="Ngân sách tháng (VND)"
                        type="number"
                      />
                    </Col>
                    <Col span={8}>
                      <Button
                        type="primary"
                        onClick={handleAddMonthlyCategory}
                        style={{ width: "100%" }}
                      >
                        Thêm danh mục
                      </Button>
                    </Col>
                  </Row>

                  {/* danh sách */}
                  <h3 style={{ marginBottom: "10px", textAlign: "center" }}>
                    Danh mục của tháng {selectedMonth.format("MM/YYYY")}:
                  </h3>
                  {filteredMonthlyCategories.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#999",
                        marginTop: 20,
                      }}
                    >
                      Chưa có danh mục nào. Hãy thêm để bắt đầu!
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                        justifyContent: "center",
                        marginTop: 8,
                      }}
                    >
                      {filteredMonthlyCategories.map((mc) => {
                        const catName =
                          categories.find(
                            (c) => c.id === mc.categories.categoryId
                          )?.name || "Không xác định";
                        return (
                          <Card
                            key={mc.id}
                            hoverable
                            style={{
                              textAlign: "center",
                              borderRadius: 12,
                              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                              border: "1px solid #f0f0f0",
                              padding: 18,
                              width: "100%",
                              maxWidth: "250px",
                            }}
                          >
                            <DollarOutlined
                              style={{ fontSize: 28, marginBottom: 8 }}
                            />
                            <div
                              style={{ fontWeight: "700", fontSize: "16px" }}
                            >
                              {catName}
                            </div>
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: "18px",
                                color: "#1890ff",
                              }}
                            >
                              {mc.categories.budget.toLocaleString()} VND
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
