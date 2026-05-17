# 🏆 Certificates & Achievements - API Documentation

## 🎯 Tính Năng Đã Thêm

### 1. **Certificate Model** (`src/models/Certificate.js`)
- `course` - ID khóa học
- `student` - ID student
- `certificateNumber` - Unique ID (tự sinh)
- `title` - Tên chứng chỉ
- `completionDate` - Ngày hoàn thành
- `courseName`, `instructorName`, `courseDuration`
- `finalScore` - Điểm cuối
- `isPublic` - Share công khai
- `verificationCode` - Code để verify
- `expiresAt` - Hạn sử dụng (null = never)
- Unique: 1 certificate per student per course

### 2. **Achievement Model** (`src/models/Achievement.js`)
- `student` - ID student
- `type` - Loại achievement (enum):
  - first_course_completed
  - course_completed
  - perfect_score
  - high_score
  - multiple_quizzes_passed
  - course_reviewer
  - learning_streak
  - custom
- `title`, `description`, `badgeImage`
- `level` - bronze, silver, gold, platinum
- `points` - Điểm ranking
- `isPublic` - Hiển thị công khai

---

## 📋 API Endpoints

### CERTIFICATES

#### ✅ TẠO CHỨNG CHỈ (Auto-triggered)
```
POST /api/certificates
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollmentId": "607f..."
}

Response (201):
{
  "_id": "608f...",
  "certificateNumber": "CERT-1716...-1",
  "course": "507f...",
  "student": "000f...",
  "title": "Certificate of Completion - Node.js API",
  "completionDate": "2024-05-17",
  "courseName": "Node.js API Development",
  "instructorName": "Nguyễn Văn A",
  "finalScore": 85,
  "scorePercentage": 100,
  "verificationCode": "abc123def456...",
  "issuedAt": "2024-05-17",
  "isPublic": false,
  "isValid": true
}

Note: Tự động tạo khi enrollment.status = "completed"
```

#### ✅ LẤY CHỨNG CHỈ CỦA STUDENT
```
GET /api/certificates/my-certificates
Authorization: Bearer <token>

Response (200):
[
  {
    "_id": "608f...",
    "certificateNumber": "CERT-1716...-1",
    "course": {
      "_id": "507f...",
      "title": "Node.js API",
      "thumbnail": "url..."
    },
    "completionDate": "2024-05-17",
    "isPublic": false,
    "issuedAt": "2024-05-17"
  },
  ...
]
```

#### ✅ LẤY CHI TIẾT CHỨNG CHỈ
```
GET /api/certificates/:id
Authorization: Bearer <token> (optional)

Response (200):
{
  "_id": "608f...",
  "certificateNumber": "CERT-1716...-1",
  "student": {
    "_id": "000f...",
    "name": "Nguyễn Văn A",
    "email": "user@example.com"
  },
  "course": {
    "_id": "507f...",
    "title": "Node.js API Development",
    "thumbnail": "url..."
  },
  "title": "Certificate of Completion",
  "description": "Successfully completed Node.js API Development",
  "completionDate": "2024-05-17",
  "courseName": "Node.js API Development",
  "instructorName": "Nguyễn Văn A",
  "finalScore": 85,
  "scorePercentage": 100,
  "isPublic": true,
  "issuedAt": "2024-05-17",
  "signedBy": "Nguyễn Văn A"
}

Note: Private certificates chỉ student mình được xem
```

#### ✅ VERIFY CHỨNG CHỈ
```
GET /api/certificates/verify/:code

Response (200):
{
  "valid": true,
  "certificate": {
    "certificateNumber": "CERT-1716...-1",
    "student": "Nguyễn Văn A",
    "course": "Node.js API Development",
    "completionDate": "2024-05-17",
    "issuedAt": "2024-05-17"
  }
}

Response (404):
{
  "message": "Chứng chỉ không hợp lệ"
}
```

#### ✅ CẬP NHẬT CHỨNG CHỈ (Public/Private)
```
PUT /api/certificates/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isPublic": true
}

Response (200):
- Updated certificate
```

#### ✅ LẤY CHỨNG CHỈ CÔNG KHAI CỦA USER
```
GET /api/certificates/user/:userId

Response (200):
[
  {
    "_id": "608f...",
    "certificateNumber": "CERT-1716...-1",
    "course": {
      "title": "Node.js API"
    },
    "completionDate": "2024-05-17",
    "coursePercentage": 100,
    "issuedAt": "2024-05-17"
  },
  ...
]
```

---

### ACHIEVEMENTS

#### ✅ LẤY ACHIEVEMENTS CỦA STUDENT
```
GET /api/achievements/my-achievements
Authorization: Bearer <token>

Response (200):
{
  "totalAchievements": 5,
  "totalPoints": 280,
  "achievements": [
    {
      "_id": "609f...",
      "type": "course_completed",
      "title": "Course Master: Node.js API",
      "description": "Completed Node.js API Development",
      "badgeImage": "https://...",
      "level": "silver",
      "points": 50,
      "relatedCourse": {
        "_id": "507f...",
        "title": "Node.js API Development"
      },
      "unlockedAt": "2024-05-17"
    },
    {
      "type": "perfect_score",
      "title": "Perfect Score",
      "description": "Achieved 100% on a quiz",
      "level": "platinum",
      "points": 75
    },
    ...
  ]
}
```

#### ✅ LẤY ACHIEVEMENTS CÔNG KHAI CỦA USER
```
GET /api/achievements/user/:userId

Response (200):
{
  "totalAchievements": 3,
  "totalPoints": 155,
  "achievements": [...]
}
```

#### ✅ LEADERBOARD (TOP 10)
```
GET /api/achievements/leaderboard?limit=10

Response (200):
[
  {
    "student": {
      "_id": "001f...",
      "name": "User 1",
      "avatar": "url..."
    },
    "totalPoints": 500,
    "achievements": 8
  },
  {
    "student": {
      "_id": "002f...",
      "name": "User 2",
      "avatar": "url..."
    },
    "totalPoints": 450,
    "achievements": 7
  },
  ...
]
```

---

## 🎖️ Achievement Types

| Type | Title | Points | Level | Condition |
|------|-------|--------|-------|-----------|
| first_course_completed | First Step | 100 | gold | Hoàn thành khóa đầu tiên |
| course_completed | Course Master | 50 | silver | Hoàn thành bất kỳ khóa |
| perfect_score | Perfect Score | 75 | platinum | 100% quiz |
| high_score | Quiz Master | 30 | gold | 90%+ quiz |
| multiple_quizzes_passed | Quiz Streak | 40 | silver | Pass 5+ quizzes |
| course_reviewer | Reviewer | 25 | bronze | Write 10+ reviews |
| helpful_reviewer | Helpful Reviews | 35 | silver | 50+ helpful votes |
| learning_streak | On Fire | 60 | gold | 7-day streak |

---

## 🔐 Certificate Verification

```
Generate unique code:
verificationCode = crypto.randomBytes(16).toString('hex')

Shareable verification URL:
https://learningportal.com/verify/{{verificationCode}}

Anyone can verify without login
```

---

## 📊 Database Schema

```
Certificate:
{
  _id: ObjectId,
  course: ObjectId (ref: Course),
  student: ObjectId (ref: User),
  certificateNumber: String (unique),
  title: String,
  description: String,
  completionDate: Date,
  courseName: String,
  instructorName: String,
  finalScore: Number,
  scorePercentage: Number,
  isPublic: Boolean,
  verificationCode: String (unique),
  expiresAt: Date,
  isValid: Boolean,
  signedBy: String,
  issuedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Index: { course: 1, student: 1 } UNIQUE

Achievement:
{
  _id: ObjectId,
  student: ObjectId (ref: User),
  type: String (enum),
  title: String,
  description: String,
  badgeImage: String,
  relatedCourse: ObjectId,
  level: String (bronze | silver | gold | platinum),
  points: Number,
  isPublic: Boolean,
  unlockedAt: Date,
  createdAt: Date
}
```

---

## 🔄 Auto-Triggers

### When Enrollment Completed (100%):
```
1. Create Certificate
   ↓ certificateNumber = CERT-{{timestamp}}-{{count}}
   ↓ verificationCode = crypto.randomBytes(16)
   ↓ issuedAt = now

2. Create Achievement
   ↓ type = "course_completed"
   ↓ points = 50
   ↓ Check if first course: points = 100
```

### When Quiz Perfect Score (100%):
```
Create Achievement
→ type = "perfect_score"
→ points = 75
```

### When Quiz High Score (90%+):
```
Create Achievement
→ type = "high_score"
→ points = 30
```

---

## 🛡️ Error Handling

| Error | Code | Giải pháp |
|-------|------|----------|
| Enrollment incomplete | 400 | Complete all lessons first |
| Certificate exists | 400 | Already issued |
| Invalid verification code | 404 | Check code again |
| Certificate expired | 400 | Certificate no longer valid |
| No permission | 403 | Private certificate |

---

## 📱 Frontend Integration

### Show Certificate:
```html
<div class="certificate">
  <h2>{{ certificate.title }}</h2>
  <p>{{ certificate.student.name }}</p>
  <p>{{ certificate.courseName }}</p>
  <p>Completed: {{ certificate.completionDate | date }}</p>
  <p>Score: {{ certificate.finalScore }}%</p>
  <button @click="downloadCertificate">Download PDF</button>
  <button @click="shareCertificate">Share</button>
</div>
```

### Verify Certificate:
```
User scans QR or enters code:
GET /api/certificates/verify/abc123def456...
→ Show certificate details
```

### Achievements Display:
```html
<div class="achievements">
  <h3>{{ totalAchievements }} Achievements</h3>
  <p>{{ totalPoints }} Points</p>
  <div class="badges">
    <div v-for="achievement in achievements" :key="achievement._id">
      <img :src="achievement.badgeImage" :alt="achievement.title">
      <p>{{ achievement.title }}</p>
      <p>+{{ achievement.points }} pts</p>
    </div>
  </div>
</div>
```

---

**Author**: Copilot CLI  
**Date**: 2024-05-17
