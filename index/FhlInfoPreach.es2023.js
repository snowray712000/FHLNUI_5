import { PREACH_BOOKS, parseSermon } from './PreachSermon.es2023.js'
import { BibleConstant } from './BibleConstant.es2023.js'
import { fetchTextAsync } from './fetchAsync.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { formatTime } from './AudioBibleVersions.es2023.js'
import { MediaNowPlaying } from './MediaNowPlaying.es2023.js'
import { el, icon } from './auDom.es2023.js'

/**
 * 講道分頁 (FhlInfoContent 的 fhlInfoPreach，第一次切到時才載入)。取代舊的 static/preach_api/preach_api.js。
 *
 * - 與有聲聖經同一套外觀 (index/AudioBible.css，.au-* 與 .pr-*)
 * - PreachPlayer 常駐：<audio> 放在 body 下的 holder，切到別的分頁不中斷；迷你播放列、
 *   同時只播一個 (播講道時有聲聖經暫停，反之亦然) 在 MediaNowPlaying
 * - 每位講員一張卡片：講員、經文範圍、大綱、錄音 (台語 / 華語…)、上一段 / 下一段 (該講員的)
 * - 讀經換節時整個重建，但正在播的不會停；若它不在新的卡片裡，上方顯示「正在播放」
 */

const TAB_ID = 'fhlInfoPreach'
const RATES = [0.75, 1, 1.25, 1.5, 2]

/** @type {Map<string, Promise<import('./PreachSermon.es2023.js').DPreachSermon|null>>} */
const cache = new Map()
/**
 * @param {number} bookid @param {string} engs @param {number} chap @param {number} sec @param {number} gb
 */
function querySermonAsync(bookid, engs, chap, sec, gb) {
    const key = [bookid, engs, chap, sec, gb].join('|')
    if (!cache.has(key)) {
        const root = window.fhl?.urlJSON ?? '/json/'
        const qs = new URLSearchParams({ engs, chap, sec, book: bookid, gb })
        const p = fetchTextAsync(`${root}sc.php?${qs}`, { timeout: 20000 })
            .then(text => parseSermon(JSON.parse(text), bookid))
        p.catch(() => cache.delete(key)) // 失敗的不留，下次再試
        cache.set(key, p)
    }
    return cache.get(key)
}

/** @typedef {{url:string, label:string, speaker:string, title:string}} DPreachNow */

export class PreachPlayer {
    static #s = null
    /** @returns {PreachPlayer} */
    static get s() { if (!this.#s) this.#s = new PreachPlayer(); return this.#s }

    /** @type {HTMLAudioElement} */
    media
    /** @type {DPreachNow|null} 目前載入的錄音 */
    cur = null
    rate = 1
    hasError = false
    /** @type {(() => void)|null} 目前分頁畫面的更新函式 */
    onChange = null
    onTime = null

    constructor() {
        this.rate = TPPageState.s.preachRate ?? 1
        const holder = el('div', { class: 'au-holder', 'aria-hidden': 'true' })
        this.media = el('audio', { preload: 'metadata' })
        holder.append(this.media)
        document.body.append(holder)

        const m = this.media
        const changed = () => { this.onChange?.(); MediaNowPlaying.s.update() }
        m.addEventListener('play', changed)
        m.addEventListener('pause', changed)
        m.addEventListener('ended', changed)
        m.addEventListener('loadedmetadata', () => { m.playbackRate = this.rate; this.onTime?.() })
        m.addEventListener('timeupdate', () => this.onTime?.())
        m.addEventListener('error', () => { if (m.getAttribute('src')) { this.hasError = true; changed() } })

        MediaNowPlaying.s.register({
            tabId: TAB_ID,
            media: m,
            miniText: () => `講道・${this.cur?.speaker ?? ''} ${this.cur?.title ?? ''}`,
            meta: () => ({ title: `${this.cur?.title ?? ''} ${this.cur?.label ?? ''}`.trim(), artist: this.cur?.speaker ?? '', album: '信望愛講道' }),
        })
    }

    get isPlaying() { return !this.media.paused && !this.media.ended }

    /** 點某個錄音：同一個就播放 / 暫停，不同就換過去並播放 @param {DPreachNow} now */
    playTrack(now) {
        if (this.cur?.url == now.url) {
            if (this.isPlaying) this.media.pause()
            else this.#play()
            return
        }
        this.cur = now
        this.hasError = false
        this.media.src = now.url
        this.media.playbackRate = this.rate
        this.#play()
        this.onChange?.()
    }
    toggle() {
        if (this.isPlaying) this.media.pause()
        else this.#play()
    }
    setRate(rate) {
        this.rate = rate
        this.media.playbackRate = rate
        const ps = TPPageState.s
        ps.preachRate = rate
        ps.saveToLocalStorage()
        this.onChange?.()
    }
    /** @param {number} ratio 0~1 */
    seek(ratio) {
        const d = this.media.duration
        if (isFinite(d)) this.media.currentTime = Math.min(d - 0.5, Math.max(0, ratio * d))
    }
    #play() {
        if (!this.media.getAttribute('src')) return
        this.media.play().catch(err => { if (err.name != 'AbortError') console.warn('講道播放失敗', err) })
    }
}

export class FhlInfoPreach {
    static #s = null
    /** @returns {FhlInfoPreach} */
    static get s() { if (!this.#s) this.#s = new FhlInfoPreach(); return this.#s }

    /**
     * @param {TPPageState} ps
     * @param {JQuery<HTMLElement>} dom #fhlInfoContent
     */
    render(ps, dom) {
        const p = PreachPlayer.s
        const engs = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[ps.bookIndex - 1]
        const gb = ps.gb == 1 ? 1 : 0

        const r = {}
        r.now = el('div', { class: 'pr-now' })
        r.cards = el('div', { class: 'pr-cards' }, el('div', { class: 'au-empty', text: '載入中…' }))
        r.rates = el('div', { class: 'au-seg', role: 'group', 'aria-label': '播放速度' },
            ...RATES.map(v => el('button', { class: 'au-chip', type: 'button', 'data-rate': v, onclick: () => p.setRate(v) }, `${v}×`)))
        const root = el('div', { class: 'au-panel pr-panel' },
            r.now,
            r.cards,
            el('div', { class: 'au-row' }, el('span', { class: 'au-label', text: '速度' }), r.rates),
            el('div', { class: 'au-foot' }, '講道錄音來源 ',
                el('a', { href: 'https://bible.fhl.net/', target: '_blank', rel: 'noopener', text: '信望愛站' })),
        )
        root._r = r
        dom[0].replaceChildren(root)
        p.onChange = () => { if (root.isConnected) this.#update(p, root) }
        p.onTime = () => { if (root.isConnected) this.#updateTime(p, root) }
        this.#update(p, root)

        // 每位講員各自查；全部回來才決定要不要顯示「沒有講道」
        const slots = PREACH_BOOKS.map(() => el('div', { class: 'pr-slot' }))
        Promise.allSettled(PREACH_BOOKS.map((bookid, i) =>
            this.#loadCardAsync(slots[i], bookid, { engs, chap: ps.chap, sec: ps.sec }, gb, root)))
            .then(results => {
                if (!root.isConnected) return
                const n = results.filter(a1 => a1.status == 'fulfilled' && a1.value).length
                const failed = results.some(a1 => a1.status == 'rejected')
                if (n) r.cards.replaceChildren(...slots)
                else r.cards.replaceChildren(el('div', { class: 'au-empty' },
                    failed ? '講道資料載入失敗，請檢查網路後再切換一次。' : '這節經文沒有講道錄音。'))
                this.#update(p, root)
            })
    }

    /**
     * 查一位講員的某段講道，畫在 slot 裡。上一段 / 下一段只換這張卡片
     * @returns {Promise<boolean>} 有沒有資料
     */
    async #loadCardAsync(slot, bookid, link, gb, root) {
        const sermon = await querySermonAsync(bookid, link.engs, link.chap, link.sec, gb)
        if (!root.isConnected) return false
        if (sermon == null) { slot.replaceChildren(); return false }
        const go = lk => {
            slot.classList.add('pr-loading')
            this.#loadCardAsync(slot, bookid, { engs: lk.engs, chap: +lk.chap, sec: +lk.sec }, gb, root)
                .finally(() => slot.classList.remove('pr-loading'))
        }
        slot.replaceChildren(this.#card(sermon, go))
        this.#update(PreachPlayer.s, root)
        return true
    }

    /** @param {import('./PreachSermon.es2023.js').DPreachSermon} s */
    #card(s, go) {
        return el('section', { class: 'pr-card' },
            el('div', { class: 'pr-card-head' },
                el('div', { class: 'pr-speaker', text: s.speaker }),
                el('div', { class: 'pr-range', text: s.title })),
            s.outline.length ? el('div', { class: 'pr-outline' }, ...s.outline.map(a1 => el('div', { text: a1 }))) : null,
            el('div', { class: 'pr-tracks' }, ...s.tracks.map(t =>
                this.#trackRow({ url: t.url, label: t.label, speaker: s.speaker, title: s.title }))),
            (s.prev || s.next) ? el('div', { class: 'pr-nav' },
                el('button', { class: 'au-link', type: 'button', disabled: s.prev == null, onclick: () => go(s.prev) }, icon('angle-left'), ' 上一段'),
                el('button', { class: 'au-link', type: 'button', disabled: s.next == null, onclick: () => go(s.next) }, '下一段 ', icon('angle-right'))) : null,
        )
    }

    /** 一個錄音：播放鍵、名稱、(播放中) 進度、下載 @param {DPreachNow} now */
    #trackRow(now, isNowBlock = false) {
        const p = PreachPlayer.s
        const bar = el('input', { class: 'au-bar', type: 'range', min: 0, max: 1000, step: 1, value: 0, 'aria-label': '播放進度' })
        const cur = el('span', { class: 'au-time pr-cur' })
        const remain = el('span', { class: 'au-time pr-remain' })
        bar.addEventListener('input', () => { row._seeking = true; cur.textContent = formatTime(bar.value / 1000 * (p.media.duration || 0)) })
        bar.addEventListener('change', () => { row._seeking = false; p.seek(bar.value / 1000) })
        const label = isNowBlock ? `正在播放：${now.speaker} ${now.title}${now.label ? `（${now.label}）` : ''}` : (now.label || '講道錄音')
        const row = el('div', { class: 'pr-track', 'data-url': now.url },
            el('button', { class: 'pr-play', type: 'button', onclick: () => p.playTrack(now) }),
            el('div', { class: 'pr-track-main' },
                el('div', { class: 'pr-track-label' }, label, el('span', { class: 'pr-err', text: '：載入失敗', hidden: true })),
                el('div', { class: 'au-prog pr-prog' }, cur, bar, remain)),
            el('a', { class: 'au-link pr-dl', href: now.url, target: '_blank', rel: 'noopener', download: true, title: '下載 mp3', 'aria-label': '下載 mp3' }, icon('download')),
        )
        row._bar = bar; row._cur = cur; row._remain = remain
        return row
    }

    /** @param {PreachPlayer} p @param {HTMLElement} root */
    #update(p, root) {
        const r = root._r
        for (const b of r.rates.children) b.classList.toggle('on', +b.dataset.rate == p.rate)

        // 正在播的若不在目前的卡片裡 (換了經文)，放在最上面
        const inCards = p.cur != null && [...r.cards.querySelectorAll('.pr-track')].some(a1 => a1.dataset.url == p.cur.url)
        const needNow = p.cur != null && !inCards && (p.isPlaying || p.media.currentTime > 0)
        if (!needNow) r.now.replaceChildren()
        else if (r.now.firstChild?.dataset.url != p.cur.url) r.now.replaceChildren(this.#trackRow(p.cur, true))

        for (const row of root.querySelectorAll('.pr-track')) {
            const on = row.dataset.url == p.cur?.url
            const playing = on && p.isPlaying
            row.classList.toggle('on', on)
            const btn = row.querySelector('.pr-play')
            btn.replaceChildren(icon(playing ? 'pause' : 'play'))
            btn.setAttribute('aria-label', playing ? '暫停' : '播放')
            row.querySelector('.pr-prog').hidden = !on
            row.querySelector('.pr-err').hidden = !(on && p.hasError)
        }
        this.#updateTime(p, root)
    }

    /** @param {PreachPlayer} p @param {HTMLElement} root */
    #updateTime(p, root) {
        const m = p.media
        const d = m.duration
        for (const row of root.querySelectorAll('.pr-track.on')) {
            if (!row._seeking) {
                row._cur.textContent = formatTime(m.currentTime)
                row._bar.value = isFinite(d) && d > 0 ? Math.round(m.currentTime / d * 1000) : 0
            }
            row._remain.textContent = isFinite(d) ? '-' + formatTime(d - m.currentTime) : '-:--'
            row._bar.disabled = !isFinite(d)
        }
    }
}
