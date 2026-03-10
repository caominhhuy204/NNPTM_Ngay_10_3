const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user.route");
const roleRoutes = require("./routes/role.route");

const app = express();

app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/user_role_db")
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

app.use("/users", userRoutes);
app.use("/roles", roleRoutes);

module.exports = app;