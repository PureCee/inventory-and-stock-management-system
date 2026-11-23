import express from "express";

import {
    stockIn,
    stockOut,
    adjustStock,
    getStockTransactions
} from "../controllers/stockController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all stock management routes
router.use(protect);

// Stock In
router.post("/in", stockIn);

// Stock Out
router.post("/out", stockOut);

router.post("/adjustment", protect, adjustStock);

// Transaction History
router.get("/transactions", getStockTransactions);

export default router;