# 3rd Eye – AI Powered Social Media Risk Analyzer

3rd Eye is an AI-powered web application designed to analyze social media posts for potential visa and compliance risks.  
It uses Google Gemini AI to evaluate content and generate structured risk assessments.

The system helps identify potentially sensitive, controversial, or high-risk posts before submission to authorities or during visa background reviews.

---

## 🚀 Features

- AI-based post risk analysis
- Risk level classification (Low / Medium / High)
- Risk score generation (0–100)
- Structured explanation of risk
- Suggested action (Delete / Archive / Safe)
- Clean and modern UI
- Secure server-side API key handling
- JSON-structured AI response validation

---

## 🏗️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite (Build Tool)
- Tailwind CSS
- Lucide Icons
- Motion (for animations)

### Backend
- Node.js
- Express.js
- TypeScript (Server-side)
- tsx runtime

### AI Integration
- Google Gemini API (`@google/genai`)
- Structured JSON response schema validation

### Deployment
- Vercel (Frontend Hosting)
- Environment Variable Configuration

---

## 📂 Project Structure
3rd-eye/
│
├── server.ts # Express backend server
├── src/
│ ├── App.tsx # Main React component
│ ├── components/ # UI Components
│ ├── services/
│ │ └── geminiService.ts # AI integration logic
│ └── main.tsx
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── package.json


## 🧠 How It Works

1. User enters a social media post.
2. The backend sends the content to the Gemini AI model.
3. The AI analyzes the text using a structured schema.
4. The response is parsed into:
   - Risk Level
   - Risk Score
   - Explanation
   - Suggested Action
5. The result is displayed in the UI.

---

## 🛡 Security Design

- API keys are handled server-side
- Structured JSON schema ensures predictable AI output
- Error handling fallback prevents app crashes
- Environment-based configuration

---

