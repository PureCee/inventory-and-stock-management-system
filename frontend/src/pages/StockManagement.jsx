import { useEffect, useState } from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  History,
} from "lucide-react";

import API from "../services/api";

import Sidebar from "../components/Sidebar";

import "../styles/stock.css";

const StockManagement = () => {
  const [products, setProducts] = useState([]);

  const [transactions, setTransactions] = useState([]);

  const [type, setType] = useState("IN");

  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState("");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [physicalQuantity, setPhysicalQuantity] = useState("");

  const selectedProduct = products.find((product) => product._id === productId);

  // Fetch products
  const fetchProducts = async () => {
    const response = await API.get("/api/products");

    setProducts(response.data.products);
  };

  // Fetch transaction history
  const fetchTransactions = async () => {
    const response = await API.get("/api/stock/transactions");

    setTransactions(response.data.transactions);
  };

  // Load page data
  const loadData = async () => {
    try {
      setFetching(true);
      setError("");

      await Promise.all([fetchProducts(), fetchTransactions()]);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load stock information",
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle stock submission
  // Handle stock submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (!productId) {
        throw new Error("Please select a product.");
      }

      let response;

      // STOCK ADJUSTMENT
      if (type === "ADJUSTMENT") {
        if (
          physicalQuantity === "" ||
          !Number.isSafeInteger(Number(physicalQuantity)) ||
          Number(physicalQuantity) < 0
        ) {
          throw new Error("Enter a valid physical quantity.");
        }

        if (!note.trim()) {
          throw new Error("Please provide an adjustment reason.");
        }

        response = await API.post("/api/stock/adjustment", {
          productId,
          physicalQuantity: Number(physicalQuantity),
          note,
        });
      } else {
        // STOCK IN AND STOCK OUT
        if (!Number.isSafeInteger(Number(quantity)) || Number(quantity) <= 0) {
          throw new Error("Enter a valid positive quantity.");
        }

        response = await API.post(
          type === "IN" ? "/api/stock/in" : "/api/stock/out",
          {
            productId,
            quantity: Number(quantity),
            note,
          },
        );
      }

      // Successful transaction
      setMessage(response.data.message);

      setQuantity("");
      setPhysicalQuantity("");
      setNote("");

      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to process stock transaction.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-layout">
      <Sidebar />

      <main className="stock-main">
        <header className="stock-header">
          <div>
            <h1>Stock Management</h1>

            <p>Manage incoming and outgoing inventory</p>
          </div>

          <button
            className="stock-refresh"
            onClick={loadData}
            disabled={fetching}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        {message && <div className="stock-success">{message}</div>}

        {error && <div className="stock-error">{error}</div>}

        {fetching ? (
          <div className="stock-loading">Loading stock information...</div>
        ) : (
          <>
            {/* Stock Movement Tabs */}

            <section className="stock-tabs">
              <button
                type="button"
                className={type === "IN" ? "active" : ""}
                onClick={() => setType("IN")}
              >
                Stock In
              </button>

              <button
                type="button"
                className={type === "OUT" ? "active" : ""}
                onClick={() => setType("OUT")}
              >
                Stock Out
              </button>

              <button
                type="button"
                className={type === "ADJUSTMENT" ? "active" : ""}
                onClick={() => setType("ADJUSTMENT")}
              >
                Stock Adjustment
              </button>
            </section>

            {/* Stock Transaction Form */}

            <section className="stock-form-section">
              <div className="stock-form-heading">
                <h2>
                  {type === "IN"
                    ? "Receive New Stock"
                    : type === "OUT"
                      ? "Issue Stock"
                      : "Adjust Stock Quantity"}
                </h2>

                <p>
                  {type === "IN"
                    ? "Record additional products received into inventory."
                    : type === "OUT"
                      ? "Record products leaving your inventory."
                      : "Correct inventory quantities after a physical stock count."}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="stock-form-grid">
                  <div className="stock-field">
                    <label>Select Product</label>

                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      required
                    >
                      <option value="">Choose a product</option>

                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stock-field">
                    <label>Available Quantity</label>

                    <input
                      type="text"
                      value={
                        selectedProduct
                          ? selectedProduct.quantity
                          : "Select a product"
                      }
                      readOnly
                    />
                  </div>

                  {type === "ADJUSTMENT" ? (
                    <div className="form-group">
                      <label>Physical Stock Quantity</label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={physicalQuantity}
                        onChange={(e) => setPhysicalQuantity(e.target.value)}
                        placeholder="Enter actual physical quantity"
                        required
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Quantity</label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        required
                      />
                    </div>
                  )}

                  {type === "ADJUSTMENT" &&
                    selectedProduct &&
                    physicalQuantity !== "" && (
                      <div className="adjustment-preview">
                        <h4>Adjustment Preview</h4>

                        <p>
                          Current System Quantity:{" "}
                          <strong>{selectedProduct.quantity}</strong>
                        </p>

                        <p>
                          Physical Quantity:{" "}
                          <strong>{Number(physicalQuantity)}</strong>
                        </p>

                        <p>
                          Difference:{" "}
                          <strong>
                            {Number(physicalQuantity) -
                              selectedProduct.quantity >
                            0
                              ? `+${Number(physicalQuantity) - selectedProduct.quantity}`
                              : Number(physicalQuantity) -
                                selectedProduct.quantity}
                          </strong>
                        </p>

                        <p>
                          New System Quantity:{" "}
                          <strong>{Number(physicalQuantity)}</strong>
                        </p>
                      </div>
                    )}

                  <div className="stock-field">
                    <label>Transaction Note</label>

                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Enter transaction details"
                      maxLength={300}
                    />
                  </div>
                </div>

                {selectedProduct && (
                  <div className="stock-preview">
                    <strong>
                      {type === "ADJUSTMENT"
                        ? "Adjusted Stock Quantity:"
                        : "Expected Stock After Transaction:"}
                    </strong>

                    <span>
                      {type === "ADJUSTMENT"
                        ? physicalQuantity === ""
                          ? selectedProduct.quantity
                          : Number(physicalQuantity)
                        : type === "IN"
                          ? selectedProduct.quantity + Number(quantity || 0)
                          : selectedProduct.quantity - Number(quantity || 0)}
                    </span>
                  </div>
                )}

                <button type="submit" disabled={loading}>
                  {loading
                    ? "Processing..."
                    : type === "IN"
                      ? "Receive Stock"
                      : type === "OUT"
                        ? "Issue Stock"
                        : "Adjust Stock"}
                </button>
              </form>
            </section>

            {/* Transaction History */}

            <section className="transaction-section">
              <div className="transaction-heading">
                <div>
                  <h2>
                    <History size={20} />
                    Stock Transaction History
                  </h2>

                  <p>Track all incoming and outgoing stock movements.</p>
                </div>

                <span>{transactions.length} Transactions</span>
              </div>

              {transactions.length === 0 ? (
                <div className="transaction-empty">
                  <History size={35} />

                  <h3>No transactions recorded</h3>

                  <p>Your stock movements will appear here.</p>
                </div>
              ) : (
                <div className="transaction-table-container">
                  <table className="transaction-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Previous Stock</th>
                        <th>New Stock</th>
                        <th>Performed By</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>
                            {new Date(
                              transaction.createdAt,
                            ).toLocaleDateString()}
                          </td>

                          <td>
                            {transaction.product?.name || "Deleted Product"}
                          </td>

                          <td>{transaction.product?.sku || "N/A"}</td>

                          <td>
                            <span
                              className={`transaction-badge ${
                                transaction.type === "IN"
                                  ? "in"
                                  : transaction.type === "OUT"
                                    ? "out"
                                    : "adjustment"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>

                          <td>{transaction.quantity}</td>

                          <td>{transaction.previousQuantity}</td>

                          <td>{transaction.newQuantity}</td>

                          <td>{transaction.performedBy?.name || "Unknown"}</td>
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

export default StockManagement;
