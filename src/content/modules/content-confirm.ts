import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2'
import { Message, MessageType } from '../../worker/types/Message'

/**
 * 监听发过来的消息，如果是 confirm 消息，则调用 mySweetAlert 显示通知
 */
function initConfirm() {
    console.log('initConfirm')
    // 监听后台消息
    chrome.runtime.onMessage.addListener((msg: Message, sender, sendResponse) => {
        if (msg.type !== MessageType.ShowConfirm) return
        /**
         * 处理确认消息
         * @param confirm 确认结果
         */
        const callback = (confirm: SweetAlertResult<unknown>) => {
            // 发送确认消息给背景页
            chrome.runtime.sendMessage({
                type: 'showConfirm',
                confirm: confirm.value
            })
        }
        // 显示通知
        if (typeof msg.data === 'string') {
            Swal.fire({
                icon: 'warning',
                title: msg.data,
                showCancelButton: true,
                confirmButtonText: '是',
                cancelButtonText: '不了'
            }).then(callback)
        } else {
            Swal.fire(msg.data as SweetAlertOptions).then(callback)
        }
        // 通知后台正常显示了通知
        sendResponse({ succ: 1 })
    })
}

export { initConfirm }
