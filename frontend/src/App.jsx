import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import StockManagement from "./pages/StockManagement";
import UserManagement from "./pages/UserManagement";


// ==================================
// HOME REDIRECT
// ==================================

const HomeRedirect = () => {
  const { token } = useAuth();

  return (
    <Navigate
      to={token ? "/dashboard" : "/login"}
      replace
    />
  );
};


// ==================================
// ADMIN-ONLY ROUTE
// ==================================

const AdminRoute = () => {
  const { admin } = useAuth();

  if (admin?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};


// ==================================
// MAIN APP
// ==================================

const App = () => {

  return (

    <BrowserRouter>

      <AuthProvider>

        <Routes>

          <Route path="/" element={<HomeRedirect />} />

          <Route path="/login" element={<Login />} />


          {/* Authenticated Routes */}
          <Route element={<ProtectedRoute />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/stock"
              element={<StockManagement />}
            />


            {/* Administrator-Only Routes */}
            <Route element={<AdminRoute />}>

              <Route
                path="/users"
                element={<UserManagement />}
              />

            </Route>

          </Route>


          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>

  );

};

export default App;
