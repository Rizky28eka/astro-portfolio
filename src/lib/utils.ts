import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CollectionEntry } from 'astro:content';

// Types
type PostCollection = 'blog' | 'projects';
type Post = CollectionEntry<PostCollection>;

interface ReadingTimeOptions {
  wordsPerMinute?: number;
  locale?: string;
}

interface DateFormatOptions {
  locale?: string;
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
}

/**
 * Combines multiple class names into a single string using clsx and tailwind-merge
 * @param inputs - Class values to combine
 * @returns Combined and optimized class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into a readable string with customizable options
 * @param date - Date to format (Date object or string)
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: DateFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    format = 'long',
    includeTime = false
  } = options;

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' }, // duplicated in original, corrected to match 'short' if not intended to be different
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }[format];

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return d.toLocaleDateString(locale, formatOptions);
}

/**
 * Calculates estimated reading time for content
 * @param content - Text content to analyze
 * @param options - Reading time calculation options
 * @returns Formatted reading time string
 */
export function readingTime(
  content: string,
  options: ReadingTimeOptions = {}
): string {
  const { wordsPerMinute = 200, locale = 'en-US' } = options;

  if (!content?.trim()) {
    return '0 min read';
  }

  // More accurate word counting that handles various whitespace and punctuation
  const words = content
    .trim()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .split(' ')
    .filter(word => word.length > 0).length;

  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  // Internationalization support
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  // Simplified logic: format using Intl.RelativeTimeFormat only if needed, otherwise use simple string
  if (locale === 'en-US' || locale === 'id-ID') { // Contoh: tambahkan locale lain yang umum
    return `${minutes} min read`; // Default English format
  } else {
    // Ini mungkin tidak mengembalikan "X min read" secara langsung.
    // Intl.RelativeTimeFormat digunakan untuk "in X minutes" atau "X minutes ago".
    // Untuk "X min read", lebih baik buat string secara manual.
    // Jika maksudnya adalah "1 minute read", gunakan `rtf.format(minutes, 'minute')` (untuk kasus tunggal).
    // Untuk konsistensi dengan "X min read", pendekatan manual lebih baik.
    return `${minutes} min read`; // Untuk kasus selain en-US, tetap pakai format umum
  }
}

/**
 * Extracts category information from a post slug based on folder structure
 * @param slug - Post slug to parse (e.g., "flutter/getting-started" or "datamining/analysis-project")
 * @param collection - Collection type ('blog' | 'projects')
 * @returns Object containing collection, category, and subcategory information
 */
function parseSlugCategory(slug: string, collection: PostCollection): {
  collection: PostCollection;
  category: string;
  subcategory?: string;
} {
  const slugParts = slug.split('/').filter(Boolean);

  return {
    collection,
    category: slugParts[0] || '', // flutter, git, java, kotlin, datamining, web, mobile
    subcategory: slugParts[1] // specific post slug
  };
}

/**
 * Checks if a post matches the specified category filter
 * @param post - Post to check
 * @param categoryFilter - Category to match against (optional)
 * @returns Boolean indicating if post matches category
 */
function doesPostMatchCategory(post: Post, categoryFilter?: string): boolean {
  if (!categoryFilter) return true; // If no filter, all posts match

  const { collection, category } = parseSlugCategory(post.slug, post.collection);
  const normalizedFilter = categoryFilter.toLowerCase().trim();

  // Exact category match (e.g., 'flutter', 'git')
  if (category.toLowerCase() === normalizedFilter) return true;

  // Collection-level match (e.g., 'blog', 'projects')
  if (collection.toLowerCase() === normalizedFilter) return true;

  return false;
}

/**
 * Filters posts by category with enhanced matching logic
 * Supports filtering by:
 * - Collection type: 'blog', 'projects'
 * - Blog categories: 'flutter', 'git', 'java', 'kotlin'
 * - Project categories: 'datamining', 'web', 'mobile'
 *
 * @param posts - Array of posts to filter
 * @param categoryFilter - Category to filter by (optional)
 * @returns Filtered array of posts
 */
export function filterPostsByCategory<T extends Post>(
  posts: T[],
  categoryFilter?: string
): T[] {
  if (!posts?.length) {
    return [];
  }

  if (!categoryFilter) {
    return posts;
  }

  const normalizedCategory = categoryFilter.toLowerCase().trim();

  return posts.filter(post => {
    if (!post?.slug) return false;
    return doesPostMatchCategory(post, normalizedCategory);
  });
}

/**
 * Groups posts by their categories based on folder structure
 * @param posts - Array of posts to group
 * @returns Object with categories as keys and arrays of posts as values
 */
export function groupPostsByCategory<T extends Post>(
  posts: T[]
): Record<string, T[]> {
  if (!posts?.length) return {};

  return posts.reduce((groups, post) => {
    if (!post?.slug) return groups;

    const { category } = parseSlugCategory(post.slug, post.collection);
    const groupKey = category || 'uncategorized';

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(post);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Gets all available categories from posts based on folder structure
 * @param posts - Array of posts to extract categories from
 * @returns Array of unique category names
 */
export function getAvailableCategories<T extends Post>(posts: T[]): string[] {
  if (!posts?.length) return [];

  const categories = new Set<string>();

  posts.forEach(post => {
    if (!post?.slug) return;

    const { collection, category } = parseSlugCategory(post.slug, post.collection);

    // Add collection type (e.g., 'blog', 'projects')
    categories.add(collection);

    // Add specific category (e.g., 'flutter', 'datamining') if exists
    if (category) {
      categories.add(category);
    }
  });

  return Array.from(categories).sort();
}

/**
 * Gets categories grouped by collection type
 * @param posts - Array of posts to extract categories from
 * @returns Object with collection types as keys and category arrays as values
 */
export function getCategoriesByCollection<T extends Post>(
  posts: T[]
): Record<PostCollection, string[]> {
  const result: Record<PostCollection, string[]> = {
    blog: [],
    projects: []
  };

  if (!posts?.length) return result;

  const blogCategories = new Set<string>();
  const projectCategories = new Set<string>();

  posts.forEach(post => {
    if (!post?.slug) return;

    const { collection, category } = parseSlugCategory(post.slug, post.collection);

    if (collection === 'blog' && category) {
      blogCategories.add(category);
    } else if (collection === 'projects' && category) {
      projectCategories.add(category);
    }
  });

  result.blog = Array.from(blogCategories).sort();
  result.projects = Array.from(projectCategories).sort();

  return result;
}

/**
 * Sorts posts by date (newest first by default)
 * @param posts - Array of posts to sort
 * @param ascending - Sort in ascending order (oldest first)
 * @returns Sorted array of posts
 */
export function sortPostsByDate<T extends Post>(
  posts: T[],
  ascending = false
): T[] {
  if (!posts?.length) return [];

  return [...posts].sort((a, b) => {
    const dateA = new Date(a.data.date || 0);
    const dateB = new Date(b.data.date || 0);

    return ascending
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
}

/**
 * Searches posts by title and content
 * @param posts - Array of posts to search
 * @param query - Search query
 * @returns Filtered array of matching posts
 */
export function searchPosts<T extends Post>(
  posts: T[],
  query: string
): T[] {
  if (!query?.trim() || !posts?.length) return posts || [];

  const normalizedQuery = query.toLowerCase().trim();

  return posts.filter(post => {
    if (!post?.data) return false;

    const title = post.data.title?.toLowerCase() || '';
    const description = post.data.summary?.toLowerCase() || '';
    const content = post.body?.toLowerCase() || '';

    return title.includes(normalizedQuery) ||
           description.includes(normalizedQuery) ||
           content.includes(normalizedQuery);
  });
}