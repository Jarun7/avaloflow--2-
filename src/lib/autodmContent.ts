export type ContentType = 'post' | 'reel' | 'story' | 'live';

export interface ContentItem {
  id: string;
  type: ContentType;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  date: string;
}

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  post: 'Post',
  reel: 'Reel',
  story: 'Story',
  live: 'Live',
};

export const MOCK_POSTS_REELS: ContentItem[] = [
  {
    id: 'pr1',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&q=80',
    caption: '✨ Your piping tip matters more than you think! 🎂💜 Ever wondered why your buttercream flowers don\'t look like the ones in tutorials?',
    likes: 3400,
    comments: 210,
    date: 'July 17th',
  },
  {
    id: 'pr2',
    type: 'post',
    thumbnail: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    caption: '❤️🍓 The dessert that looks like it belongs in a French patisserie — Red Berry Tartlets.',
    likes: 5200,
    comments: 384,
    date: 'July 17th',
  },
  {
    id: 'pr3',
    type: 'post',
    thumbnail: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&q=80',
    caption: '🍋 The Ultimate Lemon Tart Recipe is HERE! ✨ Crispy shell, silky curd.',
    likes: 8900,
    comments: 612,
    date: 'July 16th',
  },
  {
    id: 'pr4',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&q=80',
    caption: '✨ EGGLESS & BUTTER-FREE LEMON BLUEBERRY CRUMBLE — comment "CRUMBLE" for the recipe!',
    likes: 2100,
    comments: 145,
    date: 'May 23rd',
  },
];

export const MOCK_STORIES: ContentItem[] = [
  {
    id: 's1',
    type: 'story',
    thumbnail: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&q=80',
    caption: '⏰ 24hr only — reply "DEAL" to get the exclusive link 🔥',
    likes: 1200,
    comments: 87,
    date: '18 hours ago',
  },
  {
    id: 's2',
    type: 'story',
    thumbnail: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80',
    caption: 'Swipe up or reply "MENU" for the full menu ✨',
    likes: 640,
    comments: 52,
    date: '1 day ago',
  },
];

export const MOCK_LIVES: ContentItem[] = [
  {
    id: 'l1',
    type: 'live',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    caption: 'LIVE: Baking Q&A — comment "RECIPE" and I\'ll DM it to you 🔴',
    likes: 940,
    comments: 301,
    date: 'Streamed July 12th',
  },
];
