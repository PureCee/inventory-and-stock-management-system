import { useEffect, useState } from "react";

import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";

import API from "../services/api";

import Sidebar from "../components/Sidebar";

import "../styles/products.css";

const initialForm = {
  name: "",
  sku: "",
  category: "",
  price: "",
  quantity: "",
  lowStockThreshold: "5",
};

const Products = () => {

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  const [saving, setSaving] = useState(false);

  // Fetch products
  const fetchProducts = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await API.get("/api/products", {
        params: {
          search,
          category,
        },
      });

      setProducts(response.data.products);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Unable to retrieve products"
      );

    } finally {

      setLoading(false);

    }

  };

  // Load products when search or category changes
  useEffect(() => {

    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timer);

  }, [search, category]);

  // Get unique categories
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ];

  // Handle input changes
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };

  // Open Add Product Form
  const handleAddProduct = () => {

    setEditingProduct(null);

    setFormData(initialForm);

    setShowForm(true);

    setMessage("");

  };

  // Open Edit Product Form
  const handleEditProduct = (product) => {

    setEditingProduct(product);

    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      lowStockThreshold: String(product.lowStockThreshold),
    });

    setShowForm(true);

    setMessage("");

  };

  // Submit Product Form
  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    const price = Number(formData.price);

    const lowStockThreshold = Number(
      formData.lowStockThreshold
    );

    const quantity = Number(formData.quantity);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isSafeInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {

      setError("Please enter valid product values.");

      return;

    }

    if (!editingProduct) {

      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 0
      ) {

        setError("Quantity must be a valid non-negative whole number.");

        return;

      }

    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category.trim(),
      price,
      lowStockThreshold,
    };

    if (!editingProduct) {
      payload.quantity = quantity;
    }

    try {

      setSaving(true);

      if (editingProduct) {

        await API.put(
          `/api/products/${editingProduct._id}`,
          payload
        );

        setMessage("Product updated successfully.");

      } else {

        await API.post("/api/products", payload);

        setMessage("Product added successfully.");

      }

      setShowForm(false);

      setEditingProduct(null);

      setFormData(initialForm);

      await fetchProducts();

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Unable to save product"
      );

    } finally {

      setSaving(false);

    }

  };

  // Delete Product
  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {

      await API.delete(`/api/products/${id}`);

      setMessage("Product deleted successfully.");

      await fetchProducts();

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Unable to delete product"
      );

    }

  };

  return (

    <div className="products-layout">

      <Sidebar />

      <main className="products-main">

        {/* Page Header */}

        <header className="products-header">

          <div>
            <h1>Products</h1>

            <p>
              Manage your inventory products
            </p>
          </div>

          <button
            className="add-product-btn"
            onClick={handleAddProduct}
          >
            <Plus size={18} />
            Add Product
          </button>

        </header>


        {/* Messages */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* Search and Filter */}

        <section className="products-toolbar">

          <div className="search-box">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >

            <option value="">All Categories</option>

            {categories.map((item) => (

              <option key={item} value={item}>
                {item}
              </option>

            ))}

          </select>

          <button
            className="refresh-products"
            onClick={fetchProducts}
            disabled={loading}
            title="Refresh products"
          >
            <RefreshCw size={18} />
          </button>

        </section>


        {/* Product Form */}

        {showForm && (

          <div className="product-form-overlay">

            <div className="product-form-card">

              <div className="form-header">

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <button
                  onClick={() => setShowForm(false)}
                  className="close-form-btn"
                >
                  <X size={20} />
                </button>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="product-form-grid">

                  <div className="product-form-group">

                    <label>Product Name</label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      required
                    />

                  </div>

                  <div className="product-form-group">

                    <label>SKU / Product Code</label>

                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="Enter SKU"
                      required
                    />

                  </div>

                  <div className="product-form-group">

                    <label>Category</label>

                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Enter category"
                      required
                    />

                  </div>

                  <div className="product-form-group">

                    <label>Unit Price</label>

                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />

                  </div>

                  {!editingProduct && (

                    <div className="product-form-group">

                      <label>Opening Quantity</label>

                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        required
                      />

                    </div>

                  )}

                  <div className="product-form-group">

                    <label>Low-Stock Threshold</label>

                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      required
                    />

                  </div>

                </div>

                <div className="product-form-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-product-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingProduct
                        ? "Update Product"
                        : "Save Product"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}


        {/* Products Table */}

        <section className="products-table-section">

          <div className="table-heading">

            <h2>Product Inventory</h2>

            <span>
              {products.length} Products
            </span>

          </div>

          {loading ? (

            <div className="products-loading">
              Loading products...
            </div>

          ) : error ? (

            <div className="products-loading">
              Products could not be loaded.
            </div>

          ) : products.length === 0 ? (

            <div className="products-empty">

              <h3>No products found</h3>

              <p>
                Add a new product or adjust your search.
              </p>

            </div>

          ) : (

            <div className="products-table-container">

              <table className="products-table">

                <thead>

                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Threshold</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {products.map((product) => (

                    <tr key={product._id}>

                      <td className="product-name">
                        {product.name}
                      </td>

                      <td>{product.sku}</td>

                      <td>{product.category}</td>

                      <td>
                        {product.price.toLocaleString()}
                      </td>

                      <td>{product.quantity}</td>

                      <td>{product.lowStockThreshold}</td>

                      <td>

                        <span className={
                          product.quantity === 0
                            ? "product-status out"
                            : product.quantity <= product.lowStockThreshold
                              ? "product-status low"
                              : "product-status available"
                        }>

                          {product.quantity === 0
                            ? "Out of Stock"
                            : product.quantity <= product.lowStockThreshold
                              ? "Low Stock"
                              : "Available"}

                        </span>

                      </td>

                      <td>

                        <div className="product-actions">

                          <button
                            className="edit-btn"
                            onClick={() => handleEditProduct(product)}
                            title="Edit product"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(product._id)}
                            title="Delete product"
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

        </section>

      </main>

    </div>

  );

};

export default Products;