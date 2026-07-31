import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TE Vi na TV",
    short_name: "TE Vi",
    description: "O vendedor do bairro perto de você.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#103f32",
    lang: "pt-BR",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
