// 產生新舊約原文、每個字後面嵌入 SN 的資料 (讀經選「新約原文」「舊約馬索拉原文」時載入)
// - index/bible_fhlwh.json.gz：新約，形如 `ἀλλὰ<WG235> καθὸ<WG2526> ...`
// - index/bible_bhs.json.gz：舊約，形如 `בְּרֵאשִׁית<WH7225> בָּרָא<WH1254> ...`
// 執行：npm run gen:orig (需要網路；zip 約 40MB，會快取在 tools/.cache/)
//
// - 來源：信望愛公開的 https://ftp.fhl.net/FHL/COBS/data/bible_parsing.zip (sqlite)，表 fhlwhparsing (新約)、lparsing (舊約)
//   - wid=0 是整節原文 (含 \n 分行；新約有 + 韋 + 聯 + 異文)；wid>=1 是逐字，sn 為 5 碼 (02526、0031a、新約的 + 為 00000)
//   - 詳見 iOS 專案 doc/260927a_離線parsing資料庫_bible_parsing.md
// - 文字以 wid=0 為準 (逐字資料有少數錯字，例 太10:3 Θμᾶς)，逐字只提供 SN，依序對到 wid=0 的字後面
//   - 新約用 uword (已是 Unicode)
//   - 舊約用 word (信望愛內碼) 逐行 umscode：umscode 會把整串反轉，uword 是整節一次轉的，多行時行序顛倒 (創1:1 第一個字跑到最後)
// - 對齊比較時忽略重音、氣號、母音點、大小寫、括號、maqaf，所以 `(κατα)καίεται` 對得到逐字的 `κατακαίεται`，`אֶת־הָרָקִיעַ` 對得到 2 個逐字
// - 對不上的寫到 tools/.cache/gen_bible_orig_report.txt，並印出統計
// - 輸出多了 ver：資料庫 version.dt，之後判斷要不要重新產生用
import fs from 'node:fs'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { umscode } from '../index/hebCode.es2023.js'

const URL_ZIP = 'https://ftp.fhl.net/FHL/COBS/data/bible_parsing.zip'
const DIR_CACHE = new URL('./.cache/', import.meta.url)
const PATH_ZIP = new URL('bible_parsing.zip', DIR_CACHE)
const PATH_ZIP_META = new URL('bible_parsing.zip.json', DIR_CACHE)
const PATH_DB = new URL('bible_parsing.db', DIR_CACHE)
const PATH_REPORT = new URL('gen_bible_orig_report.txt', DIR_CACHE)

const OT_ENGS = ['Gen', 'Ex', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth', '1 Sam', '2 Sam', '1 Kin', '2 Kin',
    '1 Chr', '2 Chr', 'Ezra', 'Neh', 'Esth', 'Job', 'Ps', 'Prov', 'Eccl', 'Song', 'Is', 'Jer', 'Lam', 'Ezek',
    'Dan', 'Hos', 'Joel', 'Amos', 'Obad', 'Jon', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal']
const NT_ENGS = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1 Cor', '2 Cor', 'Gal', 'Eph', 'Phil', 'Col',
    '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Titus', 'Philem', 'Heb', 'James', '1 Pet', '2 Pet', '1 John',
    '2 John', '3 John', 'Jude', 'Rev']

const TESTAMENTS = [
    {
        name: '新約', table: 'fhlwhparsing', tp: 'G', out: new URL('../index/bible_fhlwh.json.gz', import.meta.url),
        book: engs => NT_ENGS.indexOf(engs) + 40,
        text: r => r.uword,
        word: r => r.uword,
    },
    {
        name: '舊約', table: 'lparsing', tp: 'H', out: new URL('../index/bible_bhs.json.gz', import.meta.url),
        book: engs => OT_ENGS.indexOf(engs) + 1,
        text: r => r.word.replace(/\r\n?/g, '\n').split('\n').map(a1 => umscode(a1.trim())).join('\n'),
        word: r => r.uword,
    },
]

fs.mkdirSync(DIR_CACHE, { recursive: true })
await ensureDbAsync()

const db = new DatabaseSync(fileURLToPath(PATH_DB), { readOnly: true })
const ver = db.prepare('SELECT dt FROM version').get()?.dt ?? ''
const report = [`bible_parsing.db version: ${ver}`]
for (const t of TESTAMENTS) gen(t)
db.close()
fs.writeFileSync(PATH_REPORT, report.join('\n') + '\n')
console.log(`資料版本 ${ver}，報告見 ${fileURLToPath(PATH_REPORT)}`)

/** @param {typeof TESTAMENTS[number]} t */
function gen(t) {
    /** @type {Map<string, {text: string, words: {wid: number, word: string, sn: string}[]}>} */
    const verses = new Map()
    for (const r of db.prepare(`SELECT engs, chap, sec, wid, word, uword, sn FROM ${t.table} ORDER BY engs, chap, sec, wid`).all()) {
        const k = `${r.engs.trim()}|${r.chap}|${r.sec}`
        if (!verses.has(k)) verses.set(k, { text: null, words: [] })
        const v = verses.get(k)
        if (r.wid == 0) v.text = r.word == null ? null : t.text(r)
        else v.words.push({ wid: r.wid, word: t.word(r) ?? '', sn: (r.sn ?? '').trim() })
    }

    const data = []
    const msgs = []
    const cnt = { verse: 0, word: 0, tagged: 0, fuzzy: 0, skipWord: 0, skipChunk: 0 }
    for (const [k, v] of verses) {
        const [engs, chap, sec] = k.split('|')
        const book = t.book(engs)
        if (book < 1 || (t.tp == 'G') != (book >= 40)) throw new Error(`不認得的書卷 ${engs}`)
        if (v.text == null) { msgs.push(`${k} 沒有 wid=0`); continue }

        const re = attach_sn(v.text.replace(/\r\n?/g, '\n').trim(), v.words, t.tp)
        for (const msg of re.msgs) msgs.push(`${engs} ${chap}:${sec} ${msg}`)
        data.push([book, +chap, +sec, re.text])
        cnt.verse++
        cnt.word += v.words.length
        for (const key of ['tagged', 'fuzzy', 'skipWord', 'skipChunk']) cnt[key] += re.cnt[key]
    }
    data.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])

    const json = JSON.stringify({ col: ['book', 'chap', 'sec', 'text'], ver, data })
    fs.writeFileSync(t.out, zlib.gzipSync(json, { level: 9 }))
    report.push('', `## ${t.name} ${JSON.stringify(cnt)}`, ...msgs)
    console.log(`${t.name} ${data.length} 節 → ${fileURLToPath(t.out)} (${fs.statSync(t.out).size} bytes)`)
    console.log(`  ${JSON.stringify(cnt)}，對不上 ${msgs.length} 筆`)
}

/**
 * 把逐字的 SN 插到整節文字每個字的後面
 * @param {string} text wid=0 整節
 * @param {{wid: number, word: string, sn: string}[]} words wid>=1
 * @param {'G'|'H'} tp
 */
function attach_sn(text, words, tp) {
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
        for (let m = 1, acc = ''; m <= 6 && j + m <= words.length; m++) {
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
                parts[i] = insert_tags(parts[i], [words[j]], true, tp)
                cnt.tagged += words[j].sn.match(/^0*[1-9]/) ? 1 : 0
                j++
                continue
            }
            msgs.push(`整節 ${parts[i]} 沒有對應的逐字`)
            cnt.skipChunk++
            continue
        }
        const ws = words.slice(j, j + take)
        parts[i] = insert_tags(parts[i], ws, false, tp)
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
 * @param {'G'|'H'} tp
 */
function insert_tags(chunk, ws, isFuzzy, tp) {
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
            ins.set(last, tag(ws[iw].sn, tp))
            iw++
            used = 0
        }
        used += key(chars[p]).length
        // + 也要算進長度，但 SN 只接在字母後面，例 徒13:33 整節是 `(αὐτῶν)+` (+ 前少了空白)
        if (chars[p] != '+') last = p
    }
    if (iw < ws.length) ins.set(last, tag(ws[iw].sn, tp))
    return chars.map((c, p) => c + (ins.get(p) ?? '')).join('')
}

/**
 * @param {string} sn 例 02526 → <WG2526>；0031a → <WG31a>；00000 (+) → 空
 * @param {'G'|'H'} tp
 */
function tag(sn, tp) {
    const m = sn.match(/^0*([1-9]\d*[a-z]?)$/)
    return m ? `<W${tp}${m[1]}>` : ''
}

/** 比對用：去重音氣號母音點、小寫、ς→σ，只留字母與 + */
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
