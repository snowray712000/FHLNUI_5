// 檢查 index/ 裡由信望愛公開資料產生的檔案，是不是最新的
// 執行：npm run check:data (只送 HEAD，不下載)；有過期的，exit code 為 1
//
// - 產生時會把來源 zip 的 Last-Modified 記在檔案的 src (見 tools/gen_bible_orig.mjs)
// - 這裡再對 zip 送 HEAD，Last-Modified 不同，就表示信望愛更新了資料，要重新產生
// - 不含 index/audio_bible_index.json (npm run gen:audio)：它的來源是 API，沒有可比對的日期
import fs from 'node:fs'
import zlib from 'node:zlib'

const FILES = [
    { path: 'index/bible_fhlwh.json.gz', gen: 'npm run gen:orig' },
    { path: 'index/bible_bhs.json.gz', gen: 'npm run gen:orig' },
    { path: 'index/bible_bhs_code.json.gz', gen: 'npm run gen:orig' },
]

/** @type {Map<string, Promise<string|null>>} url → 遠端 Last-Modified，同一個 zip 只問一次 */
const remotes = new Map()
const headAsync = url => {
    if (!remotes.has(url)) remotes.set(url, fetch(url, { method: 'HEAD' }).then(r => r.ok ? r.headers.get('last-modified') : null))
    return remotes.get(url)
}

const gens = new Set()
for (const f of FILES) {
    const url = new URL('../' + f.path, import.meta.url)
    const jo = fs.existsSync(url) ? JSON.parse(zlib.gunzipSync(fs.readFileSync(url))) : null
    if (jo?.src?.url == null) {
        console.log(`✗ ${f.path}：沒有 src (舊格式或不存在)，請 ${f.gen}`)
        gens.add(f.gen)
        continue
    }
    const remote = await headAsync(jo.src.url)
    if (remote == null) {
        console.log(`? ${f.path}：無法取得 ${jo.src.url}`)
    } else if (remote != jo.src.lastModified) {
        console.log(`✗ ${f.path}：已過期 (本機 ${jo.src.lastModified}，遠端 ${remote})，請 ${f.gen}`)
        gens.add(f.gen)
    } else {
        console.log(`✓ ${f.path}：最新 (${jo.src.lastModified}，資料版本 ${jo.ver})`)
    }
}
if (gens.size > 0) {
    console.log(`\n要執行：${[...gens].join('、')}，再 npm run build 並上傳`)
    process.exitCode = 1
}
