import React from 'react';
import { useNavigate } from 'react-router-dom';

const OverallReportLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 p-2 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="ml-2 font-medium">Back to Reports</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center">
              <span className="text-sm font-medium text-slate-500">Reports</span>
              <span className="mx-2 text-slate-400">/</span>
              <span className="text-sm font-medium text-slate-900">Detailed View</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6">
            {/* Report Context Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-900">Assessment Report</h1>
              <p className="mt-2 text-sm text-slate-500">
                Detailed feedback and analysis from your assessment
              </p>
            </div>
            
            {/* Content Area */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallReportLayout;