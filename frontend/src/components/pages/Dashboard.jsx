// frontend/src/components/pages/Dashboard.jsx
import React from 'react'
import {
  Home,
  FileText,
  Settings,
  LogOut,
  Mic,
  VideoIcon,
  BookOpen,
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom';


function Dashboard() {
  const navigate = useNavigate();
  const { type } = useParams();

  const handleStartAssessment = (type) => {
    navigate(`/video`);
  }

  const sidebarLinks = [
    { icon: <Home size={20} />, label: 'Overview', path: '/dashboard' },
    { icon: <FileText size={20} />, label: 'Reports', path: '/reports' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ]

  const assessmentTypes = [
    {
      title: 'Speaking Assessment',
      icon: <Mic className="w-8 h-8" />,
      description: 'Evaluate your spoken English skills with AI-powered analysis',
      color: 'bg-brand-blue',
      count: '3 Tests Available'
    },
    {
      title: 'Video Interview',
      icon: <VideoIcon className="w-8 h-8" />,
      description: 'Practice interview scenarios with real-time feedback',
      color: 'bg-brand-purple',
      count: '5 Scenarios'
    },
    {
      title: 'Reading Comprehension',
      icon: <BookOpen className="w-8 h-8" />,
      description: 'Test your reading and understanding abilities',
      color: 'bg-brand-orange',
      count: '4 Tests Available'
    },
    {
      title: 'Conversation Practice',
      icon: <MessageSquare className="w-8 h-8" />,
      description: 'Practice daily conversations and improve fluency',
      color: 'bg-brand-yellow',
      count: '8 Topics'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:block">
        <div className="h-full flex flex-col">
          <div className="p-4">
            <h2 className="text-2xl font-bold text-brand-blue">Dashboard</h2>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="flex items-center space-x-3 text-gray-600 p-3 rounded-lg hover:bg-gray-50 hover:text-brand-blue transition-colors"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button className="flex items-center space-x-3 text-gray-600 w-full p-3 rounded-lg hover:bg-gray-50 hover:text-brand-red transition-colors">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, User!</h1>
            <p className="text-gray-600 mt-2">Choose an assessment to get started</p>
          </div>

          {/* Assessment Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {assessmentTypes.map((assessment, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className={`${assessment.color} p-3 rounded-lg text-white`}>
                    {assessment.icon}
                  </div>
                  <span className="text-sm text-gray-500">{assessment.count}</span>
                </div>
                <h3 className="text-xl font-semibold mt-4 text-gray-900">
                  {assessment.title}
                </h3>
                <p className="mt-2 text-gray-600">
                  {assessment.description}
                </p>
                <button onClick={() => handleStartAssessment()} className="mt-4 text-brand-blue flex items-center text-sm hover:text-brand-purple transition-colors">
                  Start Assessment <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard