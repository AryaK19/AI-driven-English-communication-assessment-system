from typing import Union, Optional
import io
import PyPDF2
import docx
from fastapi import UploadFile
import chardet

class ResumeHandler:
    @staticmethod
    def detect_encoding(content: bytes) -> str:
        """
        Detect the encoding of the content.
        """
        result = chardet.detect(content)
        return result['encoding'] or 'utf-8'

    @staticmethod
    def extract_text_from_pdf(content: bytes) -> str:
        """
        Extract text from PDF content.
        """
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from PDF: {str(e)}")
            raise ValueError("Failed to extract text from PDF file")

    @staticmethod
    def extract_text_from_docx(content: bytes) -> str:
        """
        Extract text from DOCX content.
        """
        try:
            doc = docx.Document(io.BytesIO(content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from DOCX: {str(e)}")
            raise ValueError("Failed to extract text from DOCX file")

    @staticmethod
    def extract_text_from_txt(content: bytes) -> str:
        """
        Extract text from TXT content.
        """
        try:
            encoding = ResumeHandler.detect_encoding(content)
            return content.decode(encoding).strip()
        except Exception as e:
            print(f"Error extracting text from TXT: {str(e)}")
            raise ValueError("Failed to extract text from TXT file")

    @staticmethod
    async def process_resume(file: UploadFile) -> str:
        """
        Process the uploaded resume file and extract text content.
        
        Args:
            file: The uploaded file object
            
        Returns:
            str: Extracted text content from the resume
            
        Raises:
            ValueError: If file format is not supported or text extraction fails
        """
        try:
            content = await file.read()
            file_extension = file.filename.lower().split('.')[-1]

            if file_extension == 'pdf':
                return ResumeHandler.extract_text_from_pdf(content)
            elif file_extension in ['doc', 'docx']:
                return ResumeHandler.extract_text_from_docx(content)
            elif file_extension == 'txt':
                return ResumeHandler.extract_text_from_txt(content)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")

        except Exception as e:
            print(f"Error processing resume: {str(e)}")
            raise ValueError(f"Failed to process resume: {str(e)}")

    @staticmethod
    def clean_resume_text(text: str) -> str:
        """
        Clean and normalize the extracted resume text.
        
        Args:
            text: Raw text extracted from resume
            
        Returns:
            str: Cleaned and normalized text
        """
        try:
            # Remove extra whitespace and normalize line endings
            text = " ".join(text.split())
            
            # Remove special characters but keep basic punctuation
            text = "".join(char for char in text if char.isprintable())
            
            # Normalize multiple spaces
            text = " ".join(text.split())
            
            return text.strip()
            
        except Exception as e:
            print(f"Error cleaning resume text: {str(e)}")
            return text  # Return original text if cleaning fails

    @staticmethod
    async def save_resume(file: UploadFile) -> str:
        """
        Process and save the resume, returning the extracted text.
        
        Args:
            file: The uploaded resume file
            
        Returns:
            str: Extracted and cleaned text from the resume
            
        Raises:
            ValueError: If file processing fails
        """
        try:
            # Extract text from the resume
            resume_text = await ResumeHandler.process_resume(file)
            
            # Clean the extracted text
            cleaned_text = ResumeHandler.clean_resume_text(resume_text)
            
            if not cleaned_text:
                raise ValueError("No text could be extracted from the resume")
                
            return cleaned_text
            
        except Exception as e:
            print(f"Error saving resume: {str(e)}")
            raise ValueError(f"Failed to save resume: {str(e)}")