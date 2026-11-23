import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
  try {

    // Get total number of products
    const totalProducts = await Product.countDocuments();

    // Calculate total units in stock
    const stockResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalUnits: {
            $sum: "$quantity",
          },
        },
      },
    ]);

    const totalUnitsInStock = stockResult[0]?.totalUnits || 0;

    // Count low-stock products
    const lowStockProducts = await Product.countDocuments({
      $expr: {
        $lte: ["$quantity", "$lowStockThreshold"],
      },
    });

    // Get products that need restocking
    const restockingProducts = await Product.find({
      $expr: {
        $lte: ["$quantity", "$lowStockThreshold"],
      },
    })
      .select("name sku category quantity lowStockThreshold")
      .sort({ quantity: 1 });

    // Return dashboard statistics
    res.status(200).json({
      success: true,

      statistics: {
        totalProducts,
        totalUnitsInStock,
        lowStockProducts,
      },

      restockingProducts,

    });

  } catch (error) {

    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics",
    });

  }
};