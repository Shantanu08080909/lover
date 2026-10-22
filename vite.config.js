import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base: './'` makes the build work from any sub-path, so the same output
// deploys to GitHub Pages (/lover/), Vercel, Netlify or a custom domain.
export default defineConfig({
  base: './',
  plugins: [react()],
})
