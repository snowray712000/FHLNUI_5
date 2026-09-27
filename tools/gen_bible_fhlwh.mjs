// 產生 index/bible_fhlwh.json.gz：新約原文 (fhlwh) 每節嵌入 SN，形如 `ἀλλὰ<WG235> καθὸ<WG2526> ...`
// 執行：npm run gen:fhlwh (需要網路；zip 約 40MB，會快取在 tools/.cache/)
//
// - 來源：信望愛公開的 https://ftp.fhl.net/FHL/COBS/data/bible_parsing.zip (sqlite)，表 fhlwhparsing
//   - wid=0 是整節原文 (uword 已是 Unicode，含 \n 分行、+ 韋 + 聯 + 異文)；wid>=1 是逐字，sn 為 5 碼 (02526、0031a、+ 為 00000)
//   - 詳見 iOS 專案 doc/260927a_離線parsing資料庫_bible_parsing.md
// - 文字以 wid=0 為準 (逐字資料有少數錯字，例 太10:3 Θμᾶς)，逐字只提供 SN，依序對到 wid=0 的字後面
// - 對齊比較時忽略重音、氣號、大小寫、括號，所以 `(κατα)καίεται` 對得到逐字的 `κατακαίεται`
// - 對不上的寫到 tools/.cache/gen_bible_fhlwh_report.txt，並印出統計
// - 輸出多了 ver：資料庫 version.dt，之後判斷要不要重新產生用
import fs from 'node:fs'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const URL_ZIP = 'https://ftp.fhl.net/FHL/COBS/data/bible_parsing.zip'
const DIR_CACHE = new URL('./.cache/', import.meta.url)
const PATH_ZIP = new URL('bible_parsing.zip', DIR_CACHE)
const PATH_ZIP_META = new URL('bible_parsing.zip.json', DIR_CACHE)
const PATH_DB = new URL('bible_parsing.db', DIR_CACHE)
const PATH_REPORT = new URL('gen_bible_fhlwh_report.txt', DIR_CACHE)
const OUT = new URL('../index/bible_fhlwh.json.gz', import.meta.url)

const NT_ENGS = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1 Cor', '2 Cor', 'Gal', 'Eph', 'Phil', 'Col',
    '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Titus', 'Philem', 'Heb', 'James', '1 Pet', '2 Pet', '1 John',
    '2 John', '3 John', 'Jude', 'Rev']

fs.mkdirSync(DIR_CACHE, { recursive: true })
await ensureDbAsync()

const db = new DatabaseSync(fileURLToPath(PATH_DB), { readOnly: true })
const ver = db.prepare('SELECT dt FROM version').get()?.dt ?? ''

/** @type {Map<string, {text: string, words: {wid: number, word: string, sn: string}[]}>} */
const verses = new Map()
for (const r of db.prepare('SELECT engs, chap, sec, wid, uword, sn FROM fhlwhparsing ORDER BY engs, chap, sec, wid').all()) {
    const k = `${r.engs.trim()}|${r.chap}|${r.sec}`
    if (!verses.has(k)) verses.set(k, { text: null, words: [] })
    const v = verses.get(k)
    if (r.wid == 0) v.text = r.uword
    else v.words.push({ wid: r.wid, word: r.uword ?? '', sn: (r.sn ?? '').trim() })
}
db.close()

const data = []
const report = []
const cnt = { verse: 0, word: 0, tagged: 0, fuzzy: 0, skipWord: 0, skipChunk: 0 }
for (const [k, v] of verses) {
    const [engs, chap, sec] = k.split('|')
    const iBook = NT_ENGS.indexOf(engs)
    if (iBook < 0) throw new Error(`不認得的書卷 ${engs}`)
    const book = iBook + 40
    if (v.text == null) { report.push(`${k} 沒有 wid=0`); continue }

    const re = attach_sn(v.text.replace(/\r\n?/g, '\n').trim(), v.words)
    for (const msg of re.msgs) report.push(`${engs} ${chap}:${sec} ${msg}`)
    data.push([book, +chap, +sec, re.text])
    cnt.verse++
    cnt.word += v.words.length
    for (const key of ['tagged', 'fuzzy', 'skipWord', 'skipChunk']) cnt[key] += re.cnt[key]
}
data.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])

const json = JSON.stringify({ col: ['book', 'chap', 'sec', 'text'], ver, data })
fs.writeFileSync(OUT, zlib.gzipSync(json, { level: 9 }))
fs.writeFileSync(PATH_REPORT, `bible_parsing.db version: ${ver}\n${JSON.stringify(cnt)}\n\n${report.join('\n')}\n`)
console.log(`${data.length} 節 → ${fileURLToPath(OUT)} (${fs.statSync(OUT).size} bytes)，資料版本 ${ver}`)
console.log(cnt)
console.log(`對不上 ${report.length} 筆，見 ${fileURLToPath(PATH_REPORT)}`)

/**
 * 把逐字的 SN 插到整節文字每個字的後面
 * @param {string} text wid=0 整節
 * @param {{wid: number, word: string, sn: string}[]} words wid>=1
 */
function attach_sn(text, words) {
    const msgs = []
    const cnt = { tagged: 0, fuzzy: 0, skipWord: 0, skipChunk: 0 }
    const wkeys = words.map(a1 => key(a1.word))
    const parts = text.split(/(\s+)/)
    // 非空白、且有字母或 + 的片段，才需要對
    const iChunks = parts.map((p, i) => i).filter(i => key(parts[i]) != '')

    let j = 0
    for (let n = 0; n < iChunks.length; n++) {
        const i = iChunks[n]
        const ck = key(parts[i])
        const nextKey = n + 1 < iChunks.length ? key(parts[iChunks[n + 1]]) : null

        // 1 個片段可能含多個字，例 `+(ὀψίας)`、`δι᾽αὐτοῦ`
        let take = 0
        for (let m = 1, acc = ''; m <= 4 && j + m <= words.length; m++) {
            acc += wkeys[j + m - 1]
            if (acc == ck) { take = m; break }
            if (!ck.startsWith(acc)) break
        }
        if (take == 0) {
            if (j < words.length && wkeys[j + 1] == ck) {
                // 逐字多一個 (wid=0 沒有)
                msgs.push(`略過逐字 wid${words[j].wid} ${words[j].word}`)
                cnt.skipWord++
                j++
                n--
                continue
            }
            if (j < words.length && (nextKey == null ? j + 1 == words.length : wkeys[j + 1] == nextKey || similar(wkeys[j], ck))) {
                // 錯字，位置對得上，就當同一個字
                msgs.push(`錯字 wid${words[j].wid} 逐字 ${words[j].word} ≠ 整節 ${parts[i]}`)
                cnt.fuzzy++
                parts[i] = insert_tags(parts[i], [words[j]], true)
                cnt.tagged += words[j].sn.match(/^0*[1-9]/) ? 1 : 0
                j++
                continue
            }
            msgs.push(`整節 ${parts[i]} 沒有對應的逐字`)
            cnt.skipChunk++
            continue
        }
        const ws = words.slice(j, j + take)
        parts[i] = insert_tags(parts[i], ws, false)
        cnt.tagged += ws.filter(a1 => a1.sn.match(/^0*[1-9]/)).length
        j += take
    }
    for (; j < words.length; j++) {
        msgs.push(`逐字 wid${words[j].wid} ${words[j].word} 沒有對應`)
        cnt.skipWord++
    }
    return { text: parts.join(''), msgs, cnt }
}

/**
 * 在片段中，每個字的最後一個字母之後加 <WGsn>
 * @param {string} chunk 例 `(κατα)καίεται,`
 * @param {{word: string, sn: string}[]} ws
 * @param {boolean} isFuzzy 錯字時只有 1 個字，放在片段最後一個字母後面
 */
function insert_tags(chunk, ws, isFuzzy) {
    const chars = [...chunk]
    // 每個字要吃掉幾個 key 字元
    const lens = isFuzzy ? [Infinity] : ws.map(a1 => key(a1.word).length)
    /** @type {Map<number, string>} 插在 chars[pos] 之後 */
    const ins = new Map()
    let iw = 0, used = 0, last = -1
    for (let p = 0; p < chars.length && iw < ws.length; p++) {
        if (key(chars[p]) == '') {
            // 重音等附加符號、省略號 ᾽ 跟著前一個字母
            if (last == p - 1 && /[\p{M}᾽’ʼ]/u.test(chars[p])) last = p
            continue
        }
        if (used == lens[iw]) {
            ins.set(last, tag(ws[iw].sn))
            iw++
            used = 0
        }
        used += key(chars[p]).length
        // + 也要算進長度，但 SN 只接在字母後面，例 徒13:33 整節是 `(αὐτῶν)+` (+ 前少了空白)
        if (chars[p] != '+') last = p
    }
    if (iw < ws.length) ins.set(last, tag(ws[iw].sn))
    return chars.map((c, p) => c + (ins.get(p) ?? '')).join('')
}

/** @param {string} sn 例 02526 → <WG2526>；0031a → <WG31a>；00000 (+) → 空 */
function tag(sn) {
    const m = sn.match(/^0*([1-9]\d*[a-z]?)$/)
    return m ? `<WG${m[1]}>` : ''
}

/** 比對用：去重音氣號、小寫、ς→σ，只留字母與 + */
function key(s) {
    return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ς/g, 'σ').replace(/[^\p{L}+]/gu, '')
}

/** 錯字判斷：編輯距離 <= 2 */
function similar(a, b) {
    if (a == null || b == null) return false
    if (Math.abs(a.length - b.length) > 2) return false
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
    for (let y = 1; y <= b.length; y++) d[0][y] = y
    for (let x = 1; x <= a.length; x++)
        for (let y = 1; y <= b.length; y++)
            d[x][y] = Math.min(d[x - 1][y] + 1, d[x][y - 1] + 1, d[x - 1][y - 1] + (a[x - 1] == b[y - 1] ? 0 : 1))
    return d[a.length][b.length] <= 2
}

/** 下載 zip (遠端 Last-Modified 沒變就用快取)，解出 bible_parsing.db */
async function ensureDbAsync() {
    const head = await fetch(URL_ZIP, { method: 'HEAD' })
    if (!head.ok) throw new Error(`HEAD ${URL_ZIP} ${head.status}`)
    const remote = { lastModified: head.headers.get('last-modified'), size: +head.headers.get('content-length') }
    const cached = fs.existsSync(PATH_ZIP_META) ? JSON.parse(fs.readFileSync(PATH_ZIP_META, 'utf8')) : null
    const isSame = cached != null && cached.lastModified == remote.lastModified && cached.size == remote.size
        && fs.existsSync(PATH_ZIP) && fs.existsSync(PATH_DB)
    if (isSame) {
        console.log(`用快取 ${fileURLToPath(PATH_ZIP)} (${remote.lastModified})`)
        return
    }

    console.log(`下載 ${URL_ZIP} (${(remote.size / 1e6).toFixed(1)}MB, ${remote.lastModified})`)
    const res = await fetch(URL_ZIP)
    if (!res.ok) throw new Error(`GET ${URL_ZIP} ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(PATH_ZIP, buf)
    fs.writeFileSync(PATH_DB, unzip_one(buf, 'bible_parsing.db'))
    fs.writeFileSync(PATH_ZIP_META, JSON.stringify(remote))
}

/**
 * 從 zip 取出一個檔案 (只支援 stored / deflate，夠用了，不必多裝套件)
 * @param {Buffer} buf
 * @param {string} name
 */
function unzip_one(buf, name) {
    // End of central directory
    let eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
    if (eocd < 0) throw new Error('不是 zip')
    const cnt = buf.readUInt16LE(eocd + 10)
    let p = buf.readUInt32LE(eocd + 16)
    for (let i = 0; i < cnt; i++) {
        const method = buf.readUInt16LE(p + 10)
        const sizeComp = buf.readUInt32LE(p + 20)
        const lenName = buf.readUInt16LE(p + 28), lenExtra = buf.readUInt16LE(p + 30), lenComment = buf.readUInt16LE(p + 32)
        const offLocal = buf.readUInt32LE(p + 42)
        const fname = buf.toString('utf8', p + 46, p + 46 + lenName)
        if (fname.split('/').pop() == name) {
            const start = offLocal + 30 + buf.readUInt16LE(offLocal + 26) + buf.readUInt16LE(offLocal + 28)
            const raw = buf.subarray(start, start + sizeComp)
            if (method == 0) return raw
            if (method == 8) return zlib.inflateRawSync(raw)
            throw new Error(`不支援的壓縮方式 ${method}`)
        }
        p += 46 + lenName + lenExtra + lenComment
    }
    throw new Error(`zip 裡沒有 ${name}`)
}
