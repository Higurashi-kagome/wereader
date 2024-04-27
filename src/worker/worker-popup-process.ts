/* 用于处理中间过程 */
import { responseType } from '../content/modules/content-getChapters'
import { Code } from '../content/types/Code'
import { Footnote } from '../content/types/Footnote'
import { Img } from '../content/types/Img'
import { reConfigCollectionType } from '../options/options-utils'
import { BestMarksJson, Item } from './types/BestMarksJson'
import { ChapInfoJson, ChapInfoUpdated } from './types/ChapInfoJson'
import { Updated } from './types/Updated'
import { ChapAndMarks } from './types/ChapAndMarks'
import {
    getCurTab,
    getIndexes,
    getUserVid,
    requestContentWereader,
    sendAlertMsg,
    sendMessageToContentScript
} from './worker-utils'
import { ConfigType, getBookId, ThoughtTxtOptions } from './worker-vars'
import { Wereader } from './types/Wereader'
import { ThoughtsInAChap } from './types/ThoughtsInAChap'
import { formatTimestamp, getLocalStorage, getSyncStorage, sortByKey } from '../common/utils'
import { notify } from './worker-notification'
import { attachTab } from '../debugger/debugger-network'
import {
    bookInfoFilter,
    bookmarksFilter,
    chapInfoFilter,
    reviewFilter
} from '../debugger/debugger-filters'
import { copyBookInfo, copyBookMarks, copyThought } from './worker-popup'
import { onReceivedBookMarksResponse } from '../debugger/handler/on-bookmarks'
import { onReceivedChapInfoResponse } from '../debugger/handler/on-chap-info'
import { onReceivedReviewResponse } from '../debugger/handler/on-review'
import { ThoughtJson } from './types/ThoughtJson'
import { onReceivedBookInfoResponse } from '../debugger/handler/on-book-info'

// 给标题添加前后缀
export function getTitleAddedPreAndSuf(
    title: string,
    level: number,
    config: {[key: string] : unknown}
) {
    let newTitle = ''
    switch (level) {
    case 1:
    case 2:
    case 3:
        newTitle = config[`lev${level}Pre`] + title + config[`lev${level}Suf`]
        break
    case 4: // 添加 4 5 6 级及 default 是为了处理特别的书（如导入的书籍）
    case 5:
    case 6:
    default:
        newTitle = `${config.lev3Pre}${title}${config.lev3Suf}`
        break
    }
    return newTitle
}

export async function getMyThought() {
    const wereader = new Wereader(await getBookId(), await getUserVid())
    const data = await requestContentWereader(wereader, 'getThoughts') as ThoughtJson
    if (!data) return new Map()
    // 获取 chapterUid 并去重、排序
    const chapterUidArr = Array.from(
        new Set(JSON.stringify(data).match(/(?<="chapterUid":\s*)(\d*)(?=,)/g))
    ).map((uid) => parseInt(uid))
    chapterUidArr.sort((a, b) => a - b)
    // 查找每章节标注并总结好
    const thoughtsMap: Map<number, ThoughtsInAChap[]> = new Map<number, ThoughtsInAChap[]>()
    // 遍历章节
    chapterUidArr.forEach(chapterUid => {
        const thoughtsInAChap: ThoughtsInAChap[] = []
        // 遍历所有想法，将章内想法放入一个数组
        for (let i = 0; i < data.reviews.length; i++) {
            const item = data.reviews[i]
            // 处理有书评的情况
            if (item.review.chapterUid !== undefined && item.review.chapterUid === chapterUid) {
                // 找到指定章节的想法
                let abstract = item.review.abstract
                // 替换想法前后空字符
                const content = item.review.content?.replace(/(^\s*|\s*$)/g, '') ?? ''
                let range = item.review.range
                // 如果没有发生替换（为章末想法时发生）
                if (range == null || typeof range.valueOf() !== 'string' || range.indexOf('-') < 0) {
                    abstract = '章末想法'
                    range = item.review.createTime.toString()
                } else {
                    range = range.replace(/(\d*)-\d*/, '$1')
                }
                thoughtsInAChap.push({
                    abstract,
                    content,
                    range,
                    createTime: item.review.createTime
                })
            }
        }
        thoughtsMap.set(chapterUid, sortByKey(thoughtsInAChap, 'range') as ThoughtsInAChap[])
    })
    return thoughtsMap
}

// 在标注中添加想法
async function addThoughts(chaptersAndMarks: ChapAndMarks[], chapters: ChapInfoUpdated[]) {
    const chapsMap = chapters.reduce((tempChapsMap, aChap) => {
    // 整理格式
        tempChapsMap.set(aChap.chapterUid, aChap)
        return tempChapsMap
    }, new Map<number, ChapInfoUpdated>())
    const thoughtsMap = await getMyThought()
    // 遍历各章节想法
    thoughtsMap.forEach((thoughtsInAChap, chapterUid) => {
    // 遍历章节依次将各章节章内想法添加进 marks
        let addedToMarks = false
        for (let i = 0; i < chaptersAndMarks.length; i++) {
            if (chaptersAndMarks[i].chapterUid === chapterUid) {
                // 找到想法所在章节
                // 想法与标注合并后按 range 排序
                const marks = chaptersAndMarks[i].marks.concat(thoughtsInAChap)
                chaptersAndMarks[i].marks = sortByKey(marks, 'range') as Updated[]
                addedToMarks = true
                break
            }
        }
        // 如果想法未被成功添加进标注（想法所在章节不存在标注的情况下发生）
        if (!addedToMarks) {
            const m = chapsMap.get(chapterUid)
            chaptersAndMarks.push({
                isCurrent: m !== undefined && m.isCurrent,
                level: m === undefined ? 0 : m.level,
                chapterUid: chapterUid,
                title: m === undefined ? '' : m.title,
                marks: thoughtsInAChap
            })
        }
    })
    // 章节排序
    return sortByKey(chaptersAndMarks, 'chapterUid') as ChapAndMarks[]
}

/* 判断从 DOM 获取的当前章节是否存在于 server 中（从 DOM 获取到的章节数可能多于 server 中的章节数，且当前章节为不存在于 server 中的某些子标题） */
function checkIsInServer(
    chapsInServer: ChapInfoUpdated[],
    response: responseType,
    chapsFromDom: { title: string; level: number; }[]
) {
    const isInServer = chapsInServer.filter(chap => {
        return (chap.title === response.currentContent
            || response.currentContent.indexOf(chap.title) > -1)
    }).length > 0
    /* 不存在于 server 则在从 DOM 获取到的章节信息中向前找，找到一个存在于 server 中的目录，则将其作为当前目录 */
    if (!isInServer) {
        for (let i = 0; i < chapsFromDom.length; i++) {
            // 在 chapsFromDom 找到当前章节
            if (chapsFromDom[i].title === response.currentContent) {
                // 从当前章节向前找，找到一个存在于 server 中的目录，则将其作为当前目录
                for (let j = i; j > -1; j--) {
                    if (chapsInServer.filter(c => c.title === chapsFromDom[j].title).length) {
                        response.currentContent = chapsFromDom[j].title
                        break
                    }
                }
                break
            }
        }
    }
}

export async function getChapters() {
    const wereader = new Wereader(await getBookId())
    const chapInfos = await requestContentWereader(wereader, 'getChapInfos') as ChapInfoJson
    // 发请求到 content 脚本获取章节信息
    const response = await sendMessageToContentScript({
        message: { isGetChapters: true }
    }) as responseType
    const curTab = await getCurTab()
    if (!response || !chapInfos) {
        notify('获取目录出错。')
        return null
    }
    const chapsInServer = chapInfos.data[0].updated
    const chapsFromDom = response.chapters
    // https://github.com/Higurashi-kagome/wereader/issues/76 start
    checkIsInServer(chapsInServer, response, chapsFromDom)
    // https://github.com/Higurashi-kagome/wereader/issues/76 end
    const chapIdx = await getLocalStorage('chapIdx') as {[key: string]: number}
    return chapsInServer.map((chapInServer) => {
        // 某些书没有标题，或者读书页标题与数据库标题不同（往往读书页标题多出章节信息）
        if (chapsFromDom.length === chapsInServer.length
            && !chapsFromDom.filter(chap => chap.title === chapInServer.title).length) {
            // 将 chapsFromDom 中的信息赋值给 chapsFromServer
            if (chapsFromDom[chapInServer.chapterIdx - 1]) {
                chapInServer.title = chapsFromDom[chapInServer.chapterIdx - 1].title
            }
        }
        // 某些书没有目录级别
        if (!chapInServer.level) {
            const targetChapFromDom = chapsFromDom.filter(chap => chap.title === chapInServer.title)
            if (targetChapFromDom.length) chapInServer.level = targetChapFromDom[0].level
            else chapInServer.level = 1
        }
        if (curTab.id) {
            chapInServer.isCurrent = chapInServer.chapterIdx === chapIdx[curTab.id]
        } else {
            console.warn('未找到当前标签页，无法获取当前章节 Uid')
            // 章节名称重复的情况下，会导致错误导出前一个同名章节内的内容：https://github.com/Higurashi-kagome/wereader/issues/103
            chapInServer.isCurrent = (chapInServer.title === response.currentContent)
                || (response.currentContent.indexOf(chapInServer.title) > -1)
        }
        return chapInServer
    })
}

/**
 * 通过 DevTools 获取标注
 * @param tabId tab id
 * @param isAll 是否导出全书标注
 */
export async function copyBookMarksByDevTools(tabId: number, isAll: boolean) {
    await attachTab(
        tabId,
        (url) => bookmarksFilter(url) || chapInfoFilter(url) || reviewFilter(url),
        true,
        () => copyBookMarks(isAll),
        onReceivedBookMarksResponse,
        onReceivedChapInfoResponse,
        onReceivedReviewResponse
    )
}

/**
 * 通过 DevTools 获取想法
 * @param tabId tab id
 * @param isAll 是否导出全书标注
 */
export async function copyThoughtByDevTools(tabId: number, isAll: boolean) {
    await attachTab(
        tabId,
        (url) => chapInfoFilter(url) || reviewFilter(url),
        true,
        () => copyThought(isAll),
        onReceivedChapInfoResponse,
        onReceivedReviewResponse
    )
}

/**
 * 通过 DevTools 获取书本信息
 * @param tabId tab id
 */
export async function copyBookInfoByDevTools(tabId: number) {
    await attachTab(
        tabId,
        (url) => bookInfoFilter(url),
        true,
        () => copyBookInfo(),
        onReceivedBookInfoResponse
    )
}

export async function getBookMarks(isAddThou?: boolean) {
    const wereader = new Wereader(await getBookId())
    // 发送消息到 content，由 content 调用方法
    const { updated: marks } = await requestContentWereader(wereader, 'getBookmarks') as { updated: Updated[] } || { updated: [] }
    if (!marks.length) {
        return null
    }
    /* 请求得到 chapters 方便导出不含标注的章节的标题，
    另外，某些书包含标注但标注数据中没有章节记录（一般发生在导入书籍中），此时则必须使用请求获取章节信息 */
    const chapters = await getChapters() || []
    /* 生成标注数据 */
    let chaptersAndMarks: ChapAndMarks[] = chapters.map((chap) => {
        const chapAndMarks: ChapAndMarks = chap as unknown as ChapAndMarks
        // 取得章内标注并初始化 range
        let marksInAChap = marks.filter((mark) => mark.chapterUid === chapAndMarks.chapterUid)
        marksInAChap = marksInAChap.map((curMark) => {
            if (curMark.range != null && typeof curMark.range.valueOf() === 'string') {
                curMark.range = curMark.range.replace(/(\d*)-\d*/, '$1')
            }
            return curMark
        })
        // 排序*大多数时候数据是有序的，但存在特殊情况所以必须排序*
        chapAndMarks.marks = sortByKey(marksInAChap, 'range') as Updated[]
        return chapAndMarks
    })
    // addThoughts 参数用于显式指明不包含想法
    if (isAddThou !== false && await getSyncStorage('addThoughts')) {
        chaptersAndMarks = await addThoughts(chaptersAndMarks, chapters)
    }
    return chaptersAndMarks
}

// 给 markText 进行正则替换
function regexpReplace(markText: string, regexpConfig: reConfigCollectionType) {
    const keys = Object.keys(regexpConfig)
    for (let i = 0; i < keys.length; i++) {
        const reId = keys[i]
        const replaceMsg = regexpConfig[reId as keyof reConfigCollectionType].replacePattern.match(/^s\/(.+?)\/(.*?)\/(\w*)$/)
        // 检查是否选中以及是否满足格式
        if (regexpConfig[reId as keyof reConfigCollectionType].checked
            && replaceMsg !== null && replaceMsg.length >= 4) {
            const pattern = replaceMsg[1]
            const replacement = replaceMsg[2]
            const flag = replaceMsg[3]
            const regexpObj = new RegExp(pattern, flag)
            if (regexpObj.test(markText)) {
                markText = markText.replace(regexpObj, replacement)
                // 匹配一次后结束匹配
                break
            }
        }
    }
    return markText
}

// 给某一条标注添加图片等内容
// TODO：换掉 any 类型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addMarkedData(
    mark: any,
    markedData: any,
    footnoteContent: string,
    config: ConfigType
) {
    const abstract = mark.abstract
    let markText = abstract || mark.markText
    // 遍历索引，逐个替换
    for (let i = 0; i < mark.markedDataIdxes.length; i++) {
        const markedDataIdx = mark.markedDataIdxes[i]
        // 数据缺失
        if (markedData[markedDataIdx] === undefined) {
            console.log(mark, markedData)
            break
        }
        const {
            imgSrc, alt, isInlineImg, footnoteName, code
        } = markedData[markedDataIdx]
        const footnote: string = markedData[markedDataIdx].footnote
        let replacement = ''
        /* 生成替换字符串 */
        if (imgSrc) { // 图片
            let insert1 = ''
            let insert2 = '' // 非行内图片单独占行（即使它与文字一起标注）
            if (!isInlineImg && markText.indexOf(config.imgTag) > 0) {
                // 不为行内图片且 imgTag 前有内容
                insert1 = '\n\n'
            }
            if (!isInlineImg
                && markText.indexOf(config.imgTag) !== (markText.length - config.imgTag.length)) {
                // 不为行内图片且 imgTag 后有内容
                insert2 = '\n\n'
            }
            replacement = `${insert1}![${alt}](${imgSrc})${insert2}`
        } else if (footnote) { // 注释
            const footnoteId: string = footnoteName.replace(/[\s<>"]/, '-')
            const footnoteNum: string = footnoteName.match(/(?<=注)(\d)*$/)[0]
            const data = { footnoteId, footnoteNum, footnote }
            replacement = config.footSupTemp.replace(/{{metaData\.(.*?)}}/g, (match, key: string) => {
                return data[key.trim() as keyof typeof data] || ''
            })
            footnoteContent += config.footNoteTemp.replace(/{{metaData\.(.*?)}}/g, (match, key: string) => {
                return data[key.trim() as keyof typeof data] || ''
            })
        } else if (code) { // 代码块
            let insert1 = ''; let
                insert2 = ''
            if (markText.indexOf(config.imgTag) > 0) {
                // imgTag 前有内容
                insert1 = '\n\n'
            }
            if (markText.indexOf(config.imgTag) !== (markText.length - config.imgTag.length)) {
                // imgTag 后有内容
                insert2 = '\n\n'
            }
            replacement = `${insert1}${config.codePre}\n${code}\n${config.codeSuf}${insert2}`
        }
        if (replacement) { // 替换
            markText = markText.replace(config.imgTag, replacement)
            if (abstract) mark.abstract = markText // 新字符串赋值回 mark
            else mark.markText = markText
        } else console.log(mark, markedData)
    }
    // footnoteContent 不断更新，最后在 traverseMarks 中追加到文字末尾
    return [mark, footnoteContent]
}

// 在 marks 中添加替换数据索引（每一个 imgTag 用哪个位置的 markedData 替换）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addRangeIndexST(marks: any, markedDataLength: number, config: ConfigType) {
    // imgTag 的 range 作为键，该 imgTag 所对应的数据在 markedData 中的索引作为值
    const used: {[key: string]: number} = {}
    // markedData 索引
    let markedDataIdx = 0
    // 不重复的 imgTag 的个数，正常情况下，应该与 markedData 的长度相等
    let targetCnt = 0
    for (let i = 0; i < marks.length; i++) {
        const { abstract, range: markRange } = marks[i]
        const markText = abstract || marks[i].markText
        // 获取当前标注中的 imgTag 位置
        const indexes = getIndexes(markText, config.imgTag)
        const markedDataIdxes: number[] = []
        for (let j = 0; j < indexes.length; j++) {
            // 计算某个 imgTag 在本章标注中的唯一位置
            const imgRange = markRange + indexes[j]
            if (used[imgRange] === undefined) { // 该 imgTag 没有记录过
                targetCnt++
                used[imgRange] = markedDataIdx // 记录某个位置的 imgTag 所对应的替换数据
                markedDataIdxes.push(markedDataIdx++)
            } else { // imgTag 被记录过（同一个 imgTag 多次出现）
                markedDataIdxes.push(used[imgRange])
            }
        }
        marks[i].markedDataIdxes = markedDataIdxes
    }
    // 返回 boolean 值表示 marks 与 markedData 数据匹配
    if (markedDataLength === targetCnt) return [marks, true]
    return [marks, false]
}

// 根据标注类型获取前后缀
function addMarkPreAndSuf(markText: string, style: number, config: ConfigType) {
    /* eslint-disable */
    const pre = (style == 0) ? config.s1Pre
        : (style == 1) ? config.s2Pre
            : (style == 2) ? config.s3Pre
                : ''

    const suf = (style == 0) ? config.s1Suf
        : (style == 1) ? config.s2Suf
            : (style == 2) ? config.s3Suf
                : ''
    /* eslint-enable */
    return pre + markText + suf
}

/**
 * 替换想法前后缀配置中的占位符
 * @param mark 想法标注
 * @param config 配置信息
 * @returns 替换后的各前后缀
 */
export function getReplacedThoughtConfig(mark: ThoughtsInAChap, config: ConfigType) {
    const re = /\{createTime}/g
    const time = formatTimestamp(mark.createTime)
    const thouPre = config.thouPre.replace(re, time)
    const thouSuf = config.thouSuf.replace(re, time)
    const thouMarkPre = config.thouMarkPre.replace(re, time)
    const thouMarkSuf = config.thouMarkSuf.replace(re, time)
    return {
        thouPre,
        thouSuf,
        thouMarkPre,
        thouMarkSuf
    }
}

// 处理章内标注
export function traverseMarks(
    marks: (Updated | ThoughtsInAChap)[],
    config: ConfigType,
    markedData: Array<Img|Footnote|Code> = []
) {
    function isThought(mark: Updated | ThoughtsInAChap): mark is ThoughtsInAChap {
        return ('abstract' in mark && 'content' in mark)
    }
    function isUpdated(mark: Updated | ThoughtsInAChap): mark is Updated {
        return 'markText' in mark
    }
    let prevMarkText = '' // 保存上一条标注文本
    let prevMarkType = '' // 保存上一次标注类型（0 标注 1 想法）
    let tempRes = '' // 保存上一条处理后追加到 res 的标注文本
    const res: string[] = []
    let footnoteContent = ''
    for (let j = 0; j < marks.length; j++) { // 遍历章内标注
        const mark = marks[j]
        if (markedData.length) {
            // eslint-disable-next-line no-await-in-loop
            const data = addMarkedData(marks[j], markedData, footnoteContent, config)
            marks[j] = data[0]
            footnoteContent = data[1]
        }
        if (isThought(mark)) { // 如果为想法
            const {
                thouPre,
                thouSuf,
                thouMarkPre,
                thouMarkSuf
            } = getReplacedThoughtConfig(mark, config)
            // 想法
            const thouContent = `${thouPre}${mark.content}${thouSuf}\n\n`
            // 想法所标注的内容
            const abstract = mark.abstract
            let thouAbstract = `${thouMarkPre}${abstract}${thouMarkSuf}\n\n`
            // 想法所对应文本与上一条标注相同时
            if (abstract === prevMarkText) {
                if (prevMarkType === '0') {
                    // 如果只保留标注文本，则 thouAbstract 设为空
                    if (config.thoughtTextOptions === ThoughtTxtOptions.JustMark) thouAbstract = ''
                    // 如果只保留想法所对应的文本，将上一次追加得到的标注文本删掉
                    else if (config.thoughtTextOptions === ThoughtTxtOptions.JustThought) {
                        res.pop()
                    }
                } else if (config.distinctThouMarks) {
                    // 多个想法对应相同的标注时，不重复记录标注内容
                    thouAbstract = ''
                }
            }
            // 是否将想法添加到对应标注之前
            if (config.thoughtFirst) {
                res.push(thouContent + thouAbstract)
            } else {
                res.push(thouAbstract + thouContent)
            }
            prevMarkText = abstract
            prevMarkType = '1'
        } else if (isUpdated(mark)) { // 不是想法（为标注）
            // 则进行正则匹配
            prevMarkText = mark.markText
            prevMarkType = '0'
            tempRes = regexpReplace(prevMarkText, config.re)
            tempRes = `${addMarkPreAndSuf(tempRes, mark.style, config)}\n\n`
            res.push(tempRes)
        }
    }
    if (markedData.length && footnoteContent) {
        res.push(footnoteContent)
    }
    return res.join('')
}

// 获取热门标注数据
export async function getBestBookMarks() {
    const wereader = new Wereader(await getBookId())
    const res = await requestContentWereader(wereader, 'getBestBookmarks') as BestMarksJson
    if (!res) {
        sendAlertMsg({ text: '未获取到热门标注数据', icon: 'warning' })
        return null
    }
    const { items: bestMarksData } = res
    // 处理书本无热门标注的情况
    if (!bestMarksData || !bestMarksData.length) {
        sendAlertMsg({ text: '该书无热门标注', icon: 'warning' })
        return null
    }
    // 查找每章节热门标注
    const chapters = await getChapters() || []
    const bestMarks = chapters.map((chap) => {
        interface ChapInfoUpdatedExtra extends ChapInfoUpdated{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bestMarks?: any
        }
        const tempChap: ChapInfoUpdatedExtra = chap
        // 取得章内热门标注并初始化 range
        const bestMarksInAChap = bestMarksData.filter(
            (bestMark) => bestMark.chapterUid === tempChap.chapterUid
        ).reduce((tempBestMarksInAChap: Item[], curBestMark) => {
            const range = curBestMark.range.toString().replace(/(\d*)-\d*/, '$1')
            curBestMark.range = parseInt(range)
            tempBestMarksInAChap.push(curBestMark)
            return tempBestMarksInAChap
        }, [])
        // 排序章内标注并加入到章节内
        tempChap.bestMarks = sortByKey(bestMarksInAChap, 'range')
        return tempChap
    })
    return bestMarks
}
