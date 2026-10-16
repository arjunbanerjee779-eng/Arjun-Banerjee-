export type Language = 'en' | 'bn' | 'hi';
export type ThemeMode = 'light' | 'dark' | 'devotional';

export type TaskPriority = 'urgent_important' | 'important' | 'routine' | 'low';
export type TaskCategory = 
  | 'study' 
  | 'professional' 
  | 'family' 
  | 'personal_dev' 
  | 'sadhana' 
  | 'community_service' 
  | 'health' 
  | 'other';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'paused' | 'deferred';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  purpose?: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimatedMinutes: number;
  actualMinutes?: number;
  deadline?: string; // YYYY-MM-DD or ISO
  startDate?: string;
  recurrence?: 'none' | 'daily' | 'weekdays' | 'weekly';
  subtasks: SubTask[];
  status: TaskStatus;
  completionCriteria?: string;
  reflectionNote?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskEvent {
  id: string;
  taskId: string;
  eventType: 'created' | 'status_changed' | 'rescheduled' | 'completed' | 'reopened';
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export type PracticeType = 'naam_jap' | 'prayer' | 'naam_sankirtan' | 'devotional_reading' | 'reflection' | 'other';

export interface SadhanaPractice {
  id: string;
  userId: string;
  name: string;
  type: PracticeType;
  intention?: string;
  targetDurationMinutes?: number;
  targetCount?: number; // e.g. 108, 1080 (10 malas)
  preferredSchedule?: 'brahma_muhurta' | 'morning' | 'midday' | 'evening' | 'flexible';
  reminderTime?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PracticeSession {
  id: string;
  practiceId: string;
  practiceName: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  count?: number; // Jap bead count
  notes?: string;
  status: 'completed' | 'partial' | 'interrupted';
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  examDate?: string;
  importance: 'high' | 'medium' | 'low';
  syllabusCoveragePercent: number;
  createdAt: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed';
  notes?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  chapterId: string;
  name: string;
  importance: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'moderate' | 'challenging';
  learningStatus: 'unstudied' | 'learning' | 'reviewing' | 'mastered';
  referenceNotes?: string;
  lastReviewedAt?: string;
  nextReviewDate?: string; // YYYY-MM-DD
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number; // default ~2.5
  independentSolvedCount: number;
  totalReviewCount: number;
  accuracyHistory: number[]; // 0 to 100
}

export interface ReviewEvent {
  id: string;
  topicId: string;
  subjectId: string;
  topicName: string;
  subjectName: string;
  date: string;
  recallAttemptedBeforeNotes: boolean;
  accuracyScore: number; // 0 - 100
  confidenceRating: 1 | 2 | 3 | 4 | 5;
  assistanceLevel: 'read_solution' | 'attempted_recall' | 'reproduced_method' | 'solved_independently';
  timeSpentMinutes: number;
  errorClassification?: string;
  suggestedNextReview: string;
}

export type MistakeCategory = 
  | 'conceptual' 
  | 'formula_selection' 
  | 'calculation' 
  | 'misreading' 
  | 'inability_to_start' 
  | 'missing_prerequisite' 
  | 'time_pressure' 
  | 'careless' 
  | 'other';

export interface MistakeEntry {
  id: string;
  userId: string;
  topicId?: string;
  topicName?: string;
  subjectId?: string;
  subjectName?: string;
  problemDescription: string;
  category: MistakeCategory;
  userAttemptDescription: string;
  whyFailedReason: string;
  correctMethod: string;
  followUpAction?: string;
  retestStatus: 'pending' | 'passed' | 'retest_failed';
  nextRetestDate?: string;
  createdAt: string;
}

export interface MockTest {
  id: string;
  userId: string;
  subjectId?: string;
  subjectName?: string;
  testName: string;
  date: string;
  maxMarks: number;
  obtainedMarks: number;
  durationMinutes: number;
  topicBreakdowns?: { topicName: string; score: number; maxScore: number }[];
  reflection?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  purpose: string;
  startDate: string;
  endDate: string;
  rules: string[];
  suggestedDailyActivity: string;
  participantCount: number;
  isPublished: boolean;
  category: 'sadhana' | 'kartavya' | 'adhyayan' | 'sangha';
}

export interface ChallengeMembership {
  id: string;
  challengeId: string;
  userId: string;
  joinedAt: string;
  completedDays: string[]; // dates array
  personalGoal?: string;
  isPublicMilestone: boolean;
  status: 'active' | 'completed' | 'paused' | 'withdrawn';
}

export interface SharedPost {
  id: string;
  userId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  challengeTitle?: string;
  timestamp: string;
  isModerated: boolean;
  likes: number;
}

export interface DevotionalResource {
  id: string;
  title: string;
  description: string;
  resourceType: 'audio' | 'teaching' | 'verse' | 'article' | 'reflection';
  attribution: string;
  contentOrUrl: string;
  category: 'radha_vallabh' | 'satsang' | 'sadhana_guidance' | 'learning_wisdom';
  permissionStatus: 'approved' | 'community_curated';
  tags: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  isUrgent?: boolean;
  authorName: string;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  sankalpa: string;
  wentWell?: string;
  dutyFulfilledSincerely?: string;
  attentionInterruptedBy?: string;
  whatLearned?: string;
  changeTomorrow?: string;
  aiInsight?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: 'member' | 'admin';
  lifeStage: 'student' | 'competitive_exam' | 'professional' | 'householder' | 'devotee';
  language: Language;
  theme: ThemeMode;
  timezone: string;
  dailyAvailableHours: number;
  primaryGoals: string[];
  importantResponsibilities: string[];
  preferredPlanningStyle: 'structured' | 'flexible' | 'milestone_driven';
  notificationsEnabled: boolean;
  privacyLevel: 'strict_private' | 'community_friendly';
  soundEnabled: boolean;
  createdAt: string;
}
