import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  BarChart2, 
  Award, 
  ChevronRight, 
  Filter,
  Download,
  Search
} from "lucide-react";

function OverallReport() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - replace with actual data
  const reports = [
    {
      id: 1,
      date: "2024-03-15",
      duration: "5:30",
      score: 85,
      fluency: 90,
      grammar: 82,
      pronunciation: 83,
      questions: 5,
      type: "Hindi Assessment"
    },
    {
      id: 1,
      date: "2024-03-15",
      duration: "5:30",
      score: 8,
      fluency: 9,
      grammar: 8,
      pronunciation: 83,
      questions: 3,
      type: "English Assessment"
    },
    // Add more mock reports...
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Assessment Reports
          </h1>
          
          {/* Search and Filter Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-blue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50">
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-opacity-90">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Reports Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reports.map((report) => (
            <motion.div
              key={report.id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Report Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-brand-purple">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>
                <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm">
                  {report.type}
                </span>
              </div>

              {/* Score Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-6 h-6 text-brand-orange" />
                  <span className="text-2xl font-bold">{report.score}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Fluency</div>
                    <div className="font-semibold text-brand-blue">{report.fluency}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Grammar</div>
                    <div className="font-semibold text-brand-purple">{report.grammar}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Pronunciation</div>
                    <div className="font-semibold text-brand-orange">{report.pronunciation}%</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{report.duration} mins</span>
                </div>
                <button className="flex items-center text-brand-blue hover:text-brand-purple transition-colors">
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default OverallReport;