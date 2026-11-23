import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {

    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@stockmaster.com",
    });

    if (existingAdmin) {
      console.log("Administrator already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@12345",
      12
    );

    await User.create({
      name: "StockMaster Administrator",
      email: "admin@stockmaster.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Administrator created successfully.");

    process.exit(0);

  } catch (error) {

    console.error("Admin creation failed:", error.message);

    process.exit(1);

  }
};

createAdmin();