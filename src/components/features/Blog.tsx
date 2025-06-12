import type { CollectionEntry } from "astro:content"
import { createSignal, For, createMemo, Show, onMount, onCleanup } from "solid-js"
import { debounce } from "@solid-primitives/scheduled"
import ArrowCard from "@components/ui/ArrowCard"
import { cn } from "@lib/utils" // Pastikan utilitas `cn` benar

type Props = {
  tags: string[]
  data: CollectionEntry<"blog">[] // Sekarang menerima SEMUA data
}

type SortType = "date" | "name" | "popularity"

const TAG_CATEGORIES = {
  categories: ['flutter', 'git', 'java', 'kotlin'],
  languages: ['javascript', 'typescript', 'python', 'java', 'go'],
  frameworks: ['react', 'vue', 'angular', 'svelte', 'astro'],
} as const

export default function Blog({ data, tags }: Props) {
  // Core state
  const [searchQuery, setSearchQuery] = createSignal('')
  const [activeFilters, setActiveFilters] = createSignal<Set<string>>(new Set())
  const [activeCategories, setActiveCategories] = createSignal<Set<string>>(new Set())
  const [sortBy, setSortBy] = createSignal<SortType>("date")

  // Paginasi state
  const [currentPage, setCurrentPage] = createSignal(1);
  const postsPerPage = 9; // Sesuaikan dengan pageSize di Astro sebelumnya

  // Desktop dropdown states
  const [isLanguageOpen, setIsLanguageOpen] = createSignal(false)
  const [isFrameworkOpen, setIsFrameworkOpen] = createSignal(false)
  const [isCategoryOpen, setIsCategoryOpen] = createSignal(false)
  const [isOtherOpen, setIsOtherOpen] = createSignal(false)

  // Mobile bottom sheet states
  const [isBottomSheetOpen, setIsBottomSheetOpen] = createSignal(false)
  const [activeBottomSheetTab, setActiveBottomSheetTab] = createSignal<'category' | 'language' | 'framework' | 'other'>('category')

  // Debounced search
  const setSearchDebounced = debounce((value: string) => {
    setSearchQuery(value.toLowerCase())
    setCurrentPage(1); // Reset halaman saat pencarian berubah
  }, 300)

  // Kategorikan tag
  const categorizedTags = createMemo(() => {
    const normalizedTags = tags.map(tag => tag.toLowerCase())
    const categories: { frameworks: string[]; languages: string[]; categories: string[]; others: string[] } = { frameworks: [], languages: [], categories: [], others: [] }

    normalizedTags.forEach(tag => {
      if (TAG_CATEGORIES.frameworks.includes(tag as (typeof TAG_CATEGORIES.frameworks)[number])) categories.frameworks.push(tag)
      else if (TAG_CATEGORIES.languages.includes(tag as (typeof TAG_CATEGORIES.languages)[number])) categories.languages.push(tag)
      else if (TAG_CATEGORIES.categories.includes(tag as (typeof TAG_CATEGORIES.categories)[number])) categories.categories.push(tag)
      else categories.others.push(tag)
    })

    return categories
  })

  // Filter dan urutkan posts
  const filteredAndSortedPosts = createMemo(() => {
    const search = searchQuery()
    const filters = activeFilters()
    const categories = activeCategories()

    let filtered = data.filter(entry => {
      const postTags = (entry.data.tags || []).map(tag => tag.toLowerCase())
      const title = entry.data.title.toLowerCase()
      const summary = (entry.data.summary || "").toLowerCase()
      const postCategory = entry.id.split('/')[0].toLowerCase()

      // Filter kategori
      if (categories.size > 0 && !categories.has(postCategory)) {
        return false
      }

      // Filter pencarian
      if (search) {
        const searchMatch =
          title.includes(search) ||
          summary.includes(search) ||
          postTags.some(tag => tag.includes(search)) ||
          postCategory.includes(search)
        if (!searchMatch) return false
      }

      // Filter tag
      if (filters.size > 0) {
        const categoryFilters = Array.from(filters).filter(f => 
          TAG_CATEGORIES.categories.includes(f as (typeof TAG_CATEGORIES.categories)[number])
        )
        const otherTagFilters = Array.from(filters).filter(f => 
          TAG_CATEGORIES.languages.includes(f as (typeof TAG_CATEGORIES.languages)[number]) || 
          TAG_CATEGORIES.frameworks.includes(f as (typeof TAG_CATEGORIES.frameworks)[number]) || 
          categorizedTags().others.includes(f)
        )

        // Jika ada filter kategori, post harus cocok dengan kategori
        if (categoryFilters.length > 0 && !categoryFilters.includes(postCategory)) {
          return false
        }

        // Jika ada filter tag lain, post harus memiliki setidaknya satu tag yang cocok
        if (otherTagFilters.length > 0 && !otherTagFilters.some(filter => postTags.includes(filter))) {
          return false
        }
      }

      return true
    })

    // Urutkan posts
    return filtered.sort((a, b) => {
      switch (sortBy()) {
        case "date":
          const dateA = a.data.date instanceof Date ? a.data.date : new Date(a.data.date || 0)
          const dateB = b.data.date instanceof Date ? b.data.date : new Date(b.data.date || 0)
          return dateB.getTime() - dateA.getTime()
        case "name":
          return a.data.title.localeCompare(b.data.title, undefined, { numeric: true })
        case "popularity":
          const viewsA = a.data.views || 0
          const viewsB = b.data.views || 0
          return viewsB - viewsA || new Date(b.data.date ?? 0).getTime() - new Date(a.data.date ?? 0).getTime()
        default:
          return 0
      }
    })
  })

  // Paginasi posts
  const paginatedPosts = createMemo(() => {
    const start = (currentPage() - 1) * postsPerPage;
    const end = start + postsPerPage;
    return filteredAndSortedPosts().slice(start, end);
  });

  const totalPages = createMemo(() => {
    return Math.ceil(filteredAndSortedPosts().length / postsPerPage);
  });

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
    setCurrentPage(1) // Reset halaman saat filter berubah
    closeAllDropdowns() // Close dropdown after selection
  }

  // Hapus semua filter
  const clearFilters = () => {
    setActiveFilters(new Set<string>())
    setActiveCategories(new Set<string>())
    setSearchQuery('')
    setCurrentPage(1) // Reset halaman saat filter dihapus
  }

  // Tutup semua dropdown
  const closeAllDropdowns = () => {
    setIsLanguageOpen(false)
    setIsFrameworkOpen(false)
    setIsCategoryOpen(false)
    setIsOtherOpen(false)
  }

  // Dapatkan jumlah filter aktif
  const getActiveFilterCount = () => {
    return activeFilters().size
  }

  // Komponen Dropdown Desktop
  const FilterDropdown = (props: {
    title: string
    isOpen: boolean
    onToggle: () => void
    items: string[]
    activeItems: Set<string>
    onItemToggle: (item: string) => void
  }) => (
    <div class="relative">
      <button
        onClick={(e) => {
          e.stopPropagation(); // Mencegah klik menyebar ke document
          props.onToggle();
        }}
        class={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md transition-colors",
          "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
          "hover:bg-gray-50 dark:hover:bg-gray-700",
          props.isOpen && "border-blue-500 ring-1 ring-blue-500"
        )}
      >
        <span>{props.title}</span>
        <Show when={Array.from(props.activeItems).filter(item => props.items.includes(item)).length > 0}>
          <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
            {Array.from(props.activeItems).filter(item => props.items.includes(item)).length}
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
                    {item}
                  </span>
                </label>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )

  // Bottom Sheet Mobile
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
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Filter Posts</h3>
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
            <Show when={categorizedTags().categories.length > 0}>
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
                <Show when={categorizedTags().categories.some(cat => activeFilters().has(cat))}>
                  <span class="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded-full">
                    {categorizedTags().categories.filter(cat => activeFilters().has(cat)).length}
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
              <For each={categorizedTags().categories}>
                {(category) => (
                  <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters().has(category)}
                      onChange={() => toggleFilter(category)}
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

  // Chips filter aktif
  const FilterChips = () => {
    const allActiveFilters = () => [
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
                    toggleFilter(filter.value)
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

  // Klik di luar untuk menutup dropdown
  const handleDocumentClick = (e: Event) => {
    const target = e.target as Element
    if (!target?.closest?.('.relative')) {
      closeAllDropdowns()
    }
  }

  // Tambahkan event listener untuk klik di luar (hanya saat mount)
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
            placeholder="Find a post..."
            onInput={(e) => setSearchDebounced(e.currentTarget.value)}
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Desktop Filters */}
      <div class="mb-6 hidden md:block">
        <div class="flex flex-wrap gap-3 items-center">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>

          <Show when={categorizedTags().categories.length > 0}>
            <FilterDropdown
              title="Category"
              isOpen={isCategoryOpen()}
              onToggle={() => {
                closeAllDropdowns()
                setIsCategoryOpen(!isCategoryOpen())
              }}
              items={categorizedTags().categories}
              activeItems={activeFilters()}
              onItemToggle={toggleFilter}
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
            {/* Sort */}
            <div class="relative ml-auto">
            <select
              value={sortBy()}
              onChange={(e) => {
                setSortBy(e.currentTarget.value as SortType);
                setCurrentPage(1); // Reset halaman saat sort berubah
              }}
              class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="popularity">Sort by Popularity</option>
            </select>
          </div>
        </div>

        {/* Chips Filter Aktif */}
        <FilterChips />

        {/* Penghitung Hasil */}
        <div class="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            {filteredAndSortedPosts().length} {filteredAndSortedPosts().length === 1 ? 'post' : 'posts'}
          </span>
        </div>
      </div>

      {/* Tombol Filter Mobile & Hasil */}
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
            {filteredAndSortedPosts().length} {filteredAndSortedPosts().length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {/* Chips Filter Aktif untuk Mobile */}
        <FilterChips />
      </div>

      {/* Grid Posts */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={paginatedPosts()}>
          {(post) => (
            <ArrowCard entry={post} pill={true} />
          )}
        </For>
      </div>

      {/* Tidak Ada Hasil */}
      <Show when={filteredAndSortedPosts().length === 0}>
        <div class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Tidak ada posts ditemukan</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Kami tidak dapat menemukan posts yang sesuai dengan filter Anda.
          </p>
          <button
            onClick={clearFilters}
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Hapus filter
          </button>
        </div>
      </Show>

      {/* Kontrol Paginasi */}
      <Show when={totalPages() > 1}>
        <div class="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            class={cn(
              "px-4 py-2 rounded border text-sm font-medium transition-colors",
              currentPage() <= 1 ? 'pointer-events-none opacity-50 bg-gray-100 dark:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            )}
            disabled={currentPage() <= 1}
          >
            Prev
          </button>
          <span class="mx-2 text-gray-500 dark:text-gray-400">Page {currentPage()} of {totalPages()}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages(), prev + 1))}
            class={cn(
              "px-4 py-2 rounded border text-sm font-medium transition-colors",
              currentPage() >= totalPages() ? 'pointer-events-none opacity-50 bg-gray-100 dark:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            )}
            disabled={currentPage() >= totalPages()}
          >
            Next
          </button>
        </div>
      </Show>

      {/* Bottom Sheet */}
      <BottomSheet />
    </div>
  )
}