const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Role = require("../models/role.model");

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;

    if (!username || !password || !email || !role) {
      return res.status(400).json({
        message: "Username, password, email, role are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      isDeleted: false,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(role)) {
      return res.status(400).json({
        message: "Invalid role id",
      });
    }

    const foundRole = await Role.findOne({ _id: role, isDeleted: false });
    if (!foundRole) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      fullName,
      avatarUrl,
      role,
    });

    const result = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description");

    return res.status(201).json({
      message: "Create user successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const { username } = req.query;

    const filter = { isDeleted: false };

    if (username) {
      filter.username = { $regex: username, $options: "i" };
    }

    const users = await User.find(filter)
      .select("-password")
      .populate("role", "name description");

    return res.status(200).json({
      message: "Get all users successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting users",
      error: error.message,
    });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: false,
    })
      .select("-password")
      .populate("role", "name description");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Get user successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting user",
      error: error.message,
    });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, email, fullName, avatarUrl, role, loginCount, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const user = await User.findOne({ _id: id, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (username) {
      const duplicateUsername = await User.findOne({
        username,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (duplicateUsername) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }

      user.username = username;
    }

    if (email) {
      const duplicateEmail = await User.findOne({
        email,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (duplicateEmail) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      user.email = email;
    }

    if (role) {
      if (!mongoose.Types.ObjectId.isValid(role)) {
        return res.status(400).json({
          message: "Invalid role id",
        });
      }

      const foundRole = await Role.findOne({ _id: role, isDeleted: false });

      if (!foundRole) {
        return res.status(404).json({
          message: "Role not found",
        });
      }

      user.role = role;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (loginCount !== undefined) user.loginCount = loginCount;
    if (status !== undefined) user.status = status;

    await user.save();

    const result = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description");

    return res.status(200).json({
      message: "Update user successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};

// SOFT DELETE USER
exports.softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const user = await User.findOne({ _id: id, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isDeleted = true;
    await user.save();

    return res.status(200).json({
      message: "Soft delete user successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// ENABLE USER
exports.enableUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        message: "Email and username are required",
      });
    }

    const user = await User.findOne({
      email,
      username,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found or information is incorrect",
      });
    }

    user.status = true;
    await user.save();

    const result = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description");

    return res.status(200).json({
      message: "User enabled successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error enabling user",
      error: error.message,
    });
  }
};

// DISABLE USER
exports.disableUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        message: "Email and username are required",
      });
    }

    const user = await User.findOne({
      email,
      username,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found or information is incorrect",
      });
    }

    user.status = false;
    await user.save();

    const result = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description");

    return res.status(200).json({
      message: "User disabled successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error disabling user",
      error: error.message,
    });
  }
};