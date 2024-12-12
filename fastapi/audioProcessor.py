import os
from groq import Groq
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the Groq client with API key from environment variable
client = Groq(api_key=os.getenv("Grok_API_KEY"))

# Language mapping for Whisper model
LANGUAGE_CODES = {
    "English": "en",
    "German": "de",
    "French": "fr",
    "Italian": "it",
    "Portuguese": "pt",
    "Hindi": "hi",
    "Spanish": "es",
    "Thai": "th"
}

async def process_audio_file(file_path: str, language: str = "English") -> dict:
    """
    Process an audio file and return its transcription and fluency analysis.
    
    Args:
        file_path (str): Path to the audio file
        language (str): Language name (default: "English")
    
    Returns:
        dict: Dictionary containing transcription result, fluency analysis, and status
    """
    try:
        # Ensure file exists
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return {"status": "error", "message": "File not found"}

        # Get the language code
        language_code = LANGUAGE_CODES.get(language, "en")
        logger.info(f"Processing audio in {language} (code: {language_code})")

        # Open and process the audio file
        with open(file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(file_path), file.read()),
                model="whisper-large-v3-turbo",
                prompt=f"Transcribe in {language}. Include hesitation markers like 'hmm', 'um', 'uh', 'aaa', 'aa', 'mmm', 'mm', 'ah', 'er', 'erm', 'uhm', 'uhmm', 'uhhuh', 'uhuh'",
                response_format="json",
                language=language_code,
                temperature=0.0
            )

        return {
            "status": "success",
            "text": transcription.text,
            "filename": os.path.basename(file_path),
            "language": language,
            "language_code": language_code
        }

    except Exception as e:
        logger.error(f"Error processing audio file: {str(e)}")
        return {
            "status": "error",
            "message": f"Error processing audio: {str(e)}",
            "filename": os.path.basename(file_path),
            "language": language
        }