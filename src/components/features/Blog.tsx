import type { CollectionEntry } from "astro:content"
import { createEffect, createSignal, createMemo, For, Show, batch } from "solid-js"
import ArrowCard from "@components/ui/ArrowCard"
import { cn } from "@lib/utils"
import OtherTags from "./OtherTags"
import DateFilter from "./DateFilter"

// Types
type Props = {
  tags: string[]
  data: CollectionEntry<"blog">[]
}

type Tag = string
type Category = string
type DateFilterValue = typeof DATE_FILTER_OPTIONS[number]['value'] | string
type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]

// Constants
const LANGUAGE_TAGS = new Set([
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'php', 'ruby',
  'go', 'rust', 'swift', 'kotlin', 'dart', 'scala', 'r', 'matlab', 'perl',
  'haskell', 'elixir', 'clojure', 'lua', 'julia', 'crystal', 'nim', 'zig',
  'cpp', 'csharp', 'golang', 'js', 'ts', 'py'
].map(tag => tag.toLowerCase()))

const CATEGORY_TAGS = new Set([
  'flutter', 'git', 'java', 'kotlin', 'android', 'ios', 'web', 'mobile',
  'backend', 'frontend', 'database', 'devops', 'tutorial', 'guide'
].map(tag => tag.toLowerCase()))

const DIFFICULTY_LEVELS = ['beginner', 'medium', 'advanced'] as const

const POSTS_PER_PAGE = 15

const DIFFICULTY_DISPLAY: Record<DifficultyLevel, string> = {
  'beginner': 'Beginner',
  'medium': 'Medium', 
  'advanced': 'Advanced'
} as const

const DATE_FILTER_OPTIONS = [
  { value: 'last-week', label: 'Last week', days: 7 },
  { value: 'last-month', label: 'Last month', days: 30 },
  { value: 'last-3-months', label: 'Last 3 months', days: 90 },
  { value: 'last-6-months', label: 'Last 6 months', days: 180 },
  { value: 'last-year', label: 'Last year', days: 365 }
] as const

// Utility functions
const normalizeDifficulty = (difficulty: string | undefined): DifficultyLevel | null => {
  if (!difficulty) return null
  const normalized = difficulty.toLowerCase()
  return DIFFICULTY_LEVELS.includes(normalized as DifficultyLevel) ? normalized as DifficultyLevel : null
}

const getAvailableYears = (data: CollectionEntry<"blog">[]): number[] => {
  const years = new Set<number>()
  data.forEach(post => {
    if (post.data.date) {
      years.add(new Date(post.data.date).getFullYear())
    }
  })
  return Array.from(years).sort((a, b) => b - a)
}

const matchesDateFilter = (postDate: string | Date | undefined, filterValue: DateFilterValue): boolean => {
  if (!postDate || !filterValue) return true
  
  const now = new Date()
  const postTime = new Date(postDate).getTime()
  
  if (/^\d{4}$/.test(filterValue)) {
    return new Date(postDate).getFullYear() === parseInt(filterValue)
  }
  
  const option = DATE_FILTER_OPTIONS.find(opt => opt.value === filterValue)
  if (option) {
    return postTime >= now.getTime() - (option.days * 24 * 60 * 60 * 1000)
  }
  
  return true
}

// Custom hooks
function useFilterSet<T extends string>(initialValue: Set<T> = new Set<T>()) {
  const [filter, setFilter] = createSignal<Set<T>>(initialValue)
  
  return {
    filter,
    toggle: (value: T) => setFilter(prev => {
      const newSet = new Set(prev)
      newSet.has(value) ? newSet.delete(value) : newSet.add(value)
      return newSet
    }),
    clear: () => setFilter(new Set<T>()),
    has: (value: T) => filter().has(value),
    size: () => filter().size
  }
}

function useSingleFilter<T extends string>(initialValue: T | null = null) {
  const [filter, setFilter] = createSignal<T | null>(initialValue)
  
  return {
    filter,
    set: (value: T | null) => setFilter(() => value),
    clear: () => setFilter(null),
    get: () => filter(),
    hasValue: () => filter() !== null
  }
}

// UI Components
const PaginationButton = (props: {
  onClick: () => void
  disabled?: boolean
  children: any
  class?: string
  active?: boolean
}) => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    class={cn(
      "px-3 py-2 text-sm font-medium rounded-md",
      "border border-black/10 dark:border-white/20",
      "transition-all duration-200 ease-in-out",
      "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
      props.disabled 
        ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-400"
        : props.active
          ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
          : "bg-white dark:bg-black hover:bg-gray-50 hover:dark:bg-gray-900 text-black dark:text-white",
      props.class
    )}
  >
    {props.children}
  </button>
)

// Main Component
export default function Blog({ data, tags }: Props) {
  // State management
  const languageFilter = useFilterSet<string>()
  const otherFilter = useFilterSet<string>()
  const difficultyFilter = useFilterSet<DifficultyLevel>()
  const dateFilter = useSingleFilter<DateFilterValue>()
  
  const [selectedCategory, setSelectedCategory] = createSignal<string | null>(null)
  const [currentPage, setCurrentPage] = createSignal(1)

  // Memoized values
  const availableYears = createMemo(() => getAvailableYears(data))

  const categories = createMemo(() => {
    const uniqueCategories = new Set<string>()
    data.forEach(post => {
      const category = post.slug.split('/')[0]
      if (category) uniqueCategories.add(category)
    })
    return Array.from(uniqueCategories).sort()
  })

  const categorizedTags = createMemo(() => ({
    language: tags.filter(tag => LANGUAGE_TAGS.has(tag.toLowerCase())),
    other: tags.filter(tag => {
      const lowerTag = tag.toLowerCase()
      return !LANGUAGE_TAGS.has(lowerTag) && 
             !DIFFICULTY_LEVELS.includes(lowerTag as DifficultyLevel) &&
             !CATEGORY_TAGS.has(lowerTag)
    })
  }))

  const filteredPosts = createMemo(() => {
    let posts = data

    if (selectedCategory()) {
      posts = posts.filter(post => post.slug.startsWith(selectedCategory()!))
    }

    const hasActiveFilters = languageFilter.size() > 0 || 
                            otherFilter.size() > 0 || 
                            difficultyFilter.size() > 0 ||
                            dateFilter.hasValue()

    if (!hasActiveFilters) return posts

    return posts.filter(entry => {
      const postTags = new Set(entry.data.tags?.map((tag: string) => tag.toLowerCase()) || [])
      const normalizedPostDifficulty = normalizeDifficulty(entry.data.difficulty)
      const postCategory = entry.slug.split('/')[0].toLowerCase()

      const selectedCategoryTags = Array.from(otherFilter.filter())
        .filter(tag => CATEGORY_TAGS.has(tag.toLowerCase()))

      if (selectedCategoryTags.length > 0) {
        if (!selectedCategoryTags.some(tag => postCategory === tag.toLowerCase())) {
          return false
        }
      }

      const languageMatch = languageFilter.size() === 0 || 
        Array.from(languageFilter.filter()).some(language => 
          postTags.has(language.toLowerCase())
        )

      const otherMatch = otherFilter.size() === 0 || 
        Array.from(otherFilter.filter()).some(other => 
          postTags.has(other.toLowerCase())
        )

      const difficultyMatch = difficultyFilter.size() === 0 || 
        (normalizedPostDifficulty && difficultyFilter.has(normalizedPostDifficulty))

      const dateMatch = !dateFilter.hasValue() || 
        matchesDateFilter(entry.data.date, dateFilter.get()!)

      return languageMatch && otherMatch && difficultyMatch && dateMatch
    })
  })

  const paginationData = createMemo(() => {
    const totalPosts = filteredPosts().length
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
    const startIndex = (currentPage() - 1) * POSTS_PER_PAGE
    const endIndex = startIndex + POSTS_PER_PAGE
    const currentPosts = filteredPosts().slice(startIndex, endIndex)
    
    return {
      totalPosts,
      totalPages,
      currentPosts,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalPosts)
    }
  })

  const hasActiveFilters = createMemo(() => 
    languageFilter.size() > 0 || 
    otherFilter.size() > 0 || 
    difficultyFilter.size() > 0 ||
    dateFilter.hasValue()
  )

  const activeFiltersDescription = createMemo(() => {
    const parts = []
    
    if (difficultyFilter.size() > 0) {
      const difficultyNames = Array.from(difficultyFilter.filter()).map(d => DIFFICULTY_DISPLAY[d])
      parts.push(`${difficultyNames.join(', ')} level${difficultyFilter.size() > 1 ? 's' : ''}`)
    }
    if (languageFilter.size() > 0) {
      parts.push(`${languageFilter.size()} language${languageFilter.size() > 1 ? 's' : ''}`)
    }
    if (otherFilter.size() > 0) {
      parts.push(`${otherFilter.size()} other tag${otherFilter.size() > 1 ? 's' : ''}`)
    }
    if (dateFilter.hasValue()) {
      const currentFilter = dateFilter.get()
      if (currentFilter) {
        if (/^\d{4}$/.test(currentFilter)) {
          parts.push(`${currentFilter}`)
        } else {
          const option = DATE_FILTER_OPTIONS.find(opt => opt.value === currentFilter)
          if (option) {
            parts.push(option.label.toLowerCase())
          }
        }
      }
    }
    
    return parts.join(' + ')
  })

  // Effects
  createEffect(() => {
    filteredPosts()
    selectedCategory()
    languageFilter.size()
    otherFilter.size()
    difficultyFilter.size()
    dateFilter.hasValue()
    setCurrentPage(1)
  })

  // Event handlers
  const clearAllFilters = () => {
    batch(() => {
      languageFilter.clear()
      otherFilter.clear()  
      difficultyFilter.clear()
      dateFilter.clear()
      setCurrentPage(1)
    })
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    document.querySelector('.posts-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const nextPage = () => {
    if (currentPage() < paginationData().totalPages) {
      goToPage(currentPage() + 1)
    }
  }

  const previousPage = () => {
    if (currentPage() > 1) {
      goToPage(currentPage() - 1)
    }
  }

  const getPageNumbers = createMemo(() => {
    const totalPages = paginationData().totalPages
    const current = currentPage()
    const pages = []
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (current >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  })

  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Filters Sidebar */}
      <div class="col-span-3 sm:col-span-1">
        <div class="sticky top-24">
          {/* Category Navigation */}
          <div class="mb-6">
            <h3 class="text-sm font-semibold uppercase text-black dark:text-white mb-2">
              Categories
            </h3>
            <div class="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedCategory(null)}
                class={cn(
                  "w-full px-2 py-1 rounded text-left",
                  "whitespace-nowrap overflow-hidden text-ellipsis",
                  "flex gap-2 items-center",
                  "bg-black/5 dark:bg-white/10",
                  "hover:bg-black/10 hover:dark:bg-white/15",
                  "transition-colors duration-300 ease-in-out",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  !selectedCategory() && "bg-black/10 dark:bg-white/20 text-black dark:text-white"
                )}
              >
                <svg class={cn(
                  "size-5 fill-black/50 dark:fill-white/50", 
                  "transition-colors duration-300 ease-in-out", 
                  !selectedCategory() && "fill-black dark:fill-white"
                )}>
                  <use href={`/ui.svg#square${!selectedCategory() ? '-check' : ''}`} />
                </svg>
                All Posts
              </button>
              <For each={categories()}>
                {(category) => (
                  <button
                    onClick={() => setSelectedCategory(category)}
                    class={cn(
                      "w-full px-2 py-1 rounded text-left",
                      "whitespace-nowrap overflow-hidden text-ellipsis",
                      "flex gap-2 items-center",
                      "bg-black/5 dark:bg-white/10",
                      "hover:bg-black/10 hover:dark:bg-white/15",
                      "transition-colors duration-300 ease-in-out",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                      selectedCategory() === category && "bg-black/10 dark:bg-white/20 text-black dark:text-white"
                    )}
                  >
                    <svg class={cn(
                      "size-5 fill-black/50 dark:fill-white/50", 
                      "transition-colors duration-300 ease-in-out", 
                      selectedCategory() === category && "fill-black dark:fill-white"
                    )}>
                      <use href={`/ui.svg#square${selectedCategory() === category ? '-check' : ''}`} />
                    </svg>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Filter Header */}
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold uppercase text-black dark:text-white">
              Filters
            </h2>
            <Show when={hasActiveFilters()}>
              <button 
                onClick={clearAllFilters}
                class="text-xs text-black/50 dark:text-white/50 hover:text-black hover:dark:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1"
              >
                Clear all
              </button>
            </Show>
          </div>

          {/* Date Filter */}
          <DateFilter
            availableYears={availableYears()}
            currentFilter={dateFilter.get()}
            onFilterChange={dateFilter.set}
          />

          {/* Difficulty Filters */}
          <div class="mb-6">
            <h3 class="text-sm font-semibold uppercase text-black dark:text-white mb-2">
              Difficulty
            </h3>
            <ul class="flex flex-wrap sm:flex-col gap-1.5">
              <For each={DIFFICULTY_LEVELS}>
                {(difficulty) => (
                  <li>
                    <button 
                      onClick={() => difficultyFilter.toggle(difficulty)}
                      class={cn(
                        "w-full px-2 py-1 rounded text-left",
                        "whitespace-nowrap overflow-hidden text-ellipsis",
                        "flex gap-2 items-center",
                        "bg-black/5 dark:bg-white/10",
                        "hover:bg-black/10 hover:dark:bg-white/15",
                        "transition-colors duration-300 ease-in-out",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        difficultyFilter.has(difficulty) && "bg-black/10 dark:bg-white/20 text-black dark:text-white"
                      )}
                    >
                      <svg class={cn(
                        "size-5 fill-black/50 dark:fill-white/50", 
                        "transition-colors duration-300 ease-in-out", 
                        difficultyFilter.has(difficulty) && "fill-black dark:fill-white"
                      )}>
                        <use href={`/ui.svg#square${difficultyFilter.has(difficulty) ? '-check' : ''}`} />
                      </svg>
                      {DIFFICULTY_DISPLAY[difficulty]}
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </div>

          {/* Language Filters */}
          <Show when={categorizedTags().language.length > 0}>
            <div class="mb-6">
              <h3 class="text-sm font-semibold uppercase text-black dark:text-white mb-2">
                Language
              </h3>
              <ul class="flex flex-wrap sm:flex-col gap-1.5">
                <For each={categorizedTags().language}>
                  {(tag) => (
                    <li>
                      <button 
                        onClick={() => languageFilter.toggle(tag)}
                        class={cn(
                          "w-full px-2 py-1 rounded text-left",
                          "whitespace-nowrap overflow-hidden text-ellipsis",
                          "flex gap-2 items-center",
                          "bg-black/5 dark:bg-white/10",
                          "hover:bg-black/10 hover:dark:bg-white/15",
                          "transition-colors duration-300 ease-in-out",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                          languageFilter.has(tag) && "bg-black/10 dark:bg-white/20 text-black dark:text-white"
                        )}
                      >
                        <svg class={cn(
                          "size-5 fill-black/50 dark:fill-white/50", 
                          "transition-colors duration-300 ease-in-out", 
                          languageFilter.has(tag) && "fill-black dark:fill-white"
                        )}>
                          <use href={`/ui.svg#square${languageFilter.has(tag) ? '-check' : ''}`} />
                        </svg>
                        {tag}
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Show>

          {/* Other Tags Filters */}
          <Show when={categorizedTags().other.length > 0}>
            <OtherTags
              tags={categorizedTags().other}
              selectedTags={otherFilter.filter()}
              onTagToggle={otherFilter.toggle}
              onClear={otherFilter.clear}
              selectedCategory={selectedCategory()}
              posts={data}
            />
          </Show>
        </div>
      </div>

      {/* Posts Display */}
      <div class="col-span-3 sm:col-span-2 posts-section">
        <div class="flex flex-col">
          {/* Results Header */}
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm uppercase font-semibold">
              {paginationData().totalPosts} {paginationData().totalPosts === 1 ? 'POST' : 'POSTS'} FOUND
              <Show when={paginationData().totalPages > 1}>
                <span class="text-black/50 dark:text-white/50 ml-2">
                  (Page {currentPage()} of {paginationData().totalPages})
                </span>
              </Show>
            </div>
            <Show when={hasActiveFilters()}>
              <div class="text-sm text-black/50 dark:text-white/50">
                {activeFiltersDescription()}
              </div>
            </Show>
          </div>

          {/* Posts List */}
          <Show 
            when={paginationData().currentPosts.length > 0}
            fallback={
              <div class="text-center py-12">
                <p class="text-black/50 dark:text-white/50 mb-4">
                  No posts found matching the selected filters
                </p>
                <Show when={hasActiveFilters()}>
                  <button 
                    onClick={clearAllFilters}
                    class="text-sm text-blue-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
                  >
                    Clear all filters
                  </button>
                </Show>
              </div>
            }
          >
            <ul class="flex flex-col gap-3 mb-8" role="list">
              <For each={paginationData().currentPosts}>
                {(post) => (
                  <li>
                    <ArrowCard entry={post} />
                  </li>
                )}
              </For>
            </ul>

            {/* Pagination Controls */}
            <Show when={paginationData().totalPages > 1}>
              <div class="flex flex-col items-center gap-4">
                {/* Pagination Info */}
                <div class="text-sm text-black/60 dark:text-white/60">
                  Showing {paginationData().startIndex} to {paginationData().endIndex} of {paginationData().totalPosts} posts
                </div>

                {/* Pagination Buttons */}
                <div class="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <PaginationButton
                    onClick={previousPage}
                    disabled={currentPage() === 1}
                    class="flex items-center gap-1"
                  >
                    <svg class="size-4 fill-current">
                      <use href="/ui.svg#chevron-left" />
                    </svg>
                    Previous
                  </PaginationButton>

                  {/* Page Numbers */}
                  <div class="flex items-center gap-1">
                    <For each={getPageNumbers()}>
                      {(pageNum) => (
                        <Show 
                          when={typeof pageNum === 'number'}
                          fallback={
                            <span class="px-2 py-2 text-black/50 dark:text-white/50">
                              ...
                            </span>
                          }
                        >
                          <PaginationButton
                            onClick={() => goToPage(pageNum as number)}
                            active={currentPage() === pageNum}
                            class="min-w-[40px]"
                          >
                            {pageNum}
                          </PaginationButton>
                        </Show>
                      )}
                    </For>
                  </div>

                  {/* Next Button */}
                  <PaginationButton
                    onClick={nextPage}
                    disabled={currentPage() === paginationData().totalPages}
                    class="flex items-center gap-1"
                  >
                    Next
                    <svg class="size-4 fill-current">
                      <use href="/ui.svg#chevron-right" />
                    </svg>
                  </PaginationButton>
                </div>

                {/* Quick Jump (for many pages) */}
                <Show when={paginationData().totalPages > 10}>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-black/60 dark:text-white/60">Jump to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={paginationData().totalPages}
                      value={currentPage()}
                      onInput={(e) => {
                        const value = parseInt(e.currentTarget.value)
                        if (value >= 1 && value <= paginationData().totalPages) {
                          goToPage(value)
                        }
                      }}
                      class="w-16 px-2 py-1 text-center border border-black/20 dark:border-white/20 rounded bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <span class="text-black/60 dark:text-white/60">of {paginationData().totalPages}</span>
                  </div>
                </Show>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  )
}