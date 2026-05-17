# 🚀 Learning Portal Backend

Một API backend hoàn chỉnh cho nền tảng learning tương tự Coursera, xây dựng bằng **Node.js + Express + MongoDB**.

## ✨ Tính Năng Chính

### 👥 User Management
- ✅ Đăng ký & Đăng nhập (JWT Authentication)
- ✅ 3 roles: Student, Instructor, Admin
- ✅ Quản lý hồ sơ người dùng
- ✅ Bảo mật mật khẩu với bcryptjs

### 📚 Course Management
- ✅ Tạo & quản lý khóa học
- ✅ Publish/Unpublish courses
- ✅ Phân loại theo category & level
- ✅ Đăng ký khóa học

### 📝 Lessons & Content
- ✅ Tạo & quản lý bài học
- ✅ Hỗ trợ video URL
- ✅ Thống kê thời lượng

### ⭐ Reviews & Ratings (NEW!)
- ✅ Đánh giá & bình luận khóa học
- ✅ Hệ thống rating 1-5 sao
- ✅ Tính rating trung bình tự động
- ✅ Thống kê chi tiết ratings
- ✅ Đánh dấu review hữu ích/không hữu ích
- ✅ Mỗi student chỉ review 1 lần/course

### 🔒 Security
- ✅ JWT Token Authentication
- ✅ Role-based Access Control
- ✅ Bcrypt Password Hashing
- ✅ CORS Protection
- ✅ Error Handling Middleware

---

## 📋 Stack Công Nghệ

| Công nghệ | Phiên bản | Mục đích |
|-----------|----------|---------|
| Node.js | v16+ | Runtime |
| Express.js | ^5.2.1 | Web Framework |
| MongoDB | Latest | Database |
| Mongoose | ^9.6.1 | ODM |
| JWT | ^9.0.3 | Authentication |
| bcryptjs | ^3.0.3 | Password Hashing |
| CORS | ^2.8.6 | Cross-origin |
| Morgan | ^1.10.1 | Logging |

---

## 🛠️ Cài Đặt & Khởi Động

### 1️⃣ Clone Repository
```bash
git clone <your-repo-url>
cd learning-portal-backend
```

### 2️⃣ Cài Dependencies
```bash
npm install
```

### 3️⃣ Tạo file .env
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```
MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/learning_portal
JWT_SECRET=your_super_secret_key
NODE_ENV=development
PORT=5000
```

### 4️⃣ Khởi Động Server
```bash
# Development mode (với auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: **http://localhost:5000**

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints chính:

#### 👥 Users
- `POST /users/register` - Đăng ký
- `POST /users/login` - Đăng nhập
- `GET /users/profile` - Lấy profile (auth required)
- `PUT /users/profile` - Cập nhật profile (auth required)

#### 📚 Courses
- `GET /courses` - Lấy tất cả courses
- `GET /courses/:id` - Lấy chi tiết course
- `POST /courses` - Tạo course (instructor only)
- `PUT /courses/:id` - Cập nhật course (auth required)
- `POST /courses/:id/enroll` - Đăng ký course (auth required)

#### 📝 Lessons
- `GET /lessons/course/:courseId` - Lấy lessons của course
- `POST /lessons` - Tạo lesson (instructor only)
- `PUT /lessons/:id` - Cập nhật lesson (auth required)
- `DELETE /lessons/:id` - Xóa lesson (auth required)

#### ⭐ Reviews (NEW!)
- `POST /reviews` - Tạo review (auth required)
- `GET /reviews/course/:courseId` - Lấy reviews của course
- `GET /reviews/stats/:courseId` - Lấy thống kê ratings
- `GET /reviews/:id` - Lấy chi tiết review
- `PUT /reviews/:id` - Cập nhật review (auth required)
- `DELETE /reviews/:id` - Xóa review (auth required)
- `POST /reviews/:id/helpful` - Đánh dấu hữu ích
- `POST /reviews/:id/unhelpful` - Đánh dấu không hữu ích

#### 📚 Enrollments (NEW!)
- `GET /enrollments/my-courses` - Lấy khóa học của student
- `GET /enrollments/course/:courseId` - Lấy chi tiết enrollment
- `GET /enrollments/course/:courseId/progress` - Xem tiến độ học
- `GET /enrollments/course/:courseId/students` - Danh sách students (instructor only)
- `PUT /enrollments/course/:courseId/start-lesson` - Bắt đầu học bài
- `PUT /enrollments/course/:courseId/update-watch-time` - Cập nhật thời gian xem
- `PUT /enrollments/course/:courseId/complete-lesson` - Hoàn thành bài học
- `PUT /enrollments/course/:courseId/complete-course` - Hoàn thành khóa học
- `PUT /enrollments/course/:courseId/drop` - Hủy đăng ký

---

## 📖 Chi Tiết Tính Năng

### 1. Reviews & Ratings API

**Tạo Review:**
```bash
POST /api/reviews
Authorization: Bearer <token>

{
  "courseId": "6789...",
  "rating": 5,
  "comment": "Khóa học rất tuyệt vời!"
}
```

**Lấy Reviews của Course:**
```bash
GET /api/reviews/course/6789...?sortBy=newest&page=1&limit=10
```

**Lấy Thống Kê:**
```bash
GET /api/reviews/stats/6789...
```

Response:
```json
{
  "totalReviews": 45,
  "averageRating": "4.7",
  "ratingDistribution": {
    "5": 35,
    "4": 8,
    "3": 2,
    "2": 0,
    "1": 0
  }
}
```

Chi tiết xem: **REVIEW_API_DOCS.md**

---

## 🧪 Testing API

### Sử dụng Postman/Thunder Client:

1. Import collection: `Learning_Portal_Reviews.postman_collection.json`
2. Set variables:
   - `BASE_URL`: http://localhost:5000
   - `token`: (lấy từ login response)
   - `courseId`: (ID của course)
   - `reviewId`: (ID của review)
3. Test từng endpoint

---

## 📁 Cấu Trúc Thư Mục

```
learning-portal-backend/
├── src/
│   ├── config/           # Database configuration
│   ├── controllers/      # Business logic
│   ├── middlewares/      # Auth & error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   └── utils/            # Helpers
├── index.js              # Server entry point
├── .env                  # Environment variables
├── package.json          # Dependencies
├── REVIEW_API_DOCS.md    # Reviews API docs
└── Learning_Portal_Reviews.postman_collection.json
```

---

## 🔐 Authentication

Tất cả endpoints protected dùng **JWT Token**.

### Cách lấy token:
```bash
POST /api/users/login

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Sử dụng token:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Deploy

### Vercel (Free)
```bash
npm run build
# Deployment config: vercel.json
```

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

### Others (AWS, DigitalOcean, Railway)
Xem vercel.json hoặc Dockerfile

---

## 📋 Checklist - Cái gì cần làm tiếp

- [ ] **Enrollment Tracking** - Track tiến độ học
- [ ] **Progress Tracking** - Lưu điểm xem video
- [ ] **Certificates** - Cấp chứng chỉ hoàn thành
- [ ] **Payment Integration** - Stripe, Zalopay
- [ ] **Quizzes & Assessments** - Bài kiểm tra
- [ ] **Notifications** - Email/SMS alerts
- [ ] **Search & Filter** - Tìm kiếm nâng cao
- [ ] **Analytics** - Dashboard thống kê
- [ ] **File Upload** - Video/Image hosting (S3)
- [ ] **Unit Tests** - Jest, Mocha

---

## 🐛 Troubleshooting

| Vấn đề | Giải pháp |
|--------|----------|
| Connection refused | Kiểm tra MongoDB URI trong .env |
| Invalid token | Regenerate token hoặc check JWT_SECRET |
| CORS error | Thêm origin vào cors() config |
| Port 5000 occupied | Thay PORT trong .env |

---

## 📞 Support & Contribution

- 📧 Email: your-email@example.com
- 🐙 GitHub: [Your Repo]
- 💬 Issues: Create GitHub issues

---

## 📄 License

MIT License - Tự do sử dụng, modify, distribute

---

**Developed with ❤️ by Copilot CLI**  
**Last Updated**: May 17, 2024
