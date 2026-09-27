import { AudioBibleIndex, AUDIO_VERSION_DEFAULT, COVERAGE_TEXT, formatTime } from './AudioBibleVersions.es2023.js'
import { BibleConstant } from './BibleConstant.es2023.js'
import { fetchJsonAsync } from './fetchAsync.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js'
import { BookSelect } from './BookSelect.es2023.js'
import { FhlLecture } from './FhlLecture.es2023.js'
import { FhlInfo } from './FhlInfo.es2023.js'
import { ViewHistory } from './ViewHistory.es2023.js'
import { MediaNowPlaying } from './MediaNowPlaying.es2023.js'
import { el, icon } from './auDom.es2023.js'

/**
 * 有聲聖經分頁 (FhlInfoContent 的 fhlInfoAudio，第一次切到時才載入)
 *
 * - AudioBiblePlayer：常駐。只有一個 <video>，mp3 也用它播 (聲音模式時藏在 body 下的 holder)。
 *   不放在 #fhlInfoContent 裡，因為其它分頁 render 時會 .html() 清掉內容，media 被移出 document 就會暫停；
 *   這樣切到別的分頁也不會中斷。迷你播放列、同時只播一個、鎖定畫面控制在 MediaNowPlaying (講道也用)。
 * - 跟著閱讀：經文換章 ('go' 事件) → 播放器換章 (播放中就接著播)；播完接下一章 → 經文也翻到下一章。
 * - FhlInfoAudio：分頁畫面，每次 render 重建，狀態都在 player。
 * - 顏色一律走 css 變數 --au-* (index/AudioBible.css)。
 */

const TAB_ID = 'fhlInfoAudio'
const RATES = [0.75, 1, 1.25, 1.5, 2]

/** @type {Promise<AudioBibleIndex>|undefined} */
let indexLoading
function loadIndexAsync() {
    indexLoading ??= fetchJsonAsync('index/audio_bible_index.json', { timeout: 20000 })
        .then(jo => new AudioBibleIndex(jo))
        .catch(err => { indexLoading = undefined; throw err })
    return indexLoading
}


function bookName(bid) {
    const names = TPPageState.s.gb == 1 ? BibleConstant.CHINESE_BOOK_NAMES_GB : BibleConstant.CHINESE_BOOK_NAMES
    return names[bid - 1]
}
function bookShort(bid) {
    const names = TPPageState.s.gb == 1 ? BibleConstant.CHINESE_BOOK_ABBREVIATIONS_GB : BibleConstant.CHINESE_BOOK_ABBREVIATIONS
    return names[bid - 1]
}

export class AudioBiblePlayer {
    static #s = null
    /** @returns {AudioBiblePlayer} */
    static get s() { if (!this.#s) this.#s = new AudioBiblePlayer(); return this.#s }

    /** @type {AudioBibleIndex|null} */
    idx = null
    /** @type {HTMLVideoElement} */
    media
    /** 聲音模式時 media 放這裡 */
    holder
    v = AUDIO_VERSION_DEFAULT
    variant = ''
    bid = 1
    chap = 1
    /** @type {'audio'|'video'} */
    mode = 'audio'
    rate = 1
    autoNext = true
    /** 版本清單是否展開 (分頁重建時保留) */
    isListOpen = false
    /** @type {''|'none'|'error'} none: 這個版本沒有這章 */
    problem = ''
    /** @type {(() => void)|null} 目前分頁畫面的更新函式 */
    onChange = null
    onTime = null

    constructor() {
        const ps = TPPageState.s
        this.v = ps.audioVer ?? AUDIO_VERSION_DEFAULT
        this.rate = ps.audioRate ?? 1
        this.autoNext = (ps.audioAutoNext ?? 1) == 1
        this.mode = ps.audioMode == 'video' ? 'video' : 'audio'

        this.holder = el('div', { class: 'au-holder', 'aria-hidden': 'true' })
        this.media = el('video', { class: 'au-media', preload: 'metadata', playsinline: true, 'webkit-playsinline': true })
        this.holder.append(this.media)
        document.body.append(this.holder)

        const m = this.media
        m.addEventListener('play', () => this.#changed())
        m.addEventListener('pause', () => this.#changed())
        m.addEventListener('loadedmetadata', () => { m.playbackRate = this.rate; this.#time() })
        m.addEventListener('timeupdate', () => this.#time())
        m.addEventListener('ended', () => { if (this.autoNext) this.step(1, true); else this.#changed() })
        m.addEventListener('error', () => { if (m.getAttribute('src')) { this.problem = 'error'; this.#changed() } })

        MediaNowPlaying.s.register({
            tabId: TAB_ID,
            media: m,
            miniText: () => `${bookShort(this.bid)} ${this.chap}・${this.versionText}`,
            meta: () => ({ title: this.refText, artist: this.versionText, album: '信望愛有聲聖經' }),
            prev: () => this.step(-1),
            next: () => this.step(1),
        })

        // 經文換章 → 播放器跟著換 (播放中就接著播)
        $(document).on('go', (_, addr) => {
            if (addr?.book >= 1 && addr?.chap >= 1 && (addr.book != this.bid || addr.chap != this.chap))
                this.setChapter(addr.book, addr.chap)
        })
        // 離開分頁前把 video 移回 holder，否則其它分頁清內容時會被移出 document 而暫停
        $(document).on('InfoTitleChanged', (_, e) => {
            if (e.titleId != TAB_ID) this.holder.append(this.media)
        })
    }

    get isPlaying() { return !this.media.paused && !this.media.ended }
    get version() { return this.idx?.get(this.v) }
    /** 這一章 (目前的朗讀版本) 有沒有投影片 */
    get canVideo() { return this.idx?.hasMp4(this.v, this.bid, this.chap, this.variant) ?? false }
    get isVideo() { return this.mode == 'video' && this.canVideo }

    async initAsync() {
        if (this.idx) return
        this.idx = await loadIndexAsync()
        if (this.version == null) this.v = AUDIO_VERSION_DEFAULT
    }

    /**
     * @param {number} bid @param {number} chap
     * @param {{play?: boolean}} [opt] play: 換完就播 (未指定時：原本在播就接著播)
     */
    setChapter(bid, chap, opt = {}) {
        const play = opt.play ?? this.isPlaying
        this.bid = bid
        this.chap = chap
        this.#load(play)
    }
    setVersion(v) {
        if (v == this.v) return
        this.v = v
        this.#save({ audioVer: v })
        this.#load(this.isPlaying)
    }
    setVariant(variant) {
        if (variant == this.variant) return
        this.variant = variant
        this.#load(this.isPlaying)
    }
    setMode(mode) {
        if (mode == this.mode) return
        const t = this.media.currentTime
        this.mode = mode
        this.#save({ audioMode: mode })
        this.#load(this.isPlaying, t) // 投影片與聲音是同一段朗讀，接著同一個時間點
    }
    setRate(rate) {
        this.rate = rate
        this.media.playbackRate = rate
        this.#save({ audioRate: rate })
        this.#changed()
    }
    setAutoNext(b) {
        this.autoNext = b
        this.#save({ audioAutoNext: b ? 1 : 0 })
        this.#changed()
    }
    toggle() {
        if (this.isPlaying) this.media.pause()
        else this.play()
    }
    play() {
        if (!this.media.getAttribute('src')) return
        this.media.play().catch(err => { if (err.name != 'AbortError') console.warn('有聲聖經播放失敗', err) })
    }
    /** @param {number} ratio 0~1 */
    seek(ratio) {
        const d = this.media.duration
        if (isFinite(d)) this.media.currentTime = Math.min(d - 0.5, Math.max(0, ratio * d))
    }
    /**
     * 上一章 / 下一章 (跳過此版本沒有的章)，經文也跟著翻
     * @param {1|-1} dir @param {boolean} [play]
     */
    step(dir, play) {
        const nx = this.idx?.step(this.v, this.bid, this.chap, dir)
        if (nx == null) { this.#changed(); return }
        this.setChapter(nx.bid, nx.chap, { play: play ?? this.isPlaying })
        this.#navigateReading(nx.bid, nx.chap)
    }

    /**
     * 依目前 v bid chap variant mode 設定 src
     * @param {boolean} play @param {number} [startTime]
     */
    #load(play, startTime = 0) {
        if (this.idx == null) return
        const variants = this.idx.variants(this.v, this.bid, this.chap)
        if (!variants.includes(this.variant)) this.variant = variants[0] ?? '' // 換章、換版本時，盡量保留同一個朗讀版本

        const url = variants.length == 0 ? null : this.idx.url(this.v, this.bid, this.chap, this.variant, this.isVideo ? 'mp4' : 'mp3')
        this.problem = url == null ? 'none' : ''
        const m = this.media
        if (url == null) {
            m.pause()
            m.removeAttribute('src')
            m.load()
        } else if (m.getAttribute('src') != url) {
            m.src = url
            m.playbackRate = this.rate
            if (startTime > 0) m.addEventListener('loadedmetadata', () => { m.currentTime = startTime }, { once: true })
            if (play) this.play()
        } else if (play && m.paused) this.play()
        this.#changed()
        this.#time()
    }
    #navigateReading(bid, chap) {
        const ps = TPPageState.s
        if (ps.bookIndex == bid && ps.chap == chap) return
        ps.bookIndex = bid
        ps.chap = chap
        ps.sec = 1
        triggerGoEventWhenPageStateAddressChange(ps)
        BookSelect.s.render()
        FhlLecture.s.render()
        ViewHistory.s.render()
        FhlInfo.s.render(ps)
        $(document).trigger('chapchanged') // 更新網址 hash
    }
    #save(dict) {
        const ps = TPPageState.s
        Object.assign(ps, dict)
        ps.saveToLocalStorage()
    }
    #changed() {
        this.onChange?.()
        MediaNowPlaying.s.update()
    }
    #time() { this.onTime?.() }

    /** 顯示用：「馬太福音 5」 */
    get refText() { return `${bookName(this.bid)} ${this.chap}` }
    /** 顯示用：「現代台語譯本・Spring」 */
    get versionText() {
        const ver = this.version
        if (ver == null) return ''
        return ver.sub ? `${ver.label}・${ver.sub}` : ver.label
    }
}

export class FhlInfoAudio {
    static #s = null
    /** @returns {FhlInfoAudio} */
    static get s() { if (!this.#s) this.#s = new FhlInfoAudio(); return this.#s }

    /**
     * @param {TPPageState} ps
     * @param {JQuery<HTMLElement>} dom #fhlInfoContent
     */
    render(ps, dom) {
        const player = AudioBiblePlayer.s
        if (player.idx == null) {
            dom.html('<div class="au-panel"><div class="au-msg">載入中…</div></div>')
            player.initAsync().then(() => {
                if (TPPageState.s.titleId == TAB_ID) this.render(TPPageState.s, dom)
            }, err => {
                console.error('載入有聲聖經索引失敗', err)
                if (TPPageState.s.titleId == TAB_ID)
                    dom.html('<div class="au-panel"><div class="au-msg">有聲聖經索引載入失敗，請稍後再試。</div></div>')
            })
            return
        }
        if (player.bid != ps.bookIndex || player.chap != ps.chap || player.media.getAttribute('src') == null)
            player.setChapter(ps.bookIndex, ps.chap)

        const root = this.#build(player)
        dom[0].replaceChildren(root)
        player.onChange = () => { if (root.isConnected) this.#update(player, root) }
        player.onTime = () => { if (root.isConnected) this.#updateTime(player, root) }
        this.#update(player, root)
        this.#updateTime(player, root)
    }

    /** @param {AudioBiblePlayer} p */
    #build(p) {
        const r = {}
        r.ref = el('div', { class: 'au-ref' })
        r.verBtn = el('button', { class: 'au-ver-btn', type: 'button', 'aria-expanded': 'false', onclick: () => { p.isListOpen = !p.isListOpen; p.onChange?.() } })
        r.modes = el('div', { class: 'au-seg', role: 'group', 'aria-label': '播放方式' },
            ...[['audio', 'headphones', '聲音'], ['video', 'film', '投影片']].map(([m, ic, text]) =>
                el('button', { class: 'au-chip', type: 'button', 'data-mode': m, onclick: () => p.setMode(m) }, icon(ic), ` ${text}`)))
        r.stage = el('div', { class: 'au-stage' })
        r.msg = el('div', { class: 'au-msg', role: 'status' })

        r.prev = el('button', { class: 'au-icon-btn', type: 'button', 'aria-label': '上一章', title: '上一章', onclick: () => p.step(-1) }, icon('step-backward'))
        r.play = el('button', { class: 'au-play', type: 'button', onclick: () => p.toggle() })
        r.next = el('button', { class: 'au-icon-btn', type: 'button', 'aria-label': '下一章', title: '下一章', onclick: () => p.step(1) }, icon('step-forward'))

        r.cur = el('span', { class: 'au-time' })
        r.remain = el('span', { class: 'au-time' })
        r.bar = el('input', { class: 'au-bar', type: 'range', min: 0, max: 1000, step: 1, value: 0, 'aria-label': '播放進度' })
        r.bar.addEventListener('input', () => { r.seeking = true; r.cur.textContent = formatTime(r.bar.value / 1000 * (p.media.duration || 0)) })
        r.bar.addEventListener('change', () => { r.seeking = false; p.seek(r.bar.value / 1000) })

        r.rates = el('div', { class: 'au-seg', role: 'group', 'aria-label': '播放速度' },
            ...RATES.map(v => el('button', { class: 'au-chip', type: 'button', 'data-rate': v, onclick: () => p.setRate(v) }, `${v}×`)))
        r.variants = el('div', { class: 'au-seg', role: 'group', 'aria-label': '朗讀版本' })
        r.variantRow = el('div', { class: 'au-row' }, el('span', { class: 'au-label', text: '朗讀' }), r.variants)
        r.auto = el('input', { type: 'checkbox', onchange: () => p.setAutoNext(r.auto.checked) })
        r.download = el('a', { class: 'au-link', target: '_blank', rel: 'noopener', download: true }, icon('download'), ' 下載')
        r.full = el('button', { class: 'au-link', type: 'button', onclick: () => fullscreen(p.media) }, icon('arrows-alt'), ' 全螢幕')

        r.list = el('div', { class: 'au-list' })

        const root = el('div', { class: 'au-panel' },
            el('div', { class: 'au-head' }, r.ref, r.verBtn),
            r.list,
            r.modes,
            r.stage,
            r.msg,
            el('div', { class: 'au-ctrl' }, r.prev, r.play, r.next),
            el('div', { class: 'au-prog' }, r.cur, r.bar, r.remain),
            el('div', { class: 'au-row' }, el('span', { class: 'au-label', text: '速度' }), r.rates),
            r.variantRow,
            el('div', { class: 'au-row au-row-links' },
                el('label', { class: 'au-check' }, r.auto, ' 播完接下一章'),
                el('span', { class: 'au-spacer' }), r.full, r.download),
            el('div', { class: 'au-foot' }, '聲音來源 ',
                el('a', { href: 'https://bible.fhl.net/index.html', target: '_blank', rel: 'noopener', text: '信望愛站' }),
                `・版本索引 ${p.idx.generated}`),
        )
        root._r = r
        return root
    }

    /** @param {AudioBiblePlayer} p @param {HTMLElement} root */
    #update(p, root) {
        const r = root._r
        const ver = p.version
        r.ref.textContent = p.refText
        r.verBtn.replaceChildren(el('span', { text: p.versionText }), ' ', icon(p.isListOpen ? 'chevron-up' : 'chevron-down'))
        r.verBtn.setAttribute('aria-expanded', String(p.isListOpen))

        // 版本清單
        r.list.hidden = !p.isListOpen
        if (p.isListOpen) this.#renderList(p, r.list)

        // 聲音 / 投影片
        r.modes.hidden = !ver?.hasMp4
        for (const b of r.modes.children) b.classList.toggle('on', b.dataset.mode == (p.isVideo ? 'video' : 'audio'))
        r.stage.hidden = !p.isVideo
        if (p.isVideo) { if (p.media.parentNode != r.stage) r.stage.append(p.media) }
        else if (p.media.parentNode != p.holder) p.holder.append(p.media)
        r.full.hidden = !p.isVideo

        // 訊息
        let msg = ''
        if (p.problem == 'none') msg = `「${p.versionText}」沒有 ${p.refText} 章的錄音${this.#suggest(p)}`
        else if (p.problem == 'error') msg = '音檔載入失敗，請檢查網路，或換一個版本。'
        else if (p.mode == 'video' && ver?.hasMp4 && !p.canVideo) msg = '本章沒有投影片，改播聲音。'
        r.msg.textContent = msg
        r.msg.hidden = msg == ''

        const ok = p.problem != 'none'
        r.play.disabled = !ok
        r.play.replaceChildren(icon(p.isPlaying ? 'pause' : 'play'))
        r.play.setAttribute('aria-label', p.isPlaying ? '暫停' : '播放')
        r.play.classList.toggle('playing', p.isPlaying)

        for (const b of r.rates.children) b.classList.toggle('on', +b.dataset.rate == p.rate)

        const variants = p.idx.variants(p.v, p.bid, p.chap)
        r.variantRow.hidden = variants.length < 2
        r.variants.replaceChildren(...variants.map((k, i) => el('button', {
            class: 'au-chip' + (k == p.variant ? ' on' : ''), type: 'button', onclick: () => p.setVariant(k),
        }, ver?.variantNames[k] ?? (k == '' ? (ver?.sub || '預設') : `${i + 1}`))))

        r.auto.checked = p.autoNext
        const src = p.media.getAttribute('src')
        r.download.hidden = !src
        if (src) r.download.href = src
    }

    /** 沒有這章時，建議幾個有的版本 */
    #suggest(p) {
        const others = p.idx.versions.filter(a1 => a1.v != p.v && p.idx.variants(a1.v, p.bid, p.chap).length).slice(0, 3)
        if (others.length == 0) return '。'
        return `，可改聽：${others.map(a1 => a1.sub ? `${a1.label}・${a1.sub}` : a1.label).join('、')}…`
    }

    /** @param {AudioBiblePlayer} p @param {HTMLElement} list */
    #renderList(p, list) {
        list.replaceChildren(...p.idx.groups().map(([group, vers]) => el('div', { class: 'au-group' },
            el('div', { class: 'au-group-name', text: group }),
            ...vers.map(ver => {
                const has = p.idx.hasBook(ver.v, p.bid)
                return el('button', {
                    class: 'au-item' + (ver.v == p.v ? ' on' : '') + (has ? '' : ' off'),
                    type: 'button',
                    title: has ? ver.name : `${ver.name}：沒有${bookName(p.bid)}`,
                    onclick: () => { p.isListOpen = false; p.setVersion(ver.v); p.onChange?.() },
                },
                    el('span', { class: 'au-item-name' }, ver.label, ver.sub ? el('small', { text: ver.sub }) : null),
                    ver.hasMp4 ? el('span', { class: 'au-item-mp4', title: '有投影片' }, icon('film')) : null,
                    el('span', { class: 'au-item-cov', text: COVERAGE_TEXT[ver.coverage] }))
            }))))
    }

    /** @param {AudioBiblePlayer} p @param {HTMLElement} root */
    #updateTime(p, root) {
        const r = root._r
        const m = p.media
        const d = m.duration
        if (!r.seeking) {
            r.cur.textContent = formatTime(m.currentTime)
            r.bar.value = isFinite(d) && d > 0 ? Math.round(m.currentTime / d * 1000) : 0
        }
        r.remain.textContent = isFinite(d) ? '-' + formatTime(d - m.currentTime) : '-:--'
        r.bar.disabled = !isFinite(d)
    }
}

/** @param {HTMLVideoElement} v */
function fullscreen(v) {
    if (v.requestFullscreen) v.requestFullscreen().catch(() => { })
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen() // iOS Safari
}
