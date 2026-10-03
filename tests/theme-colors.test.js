// 主題 (docs/z261003b)：顏色只在 index/theme/ 由 Apple 色票定義，其他 css / js 只用語意變數。
// 這裡掃 css 的宣告值與 js 裡的 css 字串，出現 #hex、rgb()、hsl()、顏色名稱就失敗，避免之後又寫死顏色。
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '..')

// CSS 的 148 個顏色名稱 (transparent、currentColor、inherit 不算)
const NAMED = 'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(' ')
const COLOR = new RegExp(String.raw`#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![\w-])(?:${NAMED.join('|')})(?![\w-])`, 'i')

/** 拿掉註解、var(...) 的名稱 (例 var(--red-fg))、url(...)、字串，剩下的才是「值」 */
const clean = v => v
    .replace(/url\([^)]*\)/g, '')
    .replace(/var\(--[\w-]+/g, 'var(')
    .replace(/(["']).*?\1/g, '')

/** css 文字 → [行號, 屬性, 值] (不看選擇器，例 [style*="rgb(195,39,43)"] 是比對資料用的) */
function declarations(css) {
    css = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    const re = []
    let line = 1, buf = '', bufLine = 1
    for (const c of css) {
        if (c == '{' || c == '}' || c == ';') {
            const m = buf.match(/^\s*([-\w]+)\s*:([\s\S]*)$/)
            if (c != '{' && m) re.push([bufLine, m[1], m[2].trim()])
            buf = ''
        } else {
            if (buf.trim() == '' && c.trim() != '') bufLine = line
            buf += c
        }
        if (c == '\n') line++
    }
    return re
}
/** 有顏色的屬性 (font-family 等不看，避免字型名稱誤判) */
const isColorProp = p => p.startsWith('--') || /color|background|border|outline|shadow|fill|stroke|caret|text-decoration|column-rule|filter/.test(p)

/** 允許的地方：Apple 色票本身、語意變數定義 */
const ALLOW_CSS = new Set(['index/theme/apple-color-ios.css'])
const CSS_FILES = [
    'index/fhl.css', 'index/bs4-compat.css', 'index/Search.css', 'index/AudioBible.css', 'index/version-infos-dialog.css',
    'index/theme/theme-vars.css', 'index/theme/theme-3rd.css',
    'static/ob_api/ob_api.css', 'static/ob_api/ob_table.css',
    'libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.css', 'libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.min.css',
]

describe('css 只用語意變數', () => {
    test.each(CSS_FILES)('%s', f => {
        const css = fs.readFileSync(path.join(ROOT, f), 'utf8')
        const bad = declarations(css)
            .filter(([, p, v]) => isColorProp(p) && COLOR.test(clean(v)))
            .map(([n, p, v]) => `${f}:${n} ${p}: ${v}`)
        expect(bad).toEqual([])
    })
    test('theme-vars.css 的語意變數只用 Apple 色票', () => {
        const css = fs.readFileSync(path.join(ROOT, 'index/theme/theme-vars.css'), 'utf8')
        expect(declarations(css).filter(([, , v]) => COLOR.test(clean(v)))).toEqual([])
    })
})

// js：只看「像 css 的字串」裡的顏色：color: xxx、background: xxx、.css('color', xxx)、{ color: 'xxx' }
const JS_DIRS = ['index', 'static/fhlmap_api', 'static/ob_api', 'static/search_api', 'libs/ijnjs-ui', 'libs/ijnjs-fhl']
/** 顏色是資料本身 (解析用的 regex、型別說明)，不是設定畫面的顏色 */
const ALLOW_JS = new Set(['index/AddParenthesesUnvNcv.js', 'index/cvt_others.js', 'index/DText.js', 'index/DTextBackup.ts'])
const walk = d => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(d, e.name)) : /\.js$/.test(e.name) && !/\.min\.js$/.test(e.name) ? [path.join(d, e.name).split(path.sep).join('/')] : [])

describe('js 不寫死顏色', () => {
    const files = JS_DIRS.flatMap(walk).filter(f => !ALLOW_JS.has(f) && !f.includes('/theme/'))
    test.each(files)('%s', f => {
        const src = fs.readFileSync(path.join(ROOT, f), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map(l => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')) // 行尾註解 (不碰 http://)
        const bad = []
        src.forEach((l, i) => {
            const decl = /(?:color|background(?:-color)?|border(?:-[a-z]+)?|fill|stroke)['"]?\s*[:,]\s*['"`]?([^;'"`]*)/gi
            const isBad = [...l.matchAll(decl)].some(m => COLOR.test(clean(m[1])))
                || /(['"`])#[0-9a-f]{3}(?:[0-9a-f]{3})?(?:[0-9a-f]{2})?\1/i.test(l) // 當參數傳的顏色，例 label_range(…, '#ffff99')
            if (isBad) bad.push(`${f}:${i + 1} ${l.trim().slice(0, 120)}`)
        })
        expect(bad).toEqual([])
    })
})
