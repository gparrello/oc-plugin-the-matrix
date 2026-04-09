import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const distDir = join(rootDir, "dist")

const assets = [
  "matrix-console.json",
  "matrix-console-opaque.json",
  "matrix-console-cyan.json",
  "matrix-console-cyan-opaque.json",
  "matrix-console-blue.json",
  "matrix-console-blue-opaque.json",
  "matrix-console-purple.json",
  "matrix-console-purple-opaque.json",
  "matrix-console-amber.json",
  "matrix-console-amber-opaque.json",
  "matrix-console-yellow.json",
  "matrix-console-yellow-opaque.json",
  "matrix-console-pink.json",
  "matrix-console-pink-opaque.json",
  "matrix-console-red.json",
  "matrix-console-red-opaque.json",
]

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

for (const asset of assets) {
  cpSync(join(rootDir, asset), join(distDir, asset))
}

for (const stale of ["index.d.ts", "index.js.map"]) {
  const target = join(distDir, stale)
  if (existsSync(target)) rmSync(target)
}
