
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const employeeRoutes = require("./routes/employees");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(express.json());

app.get("/health", function (req, res) {
  res.status(200).json({
    status: "OK",
    message: "Backend đang hoạt động",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});

app.use("/api/employees", employeeRoutes);

app.use(function (req, res) {
  res.status(404).json({
    message: "Đường dẫn API không tồn tại"
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  if (!MONGODB_URI) {
    console.error("Thiếu biến môi trường MONGODB_URI");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);

    console.log("Đã kết nối MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", function () {
      console.log("Backend đang chạy trên cổng " + PORT);
    });
  } catch (error) {
    console.error("Không thể kết nối MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
