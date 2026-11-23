import { useEffect, useState } from "react";

import {
  Package,
  Boxes,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import API from "../services/api";

import Sidebar from "../components/Sidebar";

import "../styles/dashboard.css";

const Dashboard = () => {

  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    totalUnitsInStock: 0,
    lowStockProducts: 0,
  });

  const [restockingProducts, setRestockingProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchDashboard = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await API.get("/api/dashboard");

      setStatistics(response.data.statistics);

      setRestockingProducts(response.data.restockingProducts);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Unable to load dashboard information"
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Products",
      value: statistics.totalProducts,
      icon: <Package size={25} />,
      color: "blue",
    },
    {
      title: "Total Units in Stock",
      value: statistics.totalUnitsInStock,
      icon: <Boxes size={25} />,
      color: "green",
    },
    {
      title: "Low-Stock Products",
      value: statistics.lowStockProducts,
      icon: <AlertTriangle size={25} />,
      color: "orange",
    },
  ];

  return (

    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>
            <p>Overview of your inventory</p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </header>

        {error && (
          <div className="dashboard-error">
            {error}
            <button onClick={fetchDashboard}>Try again</button>
          </div>
        )}

        {loading ? (

          <div className="loading-message">
            Loading dashboard...
          </div>

        ) : !error && (

          <>

            <section className="dashboard-cards">

              {cards.map((card, index) => (

                <div className="stat-card" key={index}>

                  <div className={`stat-icon ${card.color}`}>
                    {card.icon}
                  </div>

                  <div>
                    <p>{card.title}</p>
                    <h2>{card.value.toLocaleString()}</h2>
                  </div>

                </div>

              ))}

            </section>

            <section className="restocking-section">

              <div className="section-header">
                <div>
                  <h2>Products Requiring Restocking</h2>
                  <p>Products at or below their low-stock threshold</p>
                </div>

                <span className="product-count">
                  {restockingProducts.length} Products
                </span>
              </div>

              {restockingProducts.length === 0 ? (

                <div className="empty-state">
                  <Package size={35} />
                  <h3>No products require restocking</h3>
                  <p>Your inventory levels are currently healthy.</p>
                </div>

              ) : (

                <div className="table-container">

                  <table>

                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Available Stock</th>
                        <th>Threshold</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>

                      {restockingProducts.map((product) => (

                        <tr key={product._id}>

                          <td>{product.name}</td>

                          <td>{product.sku}</td>

                          <td>{product.category}</td>

                          <td>{product.quantity}</td>

                          <td>{product.lowStockThreshold}</td>

                          <td>
                            <span className={
                              product.quantity === 0
                                ? "status-badge out"
                                : "status-badge low"
                            }>
                              {product.quantity === 0
                                ? "Out of Stock"
                                : "Low Stock"}
                            </span>
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </>

        )}

      </main>

    </div>

  );

};

export default Dashboard;