import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

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
  plugins: [serveLegacyRaw(), copyLegacyFiles()],
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
