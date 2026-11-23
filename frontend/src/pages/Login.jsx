import { useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import "../styles/login.css";

const Login = () => {

  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");

    const result = await login(email, password);

    if (result.success) {

      navigate("/dashboard");

    } else {

      setMessage(result.message);

    }

  };

  return (

    <div className="login-container">

      <div className="login-card">

        <div className="login-header">

          <h1>StockKeeping</h1>

          <p>Inventory Management System</p>

        </div>

        <h2>Administrator/Staff Login</h2>

        <p className="login-subtitle">
          Sign in to manage your inventory
        </p>

        {message && (
          <div className="error-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading ? "Signing in..." : "Login"}

          </button>

        </form>

        <p className="login-footer">
          StockMaster Inventory System
        </p>

      </div>

    </div>

  );

};

export default Login;
