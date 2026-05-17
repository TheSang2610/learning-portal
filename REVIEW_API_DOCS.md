# 📚 Review & Rating System - API Documentation

## 🎯 Tính Năng Đã Thêm

### 1. **Model Review** (`src/models/Review.js`)
- `course` - ID khóa học
- `student` - ID student review
- `rating` - Điểm (1-5)
- `comment` - Bình luận (10-2000 ký tự)
- `helpful` - Số người đánh dấu hữu ích
- `unhelpful` - Số người đánh dấu không hữu ích
- `isVerifiedPurchase` - Xác nhận đã mua khóa học
- **Unique Index**: 1 student chỉ review 1 lần cho 1 course

### 2. **API Endpoints**

#### ✅ TẠO REVIEW MỚI
```
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "6789...",
  "rating": 5,
  "comment": "Khóa học rất tuyệt vời, giáo viên giảng dạy rất chi tiết!"
}

Response (201):
{
  "_id": "123...",
  "course": "6789...",
  "student": {
    "_id": "456...",
    "name": "Nguyễn Văn A",
    "avatar": "https://..."
  },
  "rating": 5,
  "comment": "Khóa học rất tuyệt vời, giáo viên giảng dạy rất chi tiết!",
  "helpful": 0,
  "unhelpful": 0,
  "isVerifiedPurchase": true,
  "createdAt": "2024-05-17T...",
  "updatedAt": "2024-05-17T..."
}
```

#### ✅ LẤY TẤT CẢ REVIEW CỦA 1 KHÓA HỌC
```
GET /api/reviews/course/:courseId?sortBy=newest&page=1&limit=10

Query Parameters:
- sortBy: 'newest' (default), 'highest', 'lowest', 'helpful'
- page: Trang (default: 1)
- limit: Số reviews/trang (default: 10)

Response (200):
{
  "reviews": [...],
  "totalReviews": 45,
  "totalPages": 5,
  "currentPage": 1
}
```

#### ✅ LẤY THỐNG KÊ RATING CỦA COURSE
```
GET /api/reviews/stats/:courseId

Response (200):
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

#### ✅ LẤY CHI TIẾT 1 REVIEW
```
GET /api/reviews/:id

Response (200):
{
  "_id": "123...",
  "course": {
    "_id": "6789...",
    "title": "Node.js API Development"
  },
  "student": {
    "_id": "456...",
    "name": "Nguyễn Văn A",
    "avatar": "https://...",
    "email": "user@example.com"
  },
  "rating": 5,
  "comment": "Khóa học rất tuyệt vời!",
  ...
}
```

#### ✅ CẬP NHẬT REVIEW
```
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Khóa học tốt nhưng cần thêm bài tập"
}

Response (200):
- Updated review object
```
**Quyền**: Chỉ tác giả hoặc admin

#### ✅ XÓA REVIEW
```
DELETE /api/reviews/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "Xóa review thành công"
}
```
**Quyền**: Chỉ tác giả hoặc admin

#### ✅ ĐÁNH DẤU HỮUU ÍCH
```
POST /api/reviews/:id/helpful

Response (200):
- Review object với helpful +1
```

#### ✅ ĐÁNH DẤU KHÔNG HỮU ÍCH
```
POST /api/reviews/:id/unhelpful

Response (200):
- Review object với unhelpful +1
```

---

## 🔧 Cài Đặt & Sử Dụng

### Bước 1: Khởi động server
```bash
cd c:\laragon\www\LearningPortal\learning-portal-backend
npm install  # Cài dependencies
npm run dev  # Khởi động với nodemon
```

### Bước 2: Kiểm tra MongoDB connection
Đảm bảo biến `MONGODB_URI` trong `.env` chính xác

### Bước 3: Test API với Postman/Thunder Client

#### 📌 Test Scenario:
1. **Đăng ký course**
   ```
   POST /api/courses/:id/enroll
   Headers: Authorization: Bearer <token>
   ```

2. **Tạo review**
   ```
   POST /api/reviews
   Headers: Authorization: Bearer <token>
   Body:
   {
     "courseId": "...",
     "rating": 5,
     "comment": "Giảng viên giải thích rất rõ ràng"
   }
   ```

3. **Xem reviews của course**
   ```
   GET /api/reviews/course/:courseId
   ```

4. **Xem thống kê rating**
   ```
   GET /api/reviews/stats/:courseId
   ```

---

## 🛡️ Validation & Errors

### Lỗi thường gặp:

| Error | Code | Giải pháp |
|-------|------|----------|
| Token không hợp lệ | 401 | Kiểm tra Authorization header |
| Chưa đăng ký course | 403 | Đăng ký course trước |
| Đã review rồi | 400 | Chỉ được review 1 lần |
| Rating không hợp lệ | 400 | Rating phải từ 1-5 |
| Comment quá ngắn | 400 | Comment ≥ 10 ký tự |

---

## 📊 Database Schema

```
Review Collection:
- course (ObjectId, ref: Course)
- student (ObjectId, ref: User)
- rating (Number: 1-5)
- comment (String: 10-2000 chars)
- helpful (Number, default: 0)
- unhelpful (Number, default: 0)
- isVerifiedPurchase (Boolean, default: false)
- timestamps (createdAt, updatedAt)

Index: { course, student } - UNIQUE
```

---

## 🚀 Tính Năng Tiếp Theo (Gợi Ý)

1. **Enrollment Tracking** - Track tiến độ học
2. **Certificates** - Cấp chứng chỉ hoàn thành
3. **Payment Integration** - Thanh toán (Stripe, Zalopay)
4. **Quizzes & Assessments** - Bài kiểm tra
5. **Notifications** - Thông báo email/SMS
6. **Search & Filter** - Tìm kiếm nâng cao

---

**Author**: Copilot CLI  
**Date**: 2024-05-17
