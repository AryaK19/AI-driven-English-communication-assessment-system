from typing import Dict, Tuple
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("Grok_API_KEY"),
)

def analyze_response(question: str, answer: str) -> Tuple[float, str]:
    # Count words in the answer
    word_count = len(answer.split())
    
    # Initialize base score
    score = 0.0
    detailed_feedback = []
    
    # Check word count requirement (80 words minimum)
    if word_count < 80:
        word_count_score = (word_count / 80) * 50  # Up to 50% of score for word count
        detailed_feedback.append(f"Word count ({word_count}/80): Your response is too short. -50% score penalty")
    else:
        word_count_score = 50
        detailed_feedback.append(f"Word count ({word_count}/80): Requirement met. Full word count score awarded")

    # Use Groq to analyze relevance and quality
    try:
        prompt = f"""
        Analyze the following answer for its relevance to the question and quality of explanation.
        
        Question: {question}
        Answer: {answer}
        
        Provide a detailed analysis in JSON format with the following structure:
        {{
            "relevance_score": (0-25 points),
            "quality_score": (0-25 points),
            "relevance_feedback": "detailed explanation of relevance score",
            "quality_feedback": "detailed explanation of quality score"
        }}
        
        Base your scoring on:
        - Relevance: How well the answer addresses the specific question (0-25 points)
        - Quality: Clarity, depth, and coherence of the explanation (0-25 points)
        """

        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an English assessment expert. Provide detailed analysis in JSON format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama2-70b-4096",
            temperature=0.1,
        )
        
        # Parse the response
        analysis = eval(response.choices[0].message.content)
        relevance_score = float(analysis['relevance_score'])
        quality_score = float(analysis['quality_score'])
        
        # Add detailed feedback
        detailed_feedback.append(f"Relevance: {analysis['relevance_feedback']}")
        detailed_feedback.append(f"Quality: {analysis['quality_feedback']}")
        
        # Calculate final score
        content_score = relevance_score + quality_score
        
        # If answer is completely irrelevant (relevance_score < 5), zero out the total score
        if relevance_score < 5:
            score = 0
            detailed_feedback.append("Response is completely irrelevant to the question. Score set to 0.")
        else:
            score = word_count_score + content_score
            
    except Exception as e:
        detailed_feedback.append(f"Error in analysis: {str(e)}")
        score = word_count_score  # Fall back to just word count score
    
    # Format the detailed feedback
    feedback_text = "\n".join(detailed_feedback)
    
    return score, feedback_text

def check_answer_correctness(question: str, answer: str) -> Dict:
    """
    Main function to check answer correctness and provide feedback
    """
    score, feedback = analyze_response(question, answer)
    
    return {
        "score": round(score, 2),
        "detailed_feedback": feedback,
        "max_score": 100
    }