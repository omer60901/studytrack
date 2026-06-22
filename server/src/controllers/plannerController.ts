import type { Request, Response, NextFunction } from 'express';
import Plan from '../models/Plan';
const STUDY_TECHNIQUES = {
  beginner: [
    'Active Reading',
    'SQ3R Method (Survey, Question, Read, Recite, Review)',
    'Chunking - Break topics into smaller parts',
    'Repetition - Reinforce learning through repetition'
  ],
  intermediate: [
    'Spaced Repetition - Distribute learning over time',
    'Interleaving - Mix different topics during study',
    'Active Recall - Test yourself frequently',
    'Elaboration - Connect new info to prior knowledge',
    'Feynman Technique - Explain concepts in simple terms'
  ],
  advanced: [
    'Metacognition - Monitor and adjust your learning',
    'Dual Coding - Combine visual and verbal learning',
    'Transfer of Knowledge - Apply learning to new contexts',
    'Problem-Based Learning - Learn through problem-solving',
    'Peer Teaching - Teach others to deepen understanding'
  ]
};

const RESOURCE_SUGGESTIONS = {
  math: [
    { title: 'Khan Academy', url: 'https://www.khanacademy.org', type: 'Video Tutorials' },
    { title: 'Brilliant.org', url: 'https://brilliant.org', type: 'Interactive Problems' },
    { title: 'Wolfram Alpha', url: 'https://www.wolframalpha.com', type: 'Problem Solver' }
  ],
  science: [
    { title: 'Crash Course', url: 'https://crashcourse.com', type: 'Video Tutorials' },
    { title: 'PBS Learning Media', url: 'https://www.pbslearningmedia.org', type: 'Educational Content' },
    { title: 'Nature Journals', url: 'https://www.nature.com', type: 'Research Papers' }
  ],
  history: [
    { title: 'Crash Course History', url: 'https://crashcourse.com/courses/world-history', type: 'Video Tutorials' },
    { title: 'JSTOR Daily', url: 'https://daily.jstor.org', type: 'Historical Articles' },
    { title: 'Timeline.com', url: 'https://timeline.com', type: 'Visual Timelines' }
  ],
  language: [
    { title: 'Duolingo', url: 'https://www.duolingo.com', type: 'Interactive Practice' },
    { title: 'Anki', url: 'https://ankiweb.net', type: 'Flashcard App' },
    { title: 'Immersive Media', url: 'https://www.bbc.co.uk/learningenglish', type: 'Audio/Video' }
  ],
  programming: [
    { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org', type: 'Interactive Tutorials' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'Reference' },
    { title: 'LeetCode', url: 'https://leetcode.com', type: 'Practice Problems' }
  ],
  default: [
    { title: 'YouTube EDU', url: 'https://www.youtube.com', type: 'Video Tutorials' },
    { title: 'Wikipedia', url: 'https://www.wikipedia.org', type: 'Reference' },
    { title: 'Quizlet', url: 'https://quizlet.com', type: 'Flashcards' }
  ]
};

// Keyword → subject map. Order matters: first match wins.
const SUBJECT_KEYWORDS: { subject: keyof typeof RESOURCE_SUGGESTIONS; keywords: string[] }[] = [
  {
    subject: 'math',
    keywords: ['math', 'calculus', 'algebra', 'geometry', 'trigonometry', 'statistics', 'arithmetic', 'equation', 'theorem', 'derivative', 'integral', 'matrix', 'linear algebra']
  },
  {
    subject: 'science',
    keywords: ['science', 'biology', 'chemistry', 'physics', 'astronomy', 'ecology', 'genetics', 'molecular', 'organic chem', 'anatomy', 'botany', 'zoology']
  },
  {
    subject: 'history',
    keywords: ['history', 'historical', 'ancient', 'medieval', 'renaissance', 'world war', 'civilization', 'empire', 'revolution']
  },
  {
    subject: 'language',
    keywords: ['language', 'english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'vocabulary', 'grammar', 'literature', 'writing', 'linguistics']
  },
  {
    subject: 'programming',
    keywords: ['programming', 'coding', 'code', 'python', 'javascript', 'typescript', 'java', 'c++', 'rust', 'golang', 'react', 'node', 'algorithm', 'data structure', 'software']
  }
];

const pickResourcesForGoal = (goal: string) => {
  const goalLower = goal.toLowerCase();
  for (const { subject, keywords } of SUBJECT_KEYWORDS) {
    if (keywords.some((k) => goalLower.includes(k))) {
      return RESOURCE_SUGGESTIONS[subject];
    }
  }
  return RESOURCE_SUGGESTIONS.default;
};

const generatePlan = (goal: string, deadline: Date | null, difficultyLevel: string) => {
  const days = deadline ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 7;
  const clampedDays = Math.max(3, Math.min(days, 14));

  const dailyHoursMap = { beginner: 1.5, intermediate: 2.5, advanced: 3.5 };
  const dailyHours = dailyHoursMap[difficultyLevel as keyof typeof dailyHoursMap] || 2.5;

  const phases = [
    { name: 'Foundation', pct: 0.3, focus: 'Learn core concepts, read materials' },
    { name: 'Practice', pct: 0.5, focus: 'Work through problems, practice exercises' },
    { name: 'Review & Mastery', pct: 0.2, focus: 'Review weak areas, final preparation' }
  ];

  const schedule = [];
  let dayCount = 0;

  for (const phase of phases) {
    const phaseDays = Math.ceil(clampedDays * phase.pct);
    for (let i = 0; i < phaseDays && dayCount < clampedDays; i++) {
      dayCount++;
      schedule.push({
        day: `Day ${dayCount}`,
        focus: `${phase.name}: ${phase.focus}`,
        duration: `${Math.round(dailyHours * 60)} min`,
        techniques: STUDY_TECHNIQUES[difficultyLevel as keyof typeof STUDY_TECHNIQUES] || STUDY_TECHNIQUES.intermediate,
        resources: [],
        completed: false
      });
    }
  }

  const resources = pickResourcesForGoal(goal);

  const dailyGoals = [
    '✓ Complete daily focus area',
    '✓ Apply 2+ study techniques from recommendations',
    '✓ Take notes and create flashcards',
    '✓ Review previous day\'s material',
    '✓ Identify weak areas for next session'
  ];

  const recommendations = [
    '📅 Study at consistent times each day',
    '⏰ Use Pomodoro: 25 min focus + 5 min break',
    '📝 Take active notes, not passive reading',
    '🔄 Review material spaced over multiple days',
    '💪 Focus on challenging topics first when fresh',
    '🧠 Teach the material to someone else',
    '🎯 Test yourself frequently (active recall)',
    '😴 Get 7-9 hours of sleep for memory consolidation'
  ];

  return {
    goal,
    deadline: deadline ? deadline.toISOString() : null,
    difficultyLevel,
    totalDays: clampedDays,
    estimatedHoursPerDay: dailyHours,
    schedule,
    dailyGoals,
    recommendations,
    studyTechniques: STUDY_TECHNIQUES[difficultyLevel as keyof typeof STUDY_TECHNIQUES] || STUDY_TECHNIQUES.intermediate,
    resources
  };
};

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input, deadline, difficultyLevel = 'intermediate' } = req.body;
    const userId = req.user!.id;

    if (!input || !input.trim()) {
      return res.status(400).json({ message: 'Goal is required' });
    }

    const parsedDeadline = deadline ? new Date(deadline) : null;
    const plan = generatePlan(input, parsedDeadline, difficultyLevel);

    const savedPlan = await Plan.create({
      userId,
      goal: input,
      deadline: parsedDeadline,
      difficultyLevel: difficultyLevel as 'beginner' | 'intermediate' | 'advanced',
      totalDays: plan.totalDays,
      estimatedHoursPerDay: plan.estimatedHoursPerDay,
      schedule: plan.schedule,
      dailyGoals: plan.dailyGoals,
      recommendations: plan.recommendations,
      studyTechniques: plan.studyTechniques,
      resources: plan.resources
    });

    res.status(201).json(savedPlan);
  } catch (error) {
    next(error);
  }
};

export const getUserPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const plans = await Plan.find({ userId }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const plan = await Plan.findOne({ _id: req.params.id, userId });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const updatePlanProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { dayIndex, completed } = req.body;

    if (typeof dayIndex !== 'number' || !Number.isInteger(dayIndex) || dayIndex < 0) {
      return res.status(400).json({ message: 'dayIndex must be a non-negative integer' });
    }
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'completed must be a boolean' });
    }

    const plan = await Plan.findOne({ _id: req.params.id, userId });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (!plan.schedule || !plan.schedule[dayIndex]) {
      return res.status(400).json({
        message: `dayIndex ${dayIndex} is out of range (plan has ${plan.schedule?.length ?? 0} days)`
      });
    }

    plan.schedule[dayIndex].completed = completed;
    await plan.save();

    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, userId });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
};
