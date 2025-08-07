AiTut 📚🧠
AiTut is an AI-powered educational assistant built to help learners access summarized knowledge, generate quizzes, translate transcripts, and find relevant YouTube content.

🔧 Tech Stack
Backend: LangGraph (agent + tools) with OpenAI GPT-4o

Frontend: Next.js (not in this repo)

Database & Auth: Convex + Clerk (handled in Next.js frontend)

Environment Management: dotenv

APIs Used: YouTube Data API, OpenAI API

📂 Folder Structure (Backend)
bash
Copy
Edit
aitut-backend/
│
├── agent/
│   └── langgraph_agent.py  # Core LangGraph agent logic and tools
│
├── venv/                   # Virtual environment (excluded via .gitignore)
│
├── main.py                 # Entry point for backend invocation
├── .env                    # Environment variables (excluded via .gitignore)
└── .gitignore
✅ Features (Backend LangGraph Agent)
📄 YouTube Transcript Extraction

Uses youtube_transcript_api to fetch and clean transcripts.

Falls back gracefully if transcript isn't available.

📚 AI-Powered Summary

Summarizes YouTube transcripts using GPT-4o.

Triggered when user requests a "summary".

❓ Quiz Generator

Produces 5 MCQs with options and marked correct answers.

Formatted in a strict JSON response with prefix (QUIZ_$#%^&$24534).

🌍 Transcript Translation

Translates any transcript content to English.

🔍 YouTube Video Search

Finds embeddable, public YouTube videos longer than 5 minutes.

Structured output with prefix (YTSEARCH_$#%^&$24534).

🧠 LangGraph Agent Flow

Determines tool use based on user input.

Automatically chains tool calls via LangGraph's conditional logic.
