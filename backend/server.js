// Import required packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Import database connection
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";

import authRoutes from "./routes/authRoutes.js";

import stockRoutes from "./routes/stockRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Get port
const PORT = process.env.PORT || 5000;


// =================================
// MIDDLEWARE CONFIGURATION
// =================================

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [ "http://localhost:5173",
    "https://inventory-and-stock-management-syst.vercel.app"
    ],
    credentials: true
  })
);

app.use(helmet());

app.use(morgan("dev"));

// API Routes

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/stock", stockRoutes);

app.use("/api/dashboard", dashboardRoutes);


// =================================
// TEST ROUTE
// =================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to StockMaster API",
  });
});


// =================================
// START SERVER
// =================================

const startServer = async () => {
  try {

    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`StockMaster server running on port ${PORT}`);
    });

  } catch (error) {

    console.error("Unable to start server:", error.message);

    process.exit(1);
  }
};

startServer();