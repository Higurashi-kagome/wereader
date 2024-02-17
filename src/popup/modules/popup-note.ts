import $ from 'jquery'

import { tabClickEvent } from './popup-tabs'
import {
    popupApi,
    dropdownClickEvent,
    readPageRegexp
} from './popup-utils'

/* 初始化笔记面板，为各个按钮绑定点击事件 */
async function initNoteTab(url: string) {
    // 在读书页时才显示笔记
    if (!readPageRegexp.test(url)) return
    const bookId = await popupApi.setBookId()
    if (!bookId) {
        window.close()
        return
    }
    const userVid = await popupApi.getUserVid()
    console.log('bookId', bookId)
    console.log('userVid', userVid)
    if (!userVid) {
        await popupApi.notify('信息获取失败，请确保正常登陆后刷新重试')
        window.close()
        return
    }
    $('<button class="tabLinks" id="noteBtn">笔记</button>').prependTo($('.tab')).on('click', tabClickEvent)
    // 功能入口
    $('.caller').on('click', async function listener(event: JQuery.ClickEvent) {
        const targetEl = event.target
        console.log('click: ', targetEl.id)
        switch (targetEl.id) {
        case 'getTextComment':
            // await popupApi.copyComment(userVid, false)
            break
        case 'getHtmlComment':
            // await popupApi.copyComment(userVid, true)
            break
        case 'getMarksInCurChap':
            popupApi.copyBookMarks(false).then()
            break
        case 'getAllMarks':
            await popupApi.copyBookMarks(true)
            break
        case 'getContents':
            await popupApi.copyContents()
            break
        case 'getBestBookMarks':
            // await popupApi.copyBestBookMarks()
            break
        case 'getMyThoughtsInCurChap':
            await popupApi.copyThought(false)
            break
        case 'getAllMyThoughts':
            await popupApi.copyThought(true)
            break
        case 'removeMarksInCurChap':
            /* await popupApi.sendMessageToContentScript({
                message: { deleteBookmarks: true, isAll: false }
            }) */
            break
        case 'removeAllMarks':
            /* await popupApi.sendMessageToContentScript({
                message: { deleteBookmarks: true, isAll: true }
            }) */
            break
        case 'copyBookInfo':
            await popupApi.copyBookInfo()
            break
        default:
            break
        }
        window.close()
    })
    // 下拉按钮点击事件
    $('.vertical-menu[data-for="noteBtn"] .dropdown-btn').on('click', dropdownClickEvent)
}

export { initNoteTab }
