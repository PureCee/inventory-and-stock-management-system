import express from "express";

import {
  loginAdmin,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/authController.js";


import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";


const router = express.Router();

// Login - Admin and Staff
router.post("/login", loginAdmin);

// Create user - Admin only
router.post("/users", protect, adminOnly, createUser);

// Get all users - Admin only
router.get("/users", protect, adminOnly, getUsers);

// Update user - Admin only
router.patch("/users/:id", protect, adminOnly, updateUser);

// Delete user - Admin only
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
