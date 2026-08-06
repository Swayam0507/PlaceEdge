# 🛡️ PlaceEdge Admin Panel — Complete Feature Guide

## Admin Kone Bane Che?

System start thay tyare ek **default admin account** automatically seed (create) thay che:

| Field | Value |
|-------|-------|
| Email | `admin@PlaceEdge.com` |
| Password | `Admin@2026` |
| Name | Dr. Rajesh Kumar |
| Role | `admin` |

> **Note:** Koi pan user ne admin manually promote kari shakai che `promoteToAdmin.js` script use karke, ya toh Admin Panel mathi role change karke.

---

## 📊 Admin Shu Shu Manage Kari Shake? — Feature Breakdown

Admin pase **6 major management areas** che:

```
                        🛡️ Admin Panel
                              |
        ┌─────────┬───────────┼───────────┬──────────┬──────────┐
        |         |           |           |          |          |
   👥 Users  ❓ Questions  🏢 Companies  🎤 Interview  📈 Analytics  📤 Export
        |         |           |           |          |          |
   - View All  - Add       - Add       - Add      - Stats    - Users CSV
   - Search    - Edit      - Edit      - Bulk Add - Charts   - Tests CSV
   - Edit Role - Delete    - Delete    - Delete   - Trends   - PDF
   - Delete    - Bulk Import                      - Top 10
```

---

## 1️⃣ 👥 User Management

**Client Page**: `client/src/pages/AdminUsers.jsx`  
**Server**: `server/controllers/adminController.js` → `server/routes/adminRoutes.js`

| Feature | API Route | What it does |
|---------|-----------|--------------|
| **All Users Jovo** | `GET /api/admin/users` | Pagination, search (name/email), role filter, sort support. Each user na test count ane avg score pan aave |
| **User Edit Karo** | `PUT /api/admin/users/:id` | Name, email, role, branch, semester, CGPA badlu shakai. **Student ne Admin banavi shakai!** |
| **User Delete Karo** | `DELETE /api/admin/users/:id` | User + eana badha TestAttempts + Resumes badhu delete thay. Self-delete blocked che |

> ⚠️ **Important:** User delete karva thi eana **test history, resume, ane related badho data** permanently delete thay che!

---

## 2️⃣ ❓ Aptitude Question Management

**Client Page**: `client/src/pages/AdminQuestions.jsx`  
**Server**: `server/controllers/questionController.js` → `server/routes/questionRoutes.js`  
**Model**: `server/models/Question.js`

### Question nu Structure:

```json
{
  "category": "quantitative",
  "question": "What is 2+2?",
  "options": ["1", "2", "3", "4"],
  "correctAnswer": 3,
  "difficulty": "easy",
  "explanation": "2+2 = 4"
}
```

| Feature | API Route | What it does |
|---------|-----------|--------------|
| **All Questions Jovo (Admin)** | `GET /api/questions/all` | Pagination, category filter, difficulty filter, search. **correctAnswer** pan dekhai |
| **New Question Add** | `POST /api/questions` | Ek question add karo |
| **Question Edit** | `PUT /api/questions/:id` | Badhu update kari shakai |
| **Question Delete** | `DELETE /api/questions/:id` | Permanently delete |
| **Bulk Import** | `POST /api/features/questions/bulk` | Multiple questions ek sathe import |
| **Categories Jovo** | `GET /api/questions/categories` | Category-wise counts |

---

## 3️⃣ 🏢 Company Management

**Server**: `server/controllers/companyController.js` → `server/routes/companyRoutes.js`

| Feature | API Route | What it does |
|---------|-----------|--------------|
| **Company Add** | `POST /api/companies` | Name, package, eligibility, visit date, status, roles |
| **Company Edit** | `PUT /api/companies/:id` | Badhi details update |
| **Company Delete** | `DELETE /api/companies/:id` | Permanently remove |

---

## 4️⃣ 🎤 Interview Question Management

**Client Page**: `client/src/pages/AdminInterviewQuestions.jsx`  
**Server**: `server/controllers/interviewController.js` → `server/routes/interviewRoutes.js`

| Feature | API Route | What it does |
|---------|-----------|--------------|
| **Add Interview Q** | `POST /api/interview` | Single question add |
| **Bulk Add** | `POST /api/interview/bulk` | Multiple ek sathe import |
| **Delete** | `DELETE /api/interview/:id` | Question delete |

---

## 5️⃣ 📈 Analytics Dashboard

**Client Page**: `client/src/pages/AdminDashboard.jsx`

Dashboard ma dekhai: Total Users/Students/Admins, Total Questions, Total Tests, Avg Score, Category Performance, Difficulty Distribution, Top 10 Performers, Score Distribution charts, Registration trends, etc.

---

## 6️⃣ 📤 Export Reports (CSV + PDF)

| Export Type | API Route |
|-------------|-----------|
| **Users Report** | `GET /api/admin/export?type=users` |
| **Tests Report** | `GET /api/admin/export?type=tests` |

---

---

# 🔥 IMPORTANT: Questions Kya Thi Aave Che Ane Kya Use Thai Che?

## Student ne Test ma Questions KYA THI AAVE?

### ➡️ **GEMINI AI GENERATE KARE CHE!** (Admin na questions thi NAI)

Jyare student test start kare:

```
Student clicks "Start Test"
       ↓
Client calls: POST /api/ai/generate-exam
       ↓
Server → Gemini AI ne prompt mokle
       ↓
Gemini AI dynamically questions generate kare
       ↓
Server → Generated questions ne Question DB ma SAVE kare (insertMany)
       ↓
Student ne questions male (test start thay)
```

### Code Proof (`server/controllers/chatbotController.js`, line 120-186):

```javascript
exports.generateExam = async (req, res) => {
    const { category, difficulty = 'medium', limit = 10 } = req.body;
    
    // Step 1: Gemini AI ne prompt mokle
    const prompt = `Generate exactly ${limit} multiple choice questions 
                    for category "${category}" at "${difficulty}" difficulty...`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    // Step 2: AI na response ne parse kare
    questionsData = JSON.parse(response.text);
    
    // Step 3: ⭐ GENERATED QUESTIONS NE QUESTION DB MA SAVE KARE ⭐
    const Question = require("../models/Question");
    const insertedQuestions = await Question.insertMany(formattedQuestions);
    
    // Step 4: Student ne questions mokle
    res.status(200).json({ success: true, questions: insertedQuestions });
};
```

> ⭐ **KEY POINT**: Gemini generate kare ane SAME Question collection ma save kare che. 
> Etle admin na manually added questions ane AI na generated questions — **badha SAME database table ma** jaye che!

---

## Toh Admin Na Questions NI USE KYA THAI CHE?

### 1️⃣ **Admin Analytics / Dashboard Stats Ma**

Admin Dashboard ma `Question.countDocuments()` ane `Question.aggregate()` use thay:
- **"Total Questions"** count → aa badhi questions (manual + AI generated) count thay
- **Difficulty Distribution** (Easy/Medium/Hard keta che) → pie chart
- **Category Distribution** (kem kem category ma keta che) → chart

```
File: server/controllers/adminController.js (line 171, 196-205)

totalQuestions = await Question.countDocuments();           // Total count
difficultyStats = await Question.aggregate([...]);          // Easy/Medium/Hard breakdown
categoryDistribution = await Question.aggregate([...]);     // Category-wise breakdown
```

### 2️⃣ **Test Grading (submitTest) Ma**

Jyare student test submit kare, tyare server `Question.find()` kari ne correct answers DB mathi lai:

```
File: server/controllers/testController.js (line 24)

const questions = await Question.find({ _id: { $in: questionIds } }).lean();
// → questionIds wali questions fetch kare (correct answer mate)
// → Student na answers sathe compare kare (grading)
```

**BUT** — aa questions mostly Gemini generated hoy che jo exam `generateExam` thi banyu hoy!

### 3️⃣ **Admin Panel Question Management Ma**

Admin `GET /api/questions/all` call kare to **badhi questions** (manual + AI generated) dekhai:
- Admin search kari shake, filter kari shake
- Edit kari shake (correct answer change, explanation add, etc.)
- Delete kari shake

### 4️⃣ **OLD `GET /api/questions` Route** (Currently UNUSED by ExamTest)

Aa route `questionController.js` ma che:
```javascript
// GET /api/questions?category=quantitative&difficulty=medium&limit=10
const questions = await Question.aggregate([
    { $match: filter },
    { $sample: { size: parseInt(limit) } },  // Randomly pick from DB
]);
```

**AA ROUTE CURRENTLY STUDENT EXAM MA USE NATHI THATO!** ExamTest.jsx `generateExam` (Gemini AI) call kare che, aa nahi.

Aa route purpose aa hato ke DB mathi randomly questions pick kare — pan eni jagya ae Gemini use thai che.

---

## Summary: Complete Picture

```
┌──────────────────────────────────────────────────────────────────┐
│                   QUESTION SOURCES                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SOURCE 1: Admin manually add/bulk import                        │
│  ──────────────────────────────────────                          │
│  Admin Panel → POST /api/questions                               │
│             → POST /api/features/questions/bulk                  │
│             → Questions saved in "questions" collection          │
│                                                                  │
│  SOURCE 2: Gemini AI generate (MAIN SOURCE for exams)            │
│  ──────────────────────────────────────────                      │
│  Student starts test → POST /api/ai/generate-exam                │
│                     → Gemini generates questions                 │
│                     → ⭐ ALSO saved in SAME "questions"          │
│                        collection via Question.insertMany()      │
│                     → Student ne questions return                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│            Both sources → SAME "questions" MongoDB collection    │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WHERE THESE QUESTIONS ARE USED:                                 │
│  ──────────────────────────────                                  │
│                                                                  │
│  1. 📝 Test Grading (submitTest)                                 │
│     → Question.find({ _id: { $in: questionIds } })              │
│     → Correct answers fetch karke student na answers grade kare  │
│     → Mostly Gemini generated questions hoy che                  │
│                                                                  │
│  2. 📈 Admin Analytics Dashboard                                 │
│     → Question.countDocuments() → "Total Questions" stat         │
│     → Question.aggregate() → difficulty/category charts          │
│     → Admin+AI questions BOTH counted                            │
│                                                                  │
│  3. 🔧 Admin Question Management                                │
│     → GET /api/questions/all → Admin panel ma badhi dekhai       │
│     → Admin edit/delete kari shake (AI generated pan)            │
│                                                                  │
│  4. 🚫 GET /api/questions (DB random pick)                      │
│     → EXISTS but CURRENTLY NOT USED by student exam flow         │
│     → ExamTest.jsx calls generateExam (AI) instead               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Eno Matlab Shu Thayo?

| Fact | Explanation |
|------|-------------|
| **Admin manually questions add kare** | Toh ae DB ma jaye che, pan student exam ma directly use NATHI thato |
| **Student exam start kare** | Gemini AI fresh questions generate kare, ane ae questions DB ma save kare |
| **DB ma badhi questions mix thay** | Admin na + AI generated — badhi same "questions" collection ma |
| **Admin Dashboard ma count dekhai** | Total count ma admin + AI generated BADHI count thay |
| **Grading mate DB use thay** | submitTest ma question IDs thi correct answers fetch thay (mostly AI generated IDs) |
| **`GET /api/questions` route** | Aa DB mathi random pick kare pan currently ExamTest aa route USE NATHI KARTO |

### Toh Admin Na Manually Added Questions Nu Practical Use:
1. ✅ **Analytics ma count thay** (Total Questions stat)
2. ✅ **Admin panel ma manage kari shake** (view, edit, delete)
3. ❌ **Student exam ma directly use NATHI thato** (kyunke exam Gemini generate kare che)
4. ❌ **`GET /api/questions` route exist kare che pan ExamTest aa call NATHI karto**

---

## 📁 Related Files

```
server/controllers/chatbotController.js   ← generateExam() - Gemini AI questions
server/controllers/questionController.js  ← Admin CRUD + unused random pick route
server/controllers/testController.js      ← submitTest() - grading
server/controllers/adminController.js     ← Analytics (question counts/stats)
server/models/Question.js                 ← Question schema (shared by admin + AI)
client/src/pages/ExamTest.jsx             ← Calls generateExam (AI), NOT getQuestions (DB)
```
