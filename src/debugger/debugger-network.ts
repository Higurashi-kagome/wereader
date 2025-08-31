/* eslint-disable no-undef */
import Tab = chrome.tabs.Tab
import TabChangeInfo = chrome.tabs.TabChangeInfo

/**
 * 默认过滤器
 */
export function defaultFilter(url: string) {
    return url.startsWith('http') && !url.endsWith('css') && !url.endsWith('js')
}

/**
 * 默认响应处理器
 * @param body 响应体
 * @param detail 请求、响应信息
 * @param debuggee debuggee 用来关闭调试
 */
async function defaultOnResponseReceived(body: any, detail: Map<string, any>, debuggee: any) {
    console.log('detail', detail)
    console.log('body', body)
    // 关闭调试
    await chrome.debugger.detach(debuggee)
    return Promise.resolve(true)
}

function getBody(response: Object | undefined) {
    let body = null
    if (response) {
        body = (response as any).body
        try {
            body = JSON.parse(body)
        } catch (e) {
            // ignore
        }
        console.log('body', body)
    }
    return body
}

async function eventHandler(
    debuggee: any,
    method: string,
    params: any,
    tabId: number,
    filter = defaultFilter,
    responseHandler = defaultOnResponseReceived
) {
    if (tabId !== debuggee.tabId) {
        return Promise.reject(new Error('eventHandler: tabId not match'))
    }
    // 保存请求
    const detail = new Map<string, any>()
    if (method === 'Network.requestWillBeSent') {
        if (params.request && filter(params.request.url)) {
            detail.set('request', params.request)
        }
    }

    return new Promise((resolve, reject) => {
        // 保存响应
        if (method === 'Network.responseReceived' && filter(params.response.url)) {
            chrome.debugger.sendCommand({
                tabId: debuggee.tabId
            }, 'Network.getResponseBody', {
                requestId: params.requestId
            }, response => {
                detail.set('response', response)
                detail.set('url', params.response.url)
                responseHandler(getBody(response), detail, debuggee).then(resolve).catch(reject)
            })
        }
    })
}

/**
 * 调试开启回调
 */
async function onAttach(
    tabId: number,
    filter = defaultFilter,
    onSuccess = () => { },
    responseHandlers = [defaultOnResponseReceived]
) {
    console.log('attach', tabId)
    // 开启网络监控
    await chrome.debugger.sendCommand({ tabId }, 'Network.enable')

    // 监听事件，多个响应处理器都处理完成时结束
    let count = 0
    const successFunctions: { [key: string]: boolean } = {}
    chrome.debugger.onEvent.addListener(async (
        debuggee,
        method,
        params
    ) => {
        // 收到请求时调用
        // 遍历响应处理器列表并调用
        for (let i = 0; i < responseHandlers.length; i++) {
            const handler = responseHandlers[i]
            const handlerName = handler.name
            if (!successFunctions[handlerName]) {
                // eslint-disable-next-line no-await-in-loop
                const r = await eventHandler(debuggee, method, params, tabId, filter, handler)
                console.log('responseHandler success', handlerName)
                if (r) {
                    // 记录成功次数及成功函数
                    count++
                    successFunctions[handlerName] = true
                }
            }
        }
        if (count === responseHandlers.length) {
            // 返回真值次数等于处理器个数，结束调试
            await chrome.debugger.detach(debuggee)
            count = 0
            onSuccess()
        }
        return true
    })
}

/**
 * 调试指定 tab
 * @param tabId tab id
 * @param filter 请求过滤器，参数为 url
 * @param onSuccess 成功结束回调
 * @param responseHandlers 响应处理器列表，响应处理器参数为 body 和 detail（包含请求和响应信息）
 * @param reload 是否刷新页面
 */
export async function attachTab(
    tabId: number,
    filter = defaultFilter,
    reload = true,
    onSuccess = () => { },
    ...responseHandlers: (typeof defaultOnResponseReceived)[]
) {
    chrome.debugger.attach(
        { tabId },
        '1.0',
        () => onAttach(tabId, filter, onSuccess, responseHandlers)
    )
    // 发请求重新加载页面
    if (reload) {
        // 有的接口需要切换页面才会调用，所以在页面完成加载之后模拟切换页面
        const onUpdated = (aTabId: number, changeInfo: TabChangeInfo, tab: Tab) => {
            if (aTabId === tabId && changeInfo.status === 'complete' && tab.active) {
                // 打开新标签页
                chrome.tabs.create({ url: 'https://weread.qq.com/' }, (newTab) => {
                    // 立即关闭新标签页
                    if (newTab.id != null) {
                        chrome.tabs.remove(newTab.id)
                    }
                })
                chrome.tabs.onUpdated.removeListener(onUpdated)
            }
        }
        chrome.tabs.onUpdated.addListener(onUpdated)
        // 防止某些情况下没有移除监听器
        setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(onUpdated)
        }, 15000)
        // 发消息
        await chrome.tabs.reload(tabId)
    }
}
