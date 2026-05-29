export type Video = {
  id: string;
  title: string;
  description: string;
  priceUSDC: string;
  durationSec: number;
  poster: string;
  src: string;
};

export const VIDEOS: Video[] = [
  {
    id: "bbb-trailer",
    title: "Big Buck Bunny — Trailer",
    description: "Open-source short. Cheap unlock to test happy-path agent flow.",
    priceUSDC: "0.02",
    durationSec: 33,
    poster: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
    src: "https://media.w3.org/2010/05/bunny/movie.mp4",
  },
  {
    id: "sintel-teaser",
    title: "Sintel — Teaser",
    description: "Mid-priced unlock. Within default per-tx cap.",
    priceUSDC: "0.08",
    durationSec: 99,
    poster: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg",
    src: "https://media.w3.org/2010/05/sintel/trailer.mp4",
  },
  {
    id: "tears-of-steel-feature",
    title: "Tears of Steel — Premium",
    description: "Above default per-tx cap → triggers human approval.",
    priceUSDC: "0.50",
    durationSec: 734,
    poster:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Tos-poster.png/640px-Tos-poster.png",
    src: "https://archive.org/download/Tears-of-Steel/tears_of_steel_720p.mp4",
  },
];

export const MERCHANT_ADDRESS = "0xMerch4020VideoPay9aF1c2e7";
