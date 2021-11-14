import React, { useState } from "react";
import { Menu, Button } from "antd";
import { Link } from "react-router-dom";

const TopMenu = ({ data, onLogin, onLogout }) => {
  const [selected, setSelected] = useState("home");
  const onClick = (e) => {
    if (e.key === "log") return;
    setSelected(e.key)
  };
  return (
    <Menu onClick={onClick} selectedKeys={[selected]} mode="horizontal">
      <Menu.Item key="home">
        <Link to="/">首頁</Link>
      </Menu.Item>
      <Menu.Item key="todolist">
        <Link to="/todolist">我的作業死線</Link>
      </Menu.Item>
      <Menu.Item key="search">
        <Link to="/search">歷年課程資料查詢</Link>
      </Menu.Item>
      <Menu.Item key="log">
        {data !== null ? (
          <a onClick={onLogout} href="/">登出</a>
        ) : (
          <a onClick={onLogin}>登入</a>
        )}
      </Menu.Item>
    </Menu>
  );
};

export default TopMenu;
