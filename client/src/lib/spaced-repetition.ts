import { CardWithReview } from "@shared/schema";

// SM-2 algorithm parameters
const INITIAL_INTERVAL = 1; // 1 day
const EASY_BONUS = 1.3;
const HARD_PENALTY = 0.5;

// Calculate the next review date based on familiarity score
export function calculateNextReview(
  familiarityScore: number,
  card: CardWithReview
): { interval: number; nextReviewDate: Date } {
  const today = new Date();
  let interval: number;
  
  // If there's no previous review, set initial interval based on familiarity
  if (!card.lastReview) {
    interval = getInitialInterval(familiarityScore);
  } else {
    // Calculate new interval based on previous interval and familiarity
    interval = getNextInterval(familiarityScore, card.lastReview.interval);
  }
  
  // Calculate next review date
  const nextReviewDate = new Date(today);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return { interval, nextReviewDate };
}

// Initial interval setting based on first familiarity rating
function getInitialInterval(familiarityScore: number): number {
  switch (familiarityScore) {
    case 1: return 1; // Review again tomorrow
    case 2: return 2; // Review in 2 days
    case 3: return 3; // Review in 3 days
    case 4: return 5; // Review in 5 days
    case 5: return 7; // Review in a week
    default: return INITIAL_INTERVAL;
  }
}

// Calculate next interval based on previous interval and new familiarity score
function getNextInterval(familiarityScore: number, prevInterval: number): number {
  let factor: number;
  
  switch (familiarityScore) {
    case 1: 
      // Very difficult - reset to 1 day
      return 1;
    case 2:
      // Difficult - reduce interval
      factor = HARD_PENALTY;
      break;
    case 3:
      // Medium - slight increase
      factor = 1.2;
      break;
    case 4:
      // Easy - normal increase
      factor = 1.8;
      break;
    case 5:
      // Very easy - bigger increase
      factor = 2.5 * EASY_BONUS;
      break;
    default:
      factor = 1;
  }
  
  // Calculate new interval, rounding to nearest whole day
  const newInterval = Math.round(prevInterval * factor);
  
  // Ensure we don't go below 1 day or above 365 days
  return Math.max(1, Math.min(newInterval, 365));
}
