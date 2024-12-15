from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Dict, Optional
from pydantic import BaseModel
from .question_generator import QuestionGenerator
from .feedback_generator import FeedbackGenerator
from .resume_handler import ResumeHandler
from .constants import DOMAINS, ROLES

router = APIRouter(prefix="/interview", tags=["interview"])

# Pydantic models for request/response validation
class QuestionRequest(BaseModel):
    isCustomJob: bool
    jobDescription: Optional[str] = None
    domain: Optional[str] = None
    role: Optional[str] = None
    experience: str
    questionCount: int
    resumeText: Optional[str] = None

class Answer(BaseModel):
    question: str
    answer: str

class FeedbackRequest(BaseModel):
    answers: List[Answer]
    experience: str

class IdealAnswerRequest(BaseModel):
    question: str
    userAnswer: str

# Initialize components
question_generator = QuestionGenerator()
feedback_generator = FeedbackGenerator()
resume_handler = ResumeHandler()

@router.get("/domains")
async def get_domains() -> List[str]:
    """Get available interview domains."""
    return DOMAINS

@router.get("/roles/{domain}")
async def get_roles(domain: str) -> List[str]:
    """Get available roles for a specific domain."""
    if domain not in ROLES:
        raise HTTPException(status_code=404, detail="Domain not found")
    return ROLES[domain]

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)) -> Dict[str, str]:
    """
    Upload and process a resume file.
    
    Args:
        file: The resume file (PDF, DOCX, or TXT)
        
    Returns:
        Dict containing the extracted resume text
        
    Raises:
        HTTPException: If file processing fails
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
            
        allowed_extensions = {'.pdf', '.txt', '.doc', '.docx'}
        file_ext = '.' + file.filename.lower().split('.')[-1]
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file format. Allowed formats: {', '.join(allowed_extensions)}"
            )
        
        resume_text = await resume_handler.save_resume(file)
        return {"resumeText": resume_text}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@router.post("/generate-questions")
async def generate_questions(request: QuestionRequest) -> List[Dict[str, str]]:
    """
    Generate interview questions based on the provided parameters.
    
    Args:
        request: QuestionRequest containing job details and preferences
        
    Returns:
        List of generated questions
        
    Raises:
        HTTPException: If question generation fails
    """
    try:
        if request.isCustomJob and not request.jobDescription:
            raise HTTPException(
                status_code=400,
                detail="Job description is required for custom jobs"
            )
        elif not request.isCustomJob and not all([request.domain, request.role]):
            raise HTTPException(
                status_code=400,
                detail="Domain and role are required for quick setup"
            )
        
        if not request.experience:
            raise HTTPException(
                status_code=400,
                detail="Experience level is required"
            )

        # Generate behavioral questions first
        questions = question_generator.generate_behavioral_questions()

        # Generate technical questions
        technical_questions = question_generator.generate_technical_questions(
            resume_text=request.resumeText,
            is_custom_job=request.isCustomJob,
            job_description=request.jobDescription,
            domain=request.domain,
            role=request.role,
            experience=request.experience,
            num_questions=request.questionCount - len(questions)
        )
        
        questions.extend(technical_questions)
        return questions

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating questions: {str(e)}"
        )

@router.post("/submit-feedback")
async def submit_feedback(request: FeedbackRequest) -> Dict[str, str]:
    """
    Generate feedback based on interview answers.
    
    Args:
        request: FeedbackRequest containing answers and experience level
        
    Returns:
        Dict containing feedback details
        
    Raises:
        HTTPException: If feedback generation fails
    """
    try:
        if not request.answers:
            raise HTTPException(
                status_code=400,
                detail="No answers provided"
            )

        feedback = feedback_generator.generate_feedback(
            request.answers,
            request.experience
        )
        return feedback

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating feedback: {str(e)}"
        )

@router.post("/ideal-answer")
async def get_ideal_answer(request: IdealAnswerRequest) -> Dict[str, str]:
    """
    Generate an ideal answer analysis for a given question and user's answer.
    
    Args:
        request: IdealAnswerRequest containing the question and user's answer
        
    Returns:
        Dict containing the analysis and ideal answer
        
    Raises:
        HTTPException: If ideal answer generation fails
    """
    try:
        if not request.question or not request.userAnswer:
            raise HTTPException(
                status_code=400,
                detail="Question and user answer are required"
            )

        response = feedback_generator.generate_ideal_answer(
            request.question,
            request.userAnswer
        )
        return {"response": response}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating ideal answer: {str(e)}"
        )