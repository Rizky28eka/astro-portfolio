import type { CollectionEntry } from "astro:content"
import { createEffect, createSignal, For, Show } from "solid-js"
import ArrowCard from "@components/ui/ArrowCard"
import { cn } from "@lib/utils"

type Props = {
  tags: string[]
  data: CollectionEntry<"blog">[]
}

// List of framework tags
const FRAMEWORK_TAGS = ['flutter', 'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'astro']

export default function Blog({ data, tags }: Props) {
  const [frameworkFilter, setFrameworkFilter] = createSignal<Set<string>>(new Set())
  const [otherFilter, setOtherFilter] = createSignal<Set<string>>(new Set())
  const [showOtherTags, setShowOtherTags] = createSignal(false)
  const [posts, setPosts] = createSignal<CollectionEntry<"blog">[]>([])

  // Separate framework tags from other tags
  const frameworkTags = tags.filter(tag => FRAMEWORK_TAGS.includes(tag.toLowerCase()))
  const otherTags = tags.filter(tag => !FRAMEWORK_TAGS.includes(tag.toLowerCase()))

  createEffect(() => {
    setPosts(data.filter((entry) => {
      // If no filters are active, show all posts
      if (frameworkFilter().size === 0 && otherFilter().size === 0) {
        return true
      }

      // Check if entry has any of the selected framework tags
      const hasFramework = frameworkFilter().size === 0 || 
        entry.data.tags?.some(tag => 
          Array.from(frameworkFilter()).some(framework => 
            tag.toLowerCase() === framework.toLowerCase()
          )
        )

      // Check if entry has any of the selected other tags
      const hasOther = otherFilter().size === 0 || 
        entry.data.tags?.some(tag => 
          Array.from(otherFilter()).some(other => 
            tag.toLowerCase() === other.toLowerCase()
          )
        )

      return hasFramework && hasOther
    }))
  })

  function toggleFrameworkTag(tag: string) {
    setFrameworkFilter((prev) => 
      new Set(prev.has(tag) 
        ? [...prev].filter((t) => t !== tag) 
        : [...prev, tag]
      )
    )
  }

  function toggleOtherTag(tag: string) {
    setOtherFilter((prev) => 
      new Set(prev.has(tag) 
        ? [...prev].filter((t) => t !== tag) 
        : [...prev, tag]
      )
    )
  }

  function clearFilters() {
    setFrameworkFilter(new Set<string>())
    setOtherFilter(new Set<string>())
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="col-span-3 sm:col-span-1">
        <div class="sticky top-24">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-semibold uppercase text-black dark:text-white">Filter by Framework</div>
            {(frameworkFilter().size > 0 || otherFilter().size > 0) && (
              <button 
                onClick={clearFilters}
                class="text-xs text-black/50 dark:text-white/50 hover:text-black hover:dark:text-white transition-colors duration-300"
              >
                Clear all
              </button>
            )}
          </div>

          {frameworkTags.length > 0 ? (
            <ul class="flex flex-wrap sm:flex-col gap-1.5 mb-4">
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
          ) : (
            <p class="text-sm text-black/50 dark:text-white/50 mb-4">No framework tags available</p>
          )}

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
      <div class="col-span-3 sm:col-span-2">
        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm uppercase">
              {posts().length} {posts().length === 1 ? 'POST' : 'POSTS'} FOUND
            </div>
            {(frameworkFilter().size > 0 || otherFilter().size > 0) && (
              <div class="text-sm text-black/50 dark:text-white/50">
                {frameworkFilter().size > 0 && `${frameworkFilter().size} framework${frameworkFilter().size > 1 ? 's' : ''}`}
                {frameworkFilter().size > 0 && otherFilter().size > 0 && ' + '}
                {otherFilter().size > 0 && `${otherFilter().size} other tag${otherFilter().size > 1 ? 's' : ''}`}
              </div>
            )}
          </div>
          {posts().length > 0 ? (
            <ul class="flex flex-col gap-3">
              {posts().map((post) => (
                <li>
                  <ArrowCard entry={post} />
                </li>
              ))}
            </ul>
          ) : (
            <div class="text-center py-12">
              <p class="text-black/50 dark:text-white/50">
                No posts found matching the selected filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
