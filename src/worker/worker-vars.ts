import { IMG_TAG } from '../common/constants'
import { getLocalStorage } from '../common/utils'
import { BookData } from '../types/bookData'
import { ConfigType } from './types/ConfigType'
// eslint-disable-next-line no-undef
import Tab = chrome.tabs.Tab

const DefaultBackupName = '默认设置'
const StorageErrorMsg = '存储出错'
const BackupKey = 'backup'
const DefaultRegexPattern = { replacePattern: '', checked: false }

// "想法所对应文本被标注时保留"选项
/* eslint-disable */
export enum ThoughtTxtOptions{
    JustThought = 'thoughtTextThought',
    All = 'thoughtTextAll',
    JustMark = 'thoughtTextMark'
}

// "选中后动作"选项
export enum SelectActionOptions{
    None = 'underlineNone',
    Copy = 'wr_copy',
    Bg = 'underlineBg',
    Straight = 'underlineStraight',
    HandWrite = 'underlineHandWrite',
    BgCopy = 'underlineBg,.toolbarItem.wr_copy',
    StraightCopy = 'underlineStraight,.toolbarItem.wr_copy',
    HandWriteCopy = 'underlineHandWrite,.toolbarItem.wr_copy'
}
/* eslint-enable */

const defaultConfig: ConfigType = {
    s1Pre: '',
    s1Suf: '',
    s2Pre: '**',
    s2Suf: '**',
    s3Pre: '',
    s3Suf: '',
    imgTag: IMG_TAG,
    scale: '0.97',
    lev1Pre: '## ',
    lev1Suf: '',
    lev2Pre: '### ',
    lev2Suf: '',
    lev3Pre: '#### ',
    lev3Suf: '',
    thouPre: '> {createTime}\n\n==',
    thouSuf: '==',
    /* eslint-disable */
    metaTemplate: '__metaTemplate__',
    /* eslint-enable */
    thouMarkPre: '> ',
    thouMarkSuf: '',
    codePre: '```',
    codeSuf: '```',
    displayN: false,
    mpShrink: false,
    mpContent: false,
    mpAutoLoad: true,
    allTitles: false,
    anchorTitle: true,
    addThoughts: true,
    thoughtFirst: false,
    enableDevelop: false,
    distinctThouMarks: true,
    enableShelf: true,
    enableStatistics: false,
    enableOption: true,
    enableCopyImgs: true,
    enableFancybox: true,
    enableThoughtEsc: true,
    backupName: DefaultBackupName,
    selectAction: SelectActionOptions.None,
    thoughtTextOptions: ThoughtTxtOptions.JustThought,
    // 如果不设置默认值，则在设置页初始化时需要考虑到
    re: {
        re1: DefaultRegexPattern,
        re2: DefaultRegexPattern,
        re3: DefaultRegexPattern,
        re4: DefaultRegexPattern,
        re5: DefaultRegexPattern
    },
    flag: 0,
    // eslint-disable-next-line no-template-curly-in-string
    footSupTemp: '<sup><a id="{{metaData.footnoteId}}-ref" href="#{{metaData.footnoteId}}">{{metaData.footnoteNum}}</a></sup>',
    // eslint-disable-next-line no-template-curly-in-string
    footNoteTemp: '<p id="{{metaData.footnoteId}}">{{metaData.footnoteNum}}. {{metaData.footnote}}<a href="#{{metaData.footnoteId}}-ref">&#8617;</a></p>\n'
}
/**
 * 获取当前读书页的书本 id
 * @returns 当前读书页的书本 id
 */
export async function getBookId(): Promise<string> {
    return await getLocalStorage('bookId') as string
}
/**
 * 获取各书本信息
 * @returns bookId 为键，书本相关信息为值的对象
 */
export async function getBooks(): Promise<{[key: string]: BookData}> {
    return await getLocalStorage('books') as {[key: string]: BookData}
}
/**
 * 获取当前书本信息
 */
export async function getCurBook(): Promise<BookData> {
    const books = await getBooks()
    return books[await getBookId()]
}
/**
 * 获取已打开读书页及对应书本 id
 * @returns tabId: bookId 键值对
 */
export async function getBookIds(): Promise<{[key: number]: string}> {
    return await getLocalStorage('bookIds') as {[key: number]: string}
}

/**
 * 获取记录的 tab 信息
 * @returns tabId: Tab 键值对
 */
export async function getTabs(): Promise<{[key: number]: Tab}> {
    return await getLocalStorage('tabs') as {[key: number]: Tab} || {}
}

/**
 * 获取指定 tabId 的 tab 信息
 */
export async function getTab(tabId: number): Promise<Tab | null> {
    const tabs = await getTabs()
    return tabs[tabId]
}

/**
 * 保存 tab 信息
 */
export async function saveTab(tab: Tab) {
    const tabs = await getTabs() || {}
    if (tab.id) {
        tabs[tab.id] = tab
    }
    chrome.storage.local.set({ tabs }).then().catch()
}

/**
 * 删除指定 tabId 的 tab 信息
 */
export async function deleteTab(tabId: number) {
    const tabs = await getTabs()
    delete tabs[tabId]
    chrome.storage.local.set({ tabs }).then().catch()
}

/**
 * 初始化 bookIds
 */
export async function initBookIds() {
    return chrome.storage.local.set({ bookIds: {} })
}
/**
 * 初始化 books
 */
export async function initBooks() {
    return chrome.storage.local.set({ books: {} })
}
/**
 * 添加信息到当前 book
 */
export async function addToCurBook(data: BookData) {
    const bookId = await getBookId()
    const books = await getBooks()
    books[bookId] = { ...books[bookId], ...data }
    return chrome.storage.local.set({ books })
}
/**
 * 获取已打开读书页及对应书本正在阅读的章节索引
 * @returns tabId: chapterIdx 键值对
 */
export async function getChapIdx(): Promise<{[key: number]: string}> {
    return await getLocalStorage('chapIdx') as {[key: number]: string}
}

export {
    BackupKey,
    ConfigType,
    DefaultBackupName,
    defaultConfig,
    DefaultRegexPattern,
    StorageErrorMsg
}
