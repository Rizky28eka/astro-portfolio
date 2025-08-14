import { For, createSignal, createMemo } from 'solid-js';
import CertificateModal from '@components/ui/CertificateModal';

interface Achievement {
  title: string;
  provider: string;
  year?: string;
  certificate?: string;
  slug: string;
}

interface AchievementFilterableListProps {
  achievements: Achievement[];
  uniqueProviders: string[];
}

export default function AchievementFilterableList(props: AchievementFilterableListProps) {
  const [sortOrder, setSortOrder] = createSignal('desc');
  const [providerFilter, setProviderFilter] = createSignal('all');
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [currentCertificateUrl, setCurrentCertificateUrl] = createSignal('');

  const openModal = (e: MouseEvent, url: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    setCurrentCertificateUrl(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCertificateUrl('');
  };

  const filteredAndSortedAchievements = createMemo(() => {
    let filtered = props.achievements;
    if (providerFilter() !== 'all') {
      filtered = filtered.filter(a => a.provider === providerFilter());
    }

    return [...filtered].sort((a, b) => {
      const yearA = parseInt(a.year || '0');
      const yearB = parseInt(b.year || '0');
      if (sortOrder() === 'asc') {
        return yearA - yearB;
      } else {
        return yearB - yearA;
      }
    });
  });

  return (
    <>
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 relative z-10">
        <div class="mb-4 md:mb-0">
          <label for="sort-by-year" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort by Year:</label>
          <select
            id="sort-by-year"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onchange={(e: Event) => {
              const value = (e.target as HTMLSelectElement).value;
              if (value === 'asc') {
                setSortOrder('asc');
              } else {
                setSortOrder('desc');
              }
            }}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <div>
          <label for="filter-by-provider" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Provider:</label>
          <select
            id="filter-by-provider"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onchange={(e: Event) => setProviderFilter((e.target as HTMLSelectElement).value)}
          >
            <option value="all">All Providers</option>
            {
              props.uniqueProviders.map(provider => (
                <option value={provider}>{provider}</option>
              ))
            }
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 relative z-10">
        <For each={filteredAndSortedAchievements()}>
          {(achievement) => (
            <a
              href={`/achievements/${achievement.slug}`}
              class="block p-4 md:p-6 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 relative"
            >
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
              {achievement.certificate && (
                <button 
                  onClick={(e) => openModal(e, achievement.certificate!)}
                  class="absolute top-2 right-2 p-1.5 rounded-full bg-gray-200/50 dark:bg-gray-900/50 hover:bg-gray-300/70 dark:hover:bg-gray-700/70 transition-colors"
                  aria-label="View Certificate"
                >
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='stroke-gray-700 dark:stroke-gray-300'><path d='M12 12s3-4 6-4 6 4 6 4-3 4-6 4-6-4-6-4z'/><path d='M2 12s3-4 6-4 6 4 6 4-3 4-6 4-6-4-6-4z'/><circle cx='12' cy='12' r='3'/></svg>
                </button>
              )}
            </a>
          )}
        </For>
      </div>

      <CertificateModal
        isOpen={isModalOpen()}
        onClose={closeModal}
        certificateUrl={currentCertificateUrl()}
      />
    </>
  );
}