import { readFile } from 'node:fs/promises'

const files = ['prototype/src/App.tsx', 'prototype/src/data.ts', 'prototype/src/main.tsx']
const forbidden = [/MODEL_API_KEY\s*=\s*['\"][^'\"]+/i, /sk-[A-Za-z0-9_-]{20,}/]
let failed = false

for (const file of files) {
  const source = await readFile(file, 'utf8')
  for (const pattern of forbidden) {
    if (pattern.test(source)) {
      console.error(`Possible secret in ${file}: ${pattern}`)
      failed = true
    }
  }
}

if (failed) process.exit(1)
console.log(`Lint passed: ${files.length} source files scanned; no embedded provider secrets.`)
