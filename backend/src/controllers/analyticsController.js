import { Task } from "../models/Task.js";
import { Exam } from "../models/Exam.js";
import { StudySession } from "../models/StudySession.js";
import { Subject } from "../models/Subject.js";

export async function stats(req, res) {
  const userId = req.user._id;
  const [tasks, exams, sessions, subjects] = await Promise.all([
    Task.find({ userId }),
    Exam.find({ userId }).populate("subjectId"),
    StudySession.find({ userId }).populate("subjectId"),
    Subject.find({ userId })
  ]);

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const totalStudyMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);

  res.json({
    overview: {
      taskCount: tasks.length,
      completedTasks,
      completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
      upcomingExams: exams.filter((exam) => new Date(exam.examDate) >= new Date()).length,
      totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10
    },
    weekly: [
      { day: "Mon", hours: 2.5, completed: 4, productivity: 82 },
      { day: "Tue", hours: 3.2, completed: 5, productivity: 88 },
      { day: "Wed", hours: 1.8, completed: 2, productivity: 70 },
      { day: "Thu", hours: 4.1, completed: 6, productivity: 93 },
      { day: "Fri", hours: 2.7, completed: 4, productivity: 84 },
      { day: "Sat", hours: 3.5, completed: 5, productivity: 89 },
      { day: "Sun", hours: 1.4, completed: 2, productivity: 68 }
    ],
    subjects: subjects.map((subject) => ({
      name: subject.name,
      progress: subject.progressPercentage,
      grade: subject.averageGrade,
      color: subject.color
    }))
  });
}
