const mongoose = require("mongoose");
const Role = require("../models/role.model");
const User = require("../models/user.model");

// CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const existingRole = await Role.findOne({ name, isDeleted: false });
    if (existingRole) {
      return res.status(400).json({
        message: "Role name already exists",
      });
    }

    const role = await Role.create({
      name,
      description,
    });

    return res.status(201).json({
      message: "Create role successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating role",
      error: error.message,
    });
  }
};

// GET ALL ROLES
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false });

    return res.status(200).json({
      message: "Get all roles successfully",
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting roles",
      error: error.message,
    });
  }
};

// GET ROLE BY ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid role id",
      });
    }

    const role = await Role.findOne({ _id: id, isDeleted: false });

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    return res.status(200).json({
      message: "Get role successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting role",
      error: error.message,
    });
  }
};

// UPDATE ROLE
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid role id",
      });
    }

    const role = await Role.findOne({ _id: id, isDeleted: false });

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    if (name) {
      const duplicateRole = await Role.findOne({
        name,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (duplicateRole) {
        return res.status(400).json({
          message: "Role name already exists",
        });
      }

      role.name = name;
    }

    if (description !== undefined) {
      role.description = description;
    }

    await role.save();

    return res.status(200).json({
      message: "Update role successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating role",
      error: error.message,
    });
  }
};

// SOFT DELETE ROLE
exports.softDeleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid role id",
      });
    }

    const role = await Role.findOne({ _id: id, isDeleted: false });

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    role.isDeleted = true;
    await role.save();

    return res.status(200).json({
      message: "Soft delete role successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting role",
      error: error.message,
    });
  }
};

// GET USERS BY ROLE ID
exports.getUsersByRoleId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid role id",
      });
    }

    const role = await Role.findOne({ _id: id, isDeleted: false });

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    const users = await User.find({
      role: id,
      isDeleted: false,
    })
      .select("-password")
      .populate("role", "name description");

    return res.status(200).json({
      message: "Get users by role successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting users by role",
      error: error.message,
    });
  }
};