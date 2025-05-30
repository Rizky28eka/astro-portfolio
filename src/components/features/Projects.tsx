import type { CollectionEntry } from "astro:content"
import { createEffect, createSignal, For, Show } from "solid-js"
import ArrowCard from "@components/ui/ArrowCard"
import { cn } from "@lib/utils"

type Props = {
  tags: string[]
  data: CollectionEntry<"projects">[]
}

// List of framework tags
const FRAMEWORK_TAGS = ['flutter', 'react', 'vue', 'angular', 'next', 'nuxt', 'astro'].map(tag => tag.toLowerCase())

// List of programming language tags
const LANGUAGE_TAGS = ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust'].map(tag => tag.toLowerCase())

export default function Projects({ data, tags }: Props) {
  const [frameworkFilter, setFrameworkFilter] = createSignal<Set<string>>(new Set())
  const [languageFilter, setLanguageFilter] = createSignal<Set<string>>(new Set())
  const [otherFilter, setOtherFilter] = createSignal<Set<string>>(new Set())
  const [showOtherTags, setShowOtherTags] = createSignal(false)
  const [projects, setProjects] = createSignal<CollectionEntry<"projects">[]>(data)

  // Separate tags into their respective categories
  const frameworkTags = tags.filter(tag => FRAMEWORK_TAGS.includes(tag.toLowerCase()))
  const languageTags = tags.filter(tag => LANGUAGE_TAGS.includes(tag.toLowerCase()))
  const otherTags = tags.filter(tag => 
    !FRAMEWORK_TAGS.includes(tag.toLowerCase()) && 
    !LANGUAGE_TAGS.includes(tag.toLowerCase())
  )

  createEffect(() => {
    const filteredProjects = data.filter((entry) => {
      // If no filters are active, show all projects
      if (frameworkFilter().size === 0 && languageFilter().size === 0 && otherFilter().size === 0) {
        return true
      }

      const projectTags = entry.data.tags?.map(tag => tag.toLowerCase()) || []

      // Check framework filter - if framework filter is active, project must have at least one selected framework
      const frameworkMatch = frameworkFilter().size === 0 || 
        Array.from(frameworkFilter()).some(framework => 
          projectTags.includes(framework.toLowerCase())
        )

      // Check language filter - if language filter is active, project must have at least one selected language
      const languageMatch = languageFilter().size === 0 || 
        Array.from(languageFilter()).some(language => 
          projectTags.includes(language.toLowerCase())
        )

      // Check other tags filter - if other filter is active, project must have at least one selected other tag
      const otherMatch = otherFilter().size === 0 || 
        Array.from(otherFilter()).some(other => 
          projectTags.includes(other.toLowerCase())
        )

      // Project must match ALL active filter categories (AND logic)
      return frameworkMatch && languageMatch && otherMatch
    })

    setProjects(filteredProjects)
  })

  function toggleFrameworkTag(tag: string) {
    setFrameworkFilter((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  function toggleLanguageTag(tag: string) {
    setLanguageFilter((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  function toggleOtherTag(tag: string) {
    setOtherFilter((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  function clearFilters() {
    setFrameworkFilter(new Set<string>())
    setLanguageFilter(new Set<string>())
    setOtherFilter(new Set<string>())
  }

  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return frameworkFilter().size > 0 || languageFilter().size > 0 || otherFilter().size > 0
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="col-span-3 sm:col-span-1">
        <div class="sticky top-24">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-semibold uppercase text-black dark:text-white">Filters</div>
            {hasActiveFilters() && (
              <button 
                onClick={clearFilters}
                class="text-xs text-black/50 dark:text-white/50 hover:text-black hover:dark:text-white transition-colors duration-300"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Framework Filters */}
          {frameworkTags.length > 0 && (
            <div class="mb-4">
              <div class="text-sm font-semibold uppercase text-black dark:text-white mb-2">Framework</div>
              <ul class="flex flex-wrap sm:flex-col gap-1.5">
                <For each={frameworkTags}>
                  {(tag) => (
                    <li>
                      <button 
                        onClick={() => toggleFrameworkTag(tag)} 
                        class={cn(
                          "w-full px-2 py-1 rounded",
                          "whitespace-nowrap overflow-hidden overflow-ellipsis",
                          "flex gap-2 items-center",
                          "bg-black/5 dark:bg-white/10",
                          "hover:bg-black/10 hover:dark:bg-white/15",
                          "transition-colors duration-300 ease-in-out",
                          frameworkFilter().has(tag) && "bg-black/10 dark:bg-white/20 text-black dark:text-white"
                        )}
                      >
                        <svg class={cn("size-5 fill-black/50 dark:fill-white/50", "transition-colors duration-300 ease-in-out", frameworkFilter().has(tag) && "fill-black dark:fill-white")}>
                          <use href={`/ui.svg#square`} class={cn(!frameworkFilter().has(tag) ? "block" : "hidden")} />
                          <use href={`/ui.svg#square-check`} class={cn(frameworkFilter().has(tag) ? "block" : "hidden")} />
                        </svg>
                        {tag}
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}

          {/* Language Filters */}
          {languageTags.length > 0 && (
            <div class="mb-4">
              <div class="text-sm font-semibold uppercase text-black dark:text-white mb-2">Language</div>
              <ul class="flex flex-wrap sm:flex-col gap-1.5">
                <For each={languageTags}>
                  {(tag) => (
                    <li>
                      <button 
                        onClick={() => toggleLanguageTag(tag)} 
                        class={cn(
                          "w-full px-2 py-1 rounded",
                          "whitespace-nowrap overflow-hidden overflow-ellipsis",
                          "flex gap-2 items-center",
                          "bg-black/5 dark:bg-white/10",
                          "hover:bg-black/10 hover:dark:bg-white/15",
                          "transition-colors duration-300 ease-in-out",
                          languageFilter().has(tag) && "bg-black/10 dark:bg-white/20 text-black dark:text-white"
                        )}
                      >
                        <svg class={cn("size-5 fill-black/50 dark:fill-white/50", "transition-colors duration-300 ease-in-out", languageFilter().has(tag) && "fill-black dark:fill-white")}>
                          <use href={`/ui.svg#square`} class={cn(!languageFilter().has(tag) ? "block" : "hidden")} />
                          <use href={`/ui.svg#square-check`} class={cn(languageFilter().has(tag) ? "block" : "hidden")} />
                        </svg>
                        {tag}
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}

          {/* Other Tags Filters */}
          {otherTags.length > 0 && (
            <div class="relative">
              <button 
                onClick={() => setShowOtherTags(!showOtherTags())}
                class={cn(
                  "w-full px-2 py-1 rounded flex items-center justify-between",
                  "bg-black/5 dark:bg-white/10",
                  "hover:bg-black/10 hover:dark:bg-white/15",
                  "transition-colors duration-300 ease-in-out",
                  otherFilter().size > 0 && "bg-black/10 dark:bg-white/20"
                )}
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold uppercase">Other Tags</span>
                  {otherFilter().size > 0 && (
                    <span class="text-xs px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/20">
                      {otherFilter().size}
                    </span>
                  )}
                </div>
                <svg class={cn("size-5 transition-transform duration-300", showOtherTags() && "rotate-180")}>
                  <use href="/ui.svg#chevron-down" />
                </svg>
              </button>

              <Show when={showOtherTags()}>
                <div class="absolute z-10 w-full mt-1 p-2 bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded shadow-lg max-h-60 overflow-y-auto">
                  <ul class="flex flex-col gap-1">
                    <For each={otherTags}>
                      {(tag) => (
                        <li>
                          <button 
                            onClick={() => toggleOtherTag(tag)} 
                            class={cn(
                              "w-full px-2 py-1 rounded text-left",
                              "whitespace-nowrap overflow-hidden overflow-ellipsis",
                              "flex gap-2 items-center",
                              "hover:bg-black/5 hover:dark:bg-white/10",
                              "transition-colors duration-300 ease-in-out",
                              otherFilter().has(tag) && "bg-black/10 dark:bg-white/20 text-black dark:text-white"
                            )}
                          >
                            <svg class={cn("size-5 fill-black/50 dark:fill-white/50", "transition-colors duration-300 ease-in-out", otherFilter().has(tag) && "fill-black dark:fill-white")}>
                              <use href={`/ui.svg#square`} class={cn(!otherFilter().has(tag) ? "block" : "hidden")} />
                              <use href={`/ui.svg#square-check`} class={cn(otherFilter().has(tag) ? "block" : "hidden")} />
                            </svg>
                            {tag}
                          </button>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </Show>
            </div>
          )}
        </div>
      </div>

      {/* Projects Display */}
      <div class="col-span-3 sm:col-span-2">
        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm uppercase font-semibold">
              {projects().length} {projects().length === 1 ? 'PROJECT' : 'PROJECTS'} FOUND
            </div>
            {hasActiveFilters() && (
              <div class="text-sm text-black/50 dark:text-white/50">
                {frameworkFilter().size > 0 && `${frameworkFilter().size} framework${frameworkFilter().size > 1 ? 's' : ''}`}
                {frameworkFilter().size > 0 && (languageFilter().size > 0 || otherFilter().size > 0) && ' + '}
                {languageFilter().size > 0 && `${languageFilter().size} language${languageFilter().size > 1 ? 's' : ''}`}
                {languageFilter().size > 0 && otherFilter().size > 0 && ' + '}
                {otherFilter().size > 0 && `${otherFilter().size} other tag${otherFilter().size > 1 ? 's' : ''}`}
              </div>
            )}
          </div>
          
          {projects().length > 0 ? (
            <ul class="flex flex-col gap-3">
              <For each={projects()}>
                {(project) => (
                  <li>
                    <ArrowCard entry={project} />
                  </li>
                )}
              </For>
            </ul>
          ) : (
            <div class="text-center py-12">
              <p class="text-black/50 dark:text-white/50 mb-2">
                No projects found matching the selected filters
              </p>
              {hasActiveFilters() && (
                <button 
                  onClick={clearFilters}
                  class="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}