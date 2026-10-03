// npm run gen:theme
// 把 @fhlnet/color-apple 的 dist/apple-color-ios.css 複製到 index/theme/apple-color-ios.css，檔頭記錄來源版本。
// 不直接從 node_modules 載入：原始碼不經 build 也要能跑 (伺服器上沒有 node_modules)，
// 而套件的 dist/index.js 第一行 import './apple-color-ios.css'，瀏覽器原生 module 不能 import css。
// 用法：node tools/gen_apple_color.mjs [套件資料夾]  (預設 node_modules/@fhlnet/color-apple)
import fs from 'node:fs'
import path from 'node:path'

const src = process.argv[2] ?? 'node_modules/@fhlnet/color-apple'
const pkg = JSON.parse(fs.readFileSync(path.join(src, 'package.json'), 'utf8'))
const css = fs.readFileSync(path.join(src, 'dist/apple-color-ios.css'), 'utf8').replace(/\/\*\$vite\$:\d+\*\/\s*$/, '').trimEnd()
const out = 'index/theme/apple-color-ios.css'
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, `/* ${pkg.name} ${pkg.version} dist/apple-color-ios.css
 * 由 npm run gen:theme (tools/gen_apple_color.mjs) 產生，不要手改；改色請改 index/theme/theme-vars.css */
${css}
`)
console.log(`${out} <- ${pkg.name}@${pkg.version}`)
