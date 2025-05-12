// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";
import vue from '@astrojs/vue';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Enable server-side rendering for all pages by default
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [vue()],
  adapter: cloudflare()
});