import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export const ResumeUpload = ({ onResumeUpload }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const processFile = async (file) => {
    setIsLoading(true);
    setError('');
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        onResumeUpload(text);
        setFileName(file.name);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };

      if (file.type === 'application/pdf') {
        // For PDF files, we'll need to handle them differently
        // In a real application, you'd want to use a PDF parsing library
        // For now, we'll just read it as text
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } catch (err) {
      setError('Error processing file');
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || 
          file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        processFile(file);
      } else {
        setError('Please upload a PDF or text file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const clearFile = () => {
    setFileName('');
    onResumeUpload('');
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-300 hover:border-brand-blue/50'}
          ${fileName ? 'bg-gray-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isLoading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            <p className="text-sm text-gray-600">Processing resume...</p>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-5 h-5 text-brand-blue" />
            <span className="text-sm text-gray-700">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-brand-blue mx-auto" />
            <p className="text-sm text-gray-600">
              {isDragActive ? (
                "Drop your resume here"
              ) : (
                <>
                  Drag and drop your resume, or <span className="text-brand-blue">browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500">Supports: PDF, TXT</p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
};