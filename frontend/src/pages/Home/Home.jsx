// frontend/src/components/pages/Home.jsx
import React, { useState } from 'react'
import { UserCircle, Video, Brain, FileText, ChevronRight } from 'lucide-react'

function Home() {
  const [isHovered, setIsHovered] = useState(null)
  const features = [
    {
      icon: <Video className="w-10 h-10" />,
      title: "Video Analysis",
      description: "Record responses to prompts with real-time feedback",
      colorClass: "text-brand-blue"
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "AI Assessment",
      description: "Advanced analysis of grammar, pronunciation & fluency",
      colorClass: "text-brand-purple"
    },
    {
      icon: <FileText className="w-10 h-10" />,
      title: "Detailed Reports",
      description: "Get comprehensive feedback and improvement plans",
      colorClass: "text-brand-orange"
    },
    {
      icon: <UserCircle className="w-10 h-10" />,
      title: "Indian Context",
      description: "Specialized for Indian regional accents",
      colorClass: "text-brand-yellow"
    }
  ]
  
  const statistics = [
    { 
      value: "70%+", 
      label: "Accuracy for Indian Accents",
      style: { color: '#073ca5' } // brand-blue
    },
    { 
      value: "4.8/5", 
      label: "User Satisfaction",
      style: { color: '#891a61' } // brand-purple
    },
    { 
      value: "1000+", 
      label: "Daily Assessments",
      style: { color: '#ff5b00' } // brand-orange
    }
  ]

  return (
    <div className="space-y-16 bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-blue/5 to-brand-purple/5" />
        <h1 className="text-6xl font-bold text-gray-900 relative">
          AI-Powered <span className="text-brand-blue">English</span> Communication
          <span className="block mt-2">Assessment</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Enhance your communication skills with advanced AI feedback, specifically designed 
          for <span className="text-brand-purple font-semibold">Indian professionals</span>
        </p>
        <button className="bg-brand-blue text-white px-10 py-4 rounded-lg hover:bg-brand-purple 
          transition-all duration-300 transform hover:scale-105 flex items-center mx-auto gap-2">
          Start Assessment <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
              transform hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(index)}
            onMouseLeave={() => setIsHovered(null)}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={feature.colorClass}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Statistics */}
      <section className="bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 py-16 rounded-2xl">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          {statistics.map((stat, index) => (
            <div key={index} className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2" style={stat.style}>
                {stat.value}
              </div>
              <div className="text-gray-700 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-brand-blue to-brand-purple p-16 rounded-2xl text-white">
        <h2 className="text-4xl font-bold mb-6">Ready to Improve Your Communication?</h2>
        <p className="text-xl mb-8 opacity-90">Start your assessment journey today</p>
        <div className="space-x-6">
          <button className="bg-white text-brand-blue px-8 py-4 rounded-lg 
            hover:bg-brand-yellow hover:text-gray-900 transition-all duration-300 transform hover:scale-105">
            Get Started
          </button>
          <button className="border-2 border-white px-8 py-4 rounded-lg 
            hover:bg-white hover:text-brand-purple transition-all duration-300">
            Learn More
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home