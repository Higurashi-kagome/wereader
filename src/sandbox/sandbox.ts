import { Renderer } from '../common/renderer'

// 接收消息
// https://developer.chrome.com/docs/extensions/mv3/sandboxingEval/
window.addEventListener('message', async (event)=>{
    const message = event.data
    let result = ''
    if (message) {
        switch (message.command) {
        case 'render':
            try {
                result = await new Renderer().render(message.context, message.templateStr)
            } catch (error) {
                event.source?.postMessage({
                    error, command: message.command
                // eslint-disable-next-line no-undef
                }, event.origin as WindowPostMessageOptions)
                return
            }
            break
        default:
            break
        }
    }
    event.source?.postMessage({
        result: result, command: message.command
    // eslint-disable-next-line no-undef
    }, event.origin as WindowPostMessageOptions)
})
