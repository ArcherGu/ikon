import { join } from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      script: {
        defineModel: true,
      },
    }),
    UnoCss(),
    Icons(),
    Components({
      resolvers: [
        IconsResolver(),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@src': join(__dirname, './src'),
    },
  },
})
