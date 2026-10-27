
import { useEffect, useState } from "react";
import "./App.css";

// Địa chỉ API của hệ thống quản lý nhân sự
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

// Dữ liệu mặc định khi thêm nhân viên
const formMacDinh = {
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

// Chuyển ngày tháng về định dạng YYYY-MM-DD cho ô nhập ngày
function dinhDangNgay(ngay) {
  if (!ngay) {
    return "";
  }

  // Nếu ngày đã có định dạng YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(ngay)) {
    return ngay;
  }

  // Nếu ngày được trả về từ MongoDB dưới dạng chuỗi ISO
  const ngayChuanHoa = new Date(ngay);

  if (Number.isNaN(ngayChuanHoa.getTime())) {
    return "";
  }

  // Lấy ngày theo UTC để tránh lệch ngày do múi giờ
  return ngayChuanHoa.toISOString().slice(0, 10);
}

// Gửi yêu cầu đến máy chủ và nhận kết quả
async function guiYeuCauAPI(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error(
      "Không thể kết nối máy chủ. Vui lòng kiểm tra API và kết nối mạng."
    );
  }

  const ketQua = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(
      ketQua.message || "Yêu cầu không thành công. Vui lòng thử lại."
    );
  }

  return ketQua;
}

function App() {
  // Danh sách nhân viên
  const [employees, setEmployees] = useState([]);

  // Từ khóa tìm kiếm
  const [search, setSearch] = useState("");

  // Dữ liệu biểu mẫu
  const [form, setForm] = useState({ ...formMacDinh });

  // Mã nhân viên đang được chỉnh sửa
  const [editingId, setEditingId] = useState("");

  // Trạng thái xử lý
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Thông báo lỗi và thông báo thành công
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Tải danh sách nhân viên từ máy chủ
  async function taiDanhSachNhanVien(tuKhoa = "") {
    setLoading(true);
    setError("");

    try {
      const query = tuKhoa.trim()
        ? "?search=" + encodeURIComponent(tuKhoa.trim())
        : "";

      const ketQua = await guiYeuCauAPI(
        API_URL + "/employees" + query
      );

      setEmployees(ketQua.data || []);
    } catch (loi) {
      setError(
        loi.message || "Không thể tải danh sách nhân viên."
      );
    } finally {
      setLoading(false);
    }
  }

  // Tự động tải danh sách khi mở trang
  useEffect(function () {
    taiDanhSachNhanVien("");
  }, []);

  // Xử lý tìm kiếm nhân viên
  function xuLyTimKiem(event) {
    const tuKhoa = event.target.value;

    setSearch(tuKhoa);
    taiDanhSachNhanVien(tuKhoa);
  }

  // Xử lý khi người dùng nhập hoặc thay đổi dữ liệu
  function xuLyThayDoi(event) {
    const tenTruong = event.target.name;
    const giaTri = event.target.value;

    setForm(function (duLieuCu) {
      return {
        ...duLieuCu,
        [tenTruong]: giaTri
      };
    });
  }

  // Đưa biểu mẫu về trạng thái ban đầu
  function lamMoiBieuMau() {
    setForm({ ...formMacDinh });
    setEditingId("");
    setError("");
    setNotice("");
  }

  // Đưa thông tin nhân viên lên biểu mẫu để chỉnh sửa
  function suaNhanVien(nhanVien) {
    setForm({
      employeeId: nhanVien.employeeId || "",
      fullName: nhanVien.fullName || "",
      gender: nhanVien.gender || "Nam",
      dateOfBirth: dinhDangNgay(nhanVien.dateOfBirth),
      department: nhanVien.department || "",
      position: nhanVien.position || "",
      email: nhanVien.email || "",
      phone: nhanVien.phone || "",
      hireDate: dinhDangNgay(nhanVien.hireDate),
      status: nhanVien.status || "Dang lam viec"
    });

    setEditingId(
      nhanVien.employeeId || nhanVien._id
    );

    setError("");
    setNotice("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // Thêm mới hoặc cập nhật nhân viên
  async function xuLyLuuNhanVien(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const url = editingId
        ? API_URL + "/employees/" + encodeURIComponent(editingId)
        : API_URL + "/employees";

      const ketQua = await guiYeuCauAPI(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      setNotice(
        ketQua.message ||
          (editingId
            ? "Cập nhật thông tin nhân viên thành công."
            : "Thêm nhân viên thành công.")
      );

      setForm({ ...formMacDinh });
      setEditingId("");

      await taiDanhSachNhanVien(search);
    } catch (loi) {
      setError(
        loi.message || "Không thể lưu thông tin nhân viên."
      );
    } finally {
      setSaving(false);
    }
  }

  // Xóa nhân viên sau khi người dùng xác nhận
  async function xoaNhanVien(nhanVien) {
    const xacNhan = window.confirm(
      "Bạn có chắc chắn muốn xóa nhân viên " +
        nhanVien.fullName +
        " (Mã: " +
        nhanVien.employeeId +
        ") không?"
    );

    if (!xacNhan) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const maNhanVien =
        nhanVien.employeeId || nhanVien._id;

      const ketQua = await guiYeuCauAPI(
        API_URL +
          "/employees/" +
          encodeURIComponent(maNhanVien),
        {
          method: "DELETE"
        }
      );

      setNotice(
        ketQua.message || "Xóa nhân viên thành công."
      );

      if (editingId === maNhanVien) {
        lamMoiBieuMau();
      }

      await taiDanhSachNhanVien(search);
    } catch (loi) {
      setError(
        loi.message || "Không thể xóa nhân viên."
      );
    }
  }

  return (
    <main className="page">
      {/* Phần tiêu đề hệ thống */}
      <header className="topbar">
        <div>
          <p className="eyebrow">
            HỆ THỐNG QUẢN LÝ NHÂN SỰ
          </p>

          <h1>Quản lý nhân sự</h1>

          <p className="subtitle">
            Quản lý hồ sơ nhân viên trên nền tảng đám mây
          </p>
        </div>

        <div className="employee-count">
          <span>Tổng số nhân viên đang hiển thị</span>
          <strong>{employees.length}</strong>
        </div>
      </header>

      {/* Thông báo lỗi */}
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {/* Thông báo thành công */}
      {notice && (
        <div className="alert success" role="status">
          {notice}
        </div>
      )}

      {/* Biểu mẫu thêm và sửa nhân viên */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>
              {editingId
                ? "Cập nhật thông tin nhân viên"
                : "Thêm nhân viên mới"}
            </h2>

            <p>
              Vui lòng nhập đầy đủ các trường bắt buộc có dấu *.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              className="button secondary"
              onClick={lamMoiBieuMau}
            >
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <form onSubmit={xuLyLuuNhanVien}>
          <div className="form-grid">
            <label>
              Mã nhân viên *

              <input
                name="employeeId"
                value={form.employeeId}
                onChange={xuLyThayDoi}
                required
                maxLength="30"
                pattern="[a-zA-Z0-9_\-]+"
                title="Chỉ được nhập chữ cái không dấu, chữ số, dấu gạch ngang (-) và dấu gạch dưới (_)."
                placeholder="Ví dụ: NV001"
                disabled={Boolean(editingId)}
              />
            </label>

            <label>
              Họ và tên *

              <input
                name="fullName"
                value={form.fullName}
                onChange={xuLyThayDoi}
                required
                maxLength="100"
                placeholder="Nhập họ và tên"
              />
            </label>

            <label>
              Giới tính

              <select
                name="gender"
                value={form.gender}
                onChange={xuLyThayDoi}
              >
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
                onChange={xuLyThayDoi}
              />
            </label>

            <label>
              Phòng ban

              <input
                name="department"
                value={form.department}
                onChange={xuLyThayDoi}
                maxLength="100"
                placeholder="Nhập tên phòng ban"
              />
            </label>

            <label>
              Chức vụ

              <input
                name="position"
                value={form.position}
                onChange={xuLyThayDoi}
                maxLength="100"
                placeholder="Nhập chức vụ"
              />
            </label>

            <label>
              Email *

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={xuLyThayDoi}
                required
                maxLength="150"
                placeholder="vidu@email.com"
              />
            </label>

            <label>
              Số điện thoại

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={xuLyThayDoi}
                maxLength="20"
                placeholder="Nhập số điện thoại"
              />
            </label>

            <label>
              Ngày vào làm

              <input
                type="date"
                name="hireDate"
                value={form.hireDate}
                onChange={xuLyThayDoi}
              />
            </label>

            <label>
              Trạng thái làm việc

              <select
                name="status"
                value={form.status}
                onChange={xuLyThayDoi}
              >
                <option value="Dang lam viec">
                  Đang làm việc
                </option>

                <option value="Tam nghi">
                  Tạm nghỉ
                </option>

                <option value="Da nghi viec">
                  Đã nghỉ việc
                </option>
              </select>
            </label>
          </div>

          {/* Các nút thao tác biểu mẫu */}
          <div className="form-actions">
            <button
              className="button primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Đang lưu thông tin..."
                : editingId
                  ? "Lưu cập nhật"
                  : "Thêm nhân viên"}
            </button>

            <button
              className="button secondary"
              type="button"
              onClick={lamMoiBieuMau}
            >
              Làm mới biểu mẫu
            </button>
          </div>
        </form>
      </section>

      {/* Danh sách nhân viên */}
      <section className="panel">
        <div className="section-heading list-heading">
          <div>
            <h2>Danh sách nhân viên</h2>

            <p>
              Tìm kiếm theo mã nhân viên hoặc họ và tên.
            </p>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={xuLyTimKiem}
            placeholder="Nhập mã hoặc họ tên..."
            aria-label="Tìm kiếm nhân viên"
          />
        </div>

        {loading ? (
          <p className="state-message">
            Đang tải danh sách nhân viên...
          </p>
        ) : employees.length === 0 ? (
          <p className="state-message">
            Không tìm thấy nhân viên phù hợp.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã nhân viên</th>
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
                {employees.map(function (nhanVien) {
                  return (
                    <tr
                      key={
                        nhanVien._id ||
                        nhanVien.employeeId
                      }
                    >
                      <td className="employee-id">
                        {nhanVien.employeeId}
                      </td>

                      <td>{nhanVien.fullName}</td>

                      <td>
                        {nhanVien.department || "Chưa cập nhật"}
                      </td>

                      <td>
                        {nhanVien.position || "Chưa cập nhật"}
                      </td>

                      <td>{nhanVien.email}</td>

                      <td>
                        {nhanVien.phone || "Chưa cập nhật"}
                      </td>

                      <td>
                        <span className="status">
                          {nhanVien.status === "Dang lam viec"
                            ? "Đang làm việc"
                            : nhanVien.status === "Tam nghi"
                              ? "Tạm nghỉ"
                              : nhanVien.status === "Da nghi viec"
                                ? "Đã nghỉ việc"
                                : nhanVien.status || "Chưa cập nhật"}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="button small secondary"
                            onClick={function () {
                              suaNhanVien(nhanVien);
                            }}
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="button small danger"
                            onClick={function () {
                              xoaNhanVien(nhanVien);
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

      {/* Chân trang */}
      <footer className="footer">
        <span>Hệ thống quản lý nhân sự</span>
        <span>React · Node.js · MongoDB Atlas</span>
      </footer>
    </main>
  );
}

export default App;
