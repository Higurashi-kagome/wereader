/**
 * 想法
 */
export const reviewFilter = (url: string) => url?.indexOf('review/list?bookId=') > -1 && url?.indexOf('listType=11') > -1
/**
 * 标注
 */
export const bookmarksFilter = (url: string) => url?.indexOf('bookmarklist?bookId=') > -1
/**
 * 热门标注
 */
export const bestBookmarksFilter = (url: string) => url?.indexOf('web/book/bookmarklist?bookId=') > -1
/**
 * 章节信息
 */
export const chapInfoFilter = (url: string) => url?.indexOf('web/book/chapterInfos') > -1
/**
 * 书本信息
 */
export const bookInfoFilter = (url: string) => url?.indexOf('web/book/info?bookId=') > -1
