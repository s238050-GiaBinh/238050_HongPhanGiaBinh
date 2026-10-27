
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const employeeRoutes = require("./routes/employees");

const app = express();

// Cấu hình CORS
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/", function (req, res) {
  res.status(200).json({
    message: "He thong quan ly nhan vien API",
    status: "OK",
    health: "/health",
    employees: "/api/employees"
  });
});

// Cho phép Backend đọc dữ liệu JSON
app.use(express.json());

// Kiểm tra trạng thái Backend và MongoDB
app.get("/health", function (req, res) {
  res.status(200).json({
    status: "OK",
    message: "Backend đang hoạt động",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});

// API quản lý nhân viên
app.use("/api/employees", employeeRoutes);

// Xử lý đường dẫn không tồn tại
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
