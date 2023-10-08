export enum CacheKeys {
  AllRegions = 'all-regions',
  AllCategories = 'all-categories',
  AllTags = 'all-tags',
}

export const getDecoratorCacheKey = (key: string) => {
  return `decorator:${key}`;
};

export const getDisqusCacheKey = (key: string) => {
  return `disqus:${key}`;
};
