import type { CollectionEntry } from "astro:content"
import { createSignal, For, createMemo, Show, onMount, onCleanup } from "solid-js"
import { debounce } from "@solid-primitives/scheduled"
import ArrowCard from "@components/ui/ArrowCard"
import { cn } from "@lib/utils"

type Project = CollectionEntry<"projects">

// Tag categories
const TAG_CATEGORIES = {
  frameworks: ['react', 'vue', 'angular', 'svelte', 'solid', 'next', 'nuxt', 'astro', 'flutter'] as string[],
  languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust'] as string[],
}

export default function Projects({ data, tags }: { data: Project[], tags: string[] }) {
  const [searchQuery, setSearchQuery] = createSignal('')
  const [activeFilters, setActiveFilters] = createSignal<Set<string>>(new Set<string>())
  const [activeCategories, setActiveCategories] = createSignal<Set<string>>(new Set<string>())
  
  // Desktop dropdown states
  const [isLanguageOpen, setIsLanguageOpen] = createSignal(false)
  const [isFrameworkOpen, setIsFrameworkOpen] = createSignal(false)
  const [isCategoryOpen, setIsCategoryOpen] = createSignal(false)
  const [isOtherOpen, setIsOtherOpen] = createSignal(false)

  // Mobile bottom sheet states
  const [isBottomSheetOpen, setIsBottomSheetOpen] = createSignal(false)
  const [activeBottomSheetTab, setActiveBottomSheetTab] = createSignal<'category' | 'language' | 'framework' | 'other'>('category')

  // Extract categories from project paths
  const projectCategories = createMemo(() => {
    const categories = new Set<string>()
    data.forEach(project => {
      const pathParts = project.id.split('/')
      if (pathParts.length > 1) {
        categories.add(pathParts[0])
      }
    })
    return Array.from(categories).sort()
  })

  // Categorize tags
  const categorizedTags = createMemo(() => {
    const normalizedTags = tags.map(tag => tag.toLowerCase())
    const categories: { frameworks: string[]; languages: string[]; others: string[] } = { frameworks: [], languages: [], others: [] }

    normalizedTags.forEach(tag => {
      if (TAG_CATEGORIES.frameworks.includes(tag)) categories.frameworks.push(tag)
      else if (TAG_CATEGORIES.languages.includes(tag)) categories.languages.push(tag)  
      else categories.others.push(tag)
    })

    return categories
  })

  // Debounced search
  const setSearchDebounced = debounce((value: string) => {
    setSearchQuery(value.toLowerCase())
  }, 300)

  // Filter projects
  const filteredProjects = createMemo(() => {
    const search = searchQuery()
    const filters = activeFilters()
    const categories = activeCategories()

    return data.filter(project => {
      const { title = '', summary = '', tags: projectTags = [] } = project.data
      const normalizedTags = projectTags.map(tag => tag.toLowerCase())
      const projectCategory = project.id.split('/')[0]

      // Category filter
      if (categories.size > 0) {
        if (!categories.has(projectCategory)) return false
      }

      // Search filter
      if (search) {
        const searchMatch = 
          title.toLowerCase().includes(search) ||
          summary.toLowerCase().includes(search) ||
          normalizedTags.some(tag => tag.includes(search))
        if (!searchMatch) return false
      }

      // Tag filters
      if (filters.size > 0) {
        return Array.from(filters).some(filter => normalizedTags.includes(filter))
      }

      return true
    })
  })

  // Toggle filter
  const toggleFilter = (tag: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(tag)) {
        newFilters.delete(tag)
      } else {
        newFilters.add(tag)
      }
      return newFilters
    })
  }

  // Toggle category
  const toggleCategory = (category: string) => {
    setActiveCategories(prev => {
      const newCategories = new Set(prev)
      if (newCategories.has(category)) {
        newCategories.delete(category)
      } else {
        newCategories.add(category)
      }
      return newCategories
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters(new Set<string>())
    setActiveCategories(new Set<string>())
    setSearchQuery('')
  }

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsLanguageOpen(false)
    setIsFrameworkOpen(false)
    setIsCategoryOpen(false)
    setIsOtherOpen(false)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    return activeFilters().size + activeCategories().size
  }

  // Desktop Dropdown component
  const FilterDropdown = (props: {
    title: string
    isOpen: boolean
    onToggle: () => void
    items: string[]
    activeItems: Set<string>
    onItemToggle: (item: string) => void
    prefix?: string
  }) => (
    <div class="relative">
      <button
        onClick={props.onToggle}
        class={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md transition-colors",
          "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
          "hover:bg-gray-50 dark:hover:bg-gray-700",
          props.isOpen && "border-blue-500 ring-1 ring-blue-500"
        )}
      >
        <span>{props.title}</span>
        <Show when={props.activeItems.size > 0}>
          <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
            {props.activeItems.size}
          </span>
        </Show>
        <svg 
          class={cn("w-4 h-4 transition-transform", props.isOpen && "rotate-180")}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <Show when={props.isOpen}>
        <div class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div class="p-2">
            <For each={props.items}>
              {(item) => (
                <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={props.activeItems.has(item)}
                    onChange={() => props.onItemToggle(item)}
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm capitalize">
                    {props.prefix ? `${props.prefix}${item}` : item}
                  </span>
                </label>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )

  // Mobile Bottom Sheet
  const BottomSheet = () => (
    <Show when={isBottomSheetOpen()}>
      {/* Backdrop */}
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={() => setIsBottomSheetOpen(false)}
      />
      
      {/* Bottom Sheet */}
      <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl z-50 md:hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Filter Projects</h3>
          <button
            onClick={() => setIsBottomSheetOpen(false)}
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div class="border-b border-gray-200 dark:border-gray-700">
          <div class="flex">
            <Show when={projectCategories().length > 0}>
              <button
                onClick={() => setActiveBottomSheetTab('category')}
                class={cn(
                  "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeBottomSheetTab() === 'category'
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Category
                <Show when={activeCategories().size > 0}>
                  <span class="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
                    {activeCategories().size}
                  </span>
                </Show>
              </button>
            </Show>

            <Show when={categorizedTags().languages.length > 0}>
              <button
                onClick={() => setActiveBottomSheetTab('language')}
                class={cn(
                  "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeBottomSheetTab() === 'language'
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Language
                <Show when={categorizedTags().languages.some(lang => activeFilters().has(lang))}>
                  <span class="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
                    {categorizedTags().languages.filter(lang => activeFilters().has(lang)).length}
                  </span>
                </Show>
              </button>
            </Show>

            <Show when={categorizedTags().frameworks.length > 0}>
              <button
                onClick={() => setActiveBottomSheetTab('framework')}
                class={cn(
                  "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeBottomSheetTab() === 'framework'
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Framework
                <Show when={categorizedTags().frameworks.some(fw => activeFilters().has(fw))}>
                  <span class="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
                    {categorizedTags().frameworks.filter(fw => activeFilters().has(fw)).length}
                  </span>
                </Show>
              </button>
            </Show>

            <Show when={categorizedTags().others.length > 0}>
              <button
                onClick={() => setActiveBottomSheetTab('other')}
                class={cn(
                  "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeBottomSheetTab() === 'other'
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Other
                <Show when={categorizedTags().others.some(other => activeFilters().has(other))}>
                  <span class="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
                    {categorizedTags().others.filter(other => activeFilters().has(other)).length}
                  </span>
                </Show>
              </button>
            </Show>
          </div>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto p-4">
          <Show when={activeBottomSheetTab() === 'category'}>
            <div class="space-y-2">
              <For each={projectCategories()}>
                {(category) => (
                  <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeCategories().has(category)}
                      onChange={() => toggleCategory(category)}
                      class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm capitalize font-medium">{category}</span>
                  </label>
                )}
              </For>
            </div>
          </Show>

          <Show when={activeBottomSheetTab() === 'language'}>
            <div class="space-y-2">
              <For each={categorizedTags().languages}>
                {(language) => (
                  <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters().has(language)}
                      onChange={() => toggleFilter(language)}
                      class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm capitalize font-medium">{language}</span>
                  </label>
                )}
              </For>
            </div>
          </Show>

          <Show when={activeBottomSheetTab() === 'framework'}>
            <div class="space-y-2">
              <For each={categorizedTags().frameworks}>
                {(framework) => (
                  <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters().has(framework)}
                      onChange={() => toggleFilter(framework)}
                      class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm capitalize font-medium">{framework}</span>
                  </label>
                )}
              </For>
            </div>
          </Show>

          <Show when={activeBottomSheetTab() === 'other'}>
            <div class="space-y-2">
              <For each={categorizedTags().others}>
                {(other) => (
                  <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters().has(other)}
                      onChange={() => toggleFilter(other)}
                      class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm capitalize font-medium">{other}</span>
                  </label>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Footer */}
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex gap-3">
            <button
              onClick={clearFilters}
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsBottomSheetOpen(false)}
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </Show>
  )

  // Active filter chips
  const FilterChips = () => {
    const allActiveFilters = () => [
      ...Array.from(activeCategories()).map(cat => ({ type: 'category', value: cat })),
      ...Array.from(activeFilters()).map(tag => ({ type: 'tag', value: tag }))
    ]

    return (
      <Show when={allActiveFilters().length > 0}>
        <div class="flex flex-wrap gap-2 mb-4">
          <For each={allActiveFilters()}>
            {(filter) => (
              <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                <span class="capitalize">{filter.value}</span>
                <button
                  onClick={() => {
                    if (filter.type === 'category') {
                      toggleCategory(filter.value)
                    } else {
                      toggleFilter(filter.value)
                    }
                  }}
                  class="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
          </For>
          <button
            onClick={clearFilters}
            class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
          >
            Clear all
          </button>
        </div>
      </Show>
    )
  }

  // Click outside to close dropdowns
  const handleDocumentClick = (e: Event) => {
    const target = e.target as Element
    if (!target?.closest?.('.relative')) {
      closeAllDropdowns()
    }
  }

  // Add event listener for clicking outside (only on mount)
  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleDocumentClick)
    }
  })

  onCleanup(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleDocumentClick)
    }
  })

  return (
    <div class="max-w-7xl mx-auto px-4">
      {/* Search Bar */}
      <div class="mb-6">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Find a project..."
            onInput={(e) => setSearchDebounced(e.currentTarget.value)}
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Desktop Filters */}
      <div class="mb-6 hidden md:block">
        <div class="flex flex-wrap gap-3 items-center">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
          
          <Show when={projectCategories().length > 0}>
            <FilterDropdown
              title="Category"
              isOpen={isCategoryOpen()}
              onToggle={() => {
                closeAllDropdowns()
                setIsCategoryOpen(!isCategoryOpen())
              }}
              items={projectCategories()}
              activeItems={activeCategories()}
              onItemToggle={toggleCategory}
            />
          </Show>

          <Show when={categorizedTags().languages.length > 0}>
            <FilterDropdown
              title="Language"
              isOpen={isLanguageOpen()}
              onToggle={() => {
                closeAllDropdowns()
                setIsLanguageOpen(!isLanguageOpen())
              }}
              items={categorizedTags().languages}
              activeItems={activeFilters()}
              onItemToggle={toggleFilter}
            />
          </Show>

          <Show when={categorizedTags().frameworks.length > 0}>
            <FilterDropdown
              title="Framework"
              isOpen={isFrameworkOpen()}
              onToggle={() => {
                closeAllDropdowns()
                setIsFrameworkOpen(!isFrameworkOpen())
              }}
              items={categorizedTags().frameworks}
              activeItems={activeFilters()}
              onItemToggle={toggleFilter}
            />
          </Show>

          <Show when={categorizedTags().others.length > 0}>
            <FilterDropdown
              title="Other"
              isOpen={isOtherOpen()}
              onToggle={() => {
                closeAllDropdowns()
                setIsOtherOpen(!isOtherOpen())
              }}
              items={categorizedTags().others}
              activeItems={activeFilters()}
              onItemToggle={toggleFilter}
            />
          </Show>
        </div>

        {/* Active Filter Chips */}
        <FilterChips />

        {/* Results Counter */}
        <div class="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            {filteredProjects().length} {filteredProjects().length === 1 ? 'project' : 'projects'}
          </span>
        </div>
      </div>

      {/* Mobile Filter Button & Results */}
      <div class="mb-6 md:hidden">
        <div class="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span class="text-sm font-medium">Filters</span>
            <Show when={getActiveFilterCount() > 0}>
              <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
                {getActiveFilterCount()}
              </span>
            </Show>
          </button>

          <span class="text-sm text-gray-600 dark:text-gray-400">
            {filteredProjects().length} {filteredProjects().length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {/* Active Filter Chips for Mobile */}
        <FilterChips />
      </div>

      {/* Projects Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={filteredProjects()}>
          {(project) => (
            <ArrowCard entry={project} />
          )}
        </For>
      </div>

      {/* No Results */}
      <Show when={filteredProjects().length === 0}>
        <div class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No projects found</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            We couldn't find any projects matching your filters.
          </p>
          <button
            onClick={clearFilters}
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear filters
          </button>
        </div>
      </Show>

      {/* Bottom Sheet */}
      <BottomSheet />
    </div>
  )
}

