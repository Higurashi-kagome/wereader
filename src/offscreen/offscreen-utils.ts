import { Sender } from '../common/sender'
import { commandCopy } from '../common/utils'

/**
 * 复制文本（发消息给 worker，由 worker 处理）
 * @param text 待复制内容
 */
export async function workerCopy(text: string) {
    await new Sender('copy', text).sendToWorker().catch(() => chrome.runtime.lastError)
}

/**
 * 复制文本（document.execCommand 实现）
 * @param text 待复制内容
 */
export async function cmdCopy(text: string) {
    const sender = new Sender('send-alert-msg')
    try {
        commandCopy(text, '#text')
        sender.sendAlertMsg({ title: '复制成功', icon: 'success' })
    } catch (error) {
        console.error(error)
        sender.sendAlertMsg({ text: '复制出错', icon: 'warning' })
    } finally {
    // window.close()
    }
}

/**
 * 复制文本
 * @param text 待复制内容
 */
export async function copy(text: string) {
    await cmdCopy(text)
}
