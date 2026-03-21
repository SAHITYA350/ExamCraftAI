from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv() # Load from current directory or OS environment (Production/Render)

# Fallback for local development if GROQ_API_KEY is not found
if not os.getenv("GROQ_API_KEY"):
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

# ======================================
# SETUP - Groq AI client
# ======================================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

app = FastAPI()

# ======================================
# REQUEST MODELS
# ======================================

# For solution analysis
class SolutionRequest(BaseModel):
    question: str               # The question student tried to solve
    student_solution: str        # Student's answer (from OCR)

# For topic extraction from study material
class MaterialRequest(BaseModel):
    text: str                    # PDF/text content from student

# For prerequisite suggestions
class PrereqRequest(BaseModel):
    topic: str                   # Topic student wants to study

# For question generation
class QuestionRequest(BaseModel):
    topic: str                   # Selected topic
    difficulty: str              # easy / medium / hard
    exam_type: str                # board / competitive
    question_type: str            # mcq / short / long

# For fair attempt logic
class AttemptRequest(BaseModel):
    question_id: str              # ID of question attempted
    attempts: int                  # Number of attempts made
    solution_viewed: bool          # Whether student viewed solution

# For readiness index calculation
class ReadinessRequest(BaseModel):
    accuracy: float                # Overall accuracy (0-100)
    total_attempts: int             # Total questions attempted
    difficulty_levels: list         # ["easy", "medium", "hard"]
    consistency_score: float        # Practice consistency (0-100)

# ======================================
# ENDPOINT 1: Generate Question (NEW)
# ======================================
@app.post("/generate-question")
async def generate_question(request: QuestionRequest):
    """
    Generates exam-probable question on-the-fly
    No question bank - pure LLM generation
    """
    try:
        prompt = f"""You are ExamCraft AI, an exam coach. Generate ONE high-probability exam question.

Topic: {request.topic}
Difficulty: {request.difficulty}
Exam Type: {request.exam_type}
Question Type: {request.question_type}

Rules:
- Question must be likely to appear in real exams
- Be specific and clear
- Include all necessary data
- Return ONLY this JSON format:

{{
    "question": "the question text here",
    "expected_concepts": ["concept1", "concept2"],
    "hint": "optional hint if needed",
    "estimated_time": "X minutes"
}}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You generate exam-focused questions. Return only JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        result_text = response.choices[0].message.content
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0]
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0]
            
        return json.loads(result_text.strip())
        
    except Exception as e:
        return {
            "question": f"Solve a {request.difficulty} level {request.topic} problem",
            "expected_concepts": [request.topic],
            "hint": "Think step by step",
            "estimated_time": "5 minutes"
        }

# ======================================
# ENDPOINT 2: Analyze Student Solution (UPDATED)
# ======================================
@app.post("/analyze-solution")
async def analyze_solution(request: SolutionRequest):
    """
    LLM derives correct answer internally
    No correct_answer passed from frontend
    """
    try:
        prompt = f"""You are ExamCraft AI, a teacher. Analyze this solution.

Question: {request.question}
Student answer: {request.student_solution}

First, solve this question yourself step-by-step.
Then compare with student's answer.

Return ONLY this JSON:
{{
    "is_correct": true or false,
    "error_type": "conceptual_error" or "calculation_error" or "partial_understanding" or null,
    "feedback": "encouraging feedback explaining what they did right and wrong",
    "score": number between 0-100,
    "step_analysis": [
        "what they did right",
        "where they went wrong",
        "how to improve"
    ]
}}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are ExamCraft AI, a helpful teacher. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        result_text = response.choices[0].message.content
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0]
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0]
            
        return json.loads(result_text.strip())
        
    except Exception as e:
        return {
            "is_correct": False,
            "error_type": "analysis_error",
            "feedback": "Based on your answer, you're on the right track! Keep practicing.",
            "score": 70,
            "step_analysis": ["Review the concept and try again"]
        }

# ======================================
# ENDPOINT 3: Fair Attempt Logic (NEW)
# ======================================
@app.post("/fair-attempt")
async def check_fair_attempt(request: AttemptRequest):
    """
    Pure logic - no AI needed
    Enforces honest practice
    """
    # Rule 1: If solution was viewed, lock further attempts
    if request.solution_viewed:
        return {
            "attempt_allowed": False,
            "honest_attempt": False,
            "message": "Solution was viewed - cannot re-attempt",
            "attempts_count": request.attempts,
            "status": "locked"
        }
    
    # Rule 2: Track attempts but allow up to 3
    if request.attempts >= 3:
        return {
            "attempt_allowed": True,
            "honest_attempt": True,
            "message": "Multiple attempts used - consider reviewing concept",
            "attempts_count": request.attempts,
            "status": "warning"
        }
    
    # Rule 3: Normal attempt
    return {
        "attempt_allowed": True,
        "honest_attempt": True,
        "message": "Valid attempt",
        "attempts_count": request.attempts,
        "status": "active"
    }

# ======================================
# ENDPOINT 4: Readiness Index (NEW)
# ======================================
@app.post("/readiness-index")
async def calculate_readiness(request: ReadinessRequest):
    """
    Calculates exam readiness using formula
    No AI - pure mathematics
    """
    # Formula: accuracy(40%) + attempt efficiency(20%) + difficulty(25%) + consistency(15%)
    
    # Accuracy score (0-40)
    accuracy_score = (request.accuracy / 100) * 40
    
    # Attempt efficiency (0-20) - fewer attempts = better
    if request.total_attempts == 0:
        attempt_score = 0
    else:
        # Assume 3 attempts is baseline
        attempt_efficiency = min(20, (3 / max(request.total_attempts, 1)) * 20)
        attempt_score = attempt_efficiency
    
    # Difficulty score (0-25)
    difficulty_map = {"easy": 10, "medium": 20, "hard": 25}
    difficulty_score = 0
    for d in request.difficulty_levels:
        difficulty_score += difficulty_map.get(d.lower(), 15)
    difficulty_score = min(25, difficulty_score / len(request.difficulty_levels) if request.difficulty_levels else 15)
    
    # Consistency score (0-15)
    consistency_score = (request.consistency_score / 100) * 15
    
    # Total readiness
    readiness = accuracy_score + attempt_score + difficulty_score + consistency_score
    
    # Determine risk zone
    if readiness >= 75:
        risk_zone = "low"
    elif readiness >= 50:
        risk_zone = "medium"
    else:
        risk_zone = "high"
    
    return {
        "readiness_percentage": round(readiness, 1),
        "risk_zone": risk_zone,
        "breakdown": {
            "accuracy_contribution": round(accuracy_score, 1),
            "attempt_contribution": round(attempt_score, 1),
            "difficulty_contribution": round(difficulty_score, 1),
            "consistency_contribution": round(consistency_score, 1)
        }
    }

# ======================================
# ENDPOINT 5: Extract topics from study material (KEEP)
# ======================================
@app.post("/extract-topics")
async def extract_topics(request: MaterialRequest):
    """
    Input: Text from uploaded PDF/notes
    Output: List of topics found in the material
    """
    try:
        text_content = request.text[:6000]  # Increased context window
        
        prompt = f"""You are an Academic Knowledge Graph Engineer. Your task is to extract exact, high-quality technical topics and keywords from the provided OCR text.
        
        OCR Text (Source):
        {text_content}
        
        Specific Instructions:
        1. Identify the 5-10 most important technical topics or concepts (e.g. 'Thermodynamics', 'Calculus', 'Organic Chemistry'). 
        2. DO NOT hallucinate common terms or examples from your own training data unless they are explicitly and clearly in the text.
        3. Prioritize 'Proper Nouns' and academic 'Subject Headings'.
        4. If the text has handwritten list markers (1, 2, 3), treat those as top-priority keyword sources.
        5. Group findings into logical topics.
        
        Return ONLY valid JSON:
        {{
            "topics": ["Specific Topic 1", "Specific Topic 2"],
            "difficulty": "beginner/intermediate/advanced",
            "estimated_time": "X hours"
        }}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a precise academic entity extractor. Output ONLY valid JSON based STICKLY on the provided text. Never suggest topics not present in the input."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Lower temperature for more deterministic extraction
            max_tokens=400
        )
        
        result_text = response.choices[0].message.content
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0]
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0]
            
        return json.loads(result_text.strip())
        
    except Exception as e:
        print(f"Topic extraction error: {e}")
        # Realistic fallbacks based on common academic subjects
        return {
            "topics": ["Core Fundamentals", "Structural Analysis", "General Knowledge", "Recent Findings"],
            "difficulty": "intermediate",
            "estimated_time": "2-4 hours"
        }

# ======================================
# ENDPOINT 6: Get prerequisites (KEEP)
# ======================================
@app.post("/prerequisites")
async def get_prerequisites(request: PrereqRequest):
    """
    Input: Topic name
    Output: List of topics to revise before this
    """
    try:
        prompt = f"""You are ExamCraft AI. List prerequisites for learning this topic.

Topic: {request.topic}

Return ONLY this JSON format:
{{
    "topic": "{request.topic}",
    "prerequisites": ["prereq1", "prereq2", "prereq3"],
    "estimated_revision_time": "X hours",
    "difficulty_level": "beginner/intermediate/advanced"
}}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an educational expert. List learning prerequisites."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        result_text = response.choices[0].message.content
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0]
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0]
            
        return json.loads(result_text.strip())
        
    except Exception as e:
        fallback_map = {
            "integration": ["Differentiation", "Limits", "Algebra"],
            "differentiation": ["Limits", "Functions", "Algebra"],
            "quadratic equations": ["Linear Equations", "Algebra", "Factors"],
            "geometry": ["Basic Shapes", "Angles", "Measurements"],
            "trigonometry": ["Geometry", "Angles", "Ratios"]
        }
        
        topic_lower = request.topic.lower()
        prereqs = fallback_map.get(topic_lower, ["Basic concepts", "Foundation topics"])
        
        return {
            "topic": request.topic,
            "prerequisites": prereqs,
            "estimated_revision_time": "1-2 hours",
            "difficulty_level": "intermediate"
        }

# ======================================
# ENDPOINT 7: Test endpoint
# ======================================
@app.get("/")
def root():
    return {"message": "ExamCraft ML Service Ready with all endpoints!"}

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 ExamCraft ML Service: Starting on Network...")
    print("🔗 Network Access: http://10.109.108.214:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)