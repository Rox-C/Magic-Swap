import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MainLayout from "./layouts/MainLayout";
import Wardrobe from "./pages/Wardrobe";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Shop from "./pages/Shop";

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

function PrivateRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;