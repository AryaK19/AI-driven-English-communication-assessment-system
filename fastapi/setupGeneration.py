import os
import json
import logging
from typing import Dict, List
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AssessmentSetup(BaseModel):
    questionType: str
    numberOfQuestions: int
    topic: str
    difficulty: str
    language: str = "English"  # Default to English if not specified

def generate_prompt(setup: AssessmentSetup) -> str:
    language_prompts = {
        "English": "English",
        "Hindi": "Hindi (हिंदी)",
        "Bengali": "Bengali (বাংলা)",
        "Gujarati": "Gujarati (ગુજરાતી)",
        "Kannada": "Kannada (ಕನ್ನಡ)",
        "Malayalam": "Malayalam (മലയാളം)",
        "Marathi": "Marathi (मराठी)",
        "Punjabi": "Punjabi (ਪੰਜਾਬੀ)",
        "Tamil": "Tamil (தமிழ்)",
        "Telugu": "Telugu (తెలుగు)"
    }
    
    selected_language = language_prompts.get(setup.language, "English")
    
    return f"""Generate exactly {setup.numberOfQuestions} {selected_language} speaking assessment questions based on these criteria:
    - Type: {setup.questionType}
    - Topic: {setup.topic}
    - Difficulty: {setup.difficulty}
    - Language: {selected_language}

    Requirements:
    - Questions should be in {selected_language}
    - Each question should be on a new line
    - Questions should be open-ended
    - Encourage detailed responses
    - Match the specified difficulty level
    - Focus on the given topic
    - Include a mix of personal experience and analytical thinking

    Format your response as follows:
    1. [First question in {selected_language}]

    2. [Second question in {selected_language}]

    3. [Third question in {selected_language}]

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
        questions.append(get_fallback_question(setup.language))
    
    return questions

def generate_questions(setup: AssessmentSetup) -> List[str]:
    client = Groq(
        api_key=os.getenv("Grok_API_KEY"),
    )

    prompt = generate_prompt(setup)
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"""You are an expert {setup.language} language assessment creator. 
                    Generate questions that are clear, engaging, and appropriate for the specified level.
                    All questions must be in {setup.language}.
                    Each question should be on a new line and numbered.
                    Do not include any additional text or formatting."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.2-3b-preview",
            temperature=0.7,
            max_tokens=2000,
            top_p=1,
            stream=False
        )
        
        response_content = chat_completion.choices[0].message.content
        
        # Extract questions from the response
        questions = extract_questions_from_text(response_content, setup.numberOfQuestions)
        
        if not questions:
            logger.warning("No questions extracted, using fallback questions")
            return get_fallback_questions(setup.numberOfQuestions, setup.language)
        
        return questions
            
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return get_fallback_questions(setup.numberOfQuestions, setup.language)

def get_fallback_question(language: str = "English") -> str:
    fallback_questions = {
        "English": "Could you describe a challenging situation you've faced and how you handled it?",
        "German": "Können Sie eine herausfordernde Situation beschreiben, die Sie erlebt haben, und wie Sie damit umgegangen sind?",
        "French": "Pourriez-vous décrire une situation difficile que vous avez rencontrée et comment vous l'avez gérée?",
        "Italian": "Potresti descrivere una situazione difficile che hai affrontato e come l'hai gestita?",
        "Portuguese": "Você poderia descrever uma situação desafiadora que enfrentou e como lidou com ela?",
        "Hindi": "क्या आप एक चुनौतीपूर्ण स्थिति का वर्णन कर सकते हैं जिसका आपने सामना किया और आपने इसे कैसे संभाला?",
        "Spanish": "¿Podrías describir una situación desafiante que hayas enfrentado y cómo la manejaste?",
        "Thai": "คุณช่วยอธิบายสถานการณ์ที่ท้าทายที่คุณเคยเผชิญและคุณจัดการกับมันอย่างไร?"
    }
    return fallback_questions.get(language, fallback_questions["English"])

def get_fallback_questions(count: int, language: str = "English") -> List[str]:
    fallback_questions = {
        "English": [
            "Could you describe your typical daily routine?",
            "What are your future career goals and why?",
            "Tell me about a challenging experience and how you handled it.",
            "What are your thoughts on technology's impact on society?",
            "Describe your ideal vacation destination and explain why you'd choose it."
        ],
        "German": [
            "Können Sie Ihren typischen Tagesablauf beschreiben?",
            "Was sind Ihre beruflichen Ziele und warum?",
            "Erzählen Sie von einer herausfordernden Erfahrung und wie Sie damit umgegangen sind.",
            "Was denken Sie über den Einfluss der Technologie auf die Gesellschaft?",
            "Beschreiben Sie Ihr ideales Urlaubsziel und erklären Sie, warum Sie es wählen würden."
        ],
        "French": [
            "Pourriez-vous décrire votre routine quotidienne typique?",
            "Quels sont vos objectifs de carrière et pourquoi?",
            "Parlez-moi d'une expérience difficile et comment vous l'avez gérée.",
            "Que pensez-vous de l'impact de la technologie sur la société?",
            "Décrivez votre destination de vacances idéale et expliquez pourquoi vous la choisiriez."
        ],
        "Italian": [
            "Potresti descrivere la tua routine quotidiana?",
            "Quali sono i tuoi obiettivi di carriera e perché?",
            "Parlami di un'esperienza difficile e di come l'hai gestita.",
            "Cosa pensi dell'impatto della tecnologia sulla società?",
            "Descrivi la tua destinazione ideale per le vacanze e spiega perché la sceglieresti."
        ],
        "Portuguese": [
            "Você poderia descrever sua rotina diária típica?",
            "Quais são seus objetivos de carreira e por quê?",
            "Conte-me sobre uma experiência desafiadora e como você lidou com ela.",
            "O que você pensa sobre o impacto da tecnologia na sociedade?",
            "Descreva seu destino de férias ideal e explique por que você o escolheria."
        ],
        "Hindi": [
            "क्या आप अपनी रोजमर्रा की दिनचर्या का वर्णन कर सकते हैं?",
            "आपके भविष्य के करियर लक्ष्य क्या हैं और क्यों?",
            "मुझे एक चुनौतीपूर्ण अनुभव के बारे में बताएं और आपने इसे कैसे संभाला।",
            "समाज पर प्रौद्योगिकी के प्रभाव पर आपके क्या विचार हैं?",
            "अपने आदर्श छुट्टी के स्थान का वर्णन करें और बताएं कि आप इसे क्यों चुनेंगे।"
        ],
        "Spanish": [
            "¿Podrías describir tu rutina diaria típica?",
            "¿Cuáles son tus objetivos profesionales y por qué?",
            "Cuéntame sobre una experiencia desafiante y cómo la manejaste.",
            "¿Qué piensas sobre el impacto de la tecnología en la sociedad?",
            "Describe tu destino vacacional ideal y explica por qué lo elegirías."
        ],
        "Thai": [
            "คุณช่วยอธิบายกิจวัตรประจำวันของคุณได้ไหม?",
            "เป้าหมายในอาชีพของคุณคืออะไรและทำไม?",
            "เล่าให้ฟังเกี่ยวกับประสบการณ์ที่ท้าทายและคุณจัดการกับมันอย่างไร",
            "คุณคิดอย่างไรกับผลกระทบของเทคโนโลยีต่อสังคม?",
            "อธิบายสถานที่ท่องเที่ยวในอุดมคติของคุณและอธิบายว่าทำไมคุณถึงเลือกที่นั่น"
        ]
    }
    
    selected_questions = fallback_questions.get(language, fallback_questions["English"])
    return selected_questions[:count]

async def generate_assessment_questions(setup: Dict) -> List[str]:
    """
    Main function to generate assessment questions based on setup parameters.
    """
    assessment_setup = AssessmentSetup(**setup)
    questions = generate_questions(assessment_setup)
    
    return questions