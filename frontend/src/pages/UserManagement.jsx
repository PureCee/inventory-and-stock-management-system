import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import API from "../services/api";
import Sidebar from "../components/Sidebar";

import "../styles/users.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const { admin } = useAuth();

  // ==================================
  // FETCH USERS
  // ==================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await API.get("/api/auth/users");

      setUsers(response.data.users);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to retrieve users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==================================
  // FORM INPUT HANDLING
  // ==================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==================================
  // OPEN ADD USER FORM
  // ==================================

  const openAddForm = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "staff",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  // ==================================
  // OPEN EDIT USER FORM
  // ==================================

  const openEditForm = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  // ==================================
  // CREATE OR UPDATE USER
  // ==================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!editingUser && formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        await API.patch(`/api/auth/users/${editingUser._id}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });

        setMessage("User updated successfully.");
      } else {
        await API.post("/api/auth/users", formData);

        setMessage("User created successfully.");
      }

      setShowForm(false);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "staff",
      });

      setEditingUser(null);

      await fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to save user.");
    } finally {
      setSaving(false);
    }
  };

  // ==================================
  // DELETE USER
  // ==================================

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await API.delete(`/api/auth/users/${user._id}`);

      setMessage("User deleted successfully.");

      await fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete user.");
    }
  };

  // ==================================
  // USER STATISTICS
  // ==================================

  const totalUsers = users.length;

  const totalAdmins = users.filter((user) => user.role === "admin").length;

  const totalStaff = users.filter((user) => user.role === "staff").length;

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    );
  });

  const isCurrentUser = (user) => {
    return user._id === admin?.id;
  };

  // ==================================
  // PAGE
  // ==================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* PAGE HEADER */}

        <div className="users-header">
          <div>
            <h1>User Management</h1>

            <p>Manage StockMaster users and their access permissions.</p>
          </div>

          <button className="add-user-button" onClick={openAddForm}>
            <UserPlus size={19} />
            Add User
          </button>
        </div>

        {/* SUCCESS AND ERROR MESSAGES */}

        {message && <div className="users-success">{message}</div>}

        {error && <div className="users-error">{error}</div>}

        {/* STATISTICS */}

        <div className="users-statistics">
          <div className="user-stat-card">
            <div className="user-stat-icon total">
              <Users size={24} />
            </div>

            <div>
              <h3>Total Users</h3>
              <h2>{totalUsers}</h2>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon admins">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h3>Administrators</h3>
              <h2>{totalAdmins}</h2>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon staff">
              <User size={24} />
            </div>

            <div>
              <h3>Staff Members</h3>
              <h2>{totalStaff}</h2>
            </div>
          </div>
        </div>

        {/* USERS TABLE */}

        <div className="users-table-container">
          <div className="users-table-header">
            <h2>Registered Users</h2>

            <div className="users-table-controls">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="users-search"
              />

              <span>{filteredUsers.length} users</span>
            </div>
          </div>

          {loading ? (
            <p className="users-loading">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="users-empty">No matching users found.</p>
          ) : (
            <div className="users-table-scroll">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>

                      <td>{user.email}</td>

                      <td>
                        <span className={`user-role ${user.role}`}>
                          {user.role}
                        </span>
                      </td>

                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                      <td>
                        <div className="user-actions">
                          <button
                            className="edit-user-button"
                            onClick={() => openEditForm(user)}
                            title="Edit User"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className="delete-user-button"
                            onClick={() => handleDelete(user)}
                            title={
                              isCurrentUser(user)
                                ? "You cannot delete your own account"
                                : "Delete User"
                            }
                            disabled={isCurrentUser(user)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ADD / EDIT USER MODAL */}

        {showForm && (
          <div className="user-modal-overlay">
            <div className="user-modal">
              <div className="user-modal-header">
                <h2>{editingUser ? "Edit User" : "Add New User"}</h2>

                <button
                  className="close-user-modal"
                  onClick={() => setShowForm(false)}
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="user-form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="user-form-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {!editingUser && (
                  <div className="user-form-group">
                    <label>Password</label>

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                    />
                  </div>
                )}

                <div className="user-form-group">
                  <label>User Role</label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={editingUser && isCurrentUser(editingUser)}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="user-form-actions">
                  <button
                    type="button"
                    className="cancel-user-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-user-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingUser
                        ? "Update User"
                        : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;
