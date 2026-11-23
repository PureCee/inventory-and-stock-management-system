import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      price,
      quantity,
      lowStockThreshold,
    } = req.body;

    // Check required fields
    if (!name || !sku || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required product fields",
      });
    }

    // Check for existing SKU
    const existingProduct = await Product.findOne({
      sku: sku.trim().toUpperCase(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product SKU already exists",
      });
    }

    // Create product
    const product = await Product.create({
      name,
      sku,
      category,
      price,
      quantity,
      lowStockThreshold,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    // Search by product name or SKU
    if (search && search.trim()) {

      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex },
      ];

    }

    // Filter by category
    if (category && category.trim()) {
      filter.category = category.trim();
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Unable to retrieve products",
    });

  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      price,
      lowStockThreshold,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check whether the new SKU belongs to another product
    if (sku && sku.trim().toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({
        sku: sku.trim().toUpperCase(),
        _id: { $ne: product._id },
      });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: "SKU already belongs to another product",
        });
      }
    }

    // Update permitted fields
    if (name !== undefined) product.name = name;
    if (sku !== undefined) product.sku = sku;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;

    if (lowStockThreshold !== undefined) {
      product.lowStockThreshold = lowStockThreshold;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



