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
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "sintel-teaser",
    title: "Sintel — Teaser",
    description: "Mid-priced unlock. Within default per-tx cap.",
    priceUSDC: "0.08",
    durationSec: 52,
    poster: "https://durian.blender.org/wp-content/uploads/2010/05/sintel_poster.jpg",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
  {
    id: "tears-of-steel-feature",
    title: "Tears of Steel — Premium",
    description: "Above default per-tx cap → triggers human approval.",
    priceUSDC: "0.50",
    durationSec: 734,
    poster: "https://mango.blender.org/wp-content/gallery/4k-renders/01_thom_celia_bridge.jpg",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  },
];

export const MERCHANT_ADDRESS = "0xMerch4020VideoPay9aF1c2e7";
