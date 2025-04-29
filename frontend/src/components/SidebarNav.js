import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./SidebarNav.css";

const navItems = [
  { path: "/", icon: require("../assets/home.png"), label: "首页" },
  { path: "/shop", icon: require("../assets/shop.png"), label: "商城" },
  { path: "/wardrobe", icon: require("../assets/wardrobe.png"), label: "衣橱" },
  { path: "/profile", icon: require("../assets/profile.png"), label: "我的" }
];

const SidebarNav = () => {
  const location = useLocation();

  return (
    <div className="sidebar-nav">
      {navItems.map((item) => (
        <Link
            style={{ textDecoration:'none'}}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          key={item.path}
        >
          <img src={item.icon} alt={item.label} />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default SidebarNav;