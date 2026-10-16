import { Topic, ReviewEvent } from '../types';

/**
 * Deterministic Spaced-Repetition Scheduler for Sanjivani Adhyayan
 * Based on SuperMemo-2 principles enhanced with active recall assistance levels
 * and exam deadline proximity compression.
 */
export interface ScheduleCalculationResult {
  nextReviewDate: string; // YYYY-MM-DD
  intervalDays: number;
  newRepetitionCount: number;
  newEaseFactor: number;
  learningStatus: 'unstudied' | 'learning' | 'reviewing' | 'mastered';
  reasoning: string;
}

export function calculateNextReview(
  topic: Topic,
  event: Omit<ReviewEvent, 'id' | 'suggestedNextReview'>,
  examDateStr?: string
): ScheduleCalculationResult {
  const { accuracyScore, confidenceRating, assistanceLevel } = event;

  // Grade on 0-5 scale
  // accuracyScore: 0-100 -> maps roughly to quality grade
  let qualityGrade = 0;
  if (accuracyScore >= 90) qualityGrade = 5;
  else if (accuracyScore >= 75) qualityGrade = 4;
  else if (accuracyScore >= 60) qualityGrade = 3;
  else if (accuracyScore >= 40) qualityGrade = 2;
  else if (accuracyScore >= 20) qualityGrade = 1;
  else qualityGrade = 0;

  // Penalty if student just read the solution without attempting recall
  if (assistanceLevel === 'read_solution') {
    qualityGrade = Math.min(qualityGrade, 2);
  } else if (assistanceLevel === 'solved_independently' && qualityGrade >= 3) {
    // Reward independent problem solving
    qualityGrade = Math.min(5, qualityGrade + 1);
  }

  // Adjust Ease Factor (EF)
  // EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  let currentEF = topic.easeFactor || 2.5;
  let newEF = currentEF + (0.1 - (5 - qualityGrade) * (0.08 + (5 - qualityGrade) * 0.02));
  if (newEF < 1.3) newEF = 1.3;
  if (newEF > 2.8) newEF = 2.8;

  let newRepetition = topic.repetitionCount || 0;
  let intervalDays = 1;

  if (qualityGrade < 3) {
    // Recall failed or weak: reset interval to 1 day
    newRepetition = 0;
    intervalDays = 1;
  } else {
    // Recall succeeded
    newRepetition += 1;
    if (newRepetition === 1) {
      intervalDays = 1;
    } else if (newRepetition === 2) {
      intervalDays = 4;
    } else {
      intervalDays = Math.round((topic.intervalDays || 4) * newEF);
    }
  }

  // Adjust for topic difficulty
  if (topic.difficulty === 'challenging' && intervalDays > 2) {
    intervalDays = Math.max(2, Math.round(intervalDays * 0.8));
  }

  // If exam date is near, compress interval to ensure pre-exam review
  let examAdjustmentNote = '';
  if (examDateStr) {
    const examDate = new Date(examDateStr);
    const today = new Date();
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExam > 0 && daysUntilExam < 30) {
      if (intervalDays >= daysUntilExam) {
        intervalDays = Math.max(1, Math.floor(daysUntilExam / 2));
        examAdjustmentNote = ` (Compressed due to exam in ${daysUntilExam} days)`;
      }
    }
  }

  // Determine status
  let status: Topic['learningStatus'] = 'reviewing';
  if (newRepetition === 0) {
    status = 'learning';
  } else if (newRepetition >= 4 && newEF >= 2.3 && accuracyScore >= 80) {
    status = 'mastered';
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  const reasoning = qualityGrade < 3 
    ? `Recall was partial/missed (${accuracyScore}%). Reset to 1-day interval for reinforcement.`
    : `Recall successful (${accuracyScore}%, confidence ${confidenceRating}/5). Next review in ${intervalDays} days${examAdjustmentNote}.`;

  return {
    nextReviewDate,
    intervalDays,
    newRepetitionCount: newRepetition,
    newEaseFactor: Math.round(newEF * 100) / 100,
    learningStatus: status,
    reasoning,
  };
}

/**
 * Calculates topic mastery evidence breakdown
 */
export function calculateTopicMastery(topic: Topic) {
  const exposureScore = Math.min(100, (topic.totalReviewCount || 0) * 20);
  const recentAccuracies = topic.accuracyHistory || [];
  const recallAccuracy = recentAccuracies.length > 0
    ? Math.round(recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length)
    : 0;
  const independentScore = Math.min(100, (topic.independentSolvedCount || 0) * 33);
  const consistencyScore = Math.min(100, (topic.repetitionCount || 0) * 25);

  // Composite estimate: explicitly noted as calculated heuristic
  const composite = Math.round(
    exposureScore * 0.15 + 
    recallAccuracy * 0.45 + 
    independentScore * 0.25 + 
    consistencyScore * 0.15
  );

  return {
    composite,
    exposureScore,
    recallAccuracy,
    independentScore,
    consistencyScore,
    level: composite >= 85 ? 'Mastered' : composite >= 65 ? 'Proficient' : composite >= 35 ? 'Developing' : 'Novice',
  };
}
