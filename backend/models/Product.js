import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      required: [true, "Low stock threshold is required"],
      min: [0, "Threshold cannot be negative"],
      default: 5,
    },
  },

  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;