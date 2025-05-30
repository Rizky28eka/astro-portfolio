import { createSignal, Show, createMemo } from "solid-js"
import { cn } from "@lib/utils"

type Props = {
  tags: string[]
  selectedTags: Set<string>
  onTagToggle: (tag: string) => void
  onClear: () => void
  selectedCategory: string | null
  posts: any[] // CollectionEntry<"blog">[]
}

const FilterButton = (props: {
  isActive: boolean
  onClick: () => void
  children: any
  class?: string
}) => (
  <button 
    onClick={props.onClick}
    class={cn(
      "w-full px-2 py-1 rounded text-left",
      "whitespace-nowrap overflow-hidden text-ellipsis",
      "flex gap-2 items-center",
      "bg-black/5 dark:bg-white/10",
      "hover:bg-black/10 hover:dark:bg-white/15",
      "transition-colors duration-300 ease-in-out",
      "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
      props.isActive && "bg-black/10 dark:bg-white/20 text-black dark:text-white",
      props.class
    )}
  >
    <svg class={cn(
      "size-5 fill-black/50 dark:fill-white/50", 
      "transition-colors duration-300 ease-in-out", 
      props.isActive && "fill-black dark:fill-white"
    )}>
      <use href={`/ui.svg#square${props.isActive ? '-check' : ''}`} />
    </svg>
    {props.children}
  </button>
)

export default function OtherTags(props: Props) {
  const [showTags, setShowTags] = createSignal(false)

  // Filter tags based on selected category
  const filteredTags = createMemo(() => {
    if (!props.selectedCategory) {
      return props.tags
    }

    // Get all posts from the selected category
    const categoryPosts = props.posts.filter(post => 
      post.slug.startsWith(props.selectedCategory!)
    )

    // Get all tags from these posts
    const categoryTags = new Set<string>()
    categoryPosts.forEach(post => {
      post.data.tags?.forEach((tag: string) => {
        categoryTags.add(tag)
      })
    })

    // Filter the tags to only show those that exist in the category posts
    return props.tags.filter(tag => categoryTags.has(tag))
  })

  const handleOutsideClick = (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('.other-tags-dropdown')) {
      setShowTags(false)
    }
  }

  return (
    <div class="relative other-tags-dropdown">
      <button 
        onClick={() => setShowTags(!showTags())}
        class={cn(
          "w-full px-2 py-1 rounded flex items-center justify-between",
          "bg-black/5 dark:bg-white/10",
          "hover:bg-black/10 hover:dark:bg-white/15",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          "transition-colors duration-300 ease-in-out",
          props.selectedTags.size > 0 && "bg-black/10 dark:bg-white/20"
        )}
        aria-expanded={showTags()}
        aria-haspopup="true"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold uppercase">Other Tags</span>
          <Show when={props.selectedTags.size > 0}>
            <span class="text-xs px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/20">
              {props.selectedTags.size}
            </span>
          </Show>
        </div>
        <svg class={cn(
          "size-5 transition-transform duration-300",
          showTags() && "rotate-180"
        )}>
          <use href="/ui.svg#chevron-down" />
        </svg>
      </button>

      <Show when={showTags()}>
        <div class="absolute z-10 w-full mt-1 p-2 bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded shadow-lg max-h-60 overflow-y-auto">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold uppercase text-black dark:text-white">
              {props.selectedCategory ? `${props.selectedCategory} Tags` : 'Select Tags'}
            </h3>
            <Show when={props.selectedTags.size > 0}>
              <button 
                onClick={props.onClear}
                class="text-xs text-black/50 dark:text-white/50 hover:text-black hover:dark:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1"
              >
                Clear all
              </button>
            </Show>
          </div>
          <Show 
            when={filteredTags().length > 0}
            fallback={
              <div class="text-sm text-black/50 dark:text-white/50 py-2 text-center">
                No tags available for this category
              </div>
            }
          >
            <ul class="flex flex-col gap-1">
              {filteredTags().map(tag => (
                <li>
                  <FilterButton
                    isActive={props.selectedTags.has(tag)}
                    onClick={() => props.onTagToggle(tag)}
                  >
                    {tag}
                  </FilterButton>
                </li>
              ))}
            </ul>
          </Show>
        </div>
      </Show>
    </div>
  )
} 