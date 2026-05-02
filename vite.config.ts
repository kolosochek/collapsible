import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "playground",
  base: "/collapsible/",
  build: {
    outDir: "../playground-dist",
    emptyOutDir: true,
  },
  server: { port: 5173, open: true },
});
