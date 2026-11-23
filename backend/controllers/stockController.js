import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";


// ==========================================
// STOCK IN
// ==========================================

export const stockIn = async (req, res) => {
  const { productId, quantity, note } = req.body;

  // Validate input
  if (!productId || !Number.isSafeInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid product ID and positive whole-number quantity are required",
    });
  }

  if (
    note !== undefined &&
    (typeof note !== "string" || note.length > 300)
  ) {
    return res.status(400).json({
      success: false,
      message: "Note must be text with a maximum of 300 characters",
    });
  }

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const product = await Product.findById(productId).session(session);

      if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
      }

      const previousQuantity = product.quantity;
      const newQuantity = previousQuantity + quantity;

      if (!Number.isSafeInteger(newQuantity)) {
        const error = new Error("Resulting stock quantity is too large");
        error.statusCode = 400;
        throw error;
      }

      product.quantity = newQuantity;

      await product.save({ session });

      await StockTransaction.create(
        [
          {
            product: product._id,
            type: "IN",
            quantity,
            previousQuantity,
            newQuantity,
            performedBy: req.user._id,
            note,
          },
        ],
        { session }
      );

      res.locals.stockResult = {
        product: product.name,
        previousQuantity,
        newQuantity,
        quantityReceived: quantity,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Stock received successfully",
      transaction: res.locals.stockResult,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to process stock transaction",
    });

  } finally {
    await session.endSession();
  }
};


// ==========================================
// STOCK OUT
// ==========================================

export const stockOut = async (req, res) => {
  const { productId, quantity, note } = req.body;

  // Validate input
  if (!productId || !Number.isSafeInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid product ID and positive whole-number quantity are required",
    });
  }

  if (
    note !== undefined &&
    (typeof note !== "string" || note.length > 300)
  ) {
    return res.status(400).json({
      success: false,
      message: "Note must be text with a maximum of 300 characters",
    });
  }

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const product = await Product.findById(productId).session(session);

      if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
      }

      const previousQuantity = product.quantity;

      if (quantity > previousQuantity) {
        const error = new Error(
          `Insufficient stock. Available quantity: ${previousQuantity}`
        );

        error.statusCode = 400;
        throw error;
      }

      const newQuantity = previousQuantity - quantity;

      product.quantity = newQuantity;

      await product.save({ session });

      await StockTransaction.create(
        [
          {
            product: product._id,
            type: "OUT",
            quantity,
            previousQuantity,
            newQuantity,
            performedBy: req.user._id,
            note,
          },
        ],
        { session }
      );

      res.locals.stockResult = {
        product: product.name,
        previousQuantity,
        newQuantity,
        quantityIssued: quantity,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Stock issued successfully",
      transaction: res.locals.stockResult,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to process stock transaction",
    });

  } finally {
    await session.endSession();
  }
};


// ==========================================
// STOCK ADJUSTMENT
// ==========================================

export const adjustStock = async (req, res) => {
  const { productId, physicalQuantity, note } = req.body;

  // Validate product ID
  if (!productId || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "A valid product ID is required.",
    });
  }

  // Validate physical quantity
  if (
    physicalQuantity === undefined ||
    !Number.isSafeInteger(physicalQuantity) ||
    physicalQuantity < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Physical quantity must be a non-negative whole number.",
    });
  }

  // Validate adjustment reason
  if (
    typeof note !== "string" ||
    !note.trim() ||
    note.length > 300
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid adjustment reason of up to 300 characters is required.",
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Find product
      const product = await Product.findById(productId).session(session);

      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      // Get previous and new quantities
      const previousQuantity = product.quantity;
      const newQuantity = physicalQuantity;

      // Check whether adjustment is necessary
      if (previousQuantity === newQuantity) {
        const error = new Error(
          "Physical quantity matches system quantity. No adjustment is necessary."
        );

        error.statusCode = 400;
        throw error;
      }

      // Calculate adjustment difference
      const difference = Math.abs(
        newQuantity - previousQuantity
      );

      // Update product quantity
      product.quantity = newQuantity;

      await product.save({ session });

      // Record adjustment transaction
      await StockTransaction.create(
        [
          {
            product: product._id,
            type: "ADJUSTMENT",
            quantity: difference,
            previousQuantity,
            newQuantity,
            performedBy: req.user._id,
            note: note.trim(),
          },
        ],
        { session }
      );

      res.locals.stockResult = {
        product: product.name,
        previousQuantity,
        newQuantity,
        difference,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Stock adjusted successfully.",
      transaction: res.locals.stockResult,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to process stock adjustment.",
    });

  } finally {
    await session.endSession();
  }
};


// ==========================================
// GET STOCK TRANSACTION HISTORY
// ==========================================

export const getStockTransactions = async (req, res) => {
  try {
    const transactions = await StockTransaction.find()
      .populate("product", "name sku category")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve stock transactions",
    });
  }
};