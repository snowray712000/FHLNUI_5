import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// dev：取代 Live Server。大部分檔案仍是傳統全域 script 或以 $.ajax 在執行時載入，因此不讓 Vite 預掃描依賴。
// build：只打包 index/index.js 的 ES module 樹與 index.html 的 <link> CSS；
//        其餘執行時才載入的檔案（傳統 script、ijnjs、.gz、圖片…）由 copyLegacyFiles 原樣複製到 dist/。
export default defineConfig({
  root: '.',
  base: './', // 同一份 dist 可放在 /NUI/、/~sean/bible/ 等任何路徑下
  server: {
    host: '127.0.0.1', // isRDLocation() 依 hostname 判斷是否為開發環境
    port: 5173,
    strictPort: true,
    open: false,
  },
  optimizeDeps: {
    entries: ['index.html'], // 不去爬 tests/*.html、static/ 下的舊檔
    noDiscovery: true,
    include: [],
  },
  build: {
    outDir: 'dist',
    // Node 24 的 fs.rmSync 在 Windows 上遇到含中文的路徑會原生崩潰（0xC0000409），
    // Vite 的 emptyOutDir 用的就是它；改由 npm run build 先以 fs.promises.rm 清空。
    emptyOutDir: false,
    sourcemap: true,
  },
  test: {
    // vitest (npm test)；index/*.spec.js 是瀏覽器開的舊測試，dist/ 是 build 產物，都不要抓
    include: ['tests/**/*.test.js'],
  },
  // bundleLegacyScripts 要在 versionLegacyUrls 之前（同為 transformIndexHtml post，依陣列順序執行）
  plugins: [serveLegacyRaw(), copyLegacyFiles(), bundleLegacyScripts(), preloadIjnjsFiles(), versionLegacyUrls()],
})

/** 執行時才以 <script src>、$.ajax、fetch 載入的檔案，照原路徑複製到 dist/。 */
const LEGACY_COPY = [
  'static',
  'libs',
  'images',
  'index', // indexLast.js、DialogTemplate/、AppVersion.js、*.json.gz…
  'app_versions.json',
  'FHL.linq.js',
  'FHL.tools.js',
  'fhl_bible.ico',
  'frmUpdated.html',
]

function copyLegacyFiles() {
  let root, outDir
  return {
    name: 'copy-legacy-files',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(root, config.build.outDir)
    },
    closeBundle() {
      for (const p of LEGACY_COPY) {
        const from = path.resolve(root, p)
        if (!fs.existsSync(from)) continue
        fs.cpSync(from, path.join(outDir, p), {
          recursive: true,
          force: false, // 不覆蓋 Vite 產出的檔案
          filter: (src) => !/[\\/](\.DS_Store|node_modules)$/.test(src) && !src.endsWith('.map'),
        })
      }
    },
  }
}

/**
 * 不合併的本地 script：ijnjs 系列靠 document.scripts 找自己的檔名推算路徑（getSrd），
 * 且 ijnjs-fhl / ijnjs-ui 是 async 並依賴 ijnjs.js 先執行。
 */
const LEGACY_BUNDLE_EXCLUDE = /(^|\/)libs\/ijnjs/

/**
 * 把 index.html 裡本地的傳統 <script src>（約 30 個，含 AppVersion.js）依原順序串成一支
 * assets/legacy-[hash].js，並加上 defer。
 *
 * - 原本這些 script 同步阻擋 html 解析，且 nginx 沒開 HTTP/2 時，數十個請求要分批排隊。
 * - defer 保持彼此的相對順序，並在 index.js（module，同樣是延後執行）之前執行。
 *   head 裡其餘 inline script 不依賴它們（AppVersion 在 inline 有同介面的 stub，
 *   真正用到是在 index.js 之後）。
 * - 串接時每支檔案之間加 `;`，避免前一支結尾沒分號、下一支以 ( 開頭時被黏成一個運算式。
 * - 註解（<!-- -->）裡的 script 不處理。
 */
function bundleLegacyScripts() {
  let root, outDir
  /** @type {{ fileName: string, code: string } | null} */
  let pending = null
  return {
    name: 'bundle-legacy-scripts',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(root, config.build.outDir)
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const comments = [...html.matchAll(/<!--[\s\S]*?-->/g)].map((m) => [m.index, m.index + m[0].length])
        const inComment = (i) => comments.some(([a, b]) => i >= a && i < b)

        const picked = []
        const re = /<script\b([^>]*)>\s*<\/script>[ \t]*\r?\n?/gi
        for (const m of html.matchAll(re)) {
          const attrs = m[1]
          if (inComment(m.index)) continue
          if (/\b(type\s*=\s*["']?module|async|defer)\b/i.test(attrs)) continue
          const src = attrs.match(/\bsrc\s*=\s*(["']?)([^"'\s>]+)\1/i)?.[2]
          if (!src || /^(?:[a-z]+:)?\/\//i.test(src) || /(^|\/)assets\//.test(src)) continue
          const rel = src.replace(/^\.\//, '')
          if (LEGACY_BUNDLE_EXCLUDE.test(rel)) continue
          const abs = path.resolve(root, rel)
          if (!fs.existsSync(abs)) continue
          picked.push({ start: m.index, end: m.index + m[0].length, rel, abs })
        }
        if (picked.length === 0) return html

        const code = picked
          .map((p) => `/* ==== ${p.rel} ==== */\n${fs.readFileSync(p.abs, 'utf8').replace(/^﻿/, '')}\n;`)
          .join('\n')
        const fileName = `assets/legacy-${crypto.createHash('md5').update(code).digest('hex').slice(0, 8)}.js`
        pending = { fileName, code }

        // 由後往前移除，最後一支的位置放合併後的 script
        let out = html
        for (let i = picked.length - 1; i >= 0; i--) {
          const p = picked[i]
          const replacement = i === picked.length - 1
            ? `<script defer src="./${fileName}"></script>\n  <!-- 由 vite.config.js bundleLegacyScripts 合併：${picked.map((x) => x.rel).join(', ')} -->\n`
            : ''
          out = out.slice(0, p.start) + replacement + out.slice(p.end)
        }
        return out
      },
    },
    closeBundle() {
      if (!pending) return
      const target = path.join(outDir, pending.fileName)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, pending.code)
    },
  }
}

/**
 * ijnjs 系列在執行時以 XHR 下載再 eval 的小檔（ijnjs 核心、ijnjs-fhl、ijnjs-ui 的兩個對話框）。
 * 清單取自實際載入的請求；漏列的檔案不會壞，只是照舊下載。
 */
const IJNJS_PRELOAD_FILES = [
  'libs/ijnjs/SplitStringByRegex.min.js',
  'libs/ijnjs/assert.min.js',
  'libs/ijnjs/TestTime.min.js',
  'libs/ijnjs/rem2Px.min.js',
  'libs/ijnjs/Path/Path.min.js',
  'libs/ijnjs-fhl/FHL/index.min.js',
  'libs/ijnjs-fhl/FHL/BibleConstant.min.js',
  'libs/ijnjs-fhl/FHL/BibleConstantFunctions.min.js',
  'libs/ijnjs-fhl/FHL/generateDTextDom.min.js',
  'libs/ijnjs-ui/BookChapDialog/index.js',
  'libs/ijnjs-ui/BookChapDialog/BookChapDialog.js',
  'libs/ijnjs-ui/BookChapDialog/BookChapDialog.html',
  'libs/ijnjs-ui/BibleVersionDialog/index.js',
  'libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.js',
  'libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.html',
  'libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.css',
]

/**
 * 把 IJNJS_PRELOAD_FILES 的內容打包成 assets/ijnjs-preload-[hash].js，放在 ijnjs.js 之前（同步執行），
 * 設定 window.__IJNJS_PRELOAD__；ijnjs 的 getCacheAsync 有預載內容就不下載。
 * 仍以原本的 eval 方式執行，只省下請求（這些檔案要等 ijnjs 準備好才開始一支支下載）。
 * 必須同步且在 ijnjs.js 之前：ijnjs.js 一執行就會開始抓核心檔案。
 */
function preloadIjnjsFiles() {
  let root, outDir
  /** @type {{ fileName: string, code: string } | null} */
  let pending = null
  return {
    name: 'preload-ijnjs-files',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(root, config.build.outDir)
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const files = {}
        for (const rel of IJNJS_PRELOAD_FILES) {
          const abs = path.resolve(root, rel)
          if (fs.existsSync(abs)) files[rel] = fs.readFileSync(abs, 'utf8').replace(/^﻿/, '')
        }
        const code = `window.__IJNJS_PRELOAD__ = ${JSON.stringify({ files })};\n`
        const fileName = `assets/ijnjs-preload-${crypto.createHash('md5').update(code).digest('hex').slice(0, 8)}.js`
        pending = { fileName, code }

        const re = /<script\b[^>]*\bsrc\s*=\s*["']?(?:\.\/)?libs\/ijnjs\/ijnjs\.js[^>]*><\/script>/i
        if (!re.test(html)) throw new Error('preloadIjnjsFiles: index.html 找不到 libs/ijnjs/ijnjs.js')
        return html.replace(re, (m) => `<script src="./${fileName}"></script>\n  ${m}`)
      },
    },
    closeBundle() {
      if (!pending) return
      const target = path.join(outDir, pending.fileName)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, pending.code)
    },
  }
}

/** 會隨版本更新、需要破快取的舊式檔案類型（圖片等不在此列） */
const VERSIONED_EXT = /\.(js|css|html|json|gz|txt|md)$/i

/**
 * 讓舊式檔案（沒有經過 Vite 打包、檔名沒有 hash）也能在改版時破快取。
 * 正式站 nginx 沒送 Cache-Control，瀏覽器會自行估算快取時間，使用者常拿到舊版 JS/CSS。
 *
 * - index.html 裡的 <script src>、<link href>：加上該檔內容 hash，?v=xxxxxxxx。檔案沒改網址就不變，快取照用。
 * - 執行時以 XHR / fetch 載入的（ijnjs、$.ajax、.load()、.json.gz…）：在 <head> 最前面注入一段程式，
 *   攔截 XMLHttpRequest.open 與 fetch，對同網域、VERSIONED_EXT 的網址加上 ?v=BUILD_ID。
 *   不用 $.ajaxPrefilter：ijnjs 會 eval 自己的一份 jQuery 蓋掉 window.$，掛在原本 jQuery 上的 prefilter 會失效。
 *   BUILD_ID 是所有這類檔案內容的總 hash，只有它們有變動時才會變。
 * assets/ 下是 Vite 產出、檔名已含 hash 的檔案，不處理。
 */
function versionLegacyUrls() {
  let root
  const fileHashCache = new Map()
  const hashOf = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8)
  const fileHash = (abs) => {
    if (!fileHashCache.has(abs)) fileHashCache.set(abs, hashOf(fs.readFileSync(abs)))
    return fileHashCache.get(abs)
  }
  const listFiles = (abs) => {
    if (!fs.existsSync(abs)) return []
    if (fs.statSync(abs).isFile()) return [abs]
    return fs.readdirSync(abs, { recursive: true, withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => path.join(d.parentPath ?? d.path, d.name))
  }

  return {
    name: 'version-legacy-urls',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const files = LEGACY_COPY.flatMap((p) => listFiles(path.resolve(root, p)))
          .filter((f) => VERSIONED_EXT.test(f))
          .sort()
        const total = crypto.createHash('md5')
        for (const f of files) total.update(path.relative(root, f)).update(fileHash(f))
        const buildId = total.digest('hex').slice(0, 8)

        // <script src=...> 與 <link href=...>，屬性值可能有引號或沒有
        html = html.replace(/(<(?:script|link)\b[^>]*?\s(?:src|href)=)(["']?)([^"'\s>]+)\2/gi, (m, pre, q, url) => {
          if (/^(?:[a-z]+:)?\/\//i.test(url) || url.startsWith('data:') || /(^|\/)assets\//.test(url) || url.includes('?')) return m
          const abs = path.resolve(root, url.replace(/^\.\//, ''))
          if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return m
          return `${pre}${q || '"'}${url}?v=${fileHash(abs)}${q || '"'}`
        })

        const runtime = `<script>
    // 由 vite.config.js versionLegacyUrls 注入：同網域的舊式檔案加上版本號以破快取
    (function () {
      var V = ${JSON.stringify(buildId)};
      window.__BUILD_ID__ = V;
      function ver(url) {
        try {
          var u = new URL(url, location.href);
          if (u.origin !== location.origin || !${VERSIONED_EXT}.test(u.pathname) || /\\/assets\\//.test(u.pathname) || u.searchParams.has('v')) return url;
          u.searchParams.set('v', V);
          return u.href;
        } catch (e) { return url; }
      }
      var open = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url) {
        var args = Array.prototype.slice.call(arguments);
        if (typeof url === 'string' && String(method).toUpperCase() === 'GET') args[1] = ver(url);
        return open.apply(this, args);
      };
      var fetch0 = window.fetch;
      window.fetch = function (input, init) {
        if (typeof input === 'string' && (!init || !init.method || String(init.method).toUpperCase() === 'GET')) input = ver(input);
        return fetch0.call(this, input, init);
      };
    })();
  </script>`
        return html.replace(/<head>/i, `<head>\n  ${runtime}`)
      },
    },
  }
}

const MIME = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
}

/**
 * 除了「頁面本身」與「ES module」之外，一律原樣送出檔案，不經 Vite 轉換。
 *
 * 不這樣做的話 Vite 會：
 * - 在 ajax 載入的 HTML 片段（對話框模板）注入 /@vite/client
 * - 把副檔名是 .html 的字型檔（fontawesome-webfont93e3.html）當 HTML 轉換而弄壞
 * - 對傳統 script 與 ajax 當文字 eval 的 .js 做 import analysis、加 inline sourcemap
 * - 把 ajax 載入的 .css 轉成 JS module
 * - 對 *.gz 加 Content-Encoding: gzip，瀏覽器先解壓，pako 再解一次就失敗
 *
 * 判斷依據：<script type="module"> 與動態 import() 的請求是 Sec-Fetch-Dest: script + Sec-Fetch-Mode: cors；
 * 傳統 <script src> 是 no-cors；$.ajax / fetch 是 Sec-Fetch-Dest: empty。
 */
function serveLegacyRaw() {
  return {
    name: 'serve-legacy-raw',
    configureServer(server) {
      server.middlewares.use(rawFileMiddleware(path.resolve(server.config.root), { passModules: true }))

      // 原樣送出的檔案不在 Vite 的 module graph 裡，改了不會觸發更新；這裡補上整頁重新整理。
      server.watcher.on('change', (file) => {
        const mods = server.moduleGraph.getModulesByFile(file)
        if (!mods || mods.size === 0) server.ws.send({ type: 'full-reload' })
      })
    },
    // vite preview（測 dist/）同樣會對 *.gz 加 Content-Encoding，與正式伺服器行為不一致
    configurePreviewServer(server) {
      server.middlewares.use(rawFileMiddleware(path.resolve(server.config.root, server.config.build.outDir), { passModules: false }))
    },
  }
}

/**
 * @param {string} root
 * @param {{passModules: boolean}} opt passModules：ES module 請求交給 Vite 轉換（dev 用）
 */
function rawFileMiddleware(root, { passModules }) {
  return (req, res, next) => {
    const [rawPath, query = ''] = (req.url ?? '').split('?')
    if (rawPath.startsWith('/@') || rawPath.startsWith('/node_modules/')) return next()
    if (/(^|&)(import|html-proxy|direct|raw|url|worker)\b/.test(query)) return next()

    const dest = req.headers['sec-fetch-dest']
    const mode = req.headers['sec-fetch-mode']
    if (dest === 'document' || dest === 'iframe') return next() // 頁面：讓 Vite 注入 client，才有自動重新整理
    if (passModules && dest === 'script' && mode === 'cors') return next() // ES module

    let urlPath
    try { urlPath = decodeURIComponent(rawPath) } catch { return next() }
    const file = path.join(root, urlPath)
    if (!file.startsWith(root)) return next()

    fs.stat(file, (err, stat) => {
      if (err || !stat.isFile()) return next()
      const ext = path.extname(file).toLowerCase()
      res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream')
      res.setHeader('Content-Length', stat.size)
      res.setHeader('Cache-Control', 'no-cache')
      if (req.method === 'HEAD') return res.end()
      fs.createReadStream(file).pipe(res)
    })
  }
}
