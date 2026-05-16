🤖 PrepAI

A full stack Gen AI interview preparation app built with React, Node.js, MongoDB, and Groq AI, helping you upload your resume, analyze job descriptions, detect skill gaps, and generate AI-powered interview questions and ATS-optimized resumes.

🚀 Features ✅ Secure login and register with JWT token blacklisting ✅ Resume upload (PDF/DOCX) with skill extraction ✅ AI-generated technical and behavioral interview questions ✅ Skill gap detection between your resume and the job description ✅ Match score to show how well your profile fits the role ✅ ATS-optimized resume PDF download ✅ Learning roadmap to close skill gaps

🛠 Tech Stack

1. React.js (Frontend)
2. Node.js + Express.js (Backend)
3. MongoDB via Mongoose (Database)
4. JWT + bcryptjs (Authentication)
5. Groq SDK (AI Integration)
6. Puppeteer (PDF Generation)
7. Multer + pdf-parse (File Handling)

🔧 Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/santoshraj8804/PrepAI.git
cd PrepAI
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Configure environment variables — Create a `.env` file inside `backend/` and add:

```env
MONGO_URI=mongodb://localhost:27017/prepai
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

4. Run the backend server:

```bash
npm run dev
```

5. Install frontend dependencies and start:

```bash
cd ../frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.
