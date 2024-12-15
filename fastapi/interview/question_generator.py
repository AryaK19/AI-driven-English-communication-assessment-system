from typing import List, Dict, Optional
from groq import Groq
import os
from .constants import (
    GROQ_API_KEY,
    BEHAVIORAL_INTRO_PROMPT,
    BEHAVIORAL_MOTIVATION_PROMPT,
    TECHNICAL_CUSTOM_PROMPT,
    get_technical_domain_prompt
)

class QuestionGenerator:
    def __init__(self):
            self.client = Groq(api_key=os.getenv("Grok_API_KEY"))


    def _generate_groq_response(self, system_prompt: str, user_prompt: str) -> str:
        """
        Generate a response using the Groq API.
        """
        try:
            completion = self.client.chat.completions.create(
                model="llama-3.2-3b-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=1,
                max_tokens=1024,
                top_p=1,
                stream=False,
                stop=None
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error in generate_groq_response: {str(e)}")
            raise

    def generate_behavioral_questions(self) -> List[Dict[str, str]]:
        """
        Generate behavioral questions including introduction and motivation questions.
        """
        questions = []
        try:
            # Generate introduction question
            intro_response = self._generate_groq_response(
                BEHAVIORAL_INTRO_PROMPT,
                "Generate an introduction question for the interview."
            )
            questions.append({"question": intro_response, "type": "behavioral"})

            # Generate motivation question
            motivation_response = self._generate_groq_response(
                BEHAVIORAL_MOTIVATION_PROMPT,
                "Generate a question about role motivation."
            )
            questions.append({"question": motivation_response, "type": "behavioral"})

        except Exception as e:
            print(f"Error generating behavioral questions: {str(e)}")
            # Fallback questions if API fails
            questions = [
                {
                    "question": "Could you please introduce yourself and tell us about your background?",
                    "type": "behavioral"
                },
                {
                    "question": "What interests you about this role and why did you apply for it?",
                    "type": "behavioral"
                }
            ]

        return questions

    def generate_technical_questions(
        self,
        resume_text: Optional[str],
        is_custom_job: bool,
        job_description: Optional[str],
        domain: Optional[str],
        role: Optional[str],
        experience: str,
        num_questions: int
    ) -> List[Dict[str, str]]:
        """
        Generate technical questions based on job description or domain/role.
        """
        questions = []

        try:
            for i in range(num_questions):
                if is_custom_job and job_description:
                    system_prompt = TECHNICAL_CUSTOM_PROMPT
                    question_prompt = f"Generate a technical interview question based on the job requirements: {job_description}"
                else:
                    system_prompt = get_technical_domain_prompt(domain, role, experience)
                    question_prompt = f"Ask a technical {experience}-level interview question for a {role} in {domain}."

                response = self._generate_groq_response(system_prompt, question_prompt)
                questions.append({
                    "question": response,
                    "type": "technical",
                    "domain": domain if not is_custom_job else None,
                    "role": role if not is_custom_job else None
                })

        except Exception as e:
            print(f"Error generating technical questions: {str(e)}")
            # Fallback questions if API fails
            questions = [
                {
                    "question": "What are your main technical skills and how have you applied them in your previous work?",
                    "type": "technical"
                }
            ]

        return questions

    def generate_interview_questions(
        self,
        resume_text: Optional[str],
        is_custom_job: bool,
        job_description: Optional[str],
        domain: Optional[str],
        role: Optional[str],
        experience: str,
        num_technical_questions: int
    ) -> List[Dict[str, str]]:
        """
        Generate a complete set of interview questions including both behavioral and technical questions.
        """
        # Generate behavioral questions first
        questions = self.generate_behavioral_questions()

        # Generate technical questions
        technical_questions = self.generate_technical_questions(
            resume_text=resume_text,
            is_custom_job=is_custom_job,
            job_description=job_description,
            domain=domain,
            role=role,
            experience=experience,
            num_questions=num_technical_questions
        )

        questions.extend(technical_questions)
        return questions