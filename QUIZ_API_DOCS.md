# 🧪 Quizzes & Assessments - API Documentation

## 🎯 Tính Năng Đã Thêm

### 1. **Quiz Model** (`src/models/Quiz.js`)
- `course` - ID khóa học
- `lesson` - ID bài học (tuỳ chọn)
- `title` - Tên quiz
- `questions` - Array câu hỏi:
  - `type`: multiple_choice, true_false, short_answer, essay
  - `options` - Cho multiple choice/true false
  - `correctAnswer` - Đáp án đúng
  - `points` - Điểm câu hỏi
  - `explanation` - Giải thích
- `passingScore` - % cần đạt (default: 70%)
- `timeLimit` - Giới hạn thời gian (minutes)
- `attempts` - Số lần được phép làm
- `randomizeQuestions` - Trộn câu hỏi
- `randomizeOptions` - Trộn đáp án
- `showAnswers` - Hiển thị đáp án sau submit
- `isPublished` - Công bố cho students

### 2. **QuizAttempt Model** (`src/models/QuizAttempt.js`)
- `quiz` - ID quiz
- `student` - ID student
- `answers` - Câu trả lời của student:
  - `questionId` - ID câu hỏi
  - `studentAnswer` - Đáp án student
  - `isCorrect` - Đúng/sai
  - `pointsEarned` - Điểm đạt được
- `score` - Tổng điểm
- `percentage` - % hoàn thành
- `passed` - Đạt/Trượt
- `timeSpent` - Thời gian làm (seconds)
- `attemptNumber` - Lần thứ mấy
- `status` - submitted, graded, reviewed

---

## 📋 API Endpoints

#### ✅ TẠO QUIZ MỚI (Instructor Only)
```
POST /api/quizzes
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "507f...",
  "lessonId": "507f...",  // optional
  "title": "Node.js Basics Quiz",
  "description": "Test your knowledge on Node.js",
  "passingScore": 70,
  "timeLimit": 30,  // minutes
  "attempts": 2,
  "randomizeQuestions": true,
  "randomizeOptions": true,
  "showAnswers": true,
  "questions": [
    {
      "text": "Node.js được viết bằng ngôn ngữ nào?",
      "type": "multiple_choice",
      "points": 5,
      "options": [
        { "text": "Java", "isCorrect": false },
        { "text": "JavaScript", "isCorrect": true },
        { "text": "Python", "isCorrect": false }
      ],
      "explanation": "Node.js được viết bằng JavaScript"
    },
    {
      "text": "Event-driven là đặc điểm chính của Node.js?",
      "type": "true_false",
      "points": 3,
      "options": [
        { "text": "Đúng", "isCorrect": true },
        { "text": "Sai", "isCorrect": false }
      ]
    },
    {
      "text": "Viết tên package manager của Node.js",
      "type": "short_answer",
      "points": 2,
      "correctAnswer": "npm",
      "explanation": "npm = Node Package Manager"
    }
  ]
}

Response (201):
{
  "_id": "607f...",
  "course": "507f...",
  "title": "Node.js Basics Quiz",
  "totalPoints": 10,
  "isPublished": false,
  ...
}
```

#### ✅ LẤY TẤT CẢ QUIZZES CỦA COURSE
```
GET /api/quizzes/course/:courseId

Response (200):
[
  {
    "_id": "607f...",
    "title": "Quiz 1",
    "totalPoints": 10,
    "passingScore": 70,
    "isPublished": true,
    "questions": 5,
    "createdAt": "..."
  },
  ...
]
```

#### ✅ LẤY CHI TIẾT QUIZ
```
GET /api/quizzes/:id
Authorization: Bearer <token> (optional)

Response (200):
{
  "_id": "607f...",
  "course": "507f...",
  "title": "Node.js Basics Quiz",
  "description": "Test your knowledge",
  "questions": [
    {
      "_id": "608f...",
      "text": "Node.js được viết bằng ngôn ngữ nào?",
      "type": "multiple_choice",
      "points": 5,
      "options": [
        { "text": "Java" },
        { "text": "JavaScript" },
        { "text": "Python" }
      ]
    },
    ...
  ],
  "passingScore": 70,
  "timeLimit": 30,
  "totalPoints": 10,
  "isPublished": true
}

Notes:
- Student không thấy correctAnswer & explanation
- Instructor thấy tất cả
```

#### ✅ CẬP NHẬT QUIZ (Instructor Only)
```
PUT /api/quizzes/:id
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "passingScore": 75,
  "timeLimit": 45,
  "questions": [...]
}

Response (200):
- Updated quiz
```

#### ✅ PUBLISH/UNPUBLISH QUIZ
```
PUT /api/quizzes/:id/publish
Authorization: Bearer <token>

Response (200):
{
  "message": "Quiz đã được công bố",
  "quiz": { ... }
}
```

#### ✅ XÓA QUIZ (Instructor Only)
```
DELETE /api/quizzes/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "Xóa quiz thành công"
}

Note: Xóa tất cả attempts liên quan
```

---

## 📝 SUBMIT QUIZ ATTEMPT

#### ✅ NỘP BÀI QUIZ
```
POST /api/quizzes/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "608f...",
      "studentAnswer": "JavaScript"
    },
    {
      "questionId": "609f...",
      "studentAnswer": "Đúng"
    },
    {
      "questionId": "610f...",
      "studentAnswer": "npm"
    }
  ]
}

Response (201):
{
  "attemptId": "611f...",
  "score": 9,
  "percentage": 90,
  "passed": true,
  "totalPoints": 10,
  "message": "Bạn đã đạt điểm yêu cầu!"
}

Error (400):
- Đã hết lần làm bài
- Quiz chưa được công bố
```

#### ✅ LẤY KẾT QUẢ QUIZ
```
GET /api/quizzes/:id/attempt/:attemptId
Authorization: Bearer <token>

Response (200):
{
  "_id": "611f...",
  "quiz": { ... },
  "student": {
    "_id": "000f...",
    "name": "Nguyễn Văn A",
    "email": "user@example.com"
  },
  "answers": [
    {
      "questionId": "608f...",
      "studentAnswer": "JavaScript",
      "isCorrect": true,
      "pointsEarned": 5
    },
    {
      "questionId": "609f...",
      "studentAnswer": "Đúng",
      "isCorrect": true,
      "pointsEarned": 3
    },
    {
      "questionId": "610f...",
      "studentAnswer": "npm",
      "isCorrect": true,
      "pointsEarned": 2
    }
  ],
  "score": 10,
  "percentage": 100,
  "passed": true,
  "timeSpent": 1200,  // seconds
  "attemptNumber": 1,
  "submittedAt": "..."
}
```

#### ✅ LẤY TẤT CẢ ATTEMPTS CỦA STUDENT
```
GET /api/quizzes/:id/attempts
Authorization: Bearer <token>

Response (200):
[
  {
    "_id": "611f...",
    "score": 9,
    "percentage": 90,
    "passed": true,
    "attemptNumber": 1,
    "submittedAt": "..."
  },
  {
    "_id": "612f...",
    "score": 10,
    "percentage": 100,
    "passed": true,
    "attemptNumber": 2,
    "submittedAt": "..."
  }
]
```

#### ✅ LẤY THỐNG KÊ QUIZ (Instructor Only)
```
GET /api/quizzes/:id/stats
Authorization: Bearer <token>

Response (200):
{
  "totalAttempts": 25,
  "averageScore": 78,
  "passRate": 72,
  "passCount": 18,
  "failCount": 7,
  "attempts": [
    {
      "_id": "611f...",
      "student": "000f...",
      "score": 9,
      "percentage": 90,
      "passed": true,
      "attemptNumber": 1,
      "submittedAt": "..."
    },
    ...
  ]
}
```

---

## 🔍 Question Types

### 1. Multiple Choice
```json
{
  "type": "multiple_choice",
  "text": "Câu hỏi?",
  "points": 5,
  "options": [
    { "text": "Option A", "isCorrect": false },
    { "text": "Option B", "isCorrect": true }
  ]
}
```

### 2. True/False
```json
{
  "type": "true_false",
  "text": "Phát biểu?",
  "points": 3,
  "options": [
    { "text": "Đúng", "isCorrect": true },
    { "text": "Sai", "isCorrect": false }
  ]
}
```

### 3. Short Answer
```json
{
  "type": "short_answer",
  "text": "Hãy điền...",
  "points": 2,
  "correctAnswer": "npm",
  "explanation": "Giải thích"
}
```

### 4. Essay (Cần Instructor Review)
```json
{
  "type": "essay",
  "text": "Viết bài luận về...",
  "points": 10,
  "explanation": "Hướng dẫn"
}
```

---

## 🛡️ Validation & Errors

| Error | Code | Giải pháp |
|-------|------|----------|
| Quiz không tồn tại | 404 | Kiểm tra quiz ID |
| Quiz chưa công bố | 403 | Instructor chưa publish |
| Hết lần làm | 400 | Đã vượt quá số lần cho phép |
| Không có quyền | 403 | Instructor only |
| Đã có attempts | 400 | Không sửa được quiz có người làm |

---

## 📊 Auto-Grading

**Hỗ trợ tự động chấm:**
- ✅ Multiple Choice
- ✅ True/False
- ✅ Short Answer (case-insensitive)
- ❌ Essay (cần instructor review)

**Calculation:**
```
score = sum(pointsEarned for each question)
percentage = (score / totalPoints) * 100
passed = percentage >= passingScore
```

---

## 🔄 Workflow Example

### Instructor:
```
1. POST /api/quizzes → Create quiz
2. PUT /api/quizzes/:id → Edit questions
3. PUT /api/quizzes/:id/publish → Publish
4. GET /api/quizzes/:id/stats → View results
```

### Student:
```
1. GET /api/quizzes/course/:id → See available quizzes
2. GET /api/quizzes/:id → View quiz (no answers)
3. POST /api/quizzes/:id/submit → Submit attempt
4. GET /api/quizzes/:id/attempts → View my attempts
5. GET /api/quizzes/:id/attempt/:id → View result
```

---

**Author**: Copilot CLI  
**Date**: 2024-05-17
