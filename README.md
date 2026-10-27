Hệ Thống Quản lý Nhận Sự Trên Đám Mây
1. Thông tin sinh viên

MSSV:238050
Họ và Tên: Hồng Phan Gia Bình
Lớp: DH23TIN09

2. Mô tả dự án 

Xây dựng hệ thống quản lý nhân sự trên nền tảng đám mây, hỗ trợ xem danh sách nhân viên, thêm mới, tìm kiếm, xem chi tiết, cập nhật và xóa hồ sơ nhân viên. Dữ liệu được lưu trữ trên MongoDB Atlas và được truy cập thông qua REST API.

3. Công nghệ sử dụng

Frontend: React, Vite
Backend: Node.js, Express
Cơ sở dữ liệu: MongoDB Atlas
Quản lý mã nguồn: Git, GitHub
Đóng gói ứng dụng: Docker
Lưu trữ Docker image: Docker Hub
Triển khai: Render

4. Cấu trúc dự án

backend/: Mã nguồn REST API.
backend/models/: Định nghĩa mô hình dữ liệu.
backend/routes/: Các API quản lý nhân viên.
frontend/: Ứng dụng React.
frontend/src/: Mã nguồn giao diện.
README.md: Tài liệu dự án.
.gitignore: Các tệp không đưa lên GitHub.

5. Hướng dẫn chạy ở môi trường phát triển 

Yêu cầu
Node.js và npm
Git
MongoDB Atlas
Docker Desktop 
Chạy Backend
Mở terminal tại thư mục backend.
Cài đặt thư viện bằng npm install.
Tạo file .env dựa trên .env.example.
Cấu hình biến MONGODB_URI bằng chuỗi kết nối MongoDB Atlas.
Chạy ứng dụng bằng npm run dev sau khi mã nguồn Backend đã được hoàn thiện.
Chạy Frontend
Mở terminal tại thư mục frontend.
Cài đặt thư viện bằng npm install.
Cấu hình VITE_API_URL trong file .env.
Chạy npm run dev sau khi mã nguồn Frontend đã được hoàn thiện.
Lưu ý: Các hướng dẫn chạy ứng dụng sẽ được cập nhật sau khi hoàn thiện mã nguồn.

6. Các đường link nộp bài

GitHub Repository: https://github.com/s238050-GiaBinh/238050_HongPhanGiaBinh.git
Docker Hub Backend: https://hub.docker.com/r/giabinhs238050/backend
Docker Hub Frontend: https://hub.docker.com/r/giabinhs238050/frontend
Render App: https://web-238050.onrender.com
Render API: https://api-238050.onrender.com
MongoDB Atlas: mongodb+srv://binhlmk123:Binhlmk123@cluster0.gochoui.mongodb.net/238050_HongPhanGiaBinh?retryWrites=true&w=majority