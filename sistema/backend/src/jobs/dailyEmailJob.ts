import { dispatchForDate } from '../services/emailService';

export interface DailyEmailJobHandle {
  stop(): void;
}

const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function startDailyEmailJob(
  intervalMs: number = DEFAULT_INTERVAL_MS,
): DailyEmailJobHandle {
  const timer = setInterval(() => {
    dispatchForDate().catch((err) => {
      console.error('[dailyEmailJob] dispatch failed', err);
    });
  }, intervalMs);
  return {
    stop: () => clearInterval(timer),
  };
}
