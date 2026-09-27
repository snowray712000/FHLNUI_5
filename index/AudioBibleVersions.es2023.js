import { BibleConstant } from './BibleConstant.es2023.js'

/**
 * 有聲聖經：版本、覆蓋度、網址。純函式與資料，不碰 DOM (tests/audioBible.test.js)。
 *
 * - 覆蓋度來自 index/audio_bible_index.json (npm run gen:audio 產生，來源是 bible.fhl.net/new/audio_hb.php)
 * - 網址規則 https://media.fhl.net/{dir}/{bid}{variant}/{bid}_{章3位}.mp3 (au.php 也是這樣組的，不必每章打一次 api)
 * - variant 是同一章的其它朗讀版本 ('' 'A' 'B' 'C')
 */

/**
 * 版本的分組與顯示名稱。依 bible.fhl.net 首頁「聖經朗讀」的分法：先看語言，再看譯本、朗讀者。
 * v 是 au.php 的 version。沒列在這裡、但 json 有的版本，會放在「其它」，名稱用 au.php 的 name。
 * variants: 某些 variant 有特定意義時的名稱 (例：客語 A 版是海陸腔)
 * @type {{v:number, group:string, label:string, sub?:string, variants?:Record<string,string>}[]}
 */
export const AUDIO_VERSION_META = [
    { v: 0, group: '華語', label: '和合本' },
    { v: 20, group: '華語', label: '和合本', sub: '閻大衛' },
    { v: 11, group: '華語', label: '和合本', sub: 'Spring' },
    { v: 4, group: '華語', label: '現代中文譯本' },
    { v: 12, group: '華語', label: 'NetBible 中文版' },
    { v: 17, group: '台語', label: '現代台語譯本' },
    { v: 1, group: '台語', label: '巴克禮台語' },
    { v: 5, group: '台語', label: '巴克禮台語', sub: '長老教會傳播中心' },
    { v: 10, group: '台語', label: '巴克禮台語', sub: 'Spring' },
    { v: 15, group: '台語', label: '巴克禮台語', sub: '台南腔' },
    { v: 13, group: '台語', label: '全民台語聖經' },
    { v: 6, group: '台語', label: '紅皮聖經' },
    { v: 18, group: '客語', label: '現代客語譯本' },
    { v: 21, group: '客語', label: '現代客語譯本', sub: '海陸腔' },
    { v: 2, group: '客語', label: '和合本客語', sub: '四縣腔', variants: { A: '海陸腔' } },
    { v: 3, group: '粵語', label: '和合本' },
    { v: 16, group: '粵語', label: '現代中文譯本' },
    { v: 8, group: '福州話', label: '和合本' },
    { v: 9, group: '原文', label: '希臘文' },
    { v: 7, group: '原文', label: '希伯來文' },
    { v: 14, group: '族語', label: '鄒語' },
    { v: 19, group: '族語', label: '達悟語' },
]
export const AUDIO_VERSION_DEFAULT = 0

/**
 * "1-3,5,7-9" → Set{1,2,3,5,7,8,9}
 * @param {string} s
 * @returns {Set<number>}
 */
export function parseChapRanges(s) {
    const re = new Set()
    for (const part of (s ?? '').split(',')) {
        if (part == '') continue
        const [a, b] = part.split('-').map(Number)
        for (let i = a; i <= (b ?? a); i++) re.add(i)
    }
    return re
}

/** 2 → "002" */
const pad3 = n => String(n).padStart(3, '0')

/**
 * @typedef {{v:number, name:string, dir:string, ch:Record<string,Record<string,string>>, m4:Record<string,Record<string,string>>}} DAudioIndexRaw audio_bible_index.json 的一個版本
 * @typedef {{v:number, group:string, label:string, sub:string, name:string, dir:string, variantNames:Record<string,string>, coverage:'all'|'ot'|'nt'|'part', hasMp4:boolean}} DAudioVersion
 */

export class AudioBibleIndex {
    /** @type {DAudioVersion[]} 依 AUDIO_VERSION_META 排好 */
    versions = []
    /** @type {string} json 產生日期 */
    generated = ''
    /** @type {Map<number, {ch: Map<number, Record<string, Set<number>>>, m4: Map<number, Record<string, Set<number>>>}>} */
    #cov = new Map()

    /** @param {{generated:string, versions:DAudioIndexRaw[]}} jo */
    constructor(jo) {
        this.generated = jo.generated
        const expand = obj => new Map(Object.entries(obj ?? {}).map(([bid, vs]) =>
            [+bid, Object.fromEntries(Object.entries(vs).map(([k, s]) => [k, parseChapRanges(s)]))]))
        const raws = new Map(jo.versions.map(a1 => [a1.v, a1]))
        for (const raw of jo.versions)
            this.#cov.set(raw.v, { ch: expand(raw.ch), m4: expand(raw.m4) })

        const metas = [...AUDIO_VERSION_META.filter(m => raws.has(m.v)),
            ...jo.versions.filter(r => !AUDIO_VERSION_META.some(m => m.v == r.v)).map(r => ({ v: r.v, group: '其它', label: r.name }))]
        this.versions = metas.map(m => {
            const raw = raws.get(m.v)
            return {
                v: m.v, group: m.group, label: m.label, sub: m.sub ?? '', name: raw.name, dir: raw.dir,
                variantNames: m.variants ?? {},
                coverage: this.#coverage(m.v),
                hasMp4: Object.keys(raw.m4 ?? {}).length != 0,
            }
        })
    }

    /** @param {number} v @returns {DAudioVersion|undefined} */
    get(v) { return this.versions.find(a1 => a1.v == v) }

    /** 依 group 分組，保持順序 @returns {[string, DAudioVersion[]][]} */
    groups() {
        const re = new Map()
        for (const a1 of this.versions) {
            if (!re.has(a1.group)) re.set(a1.group, [])
            re.get(a1.group).push(a1)
        }
        return [...re]
    }

    /**
     * 這一章有哪些朗讀版本，'' 排最前
     * @param {number} v @param {number} bid 1-based @param {number} chap 1-based
     * @returns {string[]}
     */
    variants(v, bid, chap) {
        const vs = this.#cov.get(v)?.ch.get(bid)
        if (vs == null) return []
        return Object.keys(vs).filter(k => vs[k].has(chap)).sort()
    }
    /** @param {number} v @param {number} bid @param {number} chap @param {string} [variant] */
    has(v, bid, chap, variant = '') {
        return this.#cov.get(v)?.ch.get(bid)?.[variant]?.has(chap) ?? false
    }
    /** 這一章 (這個朗讀版本) 有沒有 mp4 投影片 */
    hasMp4(v, bid, chap, variant = '') {
        return this.#cov.get(v)?.m4.get(bid)?.[variant]?.has(chap) ?? false
    }
    /** 這卷書有沒有任何一章 */
    hasBook(v, bid) {
        return this.#cov.get(v)?.ch.has(bid) ?? false
    }

    /**
     * @param {number} v @param {number} bid @param {number} chap @param {string} variant
     * @param {'mp3'|'mp4'} ext
     */
    url(v, bid, chap, variant, ext) {
        const dir = this.get(v)?.dir
        if (dir == null) return null
        return `https://media.fhl.net/${dir}/${bid}${variant}/${bid}_${pad3(chap)}.${ext}`
    }

    /**
     * 下一個 (或上一個) 此版本有聲音的章，可跨書卷；沒有就 null
     * @param {number} v @param {number} bid @param {number} chap @param {1|-1} dir
     * @returns {{bid:number, chap:number}|null}
     */
    step(v, bid, chap, dir) {
        let b = bid, c = chap
        for (let guard = 0; guard < 1200; guard++) {
            c += dir
            if (c < 1) {
                b--
                if (b < 1) return null
                c = BibleConstant.COUNT_OF_CHAP[b - 1]
            } else if (c > BibleConstant.COUNT_OF_CHAP[b - 1]) {
                b++
                if (b > 66) return null
                c = 1
            }
            if (this.variants(v, b, c).length) return { bid: b, chap: c }
        }
        return null
    }

    /** @returns {'all'|'ot'|'nt'|'part'} */
    #coverage(v) {
        const ch = this.#cov.get(v).ch
        const full = (b0, b1) => {
            for (let b = b0; b <= b1; b++) {
                const vs = ch.get(b)
                if (vs == null) return false
                const all = new Set(Object.values(vs).flatMap(s => [...s]))
                if (all.size < BibleConstant.COUNT_OF_CHAP[b - 1]) return false
            }
            return true
        }
        const ot = full(1, 39), nt = full(40, 66)
        const anyOt = [...ch.keys()].some(b => b <= 39)
        const anyNt = [...ch.keys()].some(b => b >= 40)
        if (ot && nt) return 'all'
        if (nt && !anyOt) return 'nt'
        if (ot && !anyNt) return 'ot'
        return 'part'
    }
}

/** 顯示用：覆蓋度 → 文字 */
export const COVERAGE_TEXT = { all: '新舊約', ot: '舊約', nt: '新約', part: '部分' }

/** 秒 → "3:05"、"1:02:03" */
export function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0
    sec = Math.floor(sec)
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60
    const ss = String(s).padStart(2, '0')
    return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}
