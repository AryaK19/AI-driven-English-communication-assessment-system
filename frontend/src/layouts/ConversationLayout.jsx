// components/layouts/ConversationLayout.jsx
import React from 'react'

function ConversationLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ConversationLayout