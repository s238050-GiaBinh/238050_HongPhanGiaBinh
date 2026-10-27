
const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

// Kiểm tra mã nhân viên
function isValidEmployeeId(id) {
  return typeof id === "string" &&
    /^[a-zA-Z0-9_-]+$/.test(id.trim());
}

// Tránh ký tự tìm kiếm làm sai biểu thức chính quy
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Tìm nhân viên theo MongoDB ID hoặc mã nhân viên
function findEmployee(id) {
  if (mongoose.isValidObjectId(id)) {
    return Employee.findOne({
      $or: [
        { _id: id },
        { employeeId: id }
      ]
    });
  }

  return Employee.findOne({ employeeId: id });
}

// Xử lý lỗi và trả về thông báo chi tiết
function handleError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Mã nhân viên hoặc email đã tồn tại",
      details: error.keyValue || {}
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: Object.values(error.errors).map(function (item) {
        return item.message;
      })
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Giá trị dữ liệu không đúng định dạng",
      details: error.message
    });
  }

  console.error("Lỗi API nhân viên:", error);

  return res.status(500).json({
    message: "Lỗi máy chủ",
    details: error.message
  });
}

// GET /api/employees?search=An
router.get("/", async function (req, res) {
  try {
    const search = String(req.query.search || "").trim();
    let employees;

    if (search) {
      const keyword = new RegExp(escapeRegex(search), "i");

      employees = await Employee.find({
        $or: [
          { employeeId: keyword },
          { fullName: keyword }
        ]
      }).sort({ employeeId: 1 });
    } else {
      employees = await Employee.find().sort({ employeeId: 1 });
    }

    return res.status(200).json({
      message: "Lấy danh sách nhân viên thành công",
      count: employees.length,
      data: employees
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// GET /api/employees/:id
router.get("/:id", async function (req, res) {
  try {
    const employee = await findEmployee(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin nhân viên thành công",
      data: employee
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// POST /api/employees
router.post("/", async function (req, res) {
  try {
    const body = req.body || {};

    if (!isValidEmployeeId(body.employeeId)) {
      return res.status(400).json({
        message: "Mã nhân viên không hợp lệ",
        errors: [
          "Mã nhân viên chỉ được chứa chữ cái, chữ số, dấu gạch ngang hoặc gạch dưới."
        ]
      });
    }

    const employee = new Employee(body);
    const savedEmployee = await employee.save();

    return res.status(201).json({
      message: "Thêm nhân viên thành công",
      data: savedEmployee
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// PUT /api/employees/:id
router.put("/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const body = req.body || {};

    if (
      body.employeeId !== undefined &&
      !isValidEmployeeId(body.employeeId)
    ) {
      return res.status(400).json({
        message: "Mã nhân viên không hợp lệ"
      });
    }

    const employee = await findEmployee(id);

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    const allowedFields = [
      "employeeId",
      "fullName",
      "gender",
      "dateOfBirth",
      "department",
      "position",
      "email",
      "phone",
      "hireDate",
      "status"
    ];

    for (let i = 0; i < allowedFields.length; i++) {
      const field = allowedFields[i];

      if (body[field] !== undefined) {
        employee[field] = body[field];
      }
    }

    const updatedEmployee = await employee.save();

    return res.status(200).json({
      message: "Cập nhật nhân viên thành công",
      data: updatedEmployee
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// DELETE /api/employees/:id
router.delete("/:id", async function (req, res) {
  try {
    const employee = await findEmployee(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    await Employee.deleteOne({ _id: employee._id });

    return res.status(200).json({
      message: "Xóa nhân viên thành công",
      data: {
        employeeId: employee.employeeId
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
});

module.exports = router;
