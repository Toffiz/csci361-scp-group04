import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';
import 'dayjs/locale/kk';

dayjs.extend(relativeTime);

/**
 * Format date with locale support
 */
export function formatDate(
  date: string | Date,
  format: string = 'DD.MM.YYYY HH:mm',
  locale: 'ru' | 'kz' = 'ru'
): string {
  const dayjsLocale = locale === 'kz' ? 'kk' : 'ru';
  return dayjs(date).locale(dayjsLocale).format(format);
}

/**
 * Format date as relative time
 */
export function formatRelative(
  date: string | Date,
  locale: 'ru' | 'kz' = 'ru'
): string {
  const dayjsLocale = locale === 'kz' ? 'kk' : 'ru';
  return dayjs(date).locale(dayjsLocale).fromNow();
}

/**
 * Get current timestamp
 */
export function now(): string {
  return dayjs().toISOString();
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * Check if date is in the past
 */
export function isPast(date: string | Date): boolean {
  return dayjs(date).isBefore(dayjs());
}

/**
 * Add time to date
 */
export function addTime(
  date: string | Date,
  amount: number,
  unit: 'day' | 'hour' | 'minute' | 'second'
): Date {
  return dayjs(date).add(amount, unit).toDate();
}
