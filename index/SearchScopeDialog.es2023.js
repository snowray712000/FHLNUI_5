import { DialogHtml } from './DialogHtml.es2023.js'
import { gbText } from './gbText.es2023.js'
import { TPPageState } from './TPPageState.es2023.js'
import { scopeTree, effectiveChecked, readScope, writeScope, scopeLabel, checkedWithImplicit, OPT_IN } from './SearchScope.es2023.js'
import { BookRegistry } from './BookRegistry.es2023.js'
import { searchBookGroups } from './searchBookGroups.es2023.js'

/** 搜尋框旁「⚙」的按鈕 (放在 ? 旁邊) */
export const scopeButtonHtml = () => `<button type="button" class="search-scope-btn" title="${gbText('搜尋範圍')}"><i class="fa fa-cog"></i></button>`

/** @type {DialogHtml | null} */
let scopeDlg = null

/**
 * 目前搜尋範圍的簡短文字，例 `雅＋保羅書信`
 * @param {number} [ibook] 目前閱讀的書卷 0based，省略時用目前頁面的
 */
export function currentScopeLabel(ibook = TPPageState.s.bookIndex - 1) {
    const groups = searchBookGroups()
    return scopeLabel(groups, readScope(groups), ibook, BookRegistry.nameFull(ibook + 1, TPPageState.s.gb == 1), gbText)
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
            const groups = searchBookGroups()
            const tree = scopeTree(groups)
            let checked = readScope(groups)
            const curName = () => BookRegistry.nameFull(TPPageState.s.bookIndex, TPPageState.s.gb == 1)
            const optIn = tree.filter(n => OPT_IN.includes(n.name)).map(n => n.name)

            const render = () => {
                const ibookCur = TPPageState.s.bookIndex - 1
                // 讀使徒教父時自動含整個使徒教父 (不必勾)
                const implicit = checkedWithImplicit(groups, [], ibookCur)
                const eff = effectiveChecked(groups, [...checked, ...implicit])
                const allOn = tree.every(n => checked.includes(n.name))
                root.empty().append(
                    $('<div class="scope-note">').text(gbText('只搜尋目前閱讀的書卷；勾選的分類也一起搜尋。')),
                    optIn.length ? $('<div class="scope-note">').text(`${optIn.map(gbText).join('、')} ${gbText('預設不搜尋，勾選才搜尋；讀它裡面的書時自動含。')}`) : null,
                    $('<label class="scope-row scope-cur">').append(
                        $('<input type="checkbox" checked disabled>'),
                        $('<span>').text(`${gbText('目前閱讀的書卷')}：${curName()}`)),
                    $('<button type="button" class="scope-all">').text(allOn ? gbText('全部不勾') : gbText('全部勾選')),
                    ...tree.map(n => {
                        const by = eff.get(n.name)
                        const on = eff.has(n.name)
                        const auto = implicit.includes(n.name) && !checked.includes(n.name) // 因為正在讀它裡面的書而含
                        const note = by ? `${gbText('含於')} ${gbText(by)}` : auto ? gbText('讀它的書時自動含') : null
                        return $('<label class="scope-row">').css('padding-left', `${n.depth * 1.4}em`)
                            .attr('title', note)
                            .toggleClass('scope-implied', by != null || auto)
                            .append(
                                $('<input type="checkbox">').attr('data-name', n.name).prop('checked', on).prop('disabled', by != null || auto),
                                $('<span>').text(gbText(n.name)),
                                note ? $('<small>').text(note) : null)
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


