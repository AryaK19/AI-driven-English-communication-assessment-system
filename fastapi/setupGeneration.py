import os
import json
import logging
from typing import Dict, List
from groq import Groq
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AssessmentSetup(BaseModel):
    questionType: str
    numberOfQuestions: int
    topic: str
    difficulty: str

def generate_prompt(setup: AssessmentSetup) -> str:
    return f"""Generate exactly {setup.numberOfQuestions} English speaking assessment questions based on these criteria:
    - Type: {setup.questionType}
    - Topic: {setup.topic}
    - Difficulty: {setup.difficulty}

    Requirements:
    - Each question should be on a new line
    - Questions should be open-ended
    - Encourage detailed responses
    - Match the specified difficulty level
    - Focus on the given topic
    - Include a mix of personal experience and analytical thinking

    Format your response as follows:
    1. What are your thoughts on...?

    2. Could you describe...?

    3. Tell me about...?

    Only include the numbered questions, one per line. No additional text or formatting."""

def extract_questions_from_text(text: str, num_questions: int) -> List[str]:
    """Extract questions from text response, handling different formats."""
    # Remove any markdown formatting
    clean_text = text.replace("```", "").strip()
    
    # Split by newlines and clean up
    lines = [line.strip() for line in clean_text.split('\n') if line.strip()]
    
    # Remove numbering and any extra formatting
    questions = []
    for line in lines:
        # Remove common number formats (1., 1), Q1:, etc.)
        cleaned = line.strip()
        if cleaned:
            # Remove numbering patterns
            patterns = [
                r'^\d+[\.\)]\s*',  # Matches "1." or "1)"
                r'^Q\d+[:\.]\s*',  # Matches "Q1:" or "Q1."
                r'^\[\d+\]\s*',    # Matches "[1]"
                r'^Question\s*\d+[:\.]\s*'  # Matches "Question 1:" or "Question 1."
            ]
            for pattern in patterns:
                import re
                cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
            
            cleaned = cleaned.strip()
            if cleaned:
                questions.append(cleaned)
    
    # Ensure we have exactly the number of questions requested
    questions = questions[:num_questions]
    while len(questions) < num_questions:
        questions.append(get_fallback_question())
    
    return questions

def generate_questions(setup: AssessmentSetup) -> List[str]:
    client = Groq(
        api_key="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",
    )

    prompt = generate_prompt(setup)
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert English language assessment creator. 
                    Generate questions that are clear, engaging, and appropriate for the specified level.
                    Each question should be on a new line and numbered.
                    Do not include any additional text or formatting."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=2000,
            top_p=1,
            stream=False
        )
        
        response_content = chat_completion.choices[0].message.content
        logger.info(f"Raw response: {response_content}")
        
        # Extract questions from the response
        questions = extract_questions_from_text(response_content, setup.numberOfQuestions)
        
        if not questions:
            logger.warning("No questions extracted, using fallback questions")
            return get_fallback_questions(setup.numberOfQuestions)
        
        return questions
            
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return get_fallback_questions(setup.numberOfQuestions)

def get_fallback_question() -> str:
    return "Could you describe a challenging situation you've faced and how you handled it?"

def get_fallback_questions(count: int) -> List[str]:
    fallback_questions = [
        "Could you describe your typical daily routine?",
        "What are your future career goals and why?",
        "Tell me about a challenging experience and how you handled it.",
        "What are your thoughts on technology's impact on society?",
        "Describe your ideal vacation destination and explain why you'd choose it.",
        "How do you think education will change in the next decade?",
        "What's the most important lesson you've learned in life so far?",
        "Describe a person who has influenced you and explain why.",
        "What changes would you make to improve your local community?",
        "How do you handle stress and maintain work-life balance?"
    ]
    return fallback_questions[:count]

async def generate_assessment_questions(setup: Dict) -> List[str]:
    """
    Main function to generate assessment questions based on setup parameters.
    """
    assessment_setup = AssessmentSetup(**setup)
    questions = generate_questions(assessment_setup)
    
    # Log the final questions for debugging
    logger.info(f"Final questions: {questions}")
    
    return questions