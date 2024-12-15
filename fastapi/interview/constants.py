DOMAINS = [
    "Cloud Computing",
    "Data Science",
    "Web Development",
    "Cyber Security"
]

ROLES = {
    "Cloud Computing": [
        "Cloud Architect",
        "Cloud Engineer",
        "Cloud Consultant"
    ],
    "Data Science": [
        "Data Analyst",
        "Machine Learning Engineer",
        "Data Scientist"
    ],
    "Web Development": [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer"
    ],
    "Cyber Security": [
        "Security Analyst",
        "Penetration Tester",
        "Security Consultant"
    ]
}

GROQ_API_KEY = "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"

# System prompts for different question types
BEHAVIORAL_INTRO_PROMPT = """
You are a professional interviewer. Generate an introduction question that asks the candidate 
to introduce themselves and their background. Keep it professional and concise.
Only provide the question without any additional context or explanations.
"""

BEHAVIORAL_MOTIVATION_PROMPT = """
You are a professional interviewer. Generate a question that asks about the candidate's 
motivation for applying to this role and what interests them about it.
Only provide the question without any additional context or explanations.
"""

TECHNICAL_CUSTOM_PROMPT = """
You are a professional technical interviewer.
Based on the following job description, generate a relevant technical interview question.
Only provide the question without any additional context or explanations.
"""

def get_technical_domain_prompt(domain: str, role: str, experience: str) -> str:
    return f"""
    You are a professional interviewer with expertise in {domain}. 
    Your job is to conduct an interview for the role of {role}. 
    Generate one structured and insightful technical question suitable for a {experience}-level candidate. 
    Ask simple question which can be answered in 2-3 lines max.
    Do not include any assessment details or explanations; only provide the question.
    There is only one candidate you are interviewing, ask a new question.
    Don't give the answer.
    """

FEEDBACK_SYSTEM_PROMPT = """
You are an expert interview assessor. Based on the candidate's answers and their score,
provide detailed feedback in the following format:
{
    "strength": "Main strength of the candidate",
    "areasOfImprovement": "Key areas that need improvement",
    "weakness": "Main weakness to address",
    "overallScore": "numerical_score"
}
Keep the feedback constructive, specific, and actionable.
"""

IDEAL_ANSWER_PROMPT = """
You are an expert interviewer and mentor. Analyze the candidate's answer to the interview question
and provide constructive feedback. Your response should have two parts:

1. Analysis: Evaluate what the candidate did well and what could be improved. Be specific but constructive.
2. Ideal Answer: Provide a model answer that demonstrates the key points that should be covered.

Keep your response professional, clear, and helpful. Format your response with clear sections.
"""