/**
 * Lightweight FSRS-inspired scheduler for quiz review.
 * Not a full FSRS-6 port — enough for personal spaced practice.
 */

export type Rating = 1 | 2 | 3 | 4; // Again | Hard | Good | Easy

export type CardState = {
  due: number;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
};

const MINUTE = 60_000;
const DAY = 86_400_000;

export function initialCard(now = Date.now()): CardState {
  return {
    due: now,
    stability: 0,
    difficulty: 5,
    reps: 0,
    lapses: 0,
  };
}

export function schedule(card: CardState, rating: Rating, now = Date.now()): CardState {
  let { stability, difficulty, reps, lapses } = card;

  if (rating === 1) {
    lapses += 1;
    reps = 0;
    stability = Math.max(0.5, stability * 0.5);
    difficulty = Math.min(10, difficulty + 1);
    return { due: now + 10 * MINUTE, stability, difficulty, reps, lapses };
  }

  reps += 1;
  const delta = rating === 2 ? -0.3 : rating === 3 ? 0 : -0.8;
  difficulty = clamp(difficulty + delta, 1, 10);

  if (reps === 1) {
    stability = rating === 2 ? 0.8 : rating === 3 ? 2 : 4;
  } else {
    const factor = rating === 2 ? 1.2 : rating === 3 ? 2.2 : 3.5;
    stability = Math.max(stability * factor * (11 - difficulty) / 10, stability + 0.5);
  }

  const interval = Math.min(stability, 120) * DAY;
  return { due: now + interval, stability, difficulty, reps, lapses };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function isDue(card: CardState, now = Date.now()) {
  return card.due <= now;
}
