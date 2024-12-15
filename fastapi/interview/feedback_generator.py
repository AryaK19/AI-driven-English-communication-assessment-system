from typing import List, Dict, Any
import re
import json
from groq import Groq
import os
from .constants import GROQ_API_KEY, FEEDBACK_SYSTEM_PROMPT, IDEAL_ANSWER_PROMPT

class FeedbackGenerator:
    def __init__(self):
        # os.environ["GROQ_API_KEY"] = GROQ_API_KEY
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

    def calculate_answer_score(self, answer: str, question: str, experience_level: str) -> float:
        """
        Calculate a score for an individual answer based on various criteria.
        """
        answer = answer.lower()
        question = question.lower()

        # Basic scoring criteria with weights
        word_count = len(answer.split())
        
        # Technical terms detection
        technical_terms_pattern = r'\b(api|code|data|function|method|class|algorithm|database|framework|' \
                                r'library|server|client|test|debug|deploy|performance|optimization|' \
                                r'scalability|security|encryption|protocol|thread|process|memory|storage|' \
                                r'cloud|container|virtualization|network|frontend|backend|fullstack|' \
                                r'devops|ci/cd|integration|authentication|authorization|middleware|cache|' \
                                r'proxy|dns|http|https|ssl|tls|rest|soap|graphql|json|xml|ajax|mvc|orm|' \
                                r'nosql|sql|crud|gui|cli|architecture|design pattern|microservice|docker|' \
                                r'kubernetes|aws|azure|git|agile|scrum|testing|unit test|integration test|' \
                                r'deployment|monitoring|logging|analytics|machine learning|ai|blockchain|' \
                                r'iot|mobile|responsive|ui|ux|accessibility|seo|version control)\b'
        has_technical_terms = bool(re.search(technical_terms_pattern, answer))

        # Explanation quality detection
        explanation_pattern = r'\b(because|therefore|hence|since|as|due to|thus|resulting in|' \
                            r'consequently|so that|which means|thereby|accordingly|for this reason|' \
                            r'in order to|on account of|this leads to|this ensures|this allows|' \
                            r'this helps|this enables|this prevents|this improves|this optimizes|' \
                            r'this facilitates|this maintains)\b'
        has_explanation = bool(re.search(explanation_pattern, answer))

        # Content relevance
        question_keywords = set(re.findall(r'\b\w+\b', question))
        answer_keywords = set(re.findall(r'\b\w+\b', answer))
        relevance_score = len(question_keywords.intersection(answer_keywords)) / len(question_keywords) if question_keywords else 0

        # Calculate component scores
        length_score = min(30, (min(word_count, 100) / 100) * 30)  # 30% for length
        technical_score = 25 if has_technical_terms else 0         # 25% for technical terms
        explanation_score = 25 if has_explanation else 0           # 25% for explanation
        relevance_score = relevance_score * 20                    # 20% for relevance

        # Apply experience level modifier
        base_score = length_score + technical_score + explanation_score + relevance_score
        if experience_level.lower() == "senior":
            base_score *= 1.2
        elif experience_level.lower() == "junior":
            base_score *= 0.8

        return min(100, base_score)

    def generate_feedback(self, answers: List[Dict[str, str]], experience_level: str) -> Dict[str, Any]:
        """
        Generate comprehensive feedback based on all answers.
        """
        try:
            # Calculate scores for each answer
            total_score = 0
            answers_with_scores = []
            
            for answer_data in answers:
                score = self.calculate_answer_score(
                    answer_data["answer"],
                    answer_data["question"],
                    experience_level
                )
                total_score += score
                answers_with_scores.append({
                    **answer_data,
                    "score": score
                })

            # Calculate final score
            final_score = int(total_score / len(answers))

            # Prepare answers for analysis
            answers_text = "\n".join([
                f"Q: {a['question']}\nA: {a['answer']}\nScore: {a['score']}"
                for a in answers_with_scores
            ])

            # Generate feedback using Groq
            prompt = f"""
            Score: {final_score}
            Experience Level: {experience_level}
            Candidate's Answers:
            {answers_text}

            Please provide detailed feedback addressing the strengths, areas of improvement, and weaknesses.
            """

            feedback_response = self._generate_groq_response(FEEDBACK_SYSTEM_PROMPT, prompt)

            try:
                feedback_dict = json.loads(feedback_response)
                feedback_dict["overallScore"] = str(final_score)
                return feedback_dict
            except json.JSONDecodeError:
                return {
                    "strength": "Technical knowledge demonstrated",
                    "areasOfImprovement": "Add more specific examples and technical depth",
                    "weakness": "Could provide more detailed explanations",
                    "overallScore": str(final_score)
                }

        except Exception as e:
            print(f"Error in generate_feedback: {str(e)}")
            return {
                "strength": "Attempted to answer questions",
                "areasOfImprovement": "Technical depth and clarity",
                "weakness": "Needs more detailed explanations",
                "overallScore": "0"
            }

    def generate_ideal_answer(self, question: str, user_answer: str) -> str:
        """
        Generate an ideal answer and analysis for a given question and user's answer.
        """
        try:
            prompt = f"""
            Question: {question}
            Candidate's Answer: {user_answer}

            Please provide an analysis of the answer and an ideal response.
            """

            response = self._generate_groq_response(IDEAL_ANSWER_PROMPT, prompt)
            return response

        except Exception as e:
            print(f"Error generating ideal answer: {str(e)}")
            return "Error generating ideal answer. Please try again later."