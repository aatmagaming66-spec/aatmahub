import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AatmaHub",
    short_name: "AatmaHub",
    description: "Gaming Top-Up Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#080a0f",
    theme_color: "#080a0f",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
