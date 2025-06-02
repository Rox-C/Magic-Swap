import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MainLayout from "./layouts/MainLayout";
import Wardrobe from "./pages/Wardrobe";
import Profile from "./pages/Profile";
import Details from './pages/Details'; 
import Home from "./pages/Home";
import Shop from "./pages/Shop";

function isAuthenticated() {
  // 增加token有效性检查（示例）
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  // 此处可添加JWT过期时间校验逻辑
  return true;
}

function PrivateRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 需要认证的私有路由 */}
        <Route element={<PrivateRoute />}>
          <Route index element={<Home />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/details/:itemId" element={<Details />} />
          <Route path="/shop" element={<Shop />} />
        </Route>

        {/* 兜底路由 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;