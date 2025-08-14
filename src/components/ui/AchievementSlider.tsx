import { For, createSignal, createEffect } from 'solid-js';
import CertificateModal from '@components/ui/CertificateModal';

interface Achievement {
  title: string;
  provider: string;
  year?: string;
  certificate?: string; // Add certificate field
}

interface AchievementSliderProps {
  achievements: Achievement[];
}

export default function AchievementSlider(props: AchievementSliderProps) {
  let scrollContainerRef: HTMLDivElement | undefined;
  const [scrollPosition, setScrollPosition] = createSignal(0);
  const [maxScrollLeft, setMaxScrollLeft] = createSignal(0);
  const [currentSlideIndex, setCurrentSlideIndex] = createSignal(0);

  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [currentCertificateUrl, setCurrentCertificateUrl] = createSignal('');

  const openModal = (url: string) => {
    setCurrentCertificateUrl(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCertificateUrl('');
  };

  const scrollAmount = 300; // Adjust this value as needed

  const scrollLeft = () => {
    if (scrollContainerRef) {
      scrollContainerRef.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef) {
      scrollContainerRef.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const goToSlide = (index: number) => {
    if (scrollContainerRef) {
      const slideWidth = (scrollContainerRef.scrollWidth / props.achievements.length);
      scrollContainerRef.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    }
  };

  createEffect(() => {
    if (scrollContainerRef) {
      const handleScroll = () => {
        const newScrollPosition = scrollContainerRef?.scrollLeft || 0;
        setScrollPosition(newScrollPosition);
        setMaxScrollLeft((scrollContainerRef?.scrollWidth || 0) - (scrollContainerRef?.clientWidth || 0));

        // Calculate current slide index
        const slideWidth = (scrollContainerRef.scrollWidth / props.achievements.length);
        setCurrentSlideIndex(Math.round(newScrollPosition / slideWidth));
      };
      scrollContainerRef.addEventListener('scroll', handleScroll);
      // Initial calculation
      handleScroll();
      return () => {
        scrollContainerRef?.removeEventListener('scroll', handleScroll);
      };
    }
    return () => {}; // Always return a cleanup function
  });

  return (
    <div class="navigation-wrapper relative">
      <div
        ref={scrollContainerRef}
        class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        <For each={props.achievements}>
          {(achievement) => (
            <div
              class="flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/4 snap-center p-2"
              onClick={() => achievement.certificate && openModal(achievement.certificate)}
            >
              <div class="p-4 md:p-6 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div class="flex items-start gap-3">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base font-semibold mb-2 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
                      {achievement.title}
                    </h3>
                    <p class="text-blue-600 dark:text-blue-400 font-medium text-sm mb-1">
                      {achievement.provider}
                    </p>
                    {achievement.year && (
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        {achievement.year}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Navigation Buttons */}
      <div class="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 md:px-6 z-10">
        <button
          onClick={scrollLeft}
          disabled={scrollPosition() === 0}
          class="bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-gray-800 dark:text-gray-200">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={scrollRight}
          disabled={scrollPosition() >= maxScrollLeft()}
          class="bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-gray-800 dark:text-gray-200">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Indicators */}
      <div class="flex justify-center mt-4 space-x-2">
        <For each={props.achievements}>
          {(_, index) => (
            <button
              onClick={() => goToSlide(index())}
              class={`w-3 h-3 rounded-full ${currentSlideIndex() === index() ? 'bg-blue-500' : 'bg-gray-400'}`}
              aria-label={`Go to slide ${index() + 1}`}
            />
          )}
        </For>
      </div>

      <CertificateModal
        isOpen={isModalOpen()}
        onClose={closeModal}
        certificateUrl={currentCertificateUrl()}
      />
    </div>
  );
}
