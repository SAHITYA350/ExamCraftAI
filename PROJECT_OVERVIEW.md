# ExamCraft AI: Project Overview & Working Process

## 🎯 Main Objective (Moto)
The "Main Moto" of ExamCraft AI is to provide a **High-Precision Academic Intelligence Suite**. It aims to revolutionize how students interact with their study materials by using state-of-the-art AI and OCR to:
1. **Digitize Handwritten Notes**: Convert messy or handwritten academic notes into structured, readable Markdown.
2. **Deep Concept Extraction**: Automatically identify technical topics, keywords, and headers with zero hallucination.
3. **Personalized Exam Prep**: Generate high-quality MCQs and adaptive study roadmaps tailored to the specific content of the student's material.

---

## 🏗️ Technical Architecture & Working Process

The project is divided into three main components that work in harmony:

### 1. Frontend (The User Gateway)
- **Technologies**: React, Vite, Tailwind CSS, Lucide icons, Framer Motion, Axios.
- **How it Works**:
  - Provides a premium, futuristic UI for educational interaction.
  - Handles file uploads (PDF, Images, DOCX) through a responsive interface.
  - Displays real-time progress of OCR and AI analysis.
  - Renders personalized practice sessions and interactive study plans.

### 2. Backend (The Orchestration Hub)
- **Technologies**: Node.js, Express, MongoDB (Mongoose), ImageKit/Cloudinary, Tesseract.js, Mammoth.
- **How it Works**:
  - **API Layer**: Manages user authentication, material sessions, and data persistence.
  - **Orchestration**: Directs files to various "extractors" (PDF, Image, or Docx).
  - **AI Integration**: Coordinates with Groq (Llama 3) and Google Gemini for deep reasoning tasks like question generation and answer evaluation.
  - **Multi-LLM Strategy**: Implements a tier-based recovery system—if one AI provider fails or is rate-limited, it automatically falls back to another (e.g., Groq -> Gemini -> Heuristic Fallback).

### 3. ML-Service (The AI Specialist)
- **Technologies**: Python, FastAPI, Groq SDK, Uvicorn.
- **How it Works**:
  - Acts as a dedicated service for computationally heavy or Python-optimized AI tasks.
  - Handles specialized endpoints for topic extraction and solution analysis.
  - Ensures high-performance processing by running independently from the main Node.js backend.

---

## 🔄 Core Workflow
1. **Upload**: User uploads a file (e.g., a photo of handwritten notes).
2. **OCR Phase**: Multi-tier OCR (Tesseract + AI Layout Refinement) extracts the text.
3. **Analysis Phase**: The AI identifies the "Academic DNA" (Topics, Difficulty, and Prerequisites).
4. **Generation Phase**: Personalized MCQs and a Day-by-Day Study Plan are generated.
5. **Execution**: The student practices with the AI, receiving deep logical feedback on every answer.
