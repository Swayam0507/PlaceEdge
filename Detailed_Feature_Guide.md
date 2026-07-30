# Smart Placement Preparation Platform — Detailed Feature & Function Guide

This document explains **every feature** of the project in detail — how it works, which **libraries** are used, and which **functions** handle the logic. Perfect for your PPT presentation.

---

## 🏗️ Architecture Overview (How the System Works)

```
User (Browser)  →  React (Frontend)  →  Node.js/Express (Backend API)  →  MongoDB (Database)
                                                ↕
                                     Python/Django (ML Service)
                                                ↕
                                     Google Gemini AI (External API)
```

**Flow:** User clicks a button on the website → React sends an API request to Node.js → Node.js processes it (stores in MongoDB or calls AI/ML) → Response comes back → React shows result on screen.

---

## 1. 🔐 User Authentication (Login / Register / Password Reset)

### How it Works:
1. User enters Name, Email, Password on the Register page.
2. Password is **encrypted** (hashed) before storing in the database — so no one can read it.
3. After login, a **JWT Token** (like a digital pass) is generated and sent to the user's browser.
4. This token is checked on every request to verify the user is genuine.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `bcryptjs` | Encrypts (hashes) the password before saving to DB |
| `jsonwebtoken` (JWT) | Creates a secure token for login sessions |
| `nodemailer` | Sends Welcome email, Password Reset email via Gmail |
| `crypto` | Generates random tokens for password reset links |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `register()` | `authController.js` | Creates new user, hashes password, sends welcome email |
| `login()` | `authController.js` | Checks email/password, generates JWT token |
| `forgotPassword()` | `authController.js` | Sends password reset link to user's email |
| `resetPassword()` | `authController.js` | Verifies reset token and updates password |

---

## 2. 📝 AI Mock Exam Generator

### How it Works:
1. User selects a **category** (e.g., React, Java, DSA) and **difficulty** (Easy/Medium/Hard).
2. Frontend sends this to the backend API.
3. Backend sends a **prompt** to **Google Gemini AI** asking it to generate MCQ questions.
4. Gemini AI returns questions in JSON format.
5. Questions are saved to **MongoDB** and shown to the user.
6. After the test, score is calculated and saved as a **TestAttempt** record.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `@google/genai` | Connects to Google Gemini AI to generate questions |
| `mongoose` | Stores questions and test attempts in MongoDB |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `generateExam()` | `chatbotController.js` | Sends prompt to Gemini AI, parses JSON response, saves questions to DB |
| `retryGenerate()` | `chatbotController.js` | Auto-retries with different API keys if rate limit (429) error occurs |
| `submitTest()` | `testController.js` | Calculates score, percentage, and saves the test attempt |

---

## 3. 📄 Resume Upload & Skill Extraction

### How it Works:
1. User uploads their resume as a **PDF** file.
2. Backend uses `pdf-parse` library to **extract all text** from the PDF.
3. The extracted text is scanned against a **predefined list of 70+ technical skills** (e.g., React, Python, MongoDB).
4. Matched skills are automatically extracted and stored with the resume.
5. Education info (e.g., "B.Tech from XYZ University") is extracted using **Regex patterns**.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `multer` | Handles file upload from frontend to server |
| `pdf-parse` | Extracts raw text content from uploaded PDF files |
| `mammoth` | Extracts text from DOCX (Word) files |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `uploadResume()` | `resumeController.js` | Receives PDF, extracts text, scans for skills, saves to DB |
| `extractSkills()` | `resumeController.js` | Compares resume text against 70+ skill keywords |
| `extractEducation()` | `resumeController.js` | Uses Regex to find degree/university info from text |

---

## 4. 🤖 AI Resume ATS Checker

### How it Works:
1. User uploads their resume AND pastes a **job description**.
2. Backend extracts text from the resume (using `pdf-parse`).
3. Both resume text + job description are sent to **Google Gemini AI** with a detailed prompt.
4. Gemini AI compares the resume against the job description and returns:
   - Overall Match Score (High/Partial/Low)
   - Key Strengths
   - Missing Keywords & Gaps
   - Actionable Tips to improve the resume

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `@google/genai` | Google Gemini AI evaluates the resume |
| `pdf-parse` | Extracts text from resume PDF |
| `multer` | Handles resume file upload |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `atsCheck()` | `chatbotController.js` | Sends resume + JD to Gemini AI, returns detailed ATS feedback |

---

## 5. 💬 AI Chatbot (Study Buddy)

### How it Works:
1. User types a question in the chat interface.
2. The entire conversation history is sent to **Google Gemini AI** (so AI remembers context).
3. Gemini AI processes the question and returns an intelligent answer.
4. If a file (resume) is attached, the extracted text is included in the prompt.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `@google/genai` | Powers the AI chatbot with Gemini model |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `chat()` | `chatbotController.js` | Manages conversation history, sends messages to Gemini AI, handles file attachments |

---

## 6. 🏢 Company Interview Prep Guide

### How it Works:
1. User selects a company (e.g., Google, TCS, Infosys).
2. Backend sends the company name to **Gemini AI** with a detailed prompt.
3. AI generates a complete interview preparation guide including:
   - Most asked topics & questions
   - Difficulty breakdown (Easy/Medium/Hard percentages)
   - 4-week study roadmap
   - Pro tips for that specific company

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `@google/genai` | Generates company-specific interview prep data |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `companyPrep()` | `chatbotController.js` | Sends company name to Gemini AI, returns structured JSON prep guide |

---

## 7. 🎯 AI Career Advisor

### How it Works:
1. System collects user's **all past test scores** from the database.
2. Calculates average score, category-wise performance breakdown.
3. Sends all stats to **Gemini AI** for personalized career advice.
4. AI returns: Strengths, Weaknesses, Recommended Companies, 30-Day Plan, Skill Gaps.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `@google/genai` | Generates personalized career advice |
| `mongoose` | Fetches test attempt data from MongoDB |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `generateCareerAdvice()` | `chatbotController.js` | Fetches user stats, sends to AI, returns career guidance |

---

## 8. 🤖 ML Placement Predictor (Python/Django)

### How it Works:
1. User enters their profile: CGPA, Aptitude Score, Coding Score, Communication Score, Attendance, Projects, Internships.
2. Frontend sends this data to the **Python Django ML Service**.
3. Python uses **4 ML algorithms** to predict placement probability:
   - **Random Forest** (200 decision trees combined)
   - **Decision Tree** (single tree-based classifier)
   - **SVM** (Support Vector Machine — finds best boundary)
   - **KNN** (K-Nearest Neighbors — compares with similar students)
4. Each model gives a prediction (Placed / Not Placed) + confidence percentage.
5. Final result is the **average of all 4 models**.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `scikit-learn` | Provides all 4 ML algorithms (RandomForest, DecisionTree, SVM, KNN) |
| `pandas` | Handles training data in table format (DataFrame) |
| `numpy` | Mathematical calculations and array operations |
| `joblib` | Saves and loads trained ML models to/from files |
| `Django REST Framework` | Creates the API endpoint that Node.js calls |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `predict()` | `predictor.py` | Loads trained models, runs prediction on user data |
| `train_and_evaluate()` | `predictor.py` | Trains all 4 models on synthetic student data |
| `predict_placement()` | `views.py` | Django API endpoint — validates input, calls predict() |

---

## 9. 💼 Smart Job Recommendations (Python)

### How it Works:
1. User's **skills** (extracted from resume) and **test scores** are sent to Python service.
2. System compares user skills against a **curated database of 20+ job roles**.
3. Calculates a **match percentage** based on how many required skills the user has.
4. Returns top 15 best-matching job roles with company names and salary ranges.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `Django REST Framework` | API endpoint for recommendations |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `recommend_jobs()` | `job_recommender.py` | Matches user skills against job database, calculates match % |
| `recommend_jobs()` | `views.py` | Django API — receives skills/scores, returns recommendations |

---

## 10. 🌐 Off-Campus Job Board (Live Jobs)

### How it Works:
1. Frontend requests latest jobs from the backend.
2. Backend calls **RapidAPI JSearch** (external API) to fetch real-time job listings.
3. If API limit is reached, system automatically falls back to a **local static job list** (20 Indian jobs).
4. Python ML-Service also has a **web scraper** that fetches jobs from **RemoteOK** (free API).

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `axios` | Makes HTTP requests to RapidAPI JSearch |
| `beautifulsoup4` (Python) | Scrapes job data from public websites |
| `requests` (Python) | Makes HTTP requests to RemoteOK API |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `getJobs()` | `jobBoardController.js` | Fetches jobs from RapidAPI, falls back to static data |
| `scrape_jobs()` | `job_scraper.py` | Scrapes jobs from RemoteOK and other sources |

---

## 11. 📊 Performance Analytics Dashboard

### How it Works:
1. System fetches **all test attempts** of the logged-in user from MongoDB.
2. Uses **MongoDB Aggregation Pipeline** to calculate:
   - Category-wise average scores
   - Performance trend over last 10 tests
   - Weak areas (avg < 50%) and Strong areas (avg ≥ 70%)
3. Frontend displays this data using **Chart.js** (interactive graphs/charts).
4. Users can **download reports as PDF** using `jspdf` + `html2canvas`.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `mongoose` (Aggregation) | Complex database queries for analytics |
| `chart.js` / `react-chartjs-2` | Renders interactive bar charts, line charts, pie charts |
| `jspdf` | Generates PDF files from JavaScript |
| `html2canvas` | Converts HTML elements to images (for PDF generation) |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `getDashboardAnalytics()` | `analyticsController.js` | Calculates all stats using MongoDB aggregation |

---

## 12. 💬 Community Discussion Forum

### How it Works:
1. Students can create posts with title, content, and category.
2. Other students can **reply**, **upvote**, and **bookmark** posts.
3. Uses MongoDB with `populate()` to fetch author details with each post.
4. Supports **pagination**, **search**, and **category filtering**.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `mongoose` | CRUD operations on ForumPost model with population |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `getPosts()` | `forumController.js` | Fetches paginated, filtered forum posts |
| `createPost()` | `forumController.js` | Creates a new forum post |
| `addReply()` | `forumController.js` | Adds a reply to existing post |
| `upvotePost()` | `forumController.js` | Toggles upvote on a post |

---

## 13. 🏆 Leaderboard & Certificates

### How it Works:
1. **Leaderboard:** Uses MongoDB aggregation to rank students by average test scores.
2. Supports filters: Weekly/Monthly/All-time, Category, Branch.
3. **Certificates:** Auto-generated when a student achieves a high score, with a unique verification ID.

### Libraries Used:
| Library | Purpose |
|---------|---------|
| `mongoose` (Aggregation + Lookup) | Joins TestAttempt with User data for ranking |
| `crypto` | Generates unique certificate verification IDs |

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `getLeaderboard()` | `featureController.js` | Aggregates scores, ranks students, applies filters |
| `generateCertificate()` | `featureController.js` | Creates certificate with unique ID for high scorers |

---

## 14. 🛡️ Admin Dashboard

### How it Works:
1. Admin users (role = "admin") get access to a special dashboard.
2. Can manage all users, view platform analytics, and manage content.
3. Protected by `auth middleware` that checks both JWT token AND admin role.

### Key Functions:
| Function | File | What it Does |
|----------|------|--------------|
| `getAllUsers()` | `adminController.js` | Fetches all registered users |
| `promoteToAdmin()` | `adminController.js` | Changes a user's role to admin |
| `deleteUser()` | `adminController.js` | Removes a user from the system |

---

## 📦 Complete Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js + Vite | User Interface |
| **Styling** | Tailwind CSS + Framer Motion | Design + Animations |
| **Backend API** | Node.js + Express.js | Business Logic & API |
| **Database** | MongoDB + Mongoose | Data Storage |
| **AI Engine** | Google Gemini API (`@google/genai`) | Exam generation, Chatbot, ATS, Career Advice |
| **ML Engine** | Python + Django + scikit-learn | Placement Prediction, Job Recommendations |
| **Web Scraping** | BeautifulSoup + Requests | Live job fetching |
| **Authentication** | JWT + bcryptjs | Secure login system |
| **File Handling** | Multer + pdf-parse + Mammoth | Resume upload & text extraction |
| **Email** | Nodemailer + Gmail SMTP | Welcome emails, Password reset |
| **Charts** | Chart.js + react-chartjs-2 | Performance visualization |
| **PDF Export** | jsPDF + html2canvas | Report downloads |
