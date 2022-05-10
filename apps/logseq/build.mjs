#!/usr/bin/env zx
/* eslint-disable no-undef */
import 'zx/globals'
import fs from 'fs'

await $`rimraf dist`

// Build with [tsup](https://tsup.egoist.sh)
await $`tsup src/index.ts --format cjs --target es5`

// Prepare package.json file
const packageJson = fs.readFileSync('package.json', 'utf8')
const glob = JSON.parse(packageJson)
Object.assign(glob, {
  main: './index.js',
})

fs.writeFileSync('dist/package.json', JSON.stringify(glob, null, 2))

// copy another one for demo
// const genFolder = '../../cljs-demo/src/gen'
// await $`rimraf ${genFolder}/tldraw-logseq`
// await $`mkdir -p ${genFolder}/tldraw-logseq`
// await $`cp -r dist/* ${genFolder}/tldraw-logseq`
