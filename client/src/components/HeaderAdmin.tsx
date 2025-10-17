import { Layout, Space } from "antd";
import avatar from "../assets/avatar.png";
const { Header } = Layout;

export default function HeaderAdmin() {
  return (
    <Header
      style={{
        padding: "0 20px",
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          paddingLeft: "30px",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <h2>Financial</h2>
        <h2 style={{ color: "#4338CA" }}>Manager</h2>
      </div>
      <Space style={{ paddingTop: "15px" }}>
        <img src={avatar} alt="" />
      </Space>
    </Header>
  );
}
