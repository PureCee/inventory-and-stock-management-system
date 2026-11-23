import express from "express";

import {
  getDashboardStats,
} from "../controllers/dashboardController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect dashboard routes
router.use(protect);

// Dashboard statistics
router.get("/", getDashboardStats);

export default router;