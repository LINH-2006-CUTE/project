import { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Button,
  Input,
  DatePicker,
  message,
  Table,
  Pagination,
  Modal,
  Select,
  Row,
  Col,
} from "antd";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import axios from "axios";
import { type RootState } from "../../store/store";
import { setUser } from "../../features/userSlice";
import { GoGoal } from "react-icons/go";
import {
  DeleteOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

interface Transaction {
  id: number;
  userId: number;
  category: string;
  budget: number | undefined;
  note: string;
  month: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  limit: number;
}

export default function CategoryUsers() {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [currentBudget, setCurrentBudget] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const [categories, setCategories] = useState<Category[]>([]);

  const transactionApiUrl = "http://localhost:3001/transactions";
  const apiUrl = "http://localhost:3001/users";

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

  useEffect(() => {
    fetch("http://localhost:3001/userCategories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => message.error("Không thể tải danh mục"));
  }, []);

  // Lịch sử giao dịch
  useEffect(() => {
    axios
      .get(transactionApiUrl)
      .then((res) => setTransactions(res.data))
      .catch(() => message.error("Không thể tải lịch sử giao dịch"));
  }, []);

  // Thêm giao dịch mới
  const handleAddTransaction = async () => {
    if (!amount || !note || !selectedCategory) {
      message.warning("Vui lòng nhập đủ thông tin chi tiêu!");
      return;
    }

    const enteredAmount = Number(amount);
    if (enteredAmount > currentBudget) {
      const exceeded = enteredAmount - currentBudget;
      message.error(
        ` Số tiền vượt quá ngân sách ${exceeded.toLocaleString()} / ${currentBudget.toLocaleString()} VND`
      );
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      userId: user?.id || 0,
      category: selectedCategory,
      budget: enteredAmount,
      note,
      month: selectedMonth.format("YYYY-MM"),
      createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    try {
      await axios.post(transactionApiUrl, newTransaction);
      setTransactions((prev) => [...prev, newTransaction]);

      // Cập nhật user để trừ chi tiêu vào baseBudget (categoryId=1 là tổng)
      if (user) {
        const currentMonth = selectedMonth.format("YYYY-MM");
        const existingBase = user?.monthlyCategories?.find(
          (m) =>
            dayjs(m.month).format("YYYY-MM") === currentMonth &&
            m.categories.categoryId === 1
        );

        let updatedUser = { ...user };
        if (existingBase) {
          // Trừ enteredAmount vào baseBudget
          const updatedMonthlyCategories = user?.monthlyCategories?.map(
            (item) =>
              item.id === existingBase.id
                ? {
                    ...item,
                    categories: {
                      ...item.categories,
                      budget: item.categories.budget - enteredAmount,
                    },
                  }
                : item
          );
          updatedUser = {
            ...user,
            monthlyCategories: updatedMonthlyCategories,
          };
        } else {
          // Nếu chưa có base, tạo mới với budget = 0 - enteredAmount (nhưng cảnh báo)
          message.warning("Chưa set ngân sách tháng, chỉ lưu chi tiêu!");
        }

        await axios.put(`${apiUrl}/${user.id}`, updatedUser);
        dispatch(setUser(updatedUser));
      }

      // currentBudget sau cập nhật
      setCurrentBudget((prev) => prev - enteredAmount);

      message.success("Đã thêm vào lịch sử chi tiêu!");
      setAmount("");
      setNote("");
      setSelectedCategory("");
    } catch (err) {
      message.error("Không thể lưu giao dịch!");
      console.error(err);
    }
  };

  // Xóa giao dịch
  const showDeleteConfirm = (id: number) => {
    confirm({
      title: "Xác nhận xóa giao dịch này?",
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          const recordToDelete = transactions.find((t) => t.id === id);
          if (!recordToDelete) return;

          await axios.delete(`${transactionApiUrl}/${id}`);
          setTransactions((prev) => prev.filter((t) => t.id !== id));

          // categoryId=1 là tổng)
          if (user && recordToDelete.budget) {
            const currentMonth = selectedMonth.format("YYYY-MM");
            const existingBase = user?.monthlyCategories?.find(
              (m) =>
                dayjs(m.month).format("YYYY-MM") === currentMonth &&
                m.categories.categoryId === 1
            );

            let updatedUser = { ...user };
            if (existingBase) {
              // cộng lại recordToDelete.budget vào baseBudget
              const updatedMonthlyCategories = user?.monthlyCategories?.map(
                (item) =>
                  item.id === existingBase.id
                    ? {
                        ...item,
                        categories: {
                          ...item.categories,
                          budget:
                            item.categories.budget +
                            (recordToDelete?.budget ?? 0),
                        },
                      }
                    : item
              );
              updatedUser = {
                ...user,
                monthlyCategories: updatedMonthlyCategories,
              };
            } else {
              message.warning("Chưa set ngân sách tháng, chỉ xóa lịch sử!");
            }

            await axios.put(`${apiUrl}/${user.id}`, updatedUser);
            dispatch(setUser(updatedUser));
          }

          // currentBudget sau xóa (cộng lại vào tổng)
          setCurrentBudget((prev) => prev + (recordToDelete.budget || 0));

          message.success("Đã xóa giao dịch thành công!");
        } catch (err) {
          message.error("Lỗi khi xóa!");
          console.error(err);
        }
      },
    });
  };

  const filtered = transactions.filter(
    (t) =>
      t.userId === user?.id &&
      dayjs(t.month).format("YYYY-MM") === selectedMonth.format("YYYY-MM") &&
      (t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sorted =
    sortOrder === "asc"
      ? [...filtered].sort((a, b) => (a.budget || 0) - (b.budget || 0))
      : sortOrder === "desc"
      ? [...filtered].sort((a, b) => (b.budget || 0) - (a.budget || 0))
      : filtered;

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

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

              {/* Số tiền còn lại  */}
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
                    {(currentBudget || 0).toLocaleString()} VND{" "}
                  </h3>
                </div>
              </Card>

              {/* Chọn tháng (giữ nguyên) */}
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

              {/* Form thêm chi tiêu (sửa select: dynamic từ DB + thêm "Tiền chi tiêu") */}
              <Card style={cardStyle}>
                <Row gutter={16} justify="center" align="middle">
                  <Col span={7}>
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Số tiền chi tiêu"
                      type="number"
                      style={{ borderRadius: "6px" }}
                    />
                  </Col>
                  <Col span={7}>
                    <Select
                      placeholder="Danh mục"
                      value={selectedCategory || undefined}
                      onChange={(v) => setSelectedCategory(v)}
                      style={{ width: "100%", borderRadius: "6px" }}
                    >
                      <Option value="">Tiền chi tiêu</Option>
                      {categories.map((cat) => (
                        <Option key={cat.id} value={cat.name}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={7}>
                    <Input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú"
                      style={{ borderRadius: "6px" }}
                    />
                  </Col>
                  <Col span={3}>
                    <Button
                      type="primary"
                      onClick={handleAddTransaction}
                      style={{
                        width: "100%",
                        height: "42px",
                        borderRadius: "6px",
                        backgroundColor: "#6366F1",
                        borderColor: "#6366F1",
                      }}
                    >
                      Thêm
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Lịch sử chi tiêu */}
              <Card style={cardStyle}>
                <div style={{ display: "flex", gap: "75px" }}>
                  <h2 style={{ textAlign: "center" }}>Lịch sử giao dịch</h2>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <Button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      icon={
                        sortOrder === "asc" ? (
                          <SortAscendingOutlined />
                        ) : (
                          <SortDescendingOutlined />
                        )
                      }
                    >
                      Sắp xếp theo giá
                    </Button>

                    <Input
                      placeholder="Tìm kiếm..."
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: 250 }}
                    />
                  </div>
                </div>

                <Table
                  dataSource={paginated}
                  pagination={false}
                  bordered
                  columns={[
                    {
                      title: "STT",
                      render: (_: any, __: any, index: number) =>
                        (page - 1) * pageSize + index + 1,
                      width: 60,
                    },
                    { title: "Category", dataIndex: "category" },
                    {
                      title: "Budget",
                      dataIndex: "budget",
                      render: (val) => `${(val || 0).toLocaleString()} VND`,
                    },
                    { title: "Note", dataIndex: "note" },
                    {
                      title: "Actions",
                      render: (_, record) => (
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteConfirm(record.id)}
                        />
                      ),
                    },
                  ]}
                />

                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={sorted.length}
                  onChange={(p) => setPage(p)}
                  style={{ marginTop: 16, textAlign: "center" }}
                />
              </Card>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
