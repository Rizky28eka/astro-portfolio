import { createSignal } from "solid-js"

type CounterProps = {
  initialCount?: number
}

function CounterButton({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = createSignal<number>(initialCount)

  const increment = () => setCount(count() + 1)

  return (
    <div class="flex gap-4 items-center">
      <button 
        onClick={increment} 
        class="px-3 py-1 border border-black/25 dark:border-white/25 hover:bg-black/5 dark:hover:bg-white/15 blend"
        aria-label="Increment counter"
      >
        Increment
      </button>
      <div aria-live="polite">
        Clicked {count()} {count() === 1 ? "time" : "times"}
      </div>
    </div>
  )
}

export default CounterButton
