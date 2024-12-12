import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic,
  VideoIcon,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Trophy,
  Clock,
  TrendingUp,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  // Assessment types configuration with metadata and navigation paths
  const assessmentTypes = [
    {
      title: "Assessment",
      icon: <Mic className="w-8 h-8" />,
      description:
        "Evaluate your spoken English skills with AI-powered analysis",
      color: "bg-brand-blue",
      count: "Custom Tests Available",
      path: "assessment/setup",
      stats: { completed: 12, avgScore: "85%" },
    },
    // Additional assessment types commented out for future implementation
    // {
    //   title: "Video Interview",
    //   icon: <VideoIcon className="w-8 h-8" />,
    //   description: "Practice interview scenarios with real-time feedback",
    //   color: "bg-brand-purple",
    //   count: "5 Scenarios",
    //   stats: { completed: 8, avgScore: "78%" },
    // },
  ];

  // Framer Motion animation variants for staggered container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Delay between each child animation
      },
    },
  };

  // Animation variants for individual assessment cards
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header Section with User Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome back,{" "}
              {JSON.parse(localStorage.getItem("currUser"))?.username ||
                "Guest"}
              👋
            </h1>
            <p className="text-gray-600 text-lg">
              Continue your learning journey today
            </p>

            {/* User Progress Metrics */}
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2 text-brand-blue">
                <Trophy className="w-5 h-5" />
                <span>Level 5</span>
              </div>
              <div className="flex items-center gap-2 text-brand-purple">
                <Clock className="w-5 h-5" />
                <span>15h Practice Time</span>
              </div>
              <div className="flex items-center gap-2 text-brand-orange">
                <TrendingUp className="w-5 h-5" />
                <span>85% Success Rate</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assessment Grid with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6"
        >
          {assessmentTypes.map((assessment, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(assessment.path)}
            >
              {/* Assessment Card Header */}
              <div className="flex items-start justify-between">
                <div
                  className={`${assessment.color} p-4 rounded-2xl text-white transform transition-transform hover:scale-110`}
                >
                  {assessment.icon}
                </div>
                <span className="text-sm font-medium px-4 py-2 bg-gray-50 rounded-full">
                  {assessment.count}
                </span>
              </div>

              {/* Assessment Details */}
              <h3 className="text-2xl font-semibold mt-4 text-gray-900">
                {assessment.title}
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {assessment.description}
              </p>

              {/* Stats Section - Commented out for future implementation */}
              {/* <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>{assessment.stats.completed} Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Avg: {assessment.stats.avgScore}</span>
                </div>
              </div> */}

              {/* Animated Call-to-Action Button */}
              <motion.button
                whileHover={{ x: 5 }}
                className="mt-4 text-brand-blue flex items-center text-sm font-medium hover:text-brand-purple transition-colors"
              >
                Start Assessment <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;