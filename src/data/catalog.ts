export type ContentType = "movie" | "series" | "anime";
export type Language = "Hindi" | "English" | "Japanese";

export type ContentItem = {
  id: string;
  title: string;
  type: ContentType;
  language: Language;
  year: number;
  isFree: boolean;
  quality: "1080p" | "4K";
  thumbnail: string;
  videoUrl?: string;
};

export const catalog: ContentItem[] = [
  // MOVIES
  {
    id: "m1",
    title: "RG Action Movie (Free)",
    type: "movie",
    language: "Hindi",
    year: 2024,
    isFree: true,
    quality: "1080p",
    thumbnail: "/posters/poster1.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "m2",
    title: "City Crime (Premium)",
    type: "movie",
    language: "English",
    year: 2023,
    isFree: false,
    quality: "4K",
    thumbnail: "/posters/poster1.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },

  // SERIES
  {
    id: "s1",
    title: "Desi Drama S1 (Free)",
    type: "series",
    language: "Hindi",
    year: 2022,
    isFree: true,
    quality: "1080p",
    thumbnail: "/posters/poster1.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: "s2",
    title: "Global Mystery (Premium)",
    type: "series",
    language: "English",
    year: 2024,
    isFree: false,
    quality: "4K",
    thumbnail: "/posters/poster1.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  },

  // ANIME
  {
    id: "a1",
    title: "Neo Samurai (Free)",
    type: "anime",
    language: "Japanese",
    year: 2022,
    isFree: true,
    quality: "1080p",
    thumbnail: "/posters/poster1.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
  {
    id: "a2",
    title: "Galaxy Fighters (Premium)",
    type: "anime",
    language: "Japanese",
    year: 2024,
    isFree: false,
    quality: "4K",
    thumbnail: "/posters/poster1.jpg",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
];

