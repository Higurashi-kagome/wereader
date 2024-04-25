/* 支持将想法中的 <> 转全角、支持 Ctrl+Enter 发布想法 */
import $ from 'jquery'

function initThoughtEdit() {
    console.log('initThoughtEdit')
    window.addEventListener('load', () => {
        const content = $('.app_content')[0] || $('.wr_horizontalReader_app_content')[0]
        content.arrive('.writeReview_submit_button.wr_btn.wr_btn_Big', { onceOnly: true }, function (btn) {
            const $btn = $(btn)
            const textarea = $('#WriteBookReview')
            // 按键替代，实现字符替换
            const btnClone = $(btn.cloneNode(true)).on('click', () => {
                chrome.storage.sync.get(['enableThoughtEsc'], function (result) {
                    if (result.enableThoughtEsc) {
                        const text = textarea.val() as string
                        const newText = text.replace(/</g, '＜').replace(/>/g, '＞')
                        textarea.val(newText)
                    }
                    $btn.trigger('click')
                })
            })
            // Ctrl+Enter 发布
            textarea.on('keydown', (e) => {
                if (e.ctrlKey && e.keyCode === 13) {
                    btnClone.trigger('click')
                }
            })
            $btn.css('display', 'none')
            $btn.parent().prepend(btnClone as JQuery<JQuery.Node>)
        })
    })
}

export { initThoughtEdit }
