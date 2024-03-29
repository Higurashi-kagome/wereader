// TODO：用类分开表示图片、注释和代码块
// TODO：更好的等待翻页结束的方式
import 'arrive'

/**
 * 用于获取被标注的图片的 Markdown 文本数组，用于支持导出被标注的图片等内容
 *
 * click This Chap
 * foreach masks
 *     find Target Imgs
 * click next page if exists and repeat finding process as before
 */
import $ from 'jquery'

import { Code } from '../types/Code'
import { Footnote } from '../types/Footnote'
import { Img } from '../types/Img'
import {
    getCurrentChapTitle,
    simulateClick,
    sleep
} from './content-utils'
import { getSyncStorage } from '../../common/utils'
import { scaleStorageKey } from '../../common/constants'

/*
获取包含本章标注所在章节的标题。
有些书（比如 https://weread.qq.com/web/reader/6a732ce07201202c6a7b30a）的子标题不在服务器标注信息中，此时要确定当前标注所在章节，需要从 getCurrentChapTitle 的返回值向前查找，直到找到存在标注的章节。
如果本章存在标注，将返回本章标注所在章节的标题，否则返回空字符串
 */
function getCurrentMarkedChap() {
    /* 检查本章是否有标注 */
    const masksSelector = '.wr_underline.wr_underline_mark,.wr_underline.wr_underline_wave,.wr_underline.wr_underline_straight' // 三种标注线
    const masks = document.querySelectorAll<HTMLElement>(masksSelector)
    if (!masks.length) return ''
    /* 确定本章标注所在章节的标题 */
    const curChapTitle = getCurrentChapTitle()
    const sectionTitles = document.getElementsByClassName('sectionListItem_title') // 标注面板中的标题
    for (let i = 0; i < sectionTitles.length; i++) {
        const sTitle = sectionTitles[i] // 标题
        // 在标注面板中找到 curChapTitle
        if (sTitle && sTitle.textContent === curChapTitle) {
            return curChapTitle
        }
    }
    // 此时确定 curChapTitle 不是本章标注所在章节
    // 向前找标题
    const menuTitles = document.getElementsByClassName('chapterItem_text') // 菜单中的标题
    let tmpTitle = ''
    // 遍历目录标题
    for (let i = 0; i < menuTitles.length; i++) {
        const mTitle = menuTitles[i].textContent!
        // 在标注标题中找目录标题
        for (let j = 0; j < sectionTitles.length; j++) {
            const sTitle = sectionTitles[j]
            // 确定某个目录标题下存在标注，将其保存到 tmp_title
            if (sTitle && sTitle.textContent === mTitle) {
                tmpTitle = mTitle
            }
        }
        // 到达 curChapTitle，不再向下找
        if (mTitle === curChapTitle) return tmpTitle
    }
    return null
}

// 检查指定章节的标注内容中有多少个 IMG_TAG
let IMG_TAG = ''
function countTargets() {
    const curChapTitle = getCurrentMarkedChap()
    console.log('当前章节', curChapTitle)
    if (!curChapTitle) return 0
    let targetCnt = 0
    // 遍历标注、检查是否存在 IMG_TAG
    const sectionListItems = document.getElementsByClassName('sectionListItem')
    let foundChap = false
    for (let i = 0; i < sectionListItems.length; i++) {
        const element = sectionListItems[i]
        const sectionListItemTitle = element.getElementsByClassName('sectionListItem_title')[0] // 标题
        // 第一次找到本章内容
        if (sectionListItemTitle && sectionListItemTitle.textContent === curChapTitle) {
            console.log('找到当前章节的标注')
            foundChap = true
            if ($(element).text().indexOf(IMG_TAG) >= 0) {
                targetCnt++
            }
        } else if (foundChap === true && sectionListItemTitle
            && sectionListItemTitle.textContent !== curChapTitle) {
            break // 不再属于当前章节，退出循环
        } else if (foundChap === true) { // 本章内的内容
            if ($(element).text().indexOf(IMG_TAG) >= 0) {
                targetCnt++
            }
        }
    }
    return targetCnt
}

// 从 DOM 对象获取图片/代码/脚注对象
function getTargetObj(el: HTMLElement, curChapTitle: string) {
    const imgSrc = el.getAttribute('data-src')
    const footnote = el.getAttribute('data-wr-footernote')
    let height = parseFloat(el.style.height)
    const width = parseFloat(el.style.width)
    let top
    let left
    const match = el.style.transform.match(/translate\(\s*(\d*)px,\s*(\d*)px/)
    if (match) {
        top = parseFloat(match[2])
        left = parseFloat(match[1])
    }
    let elObj
    if (imgSrc) {
    // 判断是否为行内图片
        const isInlineImg = el.className.indexOf('h-pic') > -1
        const alt = imgSrc.split('/').pop()
        elObj = {
            alt: alt,
            imgSrc: imgSrc,
            height: height,
            top: top,
            width: width,
            left: left,
            isInlineImg: isInlineImg
        }
    } else if (footnote) {
        elObj = {
            currentChapTitle: curChapTitle,
            footnote: footnote,
            height: height,
            top: top,
            width: width,
            left: left
        }
    } else { // 代码块
        const code = el.textContent
        const padding = parseFloat(window.getComputedStyle(el).paddingTop)
            + parseFloat(window.getComputedStyle(el).paddingBottom)
        height += padding
        elObj = {
            height: height, top: top, width: width, left: left, code: code
        }
    }
    return elObj
}

/**
 * 检查 el2 是否被 el1 覆盖
 * @param el1 覆盖元素
 * @param el2 被覆盖元素
 * @param scale 被覆盖元素缩放比例
 * @returns el2 被 el1 覆盖时，返回 true，否则返回 false
 */
function isCovered(el1: HTMLElement, el2: HTMLElement, scale?: number) {
    const rect1 = el1.getBoundingClientRect()
    let {
        right: r2Right, left: r2Left, top: r2Top, bottom: r2Bottom
    } = el2.getBoundingClientRect()
    scale = scale || 0.97
    if (scale) {
        const subWidth = (1 - scale) * (r2Right - r2Left)
        const subHeight = (1 - scale) * (r2Bottom - r2Top)
        r2Right -= subWidth / 2
        r2Left += subWidth / 2
        r2Top += subHeight / 2
        r2Bottom -= subHeight / 2
    }
    const overlap = !(rect1.right < r2Left
                      || rect1.left > r2Right
                      || rect1.bottom < r2Top
                      || rect1.top > r2Bottom)
    return overlap
}

async function getMarkedData(
    addThoughts: boolean,
    markedData: Array<Img|Footnote|Code> = [],
    firstPage = true
) {
    console.log('开始获取标注数据')
    if (firstPage) { // 点击当前章节，切换到第一页
        $('#routerView')[0].arrive('.readerCatalog', { onceOnly: true, fireOnAttributesModification: true }, function onshow() { // 目录等待
            simulateClick($('.chapterItem.chapterItem_current>.chapterItem_link')[0])
        })
        simulateClick($('.readerControls_item.catalog')[0]) // 点击目录显示之后才能够正常获取 BoundingClientRect
        await sleep(1000) // 跳转等待
    }
    let masksSelector = '.wr_underline.wr_underline_mark,.wr_underline.wr_underline_wave,.wr_underline.wr_underline_straight' // 三种标注线
    if (addThoughts) masksSelector = `${masksSelector},.wr_underline_thought` // 获取想法时加上想法标注线
    // 遍历标注
    const masks = document.querySelectorAll<HTMLElement>(masksSelector)
    let notesCounter = 1
    const curChapTitle = getCurrentChapTitle()
    const scale = await getSyncStorage(scaleStorageKey) as string
    console.log(`缩放比例：${scale}`)
    for (let i = 0; i < masks.length; i++) {
        const mask = masks[i]
        mask.scrollIntoView({ block: 'center' }) // 滚动到视图，加载图片
        mask.style.background = '#ffff0085' // 高亮
        // eslint-disable-next-line no-await-in-loop
        await sleep(50) // 扫描间隔
        const ImgsSelector = 'img.wr_readerImage_opacity,.reader_footer_note.js_readerFooterNote.wr_absolute,pre' // 图片之类
        // 遍历图片之类，检查是否被当前标注遮盖
        const targetEls = $(ImgsSelector).get()
        // #99
        targetEls.sort((x, y) => x.getBoundingClientRect().left - y.getBoundingClientRect().left)
        for (let j = 0; j < targetEls.length; j++) {
            const el = targetEls[j]
            if (isCovered(mask, el, parseFloat(scale))) {
                const {
                    imgSrc, alt, isInlineImg, footnote, currentChapTitle, code
                } = getTargetObj(el, curChapTitle)
                if (imgSrc && alt !== undefined && isInlineImg !== undefined) {
                    markedData.push({ alt: alt, imgSrc: imgSrc, isInlineImg: isInlineImg })
                } else if (footnote) {
                    markedData.push({ footnoteName: `${currentChapTitle}-注${notesCounter++}`, footnote: footnote })
                } else if (code) {
                    markedData.push({ code: code })
                }
            }
        }
        mask.style.background = ''
    }
    // 有多页时翻页继续查找
    const readerFooterBtn = $('.readerFooter_button')[0]
    if (readerFooterBtn.title === '下一页') {
    // 点击下一页
        simulateClick(readerFooterBtn, { // 似乎需要这样配置才行
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: 1
        })
        await sleep(1000) // 下一页等待
        markedData = await getMarkedData(addThoughts, markedData, false)
    }
    return markedData
}

/* 初始化 */
async function initMarkedDateGetter() {
    console.log('initMarkedDateGetter')
    /* 监听背景页通知 */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!request.isGetMarkedData) return true
        chrome.storage.sync.get(['imgTag'], function (result) {
            if (result?.imgTag) {
                IMG_TAG = result.imgTag
                const targetCnt = countTargets()
                console.log(`找到“${IMG_TAG}”数：`, targetCnt)
                if (targetCnt === 0) sendResponse([]) // 没有 IMG_TAG 则不需要尝试获取图片
                else {
                    getMarkedData(request.addThoughts).then(markedData => {
                        console.log('获取到的 markedData', markedData)
                        sendResponse(markedData)
                    })
                }
            }
        })
        // 这里必须返回 true，否则 sendResponse 方法可能不会被执行
        return true
    })
}

export { initMarkedDateGetter }
