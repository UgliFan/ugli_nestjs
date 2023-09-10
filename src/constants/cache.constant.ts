export enum CacheKeys {
  AllUsers = 'all-users',
  Archive = 'archive',
  AllTags = 'all-tags',
  HottestArticles = 'hottest-articles',
  TodayViewCount = 'today-view-count',
}

export const getDecoratorCacheKey = (key: string) => {
  return `decorator:${key}`;
};

export const getDisqusCacheKey = (key: string) => {
  return `disqus:${key}`;
};
