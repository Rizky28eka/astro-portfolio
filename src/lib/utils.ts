import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string format
 * @param date Date object to format
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(date: Date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid date"
  }
  
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date)
}

/**
 * Calculates reading time based on word count
 * @param html HTML content to calculate reading time for
 * @returns Formatted reading time string
 */
export function readingTime(html: string) {
  if (!html || typeof html !== 'string') {
    return "1 min read"
  }
  
  const textOnly = html.replace(/<[^>]+>/g, "")
  const wordCount = textOnly.trim().split(/\s+/).filter(Boolean).length
  
  // Average reading speed: 200 words per minute
  // Add 1 minute as base time and round to nearest minute
  const minutes = Math.max(1, Math.round(wordCount / 200))
  
  return `${minutes} min read`
}