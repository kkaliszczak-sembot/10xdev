// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable server-side rendering for all pages by default
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [vue()]
});