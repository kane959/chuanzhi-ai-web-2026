import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

const requiredFiles = [
  'README.md',
  '.env.example',
  'prototype/package.json',
  'prototype/src/App.tsx',
  'prototype/src/data.ts',
  'docs/01-official-rules.md',
  'docs/04-architecture.md',
]

for (const file of requiredFiles) await access(file)

const app = await readFile('prototype/src/App.tsx', 'utf8')
const data = await readFile('prototype/src/data.ts', 'utf8')
for (const marker of ['生成我的行动计划', '导出清单', '打开原文定位', '演示模式只使用本地样例数据']) {
  assert.match(app, new RegExp(marker), `missing UI marker: ${marker}`)
}
for (const marker of ['Evidence', 'Task', 'E-03', 'E-05']) {
  assert.match(data, new RegExp(marker), `missing demo contract marker: ${marker}`)
}

console.log(`Smoke checks passed: ${requiredFiles.length} files and ${4 + 4} UI/data markers verified.`)
