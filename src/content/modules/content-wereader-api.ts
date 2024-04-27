// 监听来自背景页的消息，调用 Wereader 中的对于方法发起请求
import { Wereader } from '../../worker/types/Wereader'

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // request 是一个对象，包含 wereader 对象、将要调用的 methodName、method 是否为静态以及参数列表
    const { wereader, methodName, isStatic } = request
    if (wereader && methodName) {
        const args = request.args || []
        const contentWereader = new Wereader(wereader.bookId, wereader.userVid)
        // @ts-ignore
        const method = isStatic ? Wereader[methodName] : contentWereader[methodName]
        if (method) {
            const result = await method.apply(isStatic ? Wereader : contentWereader, args)
            sendResponse(result)
        } else {
            console.error('method not found: ', methodName)
        }
    }
    return true
})
