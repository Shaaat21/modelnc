import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const distDir = join(rootDir, 'dist')
const indexPath = join(distDir, 'index.html')

if (existsSync(indexPath)) {
  copyFileSync(indexPath, join(distDir, '404.html'))
  writeFileSync(join(distDir, '.nojekyll'), '')
} else {
  mkdirSync(distDir, { recursive: true })
}
