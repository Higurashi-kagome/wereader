/* 用于提示是否确认删除标注 */
import Swal, { SweetAlertResult } from 'sweetalert2'

/**
 * 监听从背景页发过来的消息，如果是删除标注时的确认消息，则将用户确认消息通知给背景页
 */
function initDeleteMarksNotification() {
    console.log('initDeleteMarksNotification')
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (!msg.deleteBookmarks) return
        let insertText = '本章'
        if (msg.isAll) insertText = '全书'
        // 显示通知
        Swal.fire({
            icon: 'warning',
            title: `删除${insertText}标注？`,
            showCancelButton: true,
            confirmButtonText: '是',
            cancelButtonText: '不了'
        }).then((confirm: SweetAlertResult<unknown>) => {
            // 发送确认消息给背景页
            chrome.runtime.sendMessage({
                type: 'deleteBookmarks',
                confirm: confirm.value,
                isAll: msg.isAll
            })
        })
        sendResponse(true)
    })
}

export { initDeleteMarksNotification }
