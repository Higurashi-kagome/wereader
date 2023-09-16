import {
    copyBestBookMarks, copyBookInfo, copyBookMarks, copyComment,
    copyContents, copyThought, createMpPage, deleteBookmarks,
    getReadDetail, getShelfData, sendMpMsg, setBookId, setShelfData
} from './worker-popup'
import {
    copy, createTab, getUserVid, sendAlertMsg, sendMessageToContentScript, updateStorageAreaInBg
} from './worker-utils'
import { Wereader } from './types/Wereader'
import { Message } from './types/Message'
import { getLocalStorage, getSyncStorage } from '../common/utils'
import { ShelfForPopupType } from './types/PopupApi'
import { notify } from './worker-notification'

chrome.runtime.onMessage.addListener((
    msg: Message,
    sender: chrome.runtime.MessageSender,
    // eslint-disable-next-line no-unused-vars
    sendResponse: (x: unknown)=>unknown
)=>{
    // https://stackoverflow.com/a/46628145
    (async () => { // 消息目标
        if (msg.target !== 'worker') {
            return
        }
        console.log('handleMessages onMessage: ', msg)
        // 消息类型
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = msg.data as any
        let resp: unknown = true
        switch (msg.type) {
        case 'get-config':
            resp = await getSyncStorage()
            break
        case 'set-book-id':
            resp = await setBookId()
            break
        case 'notify':
            notify(data)
            break
        case 'get-user-vid':
            resp = await getUserVid(data)
            break
        case 'copy-comment':
            copyComment(data.userVid, data.isHtml)
            break
        case 'copy-contents':
            copyContents()
            break
        case 'copy-book-marks':
            copyBookMarks(data)
            break
        case 'copy-best-book-marks':
            copyBestBookMarks()
            break
        case 'copy-thought':
            copyThought(data)
            break
        case 'send-message-to-content-script':
            resp = await sendMessageToContentScript(data)
            break
        case 'shelf-for-popup':
            let shelfForPopup: ShelfForPopupType = await getLocalStorage('shelfForPopup') as ShelfForPopupType
            if (!shelfForPopup) {
                shelfForPopup = { shelfData: {} }
                chrome.storage.local.set({ shelfForPopup })
            }
            resp = shelfForPopup
            break
        case 'get-shelf-data':
            resp = await getShelfData()
            break
        case 'create-tab':
            resp = await createTab(data)
            break
        case 'set-shelf-data':
            resp = await setShelfData(data)
            break
        case 'create-mp-page':
            createMpPage(data)
            break
        case 'copy-book-info':
            copyBookInfo()
            break
        case 'get-read-detail':
            resp = await getReadDetail(data.monthTimestamp, data.type, data.count)
            break
        case 'send-alert-msg':
            resp = data.tabId
                ? await sendAlertMsg(data.data, data.tabId)
                : await sendAlertMsg(data)
            break
        case 'copy':
            copy(data)
            break
        default:
            console.warn(`未知消息：'${msg.type}'`)
        }
        sendResponse(resp)
    })()
    return true
})

// 监听消息
// TODO 消息使用规定的格式
// eslint-disable-next-line @typescript-eslint/no-explicit-any
chrome.runtime.onMessage.addListener(function others(
    msg: any,
    sender: chrome.runtime.MessageSender,
    // eslint-disable-next-line no-unused-vars
    sendResponse: (x: unknown)=>unknown
) {
    (async () => {
        let tabId: number | undefined
        if (sender && sender.tab) tabId = sender.tab.id
        switch (msg.type) {
        case 'getShelf':
            getShelfData().then(data => {
                sendResponse({ data })
            })
            break
        case 'saveRegexpOptions':// 保存直接关闭设置页时 onchange 未保存的信息
            updateStorageAreaInBg(msg.regexpSet)
            break
        case 'deleteBookmarks':
            if (!msg.confirm) return
            deleteBookmarks(msg.isAll).then(deleteResp => {
                const deleteMsg = `删除结束，${deleteResp.succ} 成功，${deleteResp.fail} 失败。请重新加载读书页。`
                sendAlertMsg({ icon: 'info', text: deleteMsg }, tabId).then(alertResp => {
                    // 弹窗通知失败后使用 alert()
                    if (alertResp && !(alertResp as {succ: number}).succ) notify(deleteMsg)
                })
            })
            break
        case 'fetch':
            if (!msg.url) return
            fetch(msg.url, msg.init).then(resp => {
                console.log('resp', resp)
                const contentType = msg.init.headers['content-type']
                if (contentType === undefined || contentType === 'application/json') { return resp.json() }
                if (contentType === 'text/plain') { return resp.text() }
                return null
            }).then(data => {
                sendResponse({ data: data })
            })
            break
        case 'mploadmore':
            const index = msg.offset / 10
            const mpTempData = await getLocalStorage('mpTempData') as {[key: string]: unknown[]}
            if (mpTempData[msg.bookId] && mpTempData[msg.bookId][index]) {
                sendResponse({ data: mpTempData[msg.bookId][index] })
                return
            }
            fetch(`https://i.weread.qq.com/book/articles?bookId=${msg.bookId}&count=10&offset=${msg.offset}`).then(resp => {
                console.log('resp', resp)
                return resp.json()
            }).then(data => {
                if (!mpTempData[msg.bookId]) {
                    mpTempData[msg.bookId] = []
                }
                mpTempData[msg.bookId][index] = data
                chrome.storage.local.set({ mpTempData })
                sendResponse({ data })
            })
            break
        case 'mpInit':
            sendResponse(sendMpMsg)
            break
        case 'createMpPage': // message from shelf mp
            createMpPage(msg.bookId).then((resp) => {
                sendResponse(resp)
            })
            break
        case 'Wereader':
            const wereader = new Wereader()
            switch (msg.func) {
            case 'shelfRemoveBook':
                wereader.shelfRemoveBook(msg.bookIds).then(resp => {
                    return resp.json()
                }).then(json => {
                    sendResponse({ data: json, bookIds: msg.bookIds })
                })
                break
            case 'shelfMakeBookPrivate':
                wereader.shelfMakeBookPrivate(msg.bookIds).then(resp => {
                    return resp.json()
                }).then(json => {
                    sendResponse({ data: json, bookIds: msg.bookIds })
                })
                break
            case 'shelfMakeBookPublic':
                wereader.shelfMakeBookPublic(msg.bookIds).then(resp => {
                    return resp.json()
                }).then(json => {
                    sendResponse({ data: json, bookIds: msg.bookIds })
                })
                break
            default:
                break
            }
            break
        default:
            break
        }
    })()
    return true
})
