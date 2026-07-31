import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tá Passando",
    short_name: "Tá Passando",
    description: "Comércio do bairro em movimento.",
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
