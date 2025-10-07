import React from "react";
import { Layout, Menu } from "antd";
import category from "../assets/icon/category.png";
import dashboard from "../assets/icon/dashboard.png";
import users from "../assets/icon/users.png";
import signout from "../assets/icon/signout.png";

import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

export default function SidebarAdmin() {
  const location = useLocation();

  // map path -> menu key
  const pathToKey: Record<string, string> = {
    "/dashboard": "dashboard",
    "/users": "users",
    "/category": "category",
  };

  // xác định item được chọn dựa trên pathname hiện tại
  const selectedKey = Object.keys(pathToKey).find((path) =>
    location.pathname.startsWith(path)
  ) || "dashboard";

  return (
    <Sider
      width={250}
      style={{
        background: "#fff",
        height: "93vh",
        left: 0,
        borderRight: "1px solid #f0f0f0",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ height: "100%", borderRight: 0 }}
      >
        <Menu.Item
          key="dashboard"
          style={{ paddingLeft: "25px", borderBottom: "1px solid #f0f0f0" }}
        >
          <Link to="/dashboard">
            <h3>
              <img src={dashboard} alt="" /> Dashboard
            </h3>
          </Link>
        </Menu.Item>

        <Menu.Item
          key="users"
          style={{ paddingLeft: "25px", borderBottom: "1px solid #f0f0f0" }}
        >
          <Link to="/users">
            <h3>
              <img src={users} alt="" /> Users
            </h3>
          </Link>
        </Menu.Item>

        <Menu.Item
          key="category"
          style={{ paddingLeft: "25px", borderBottom: "1px solid #f0f0f0" }}
        >
          <Link to="/category">
            <h3>
              <img src={category} alt="" /> Category
            </h3>
          </Link>
        </Menu.Item>

        <div
          style={{
            paddingLeft: "25px",
            borderTop: "1px solid #f0f0f0",
            marginTop: "275%",
          }}
        >
          <Menu.Item key="signout">
            <Link to="/login" onClick={() => localStorage.removeItem("isAuthenticated")}>
              <h3>
                <img src={signout} alt="" /> Sign out
              </h3>
            </Link>
          </Menu.Item>
        </div>
      </Menu>
    </Sider>
  );
}
