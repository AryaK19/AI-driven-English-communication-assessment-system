import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Briefcase, FileText, Brain, ChevronRight, Check, Code, Book, Cpu, Loader2, Sparkles } from 'lucide-react';
import { ResumeUpload } from '../../components/Interview/ResumeUpload';
import { EXPERIENCE_LEVELS, MAX_QUESTIONS, DOMAINS, ROLES } from '../../utils/constants';
import { ApiService } from '../../services/api';

interface DomainCardProps {
  domain: string;
  isSelected: boolean;
  onClick: () => void;
}

const DomainCard: React.FC<DomainCardProps> = ({ domain, isSelected, onClick }) => {
  const getIcon = () => {
    switch (domain) {
      case 'Software Development': return <Code className="w-6 h-6" />;
      case 'Data Science': return <Brain className="w-6 h-6" />;
      case 'Machine Learning (ML)': return <Cpu className="w-6 h-6" />;
      default: return <Book className="w-6 h-6" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105
        ${isSelected 
          ? 'border-brand-blue bg-brand-blue/5 shadow-lg' 
          : 'border-gray-100 hover:border-brand-blue/50 shadow'
        }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
          {getIcon()}
        </div>
        <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{domain}</span>
        {isSelected && <Check className="w-4 h-4 text-brand-blue ml-auto" />}
      </div>
    </button>
  );
};

interface InterviewSetupState {
  resumeText: string;
  isCustomJob: boolean;
  jobDescription: string;
  domain: string;
  role: string;
  experience: string;
  questionCount: number;
}

const InterviewSetup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<InterviewSetupState>({
    resumeText: '',
    isCustomJob: false,
    jobDescription: '',
    domain: '',
    role: '',
    experience: '',
    questionCount: 5
  });

  const handleChange = (updates: Partial<InterviewSetupState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const availableRoles = state.domain ? ROLES[state.domain] || [] : [];

  const handleStart = async () => {
    if (canProceed()) {
      setIsLoading(true);
      try {
        // Generate questions based on the setup
        const questions = await ApiService.generateQuestions({
          resumeText: state.resumeText,
          jobDescription: state.isCustomJob ? state.jobDescription : undefined,
          domain: state.domain,
          role: state.role,
          experience: state.experience,
          count: state.questionCount
        });

        // Store questions in localStorage for the interview component
        localStorage.setItem('interviewQuestions', JSON.stringify(questions));
        
        // Navigate to the interview
        navigate('/dashboard/interview/start');
      } catch (error) {
        console.error('Error generating questions:', error);
        // Handle error (you might want to show an error message to the user)
      } finally {
        setIsLoading(false);
      }
    }
  };

  const canProceed = () => {
    return state.resumeText.length > 0 && 
           (state.isCustomJob ? state.jobDescription.length > 0 : (state.domain && state.role)) &&
           state.experience && 
           state.questionCount > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-brand-blue/10 rounded-2xl">
                <Sparkles className="w-8 h-8 text-brand-blue" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Interview Setup</h1>
            <p className="mt-3 text-gray-600 text-lg">Customize your interview experience</p>
          </div>

          <div className="space-y-8">
            {/* Resume Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Upload className="w-6 h-6 text-brand-blue mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Upload Your Resume</h3>
              </div>
              <ResumeUpload onResumeUpload={(text) => handleChange({ resumeText: text })} />
            </div>

            {/* Domain Selection */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Briefcase className="w-6 h-6 text-brand-blue mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Select Interview Type</h3>
              </div>
              
              <label className="flex items-center p-4 rounded-xl bg-brand-blue/5 border-2 border-transparent hover:border-brand-blue/20 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.isCustomJob}
                  onChange={(e) => handleChange({ isCustomJob: e.target.checked })}
                  className="rounded border-brand-blue text-brand-blue focus:ring-brand-blue bg-white"
                />
                <span className="ml-3 text-gray-700 font-medium">I have a specific job description</span>
              </label>

              {state.isCustomJob ? (
                <div className="space-y-4 animate-fadeIn">
                  <textarea
                    value={state.jobDescription}
                    onChange={(e) => handleChange({ jobDescription: e.target.value })}
                    className="w-full h-40 rounded-xl border-2 border-gray-100 bg-white/50 text-gray-900 
                      placeholder-gray-400 focus:border-brand-blue focus:ring-brand-blue 
                      resize-none p-4 text-base transition-all"
                    placeholder="Paste the job description here..."
                  />
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {DOMAINS.map((domain) => (
                      <DomainCard
                        key={domain}
                        domain={domain}
                        isSelected={state.domain === domain}
                        onClick={() => handleChange({ domain, role: '' })}
                      />
                    ))}
                  </div>

                  {state.domain && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableRoles.map((role) => (
                          <button
                            key={role}
                            onClick={() => handleChange({ role })}
                            className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm
                              ${state.role === role 
                                ? 'border-brand-purple bg-brand-purple/5 text-gray-900' 
                                : 'border-gray-100 text-gray-600 hover:border-brand-purple/50'
                              }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Experience and Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-brand-blue mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Experience Level</h3>
                </div>
                <div className="space-y-3">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleChange({ experience: level.value })}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300
                        ${state.experience === level.value 
                          ? 'border-brand-blue bg-brand-blue/5 shadow-lg' 
                          : 'border-gray-100 hover:border-brand-blue/50'
                        }`}
                    >
                      <div className="text-base font-medium text-gray-900">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-brand-blue mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Number of Questions</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <input
                    type="range"
                    min="1"
                    max={MAX_QUESTIONS}
                    value={state.questionCount}
                    onChange={(e) => handleChange({ questionCount: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                  />
                  <div className="mt-4 text-center">
                    <span className="text-3xl font-bold text-brand-blue">{state.questionCount}</span>
                    <span className="text-gray-600 ml-2">Questions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={!canProceed()}
              className="w-full group flex items-center justify-center px-8 py-4 rounded-xl text-base font-medium
                bg-gradient-to-r from-brand-blue to-brand-purple text-white 
                hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed 
                transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Start Interview
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;