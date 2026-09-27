import { TPPageState } from './TPPageState.es2023.js'

/**
 * 常駐播放器 (有聲聖經、講道) 共用：
 * - 同時只播一個：某個開始播，其它的暫停
 * - 迷你播放列：按過播放、且目前不在該分頁時，出現在 #fhlInfo 左下；點文字回到該分頁
 * - Media Session：手機鎖定畫面的標題、播放 / 暫停、上一個 / 下一個
 * 樣式在 index/AudioBible.css (.au-mini)
 *
 * @typedef {object} DMediaSource
 * @property {string} tabId 所屬分頁，例如 fhlInfoAudio
 * @property {HTMLMediaElement} media
 * @property {() => string} miniText 迷你播放列的文字，例如「太 5・和合本」
 * @property {() => {title:string, artist:string, album:string}} [meta] Media Session
 * @property {() => void} [prev] 鎖定畫面「上一個」，沒有就不顯示
 * @property {() => void} [next]
 * @property {() => void} [onStop] 按迷你播放列的 ✕ 之後
 */
export class MediaNowPlaying {
    static #s = null
    /** @returns {MediaNowPlaying} */
    static get s() { if (!this.#s) this.#s = new MediaNowPlaying(); return this.#s }

    /** @type {DMediaSource[]} */
    sources = []
    /** @type {DMediaSource|null} 最後按過播放的那個；null 表示迷你播放列不顯示 */
    active = null
    mini
    miniBtn
    miniText

    constructor() {
        const el = (tag, cls, attrs = {}) => Object.assign(document.createElement(tag), { className: cls, type: 'button' }, attrs)
        this.miniBtn = el('button', 'au-mini-btn', { onclick: () => this.#toggle() })
        this.miniText = el('button', 'au-mini-text', { title: '回到播放的分頁', onclick: () => this.active && $('#' + this.active.tabId).trigger('click') })
        const close = el('button', 'au-mini-btn', { title: '停止', innerHTML: '<i class="fa fa-times" aria-hidden="true"></i>', onclick: () => this.stop() })
        close.setAttribute('aria-label', '停止')
        this.mini = Object.assign(document.createElement('div'), { className: 'au-mini', hidden: true })
        this.mini.append(this.miniBtn, this.miniText, close)
        $('#fhlInfo').append(this.mini)

        $(document).on('InfoTitleChanged', () => this.update())
    }

    /** @param {DMediaSource} src */
    register(src) {
        this.sources.push(src)
        const m = src.media
        m.addEventListener('play', () => {
            for (const o of this.sources) if (o !== src && !o.media.paused) o.media.pause()
            this.active = src
            this.#setSessionHandlers(src)
            this.update()
        })
        m.addEventListener('pause', () => this.update())
        m.addEventListener('ended', () => this.update())
    }

    /** 迷你播放列的 ✕ */
    stop() {
        const src = this.active
        if (src == null) return
        src.media.pause()
        this.active = null
        src.onStop?.()
        this.update()
    }

    /** 播放狀態、目前播什麼、目前分頁改變時呼叫 */
    update() {
        const src = this.active
        const show = src != null && TPPageState.s.titleId != src.tabId
        this.mini.hidden = !show
        if (src != null) this.#updateSession(src)
        if (!show) return
        const playing = !src.media.paused && !src.media.ended
        this.miniBtn.innerHTML = `<i class="fa fa-${playing ? 'pause' : 'play'}" aria-hidden="true"></i>`
        this.miniBtn.setAttribute('aria-label', playing ? '暫停' : '播放')
        this.miniText.textContent = src.miniText()
    }

    #toggle() {
        const m = this.active?.media
        if (m == null) return
        if (m.paused || m.ended) m.play().catch(() => { })
        else m.pause()
    }

    /** @param {DMediaSource} src */
    #setSessionHandlers(src) {
        const ms = navigator.mediaSession
        if (ms == null) return
        const set = (action, fn) => { try { ms.setActionHandler(action, fn) } catch { /* 不支援的 action */ } }
        set('play', () => src.media.play().catch(() => { }))
        set('pause', () => src.media.pause())
        set('previoustrack', src.prev ?? null)
        set('nexttrack', src.next ?? null)
    }
    /** @param {DMediaSource} src */
    #updateSession(src) {
        const ms = navigator.mediaSession
        if (ms == null || typeof MediaMetadata == 'undefined' || src.meta == null) return
        const meta = src.meta()
        const cur = ms.metadata
        if (cur?.title == meta.title && cur?.artist == meta.artist) return
        ms.metadata = new MediaMetadata(meta)
    }
}
