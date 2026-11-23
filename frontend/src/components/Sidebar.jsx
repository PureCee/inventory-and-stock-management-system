import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>StockMaster</h2>
        <span>Inventory System</span>
      </div>

      <nav className="sidebar-menu">

        <NavLink to="/dashboard" className="sidebar-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/products" className="sidebar-link">
          <Package size={20} />
          <span>Products</span>
        </NavLink>

        <NavLink to="/stock" className="sidebar-link">
          <ClipboardList size={20} />
          <span>Stock Management</span>
        </NavLink>

        {admin?.role === "admin" && (
          <NavLink
            to="/users"
            className="sidebar-link"
          >
            <Users size={20} />
            <span>User Management</span>
          </NavLink>
        )}

      </nav>

      <button className="logout-button" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>

    </aside>
  );
};

export default Sidebar;
