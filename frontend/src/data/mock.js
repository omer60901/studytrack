export const subjects = [
  { id: "sub-1", _id: "sub-1", name: "Mathematics", color: "#7C3AED", icon: "Calculator", averageGrade: 91, progressPercentage: 78, progress: 78 },
  { id: "sub-2", _id: "sub-2", name: "Physics", color: "#3B82F6", icon: "Atom", averageGrade: 86, progressPercentage: 64, progress: 64 },
  { id: "sub-3", _id: "sub-3", name: "History", color: "#10B981", icon: "Landmark", averageGrade: 94, progressPercentage: 82, progress: 82 },
  { id: "sub-4", _id: "sub-4", name: "English", color: "#F59E0B", icon: "PenTool", averageGrade: 89, progressPercentage: 71, progress: 71 }
];

export const tasks = [
  { id: "task-1", _id: "task-1", title: "Finish calculus problem set", description: "Limits, derivatives, and chain rule", subject: "Mathematics", subjectId: "sub-1", priority: "high", status: "in-progress", dueDate: new Date().toISOString().slice(0, 10), due: "Today", estimatedTime: 60, time: 60 },
  { id: "task-2", _id: "task-2", title: "Summarize optics chapter", description: "Create active recall notes", subject: "Physics", subjectId: "sub-2", priority: "medium", status: "pending", dueDate: "2026-06-15", due: "Tomorrow", estimatedTime: 45, time: 45 },
  { id: "task-3", _id: "task-3", title: "Draft essay outline", description: "Thesis and three supporting arguments", subject: "English", subjectId: "sub-4", priority: "low", status: "completed", dueDate: "2026-06-19", due: "Fri", estimatedTime: 30, time: 30 }
];

export const exams = [
  { id: "exam-1", _id: "exam-1", title: "Calculus Midterm", subject: "Mathematics", subjectId: "sub-1", examDate: "2026-06-21", date: "2026-06-21", difficulty: "hard", preparationStatus: 62, readiness: 62 },
  { id: "exam-2", _id: "exam-2", title: "Modern History", subject: "History", subjectId: "sub-3", examDate: "2026-06-28", date: "2026-06-28", difficulty: "medium", preparationStatus: 79, readiness: 79 }
];

export const weekly = [
  { day: "Mon", hours: 2.5, completed: 4, productivity: 82 },
  { day: "Tue", hours: 3.2, completed: 5, productivity: 88 },
  { day: "Wed", hours: 1.8, completed: 2, productivity: 70 },
  { day: "Thu", hours: 4.1, completed: 6, productivity: 93 },
  { day: "Fri", hours: 2.7, completed: 4, productivity: 84 },
  { day: "Sat", hours: 3.5, completed: 5, productivity: 89 },
  { day: "Sun", hours: 1.4, completed: 2, productivity: 68 }
];
