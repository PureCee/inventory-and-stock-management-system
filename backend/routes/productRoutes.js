import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All product routes require authentication
router.use(protect);

// Create product
router.post("/", createProduct);

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Update product
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

export default router;