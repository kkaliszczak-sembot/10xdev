// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";
import vue from '@astrojs/vue';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Enable server-side rendering for all pages by default
  output: 'server',
  env: {
    schema: {
      PUBLIC_SUPABASE_URL: envField.string({ context: "client", access: "public" }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({ context: "client", access: "public" }),
      OPEN_ROUTER_KEY: envField.string({ context: "server", access: "secret" }),
    }
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [vue()],
  adapter: cloudflare()
});