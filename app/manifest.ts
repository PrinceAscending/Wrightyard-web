import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wrightyard",
    short_name: "Wrightyard",
    description:
      "A software studio for Discord and Telegram bots, websites, and managed hosting. Built here. Kept running.",
    start_url: "/",
    display: "standalone",
    background_color: "#f0e7d3",
    theme_color: "#f0e7d3",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
