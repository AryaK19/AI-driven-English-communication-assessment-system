# Use an official Python image as the base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1   
ENV PYTHONUNBUFFERED=1         

# Set the working directory in the container
WORKDIR /app

# Copy only the requirements file to the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application to the container
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the FastAPI app using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
