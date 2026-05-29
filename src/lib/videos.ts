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
    title: "Big Buck Bunny",
    description: "Open-source short. Cheap unlock to test happy-path agent flow.",
    priceUSDC: "0.02",
    durationSec: 10,
    poster: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  },
  {
    id: "sintel-teaser",
    title: "Sintel",
    description: "Mid-priced unlock. Within default per-tx cap.",
    priceUSDC: "0.08",
    durationSec: 10,
    poster: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg",
    src: "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4",
  },
  {
    id: "tears-of-steel-feature",
    title: "Jellyfish — Premium",
    description: "Above default per-tx cap → triggers human approval.",
    priceUSDC: "0.50",
    durationSec: 10,
    poster: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Jellyfish-Bosporus-istanbul.JPG",
    src: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
  },
];

export const MERCHANT_ADDRESS = "0xMerch4020VideoPay9aF1c2e7";
