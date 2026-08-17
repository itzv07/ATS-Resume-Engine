# ATS Resume Analyzer & JD-Specific Resume Builder

An AI-powered web application that analyzes a candidate's resume against a specific Job Description (JD), estimates ATS compatibility, identifies missing requirements and keywords, recommends truthful improvements, and generates a JD-specific ATS-friendly resume.

> **Core principle:** Optimize relevance and presentation — never fabricate qualifications.

## ✨ Features

### Resume & Job Description Input
- Upload or paste an existing resume.
- Supports resume/document extraction workflows for PDF, DOCX, and text content.
- Upload or paste a Job Description.
- Review extracted content before analysis.
- Replace or remove uploaded resume content.
- Load sample resume/JD data for testing.

### 🤖 AI-Powered ATS Analysis
The application uses Google's Gemini API to evaluate the resume against the target JD and produces an estimated compatibility score from 0–100.

The analysis includes:
- Overall ATS compatibility score
- JD keyword match
- Required skills match
- Technical skills match
- Qualifications match
- Experience relevance
- Resume structure
- ATS parsing compatibility
- Section completeness
- Keyword placement
- Overall JD relevance

The score is an **estimated platform-generated compatibility score**, not an official score from any ATS vendor.

### 🔎 Missing Requirements & Keyword Strategy
The analyzer separates JD requirements into actionable categories:

- **Missing Skills** — requested skills not represented in the resume
- **Missing Keywords** — important JD terminology absent from the resume
- **Missing Qualifications** — qualifications that are not represented
- **Missing JD Requirements** — responsibilities, tools, technologies, or domain requirements that are not demonstrated

Keyword recommendations are categorized as:
- **Add**
- **Emphasize**
- **Rephrase**
- **Avoid**
- **Do Not Add**

This helps reduce keyword stuffing and prevents candidates from adding skills they do not actually possess.

### 🛡️ Anti-Fabrication / Truthfulness Engine
A core design rule of the application is that AI-generated resume content must remain grounded in candidate-provided information.

The system is explicitly instructed not to invent:
- Skills
- Jobs
- Internships
- Certifications
- Degrees
- Projects
- Achievements
- Employment dates
- Responsibilities
- Technologies
- Qualifications
- Numerical results

The AI can instead:
- Rephrase existing information
- Improve grammar and clarity
- Reorganize content
- Prioritize JD-relevant information
- Map existing experience to relevant JD terminology
- Recommend skills to learn
- Recommend keywords when the candidate genuinely has supporting experience

### ✍️ JD-Specific Resume Generation
The application generates an optimized resume based on:
1. Candidate information
2. Existing resume
3. Target Job Description
4. Selected ATS template

Relevant skills, experience, internships, projects, certifications, education, and achievements are prioritized according to the JD.

### 📊 Before vs. After ATS Comparison
The application compares the original and optimized resume using:
- Before score
- After score
- Score improvement
- Category-level score changes
- Highlighted resume changes
- Improvement explanation

### 🎨 ATS-Friendly Templates
Four role-oriented templates are provided:
- Software Engineer
- AI/ML
- Graduate/Fresher
- Professional

Templates emphasize machine readability through:
- Single-column layouts
- Standard section headings
- Standard fonts
- Clean hierarchy
- Consistent spacing
- Minimal decoration

The design avoids common ATS-unfriendly patterns such as complex tables, multi-column layouts, skill bars, excessive graphics, and decorative sidebars.

### 👤 Candidate Profile Builder
Candidates can manage:
- Personal information
- Education
- Experience
- Internships
- Projects
- Technical skills
- Certifications
- Achievements
- Hobbies
- Additional information

### 🖥️ Live Resume Preview & Editor
- Live resume preview
- Editable resume sections
- Zoom support
- Page-count monitoring
- ATS score visibility
- Real-time updates
- One-page overflow warning

### 📄 PDF & DOCX Export
The project provides resume export functionality for:
- PDF
- DOCX

The generated document aims to preserve the selected template, spacing, formatting, and ATS-friendly structure.

### 📚 Resume History Dashboard
The dashboard stores previous analysis sessions in browser local storage and can show:
- Recent resumes
- Recent JDs
- Previous ATS scores
- Optimized ATS scores
- Score improvements
- Saved resume versions
- Selected templates
- Resume history

## 🧭 Application Flow

```text
Upload Resume
      ↓
Add Job Description
      ↓
Analyze Resume
      ↓
Review ATS Score
      ↓
Review Missing Skills & Keywords
      ↓
Review Recommendations
      ↓
Choose ATS Template
      ↓
Generate JD-Specific Resume
      ↓
Edit & Preview
      ↓
Check Final ATS Score
      ↓
Download PDF / DOCX
```

## 🏗️ Architecture

The application uses a React frontend with an Express/TypeScript backend.

```text
┌───────────────────────────────┐
│          React UI             │
│                               │
│ Input → Analysis → Templates  │
│ Profile → Preview → Compare   │
│ Dashboard                     │
└───────────────┬───────────────┘
                │
                │ REST API
                ▼
┌───────────────────────────────┐
│       Express Server          │
│                               │
│ /api/extract-file-text        │
│ /api/analyze-resume           │
│ /api/generate-resume          │
└───────────────┬───────────────┘
                │
                │ Gemini API
                ▼
┌───────────────────────────────┐
│       Google Gemini AI        │
│                               │
│ Document extraction           │
│ ATS analysis                  │
│ Candidate profile extraction  │
│ JD-specific optimization      │
└───────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion

### Backend
- Node.js
- Express
- TypeScript
- TSX
- esbuild

### AI
- Google Gemini API
- `@google/genai`

Gemini is used for document text extraction, resume/JD analysis, structured candidate information extraction, and JD-specific resume optimization.

### Resume Export
- jsPDF
- html2canvas
- docx

### Client-Side Persistence
- Browser `localStorage` for saved analysis sessions/history.

## 📁 Project Structure

```text
.
├── assets/
├── src/
│   ├── components/
│   │   ├── AnalysisView.tsx
│   │   ├── AtsScoreGauge.tsx
│   │   ├── CandidateForm.tsx
│   │   ├── DashboardView.tsx
│   │   ├── Header.tsx
│   │   ├── ResumeDiffView.tsx
│   │   ├── ResumePreview.tsx
│   │   ├── ResumeUploader.tsx
│   │   └── TemplateSelector.tsx
│   │
│   ├── data/
│   │   ├── sampleData.ts
│   │   └── templates.ts
│   │
│   ├── utils/
│   │   └── exportResume.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── server.ts
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### `POST /api/extract-file-text`

Extracts readable text from uploaded document content.

**Purpose:**
- Resume extraction
- JD extraction
- Document text processing

### `POST /api/analyze-resume`

Analyzes a resume against a Job Description.

**Request body:**
```json
{
  "resumeText": "Candidate resume text...",
  "jobDescription": "Target job description..."
}
```

**Returns:**
- Target role
- Company name
- Estimated ATS score
- Detailed score breakdown
- Missing requirements
- Keyword strategy
- Improvement recommendations
- Score explanation
- Extracted candidate profile

### `POST /api/generate-resume`

Generates a JD-specific optimized resume from the candidate profile, selected template, JD, and analysis context.

The response contains:
- Optimized candidate profile
- Before score
- After score
- Score improvement
- Before/after breakdown
- Improvement explanation
- Highlighted changes

## 🚀 Getting Started

### Prerequisites

Install:

- Node.js
- npm
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/itzv07/ATS-Resume-Engine.git
cd ATS-Resume-Engine
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

> **Important:** Never commit your real Gemini API key to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```


### 5. Run TypeScript checks

```bash
npm run lint
```

### 6. Create a production build

```bash
npm run build
```

### 7. Start the production server

```bash
npm start
```

## 📦 Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Express + Vite development server |
| `npm run build` | Builds the frontend and bundles the backend |
| `npm start` | Starts the production server |
| `npm run lint` | Runs TypeScript validation |

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key used by the backend |
| `APP_URL` | Optional | Application URL used by the hosted environment |

## 🎯 Design Principles

The product is designed around five priorities:

**Accuracy + ATS Compatibility + JD Relevance + Clean Formatting + Truthful Information**

The existing application visual language is treated as the source of truth for the UI. New screens and components are intended to remain visually consistent with the existing design system rather than introducing unrelated styling patterns.

The primary user-facing priority is:

```text
ATS Score
    ↓
Missing Requirements
    ↓
Recommended Changes
    ↓
Optimized Resume
    ↓
Download
```

## ⚠️ Important Notes

### ATS score is an estimate

The score generated by this application is an estimated resume-to-JD compatibility score. It should not be interpreted as an official score produced by a specific Applicant Tracking System vendor.

### AI recommendations require verification

AI-generated recommendations should be reviewed by the candidate before being included in a final resume.

### Never add skills you do not possess

A JD may contain technologies or qualifications that a candidate does not have. Those should not be added merely to increase an estimated ATS score. The application is intentionally designed to distinguish between information missing from the resume and information the candidate does not possess.

### API key security

Keep `GEMINI_API_KEY` private. Never commit `.env.local` or any file containing a real API key to a public repository.

## 🔮 Future Improvements

Potential future enhancements include:

- User authentication
- Cloud-based resume/session storage
- Multiple saved resume versions per job application
- More ATS templates
- Job application tracking
- Resume sharing links
- Advanced JD parsing
- Resume quality benchmarking
- More granular scoring explanations
- Additional export formats
- Automated resume version management
- Secure cloud persistence

## 📌 Project Goal

The goal of the ATS Resume Analyzer & JD-Specific Resume Builder is to help candidates present their **real qualifications more effectively** for a specific job opportunity.

It does not aim to manufacture experience or manipulate hiring systems. Instead, it helps candidates:

- Understand how closely their resume matches a JD
- Identify genuine gaps
- Improve wording and keyword placement
- Prioritize relevant experience
- Build a clean ATS-friendly resume
- Compare their original and optimized versions
- Export a professional final resume

---

## 👨‍💻 Author

**Venkatesh Erla**

AI & Machine Learning | Software Development | Java | Python

