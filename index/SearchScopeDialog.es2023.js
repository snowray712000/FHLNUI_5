import { DialogHtml } from './DialogHtml.es2023.js'
import { gbText } from './gbText.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { scopeTree, effectiveChecked, readScope, writeScope, scopeLabel } from './SearchScope.es2023.js'

/** 搜尋框旁「⚙」的按鈕 (放在 ? 旁邊) */
export const scopeButtonHtml = () => `<button type="button" class="search-scope-btn" title="${gbText('搜尋範圍')}"><i class="fa fa-cog"></i></button>`

/** @type {DialogHtml | null} */
let scopeDlg = null

/**
 * 目前搜尋範圍的簡短文字，例 `雅＋保羅書信`
 * @param {number} [ibook] 目前閱讀的書卷 0based，省略時用目前頁面的
 */
export function currentScopeLabel(ibook = TPPageState.s.bookIndex - 1) {
    return scopeLabel(fhl.g_book_group, readScope(fhl.g_book_group), ibook, gbText(fhl.g_book_all[ibook]?.[2] ?? ''), gbText)
}

/**
 * 在 root 內按 .search-scope-btn 開「搜尋範圍」設定 (同時只開一個)
 * @param {JQuery<HTMLElement>} root
 * @param {() => void} onChange 設定改了
 */
export function bindScopeButton(root, onChange) {
    // 滑鼠移上去才算 title (目前閱讀的書卷會變)
    root.off('mouseenter.searchScope').on('mouseenter.searchScope', '.search-scope-btn', e => { e.currentTarget.title = `${gbText('搜尋範圍')}：${currentScopeLabel()}` })
    root.off('click.searchScope').on('click.searchScope', '.search-scope-btn', e => { e.stopPropagation(); showScopeDialog(e.currentTarget, onChange) })
}

/** @param {HTMLElement} btn 設定視窗放在它旁邊 @param {() => void} onChange */
function showScopeDialog(btn, onChange) {
    scopeDlg?.dlg?.dialog('close')
    const dlgHtml = scopeDlg = new DialogHtml()
    dlgHtml.showDialog({
        html: '<div class="scope-dlg"></div>',
        width: Math.min(window.innerWidth - 16, 340),
        position: { my: 'right top', at: 'right bottom+8', of: btn, collision: 'fit' },
        getTitle: () => gbText('搜尋範圍'),
        registerEventWhenShowed: dlg => {
            const root = dlg.find('.scope-dlg')
            const tree = scopeTree(fhl.g_book_group)
            let checked = readScope(fhl.g_book_group)
            const curName = () => {
                const names = BibleNames()
                return gbText(names[TPPageState.s.bookIndex - 1] ?? '')
            }

            const render = () => {
                const eff = effectiveChecked(fhl.g_book_group, checked)
                const allOn = tree.every(n => checked.includes(n.name))
                root.empty().append(
                    $('<div class="scope-note">').text(gbText('只搜尋目前閱讀的書卷；勾選的分類也一起搜尋。')),
                    $('<label class="scope-row scope-cur">').append(
                        $('<input type="checkbox" checked disabled>'),
                        $('<span>').text(`${gbText('目前閱讀的書卷')}：${curName()}`)),
                    $('<button type="button" class="scope-all">').text(allOn ? gbText('全部不勾') : gbText('全部勾選')),
                    ...tree.map(n => {
                        const by = eff.get(n.name)
                        const on = eff.has(n.name)
                        return $('<label class="scope-row">').css('padding-left', `${n.depth * 1.4}em`)
                            .attr('title', by ? `${gbText('含於')} ${gbText(by)}` : null)
                            .toggleClass('scope-implied', by != null)
                            .append(
                                $('<input type="checkbox">').attr('data-name', n.name).prop('checked', on).prop('disabled', by != null),
                                $('<span>').text(gbText(n.name)),
                                by ? $('<small>').text(`${gbText('含於')} ${gbText(by)}`) : null)
                    }))
            }
            const save = () => { writeScope(checked); onChange(); render() }

            root.on('change', 'input[data-name]', function () {
                const name = this.getAttribute('data-name')
                checked = this.checked ? [...new Set([...checked, name])] : checked.filter(x => x != name)
                save()
            }).on('click', '.scope-all', () => {
                checked = tree.every(n => checked.includes(n.name)) ? [] : tree.map(n => n.name)
                save()
            })
            dlg.on('dialogclose', () => { if (scopeDlg == dlgHtml) scopeDlg = null })
            render()
        },
    })
}

/** 書卷中文全名 (0based)，gb 轉換由呼叫端 */
function BibleNames() {
    return fhl.g_book_all.map(a1 => a1[2])
}
