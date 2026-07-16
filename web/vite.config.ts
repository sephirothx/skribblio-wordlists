import { defineConfig } from "vite";

// GitHub Pages serves this project from https://<user>.github.io/skribblio-wordlists/,
// so all asset URLs need to be prefixed with the repository name.
export default defineConfig({
  base: "/skribblio-wordlists/",
});
