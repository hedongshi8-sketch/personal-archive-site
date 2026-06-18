import { realpathSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = realpathSync.native(process.cwd());

export default defineConfig({
  root: projectRoot,
  base: "./",
  plugins: [react()],
});
