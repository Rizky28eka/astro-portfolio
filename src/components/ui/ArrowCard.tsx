import { formatDate } from "@lib/utils"
import type { CollectionEntry } from "astro:content"

type Props = {
  entry: CollectionEntry<"blog"> | CollectionEntry<"projects">
  pill?: boolean
}

export default function ArrowCard({ entry, pill }: Props) {
  return (
    <a 
      href={`/${entry.collection}/${entry.slug}`} 
      class="group relative p-6 gap-3 flex flex-col items-start border rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 hover:border-purple-500/50 dark:hover:border-purple-400/50 transition-all duration-300 ease-in-out w-full shadow-lg hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10"
      aria-label={`Read ${entry.data.title}`}
    >
      <div class="w-full">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          {pill && (
            <div class="text-xs capitalize px-2 py-0.5 rounded-full border border-purple-500/50 dark:border-purple-400/50 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
              {entry.collection === "blog" ? "post" : "project"}
            </div>
          )}
          <div class="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {formatDate(entry.data.date)}
          </div>
        </div>
        <div class="font-bold text-lg md:text-xl mt-1 mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {entry.data.title}
        </div>
        <div class="text-sm line-clamp-2 mb-2 text-gray-600 dark:text-gray-400">
          {entry.data.summary}
        </div>
        {entry.data.tags && entry.data.tags.length > 0 && (
          <ul class="flex flex-row flex-wrap mt-2 gap-2" role="list">
            {entry.data.tags.map((tag: string) => (
              <li 
                data-key={tag}
                class="text-[10px] md:text-xs uppercase py-0.5 px-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 tracking-wide border border-gray-200 dark:border-gray-700 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:border-purple-200 dark:group-hover:border-purple-800 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all duration-200"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="stroke-current text-gray-400 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 self-end transition-colors"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" class="scale-x-0 group-hover:scale-x-100 translate-x-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
        <polyline points="12 5 19 12 12 19" class="translate-x-0 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
      </svg>
    </a>
  )
}