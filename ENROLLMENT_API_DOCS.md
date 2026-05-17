# 📚 Enrollment & Progress Tracking - API Documentation

## 🎯 Tính Năng Đã Thêm

### 1. **Model Enrollment** (`src/models/Enrollment.js`)
- `course` - ID khóa học
- `student` - ID student
- `completedLessons` - Array các bài học hoàn thành
- `lessonProgress` - Tiến độ chi tiết từng bài:
  - `lesson` - ID bài học
  - `status` - (not_started, in_progress, completed)
  - `watchedDuration` - Thời gian xem (seconds)
  - `completedAt` - Thời gian hoàn thành
- `totalProgress` - % hoàn thành (0-100)
- `status` - (active, completed, dropped)
- **Unique Index**: 1 student chỉ enroll 1 lần/course

### 2. **API Endpoints**

#### ✅ LẤY DANH SÁCH KHÓA HỌC CỦA STUDENT
```
GET /api/enrollments/my-courses
Authorization: Bearer <token>

Response (200):
[
  {
    "_id": "123...",
    "course": {
      "_id": "456...",
      "title": "Node.js API",
      "thumbnail": "url...",
      "rating": 4.7,
      "instructor": "789..."
    },
    "student": "000...",
    "completedLessons": [lesson_ids...],
    "totalProgress": 45,
    "status": "active",
    "createdAt": "2024-05-17..."
  },
  ...
]
```

#### ✅ LẤY CHI TIẾT ENROLLMENT CỦA 1 KHÓA HỌC
```
GET /api/enrollments/course/:courseId
Authorization: Bearer <token>

Response (200):
{
  "_id": "123...",
  "course": { ... },
  "student": "000...",
  "completedLessons": [lesson_ids...],
  "lessonProgress": [
    {
      "lesson": {
        "_id": "789...",
        "title": "Bài 1: Giới thiệu",
        "duration": "15:30",
        "order": 1
      },
      "status": "completed",
      "watchedDuration": 930,
      "completedAt": "2024-05-17..."
    },
    {
      "lesson": {
        "_id": "790...",
        "title": "Bài 2: Setup",
        "duration": "20:00",
        "order": 2
      },
      "status": "in_progress",
      "watchedDuration": 600,
      "completedAt": null
    },
    ...
  ],
  "totalProgress": 45,
  "status": "active",
  "lastAccessedAt": "2024-05-17..."
}
```

#### ✅ BẮT ĐẦU HỌC BÀI
```
PUT /api/enrollments/course/:courseId/start-lesson
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": "789..."
}

Response (200):
- Updated enrollment với status bài học = "in_progress"
```

#### ✅ CẬP NHẬT THỜI GIAN XEM VIDEO
```
PUT /api/enrollments/course/:courseId/update-watch-time
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": "789...",
  "watchedDuration": 930  // seconds
}

Response (200):
- Updated enrollment với watchedDuration mới
```

#### ✅ ĐÁNH DẤU BÀI HỌC HOÀN THÀNH
```
PUT /api/enrollments/course/:courseId/complete-lesson
Authorization: Bearer <token>
Content-Type: application/json

{
  "lessonId": "789...",
  "watchedDuration": 930
}

Response (200):
- Updated enrollment
- Status bài học = "completed"
- Tự động cập nhật totalProgress
```

#### ✅ LẤY THỐNG KÊ TIẾN ĐỘ HỌC
```
GET /api/enrollments/course/:courseId/progress
Authorization: Bearer <token>

Response (200):
{
  "totalLessons": 12,
  "completedLessons": 5,
  "inProgressLessons": 2,
  "progressPercentage": 42,
  "completionStatus": "active",
  "lastAccessedAt": "2024-05-17...",
  "completedAt": null,
  "lessonDetails": [
    {
      "lesson": { "_id": "...", "title": "..." },
      "status": "completed",
      "watchedDuration": 930,
      "completedAt": "..."
    },
    ...
  ]
}
```

#### ✅ HOÀN THÀNH KHÓA HỌC
```
PUT /api/enrollments/course/:courseId/complete-course
Authorization: Bearer <token>

Response (200):
{
  "message": "Khóa học hoàn thành!",
  "enrollment": { ... }
}

Error (400):
- Nếu chưa hoàn thành tất cả bài học
```

#### ✅ HỦY ĐĂNG KÝ KHÓA HỌC
```
PUT /api/enrollments/course/:courseId/drop
Authorization: Bearer <token>

Response (200):
- Updated enrollment với status = "dropped"
```

#### ✅ LẤY DANH SÁCH STUDENTS (INSTRUCTOR ONLY)
```
GET /api/enrollments/course/:courseId/students
Authorization: Bearer <token>
Role: instructor | admin

Response (200):
[
  {
    "_id": "enrollment_id",
    "student": {
      "_id": "student_id",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "avatar": "url..."
    },
    "completedLessons": 5,
    "totalProgress": 42,
    "status": "active",
    "lastAccessedAt": "..."
  },
  ...
]
```

---

## 🛡️ Validation & Errors

| Error | Code | Giải pháp |
|-------|------|----------|
| Token không hợp lệ | 401 | Kiểm tra Authorization header |
| Chưa đăng ký course | 404 | Đăng ký course trước |
| Missing fields | 400 | Cung cấp tất cả required fields |
| Chưa hoàn thành toàn bộ | 400 | Hoàn thành tất cả bài trước |
| Không có quyền | 403 | Chỉ instructor/admin mới xem được |

---

## 📊 Database Schema

```
Enrollment Collection:
- course (ObjectId, ref: Course) - REQUIRED
- student (ObjectId, ref: User) - REQUIRED
- completedLessons (Array of ObjectId, ref: Lesson)
- lessonProgress (Array):
  - lesson (ObjectId, ref: Lesson)
  - status (String: not_started | in_progress | completed)
  - watchedDuration (Number: seconds)
  - completedAt (Date)
- totalProgress (Number: 0-100)
- status (String: active | completed | dropped)
- finalScore (Number)
- lastAccessedAt (Date)
- completedAt (Date)
- timestamps (createdAt, updatedAt)

Index: { course, student } - UNIQUE
```

---

## 🔄 Workflow Example

### 1️⃣ Student Enrolls Course
```
POST /api/courses/:courseId/enroll
→ Creates Enrollment record
→ Initializes lessonProgress for all lessons
→ Sets status = "active"
```

### 2️⃣ Student Views Course
```
GET /api/enrollments/course/:courseId
→ Get all lesson progress
→ See which lessons completed/in-progress
```

### 3️⃣ Student Watches Video
```
PUT /api/enrollments/course/:courseId/start-lesson
→ Mark lesson as "in_progress"

PUT /api/enrollments/course/:courseId/update-watch-time (every 30s)
→ Update watchedDuration periodically
```

### 4️⃣ Student Completes Lesson
```
PUT /api/enrollments/course/:courseId/complete-lesson
→ Mark lesson as "completed"
→ Add to completedLessons
→ Auto-update totalProgress
```

### 5️⃣ Student Completes All Lessons
```
GET /api/enrollments/course/:courseId/progress
→ See progressPercentage = 100

PUT /api/enrollments/course/:courseId/complete-course
→ Mark enrollment as "completed"
→ Set completedAt timestamp
```

---

## 📈 Progress Calculation

```
totalProgress = (completedLessons / totalLessons) * 100

Examples:
- 0/10 lessons = 0%
- 3/10 lessons = 30%
- 5/10 lessons = 50%
- 10/10 lessons = 100% → status auto-change to "completed"
```

---

## 🚀 Integration with Frontend

### Sample React Component:
```javascript
// Get my courses
const response = await fetch('/api/enrollments/my-courses', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const myEnrollments = await response.json();

// Get progress
const progress = await fetch(
  `/api/enrollments/course/${courseId}/progress`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const stats = await progress.json();

// Mark lesson complete
await fetch(
  `/api/enrollments/course/${courseId}/complete-lesson`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      lessonId: '...',
      watchedDuration: 930
    })
  }
);
```

---

**Author**: Copilot CLI  
**Date**: 2024-05-17
