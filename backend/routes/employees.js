
const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

function isValidEmployeeId(id) {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findEmployee(id) {
  if (mongoose.isValidObjectId(id)) {
    return Employee.findOne({
      $or: [{ _id: id }, { employeeId: id }]
    });
  }

  return Employee.findOne({ employeeId: id });
}

function handleError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Mã nhân viên đã tồn tại"
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

  console.error(error);

  return res.status(500).json({
    message: "Lỗi máy chủ"
  });
}

// GET /api/employees?search=An
router.get("/", async function (req, res) {
  try {
    const search = String(req.query.search || "").trim();
    let employees;

    if (search.length > 0) {
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
    const employee = new Employee(req.body);
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

    if (req.body.employeeId !== undefined &&
        !isValidEmployeeId(req.body.employeeId)) {
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

      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
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
