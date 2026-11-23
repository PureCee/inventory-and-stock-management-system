import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ==================================
// ADMIN AND STAFF LOGIN
// ==================================

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    // Return response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      // Keep "admin" for compatibility with your existing frontend
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


// ==================================
// CREATE NEW USER
// ADMIN ONLY
// ==================================

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // Validate name
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid name.",
      });
    }

    // Validate email
    if (typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate password
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    // Validate role
    const userRole = role || "staff";

    if (!["admin", "staff"].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
    });

    return res.status(201).json({
      success: true,
      message: "User account created successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create user account.",
    });
  }
};

// ==================================
// GET ALL USERS
// ADMIN ONLY
// ==================================

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users.",
    });
  }
};


// ==================================
// UPDATE USER
// ADMIN ONLY
// ==================================

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email and role are required.",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !["admin", "staff"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user information.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent changing your own administrator role
    if (
      user._id.toString() === req.user._id.toString() &&
      role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own administrator role.",
      });
    }

    // Prevent demoting the last administrator
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot demote the last administrator.",
        });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email address is already in use.",
      });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user.",
    });
  }
};

// ==================================
// DELETE USER
// ADMIN ONLY
// ==================================

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent administrator from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    // Prevent deleting the last administrator
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete the last administrator.",
        });
      }
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });

  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete user.",
    });
  }
};

