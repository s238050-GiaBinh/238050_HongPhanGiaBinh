
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const emptyForm = {
  employeeId: "",
  fullName: "",
  gender: "Nam",
  dateOfBirth: "",
  department: "",
  position: "",
  email: "",
  phone: "",
  hireDate: "",
  status: "Dang lam viec"
};

async function requestApi(url, options = {}) {
  const response = await fetch(url, options);
  const result = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(result.message || "Yeu cau khong thanh cong");
  }

  return result;
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadEmployees(keyword) {
    setLoading(true);
    setError("");

    try {
      const query = keyword
        ? "?search=" + encodeURIComponent(keyword)
        : "";

      const result = await requestApi(API_URL + "/employees" + query);
      setEmployees(result.data || []);
    } catch (err) {
      setError(err.message || "Khong the tai danh sach nhan vien");
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadEmployees("");
  }, []);

  function handleSearch(event) {
    const keyword = event.target.value;
    setSearch(keyword);
    loadEmployees(keyword);
  }

  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    setForm(function (previous) {
      return { ...previous, [name]: value };
    });
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId("");
    setNotice("");
  }

  function editEmployee(employee) {
    setForm({
      employeeId: employee.employeeId || "",
      fullName: employee.fullName || "",
      gender: employee.gender || "Nam",
      dateOfBirth: employee.dateOfBirth || "",
      department: employee.department || "",
      position: employee.position || "",
      email: employee.email || "",
      phone: employee.phone || "",
      hireDate: employee.hireDate || "",
      status: employee.status || "Dang lam viec"
    });

    setEditingId(employee.employeeId || employee._id);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const url = editingId
        ? API_URL + "/employees/" + encodeURIComponent(editingId)
        : API_URL + "/employees";

      const result = await requestApi(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      setNotice(result.message || "Luu thong tin thanh cong");
      setForm({ ...emptyForm });
      setEditingId("");
      await loadEmployees(search);
    } catch (err) {
      setError(err.message || "Khong the luu nhan vien");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(employee) {
    const confirmed = window.confirm(
      "Ban co chac muon xoa nhan vien " +
      employee.fullName +
      " (" +
      employee.employeeId +
      ") khong?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const id = employee.employeeId || employee._id;

      const result = await requestApi(
        API_URL + "/employees/" + encodeURIComponent(id),
        { method: "DELETE" }
      );

      setNotice(result.message || "Xoa nhan vien thanh cong");

      if (editingId === id) {
        resetForm();
      }

      await loadEmployees(search);
    } catch (err) {
      setError(err.message || "Khong the xoa nhan vien");
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">HUMAN RESOURCE MANAGEMENT</p>
          <h1>Quản lý nhân sự</h1>
          <p className="subtitle">
            Quản lý hồ sơ nhân viên trên nền tảng đám mây
          </p>
        </div>
        <div className="employee-count">
          <span>Tổng nhân viên đang hiển thị</span>
          <strong>{employees.length}</strong>
        </div>
      </header>

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="alert success" role="status">
          {notice}
        </div>
      )}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>{editingId ? "Cập nhật nhân viên" : "Thêm nhân viên"}</h2>
            <p>Nhập các trường có dấu * để lưu hồ sơ.</p>
          </div>
          {editingId && (
            <button
              type="button"
              className="button secondary"
              onClick={resetForm}
            >
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Mã nhân viên *
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                required
                maxLength="30"
                pattern="[a-zA-Z0-9_-]+"
                title="Chỉ sử dụng chữ, số, dấu gạch ngang hoặc gạch dưới"
                disabled={Boolean(editingId)}
              />
            </label>

            <label>
              Họ và tên *
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                maxLength="100"
              />
            </label>

            <label>
              Giới tính
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Khac">Khác</option>
              </select>
            </label>

            <label>
              Ngày sinh
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </label>

            <label>
              Phòng ban
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                maxLength="100"
              />
            </label>

            <label>
              Chức vụ
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                maxLength="100"
              />
            </label>

            <label>
              Email *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength="150"
              />
            </label>

            <label>
              Số điện thoại
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength="20"
              />
            </label>

            <label>
              Ngày vào làm
              <input
                type="date"
                name="hireDate"
                value={form.hireDate}
                onChange={handleChange}
              />
            </label>

            <label>
              Trạng thái
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Dang lam viec">Đang làm việc</option>
                <option value="Tam nghi">Tạm nghỉ</option>
                <option value="Da nghi viec">Đã nghỉ việc</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button className="button primary" type="submit" disabled={saving}>
              {saving
                ? "Đang lưu..."
                : editingId
                  ? "Lưu cập nhật"
                  : "Thêm nhân viên"}
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={resetForm}
            >
              Làm mới biểu mẫu
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading list-heading">
          <div>
            <h2>Danh sách nhân viên</h2>
            <p>Tìm theo mã nhân viên hoặc họ tên.</p>
          </div>
          <input
            className="search-input"
            value={search}
            onChange={handleSearch}
            placeholder="Nhập mã hoặc họ tên..."
            aria-label="Tìm kiếm nhân viên"
          />
        </div>

        {loading ? (
          <p className="state-message">Đang tải danh sách nhân viên...</p>
        ) : employees.length === 0 ? (
          <p className="state-message">
            Không tìm thấy nhân viên phù hợp.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Họ và tên</th>
                  <th>Phòng ban</th>
                  <th>Chức vụ</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(function (employee) {
                  return (
                    <tr key={employee._id || employee.employeeId}>
                      <td className="employee-id">{employee.employeeId}</td>
                      <td>{employee.fullName}</td>
                      <td>{employee.department || "—"}</td>
                      <td>{employee.position || "—"}</td>
                      <td>{employee.email}</td>
                      <td>{employee.phone || "—"}</td>
                      <td>
                        <span className="status">
                          {employee.status || "Chưa cập nhật"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="button small secondary"
                            onClick={function () {
                              editEmployee(employee);
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="button small danger"
                            onClick={function () {
                              deleteEmployee(employee);
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="footer">
        <span>Hệ thống quản lý nhân sự</span>
        <span>React · Node.js · MongoDB Atlas</span>
      </footer>
    </main>
  );
}

export default App;
