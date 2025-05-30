import { createSignal, Show, For } from "solid-js"
import { cn } from "@lib/utils"

type Props = {
  availableYears: number[]
  currentFilter: string | null
  onFilterChange: (value: string | null) => void
}

const DATE_FILTER_OPTIONS = [
  { value: 'last-week', label: 'Last week', days: 7 },
  { value: 'last-month', label: 'Last month', days: 30 },
  { value: 'last-3-months', label: 'Last 3 months', days: 90 },
  { value: 'last-6-months', label: 'Last 6 months', days: 180 },
  { value: 'last-year', label: 'Last year', days: 365 }
] as const

export default function DateFilter(props: Props) {
  const [showFilter, setShowFilter] = createSignal(false)

  const handleOutsideClick = (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('.date-filter-dropdown')) {
      setShowFilter(false)
    }
  }

  const getCurrentLabel = () => {
    const current = props.currentFilter
    if (!current) return 'All time'
    
    if (/^\d{4}$/.test(current)) {
      return current
    }
    
    const option = DATE_FILTER_OPTIONS.find(opt => opt.value === current)
    return option ? option.label : 'All time'
  }

  return (
    <div class="mb-6">
      <h3 class="text-sm font-semibold uppercase text-black dark:text-white mb-2">
        Date
      </h3>
      <div class="relative date-filter-dropdown">
        <button 
          onClick={() => setShowFilter(!showFilter())}
          class={cn(
            "w-full px-3 py-2 rounded border border-black/20 dark:border-white/20",
            "bg-white dark:bg-black",
            "hover:border-black/30 hover:dark:border-white/30",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
            "transition-all duration-300 ease-in-out",
            "flex items-center justify-between text-left",
            props.currentFilter && "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20"
          )}
          aria-expanded={showFilter()}
          aria-haspopup="true"
        >
          <div class="flex items-center gap-2">
            <svg class="size-4 fill-black/50 dark:fill-white/50">
              <use href="/ui.svg#calendar" />
            </svg>
            <span class="text-sm">{getCurrentLabel()}</span>
          </div>
          <svg class={cn(
            "size-4 transition-transform duration-300 fill-black/50 dark:fill-white/50",
            showFilter() && "rotate-180"
          )}>
            <use href="/ui.svg#chevron-down" />
          </svg>
        </button>

        <Show when={showFilter()}>
          <div class="absolute z-20 w-full mt-1 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded shadow-lg max-h-64 overflow-y-auto">
            <div class="p-2 space-y-1">
              {/* All time option */}
              <button
                onClick={() => {
                  props.onFilterChange(null)
                  setShowFilter(false)
                }}
                class={cn(
                  "w-full px-3 py-2 rounded text-left text-sm",
                  "hover:bg-black/5 hover:dark:bg-white/10",
                  "focus:outline-none focus:bg-black/5 focus:dark:bg-white/10",
                  "transition-colors duration-200",
                  !props.currentFilter && "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                )}
              >
                All time
              </button>
              
              {/* Separator */}
              <hr class="border-black/10 dark:border-white/10 my-2" />
              
              {/* Relative date options */}
              <div class="space-y-1">
                <div class="px-3 py-1 text-xs font-medium text-black/50 dark:text-white/50 uppercase">
                  Recent
                </div>
                <For each={DATE_FILTER_OPTIONS}>
                  {(option) => (
                    <button
                      onClick={() => {
                        props.onFilterChange(option.value)
                        setShowFilter(false)
                      }}
                      class={cn(
                        "w-full px-3 py-2 rounded text-left text-sm",
                        "hover:bg-black/5 hover:dark:bg-white/10",
                        "focus:outline-none focus:bg-black/5 focus:dark:bg-white/10",
                        "transition-colors duration-200",
                        props.currentFilter === option.value && "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {option.label}
                    </button>
                  )}
                </For>
              </div>

              {/* Year options */}
              <Show when={props.availableYears.length > 0}>
                <hr class="border-black/10 dark:border-white/10 my-2" />
                <div class="space-y-1">
                  <div class="px-3 py-1 text-xs font-medium text-black/50 dark:text-white/50 uppercase">
                    By Year
                  </div>
                  <For each={props.availableYears}>
                    {(year) => (
                      <button
                        onClick={() => {
                          props.onFilterChange(year.toString())
                          setShowFilter(false)
                        }}
                        class={cn(
                          "w-full px-3 py-2 rounded text-left text-sm",
                          "hover:bg-black/5 hover:dark:bg-white/10",
                          "focus:outline-none focus:bg-black/5 focus:dark:bg-white/10",
                          "transition-colors duration-200",
                          props.currentFilter === year.toString() && "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {year}
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
} 