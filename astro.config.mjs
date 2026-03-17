// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel"; // ← NEU

export default defineConfig({
  output: "server", // bereits vorhanden
  adapter: vercel(), // ← NEU
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
});
