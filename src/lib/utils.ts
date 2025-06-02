import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and merges Tailwind classes with tailwind-merge
 * @param inputs List of class values to merge
 * @returns A single merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

/**
 * Formats a Date object to a readable string format
 * @param date Date object to format
 * @returns Formatted date string or "Invalid date"
 */
export function formatDate(date: unknown): string {
  const parsedDate = date instanceof Date ? date : new Date(date as string);
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
}

/**
 * Estimates reading time based on word count of given HTML content
 * @param html HTML string to calculate reading time from
 * @returns Estimated reading time as a string
 */
export function readingTime(html: string): string {
  if (typeof html !== 'string' || !html.trim()) {
    return '1 min read';
  }

  const textContent = html.replace(/<[^>]+>/g, ' '); // Replace HTML tags with space
  const words = textContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const wordsPerMinute = 200;
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));

  return `${minutes} min read`;
}
