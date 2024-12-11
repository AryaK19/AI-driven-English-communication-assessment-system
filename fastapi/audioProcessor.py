import os
from groq import Groq
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the Groq client with API key
os.environ['GROQ_API_KEY'] = "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"
client = Groq(api_key=os.environ['GROQ_API_KEY'])

async def process_audio_file(file_path: str, language: str = "en") -> dict:
    """
    Process an audio file and return its transcription.
    
    Args:
        file_path (str): Path to the audio file
        language (str): Language code (default: "en")
    
    Returns:
        dict: Dictionary containing transcription result and status
    """
    try:
        # Ensure file exists
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return {"status": "error", "message": "File not found"}

        # Open and process the audio file
        with open(file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(file_path), file.read()),
                model="whisper-large-v3-turbo",
                response_format="json",
                language=language,
                temperature=0.0
            )

        logger.info(f"Successfully transcribed audio file: {file_path}")
        return {
            "status": "success",
            "text": transcription.text,
            "filename": os.path.basename(file_path)
        }

    except Exception as e:
        logger.error(f"Error processing audio file: {str(e)}")
        return {
            "status": "error",
            "message": f"Error processing audio: {str(e)}",
            "filename": os.path.basename(file_path)
        }