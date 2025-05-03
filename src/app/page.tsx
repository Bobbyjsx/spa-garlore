"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

type Comment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
};

type Milestone = {
  id: number;
  title: string;
  completed: boolean;
};

type Goal = {
  id: number;
  title: string;
  description: string;
  progress: number; // 0-100
  deadline: string;
  color: string;
  milestones: Milestone[];
  comments: Comment[];
};

const mockGoals: Goal[] = [
  {
    id: 1,
    title: "Learn React",
    description: "Complete the official React documentation and tutorials.",
    progress: 75,
    deadline: "2025-01-15",
    color: "purple",
    milestones: [
      { id: 1, title: "Core concepts", completed: true },
      { id: 2, title: "Hooks", completed: true },
      { id: 3, title: "State management", completed: true },
      { id: 4, title: "Advanced patterns", completed: false },
      { id: 5, title: "Build a project", completed: false },
    ],
    comments: [
      { id: "c1", user: "Alice", avatar: "https://randomuser.me/api/portraits/women/68.jpg", text: "Great progress! Have you tried the React DevTools yet?", timestamp: "2023-10-10T10:30:00Z" },
      { id: "c2", user: "Bob", avatar: "https://randomuser.me/api/portraits/men/31.jpg", text: "Keep going! Context API was a game-changer for me.", timestamp: "2023-10-11T15:45:00Z" },
    ],
  },
  {
    id: 2,
    title: "Daily Exercise",
    description: "Exercise 30 minutes daily for better health.",
    progress: 40,
    deadline: "2025-03-01",
    color: "green",
    milestones: [
      { id: 1, title: "Week 1 complete", completed: true },
      { id: 2, title: "Week 2 complete", completed: true },
      { id: 3, title: "Month 1 complete", completed: false },
      { id: 4, title: "Run 5K", completed: false },
      { id: 5, title: "3 month streak", completed: false },
    ],
    comments: [
      { id: "c3", user: "Charlie", avatar: "https://randomuser.me/api/portraits/men/85.jpg", text: "Consistency is key! I find morning workouts the most effective.", timestamp: "2023-10-09T08:20:00Z" },
    ],
  },
  {
    id: 3,
    title: "Read a Book",
    description: "Read at least 20 pages of a new book every week.",
    progress: 60,
    deadline: "2025-02-15",
    color: "purple",
    milestones: [
      { id: 1, title: "First chapter", completed: true },
      { id: 2, title: "First 100 pages", completed: true },
      { id: 3, title: "Halfway point", completed: true },
      { id: 4, title: "Three-quarters", completed: false },
      { id: 5, title: "Complete book", completed: false },
    ],
    comments: [
      { id: "c4", user: "Dana", avatar: "https://randomuser.me/api/portraits/women/44.jpg", text: "Which book are you reading? I just finished 'Atomic Habits'.", timestamp: "2023-10-12T19:30:00Z" },
    ],
  },
  {
    id: 4,
    title: "Learn TypeScript",
    description: "Master TypeScript fundamentals and advanced concepts.",
    progress: 25,
    deadline: "2025-04-30",
    color: "amber",
    milestones: [
      { id: 1, title: "Basic syntax", completed: true },
      { id: 2, title: "Type system", completed: true },
      { id: 3, title: "Interfaces", completed: false },
      { id: 4, title: "Generics", completed: false },
      { id: 5, title: "Build a project", completed: false },
    ],
    comments: [
      { id: "c5", user: "Emma", avatar: "https://randomuser.me/api/portraits/women/22.jpg", text: "TypeScript is so worth learning. The type safety alone has saved me countless hours of debugging.", timestamp: "2023-10-14T12:15:00Z" },
    ],
  }
];

const generateChartData = (goals: Goal[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => {
    const obj: { [key: string]: any } = { name: month };
    goals.forEach(goal => {
      // Generate realistic progression data
      const baseProgress = Math.max(0, Math.min(100, index * 20 - Math.random() * 10));
      obj[goal.title] = baseProgress > goal.progress ? goal.progress : baseProgress;
    });
    return obj;
  });
};

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedGoals = localStorage.getItem('goals');
      return savedGoals ? JSON.parse(savedGoals) : mockGoals;
    }
    return mockGoals;
  });

  const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});
  const [chartType, setChartType] = useState<'line' | 'bar'>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('chartType') as 'line' | 'bar' || 'line';
    }
    return 'line';
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || true; // Default to dark
    }
    return true; // Default to dark
  });
  const [chartData, setChartData] = useState(generateChartData(goals));
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    milestonesCount: number;
    milestones: {title: string, completed: boolean}[];
  }>({
    title: '',
    description: '',
    milestonesCount: 3,
    milestones: [
      {title: 'Milestone 1', completed: false},
      {title: 'Milestone 2', completed: false},
      {title: 'Milestone 3', completed: false}
    ]
  });

  useEffect(() => {
     localStorage.setItem('chartType', chartType);
     localStorage.setItem('theme', darkMode ? 'dark' : 'light');
     document.documentElement.classList.toggle('dark', true);
   }, [chartType, darkMode]);

  useEffect(() => {
    // Update chart data whenever goals change
    setChartData(generateChartData(goals));
    // Save goals to localStorage
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    // Update milestones array when milestonesCount changes
    setNewGoal(prev => {
      const updatedMilestones = Array.from({ length: prev.milestonesCount }, (_, i) => {
        // Preserve existing milestone titles if they exist
        return i < prev.milestones.length
          ? prev.milestones[i]
          : {title: `Milestone ${i + 1}`, completed: false};
      });

      return {
        ...prev,
        milestones: updatedMilestones
      };
    });
  }, [newGoal.milestonesCount]);

  const handleCommentChange = (goalId: number, value: string) => {
    setCommentInput(prev => ({ ...prev, [goalId]: value }));
  };

  const handleCommentSubmit = (goalId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput[goalId]?.trim()) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      user: "You",
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      text: commentInput[goalId].trim(),
      timestamp: new Date().toISOString()
    };

    setGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              comments: [newComment, ...goal.comments],
            }
          : goal
      )
    );
    setCommentInput(prev => ({ ...prev, [goalId]: "" }));
  };

  const toggleMilestone = (goalId: number, milestoneId: number) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: goal.milestones.map(milestone =>
                milestone.id === milestoneId
                  ? { ...milestone, completed: !milestone.completed }
                  : milestone
              ),
              // Recalculate progress based on completed milestones
              progress: Math.round(
                (goal.milestones.filter(m =>
                  m.id === milestoneId
                    ? !m.completed
                    : m.completed
                ).length / goal.milestones.length) * 100
              )
            }
          : goal
      )
    );
  };

  const handleMilestoneChange = (index: number, value: string) => {
    setNewGoal(prev => {
      const updatedMilestones = [...prev.milestones];
      updatedMilestones[index] = { ...updatedMilestones[index], title: value };
      return { ...prev, milestones: updatedMilestones };
    });
  };

  const deleteGoal = (goalId: number) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const addNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.description.trim()) return;

    const milestones = newGoal.milestones.map((milestone, i) => ({
      id: i + 1,
      title: milestone.title.trim() || `Milestone ${i + 1}`,
      completed: false
    }));

    const colors = ['green','purple', 'amber'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newGoalObj: Goal = {
      id: goals.length + 1,
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      progress: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: randomColor,
      milestones,
      comments: []
    };

    setGoals(prev => [...prev, newGoalObj]);
    setNewGoal({
      title: '',
      description: '',
      milestonesCount: 3,
      milestones: Array.from({ length: 3 }, (_, i) => ({
        title: `Milestone ${i + 1}`,
        completed: false
      }))
    });
    setNewGoalOpen(false);
  };

  const getColorClass = (color: string, type: 'bg' | 'text' | 'border', isDark = false) => {
    const prefix = isDark ? 'dark:' : '';
    const intensity = type === 'bg' ? (isDark ? '700' : '500') :
                     type === 'text' ? (isDark ? '300' : '600') :
                     isDark ? '600' : '400';
    return `${prefix}${type}-${color}-${intensity}`;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();

    // Less than 1 hour ago
    if (diffMs < 60 * 60 * 1000) {
      const mins = Math.floor(diffMs / (60 * 1000));
      return `${mins} min${mins === 1 ? '' : 's'} ago`;
    }

    // Less than 24 hours ago
    if (diffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diffMs / (60 * 60 * 1000));
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    // Less than 7 days ago
    if (diffMs < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    // Otherwise show the date
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex flex-col min-h-screen dark bg-gray-900 text-white`}>
      {/* Navbar */}
      <nav className="dark:bg-gray-800 shadow-md transition-colors duration-200">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="text-xl sm:text-2xl font-bold text-blue-400">
            <span className="text-2xl sm:text-3xl mr-2">🎯</span>
            GoalTracker
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6">
            <div className="flex items-center space-x-2 text-gray-300">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
                className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                aria-label={`Switch to ${chartType === 'line' ? 'bar' : 'line'} chart`}
              >
                {chartType === 'line' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={() => setNewGoalOpen(true)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Goal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 sm:py-12 transition-colors duration-200">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold">Goal-Oriented Progress Tracker</h1>
          <p className="mt-2 sm:mt-4 text-base sm:text-xl opacity-90">Track your goals, milestones, and feedback all in one place.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 flex-grow">
        {/* Goals Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
          {goals.map(goal => (
            <motion.div
              key={goal.id}
              className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl dark:shadow-gray-900/30 flex flex-col transition-all duration-300 border border-gray-700 min-h-[450px] sm:min-h-[600px] max-h-[600px] sm:max-h-[700px] h-full"
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.3 },
              }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: goal.id * 0.1 }}
            >
              {/* Header Section - Fixed Height */}
              <div className="flex justify-between items-start mb-3 h-[50px] sm:h-[60px]">
                <h2 className={`text-lg sm:text-xl font-bold text-white ${getColorClass(goal.color, 'text', true)} truncate max-w-[70%]`}>
                  {goal.title}
                </h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${goal.progress >= 75 ? 'bg-green-800/30 text-green-300' : goal.progress >= 25 ? 'bg-yellow-800/30 text-yellow-300' : 'bg-red-800/30 text-red-300'}`}>
                    Due {formatDate(goal.deadline)}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Delete goal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description Section - Fixed Height */}
              <div className="h-[50px] sm:h-[60px] mb-4 overflow-hidden">
                <p className="text-gray-300 text-sm line-clamp-3">{goal.description}</p>
              </div>

              {/* Progress Bar Section - Fixed Height */}
              <div className="h-[40px] sm:h-[50px] mb-4">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-3 rounded-full ${getColorClass(goal.color, 'bg')}`}
                    style={{ width: `${goal.progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>{goal.progress}% complete</span>
                  <span>Target: 100%</span>
                </div>
              </div>

              {/* Milestones Section - Fixed Height with Scrollable Content */}
              <div className="h-[120px] sm:h-[150px] mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center sticky top-0 bg-gray-800 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Milestones
                </h3>
                <div className="space-y-2 overflow-y-auto max-h-[90px] sm:max-h-[120px] pr-1 custom-scrollbar">
                  {goal.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center py-1"
                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                    >
                      <div className={`w-5 h-5 flex-shrink-0 border-2 rounded ${milestone.completed ? `${getColorClass(goal.color, 'bg')} ${getColorClass(goal.color, 'border')}` : 'border-gray-600'} mr-2 cursor-pointer transition-colors duration-200`}>
                        {milestone.completed && (
                          <svg className="w-full h-full text-white" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${milestone.completed ? 'line-through text-gray-400' : 'text-gray-300'} cursor-pointer truncate`}>
                        {milestone.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section - Takes Remaining Space with Fixed Input and Scrollable Content */}
              <div className="mt-auto flex-grow flex flex-col">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center sticky top-0 bg-gray-800 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Feedback ({goal.comments.length})
                </h3>

                {/* Comment Input - Fixed Height */}
                <form className="mb-3 flex h-[40px]" onSubmit={e => handleCommentSubmit(goal.id, e)}>
                  <input
                    type="text"
                    className={`flex-grow px-3 py-2 bg-gray-700 border rounded-l-lg text-sm transition-colors focus:outline-none focus:border-${goal.color}-400 text-white border-gray-600`}
                    placeholder="Add a comment or feedback..."
                    value={commentInput[goal.id] || ''}
                    onChange={e => handleCommentChange(goal.id, e.target.value)}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 ${getColorClass(goal.color, 'bg')} text-white rounded-r-lg hover:opacity-90 transition-opacity focus:outline-none focus:border-2 focus:border-${goal.color}-300`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>

                {/* Comments List - Scrollable with Fixed Max Height */}
                <div className="overflow-y-auto flex-grow space-y-3 pr-1 custom-scrollbar min-h-[80px] sm:min-h-[100px] max-h-[150px] sm:max-h-[200px]">
                  <AnimatePresence>
                    {goal.comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        className="p-2 bg-gray-700/50 rounded-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start">
                          <img
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 border-2 border-gray-600"
                            src={comment.avatar}
                            alt={comment.user}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <p className="text-sm font-semibold text-gray-200 truncate">
                                {comment.user}
                              </p>
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                                {formatTime(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-300 break-words">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        <motion.section
          className="my-6 sm:my-8 bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Progress Over Time</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${chartType === 'line'
                  ? 'bg-blue-900/50 text-blue-300'
                  : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${chartType === 'bar'
                  ? 'bg-blue-900/50 text-blue-300'
                  : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    style={{ fontSize: '0.8rem' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '0.8rem' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#fff'
                    }}
                  />
                  {goals.map((goal) => (
                    <Line
                      key={goal.id}
                      type="monotone"
                      dataKey={goal.title}
                      stroke={`var(--tw-${goal.color}-500)`}
                      strokeWidth={2}
                      dot={{ fill: `var(--tw-${goal.color}-500)`, r: 4 }}
                      activeDot={{ r: 6, fill: `var(--tw-${goal.color}-500)` }}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    style={{ fontSize: '0.8rem' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '0.8rem' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#fff'
                    }}
                  />
                  {goals.map((goal) => (
                    <Bar
                      key={goal.id}
                      dataKey={goal.title}
                      fill={`var(--tw-${goal.color}-500)`}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.section>
      </main>

      {/* New Goal Modal */}
      <AnimatePresence>
        {newGoalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Create New Goal</h2>
                  <button
                    onClick={() => setNewGoalOpen(false)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={addNewGoal}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="goal-title">
                      Goal Title
                    </label>
                    <input
                      id="goal-title"
                      type="text"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white transition-colors"
                      placeholder="What do you want to achieve?"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="goal-description">
                      Description
                    </label>
                    <textarea
                      id="goal-description"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white transition-colors"
                      placeholder="Describe your goal in detail..."
                      rows={3}
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="goal-milestones">
                      Number of Milestones
                    </label>
                    <select
                      id="goal-milestones"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white transition-colors"
                      value={newGoal.milestonesCount}
                      onChange={(e) => setNewGoal({...newGoal, milestonesCount: parseInt(e.target.value)})}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Define Your Milestones
                    </label>
                    <div className="space-y-2">
                      {newGoal.milestones.map((milestone, index) => (
                        <input
                          key={index}
                          type="text"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white transition-colors"
                          placeholder={`Milestone ${index + 1}`}
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(index, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => setNewGoalOpen(false)}
                      className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    >
                      Create Goal
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-4 sm:py-6 transition-colors duration-200">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} GoalTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
