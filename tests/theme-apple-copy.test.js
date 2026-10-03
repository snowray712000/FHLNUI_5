// index/theme/apple-color-ios.css 是 @fhlnet/color-apple 的複本 (npm run gen:theme)，要與已安裝的版本一致 (docs/z261003b)
import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '..')
const PKG = path.join(ROOT, 'node_modules/@fhlnet/color-apple')

test.skipIf(!fs.existsSync(PKG))('apple-color-ios.css 與 node_modules 的版本、內容一致', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8'))
    const copy = fs.readFileSync(path.join(ROOT, 'index/theme/apple-color-ios.css'), 'utf8')
    const src = fs.readFileSync(path.join(PKG, 'dist/apple-color-ios.css'), 'utf8').replace(/\/\*\$vite\$:\d+\*\/\s*$/, '').trimEnd()
    expect(copy.split('\n')[0]).toBe(`/* ${pkg.name} ${pkg.version} dist/apple-color-ios.css`)
    expect(copy.includes(src)).toBe(true)
})
