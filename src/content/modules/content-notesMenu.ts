/* 给标注添加目录 */
import $ from 'jquery'
import { getCurrentChapTitle, loadCSS } from './content-utils'
import { noteBtnClassName } from '../../common/constants'

function initNotesMenu() {
    console.log('initNotesMenu')
    loadCSS('content/static/css/notes-menu.css', 'wereader-notes-menu-style-el')
    window.addEventListener('load', () => {
        const titleScrollSelector = '#sectionListItem_title_scroll'
        // 出现切换章节且已经创建目录，则重新标记当前章节（点击按钮再处理比较慢，所以提前监听，加快处理目录的速度）
        // 后来发现好像和扩展也没多少关系，标注比较多时本来就比较慢...
        const content = $('.app_content')[0] || $('.wr_horizontalReader_app_content')[0]
        content.arrive('.readerChapterContent', function onArrive() {
            const curChapTitle = getCurrentChapTitle()
            if ($(titleScrollSelector).length) { // 如果已经创建目录
                $(`${titleScrollSelector} a.current`).removeClass('current') // 删除之前章节标注
                $(`${titleScrollSelector} a`).each((idx, el) => { // 标记当前章节
                    const title = $(el)
                    if (title.text() === curChapTitle) title.addClass('current')
                })
            }
        })
        document.querySelector(`.${noteBtnClassName}`)?.addEventListener('click', () => {
            if ($(titleScrollSelector).length) return // 已经创建则不需要重新创建
            // 开始创建
            const btn = $('<button class=\'notesMenuBtn\'>目录</button>').prependTo('#noteTools') // #noteTools 在 searchNote 中创建
            const ul = $(`<ul id='${titleScrollSelector.replace('#', '')}'></ul>`).prependTo('#noteTools')
            const curChapTitle = getCurrentChapTitle()
            $('.sectionListItem_title').each((idx, titleEl) => {
            // 标记当前章节
                const titleText = titleEl.textContent
                const className = (titleText === curChapTitle) ? 'current' : ''
                // 生成目录
                const li = $(`<li><a class='${className}'>${titleText}</a></li>`).click(() => {
                    // 标题被搜索框排除时也能够跳转
                    const titleParent = $(titleEl.parentElement!)
                    const isHide = titleParent.css('display') === 'none'
                    if (isHide) titleParent.css('display', 'block')
                    titleEl.parentElement!.scrollIntoView({ behavior: 'smooth' })
                    if (isHide) titleParent.css('display', 'none')
                    ul.toggle()
                })
                ul.append(li)
            })
            btn.on('click', () => { // “目录”按钮点击事件
                $(titleScrollSelector).toggle()
            })
        }, false)
    })
}

export { initNotesMenu }
