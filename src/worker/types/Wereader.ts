import { getLocalStorage } from '../../common/utils'
import { ShelfDataTypeJson } from '../../types/shelfTypes'
import { BestMarksJsonResponse } from './BestMarksJson'
import { BookInfo } from './BookInfo'
import { ChapInfoJson } from './ChapInfoJson'
import { CommentsJson } from './CommentsJson'
import { MarksJson } from './MarksJson'
import { ThoughtJson } from './ThoughtJson'

export class Wereader {
    static readonly indexUrl = 'https://i.weread.qq.com'

    static readonly maiUrl: string = 'https://weread.qq.com'

    private chapInfosUrl: string

    private mainChapInfosUrl: string

    private bookInfosUrl: string

    private bookmarksUrl: string

    private bestBookmarksUrl: string

    private thoughtsUrl: string

    private commentsUrl: string

    private shelfDataUrl: string

    private removeBookmarkUrl: string

    private readDetailUrl: string

    private shelfRemoveBookUrl: string

    private shelfBookSecret: string

    private bookId: string | undefined

    constructor(bookId?: string, userVid?: string) {
        this.bookId = bookId
        this.chapInfosUrl = `${Wereader.indexUrl}/book/chapterInfos?bookIds=${bookId}&synckeys=0`
        this.mainChapInfosUrl = `${Wereader.maiUrl}/web/book/chapterInfos`
        this.bookInfosUrl = `${Wereader.maiUrl}/web/book/info?bookId=${bookId}`
        this.bookmarksUrl = `${Wereader.maiUrl}/web/book/bookmarklist?bookId=${bookId}`
        this.bestBookmarksUrl = `${Wereader.maiUrl}/web/book/bestbookmarks?bookId=${bookId}`
        this.thoughtsUrl = `${Wereader.maiUrl}/web/review/list?bookId=${bookId}&listType=11&maxIdx=0&count=0&listMode=2&synckey=0&userVid=${userVid}&mine=1`
        this.commentsUrl = `${Wereader.maiUrl}/web/review/list?listType=6&userVid=${userVid}&rangeType=2&mine=1&listMode=1`
        this.shelfDataUrl = `${Wereader.maiUrl}/web/shelf/sync`
        this.removeBookmarkUrl = `${Wereader.maiUrl}/web/book/removeBookmark`
        this.readDetailUrl = `${Wereader.indexUrl}/readdetail?`
        this.shelfRemoveBookUrl = `${Wereader.indexUrl}/shelf/delete`
        this.shelfBookSecret = `${Wereader.indexUrl}/book/secret`
    }

    async getBookmarks(): Promise<MarksJson | null> {
        // 查找保存的 bookmark 请求 Options 并发起请求
        const bookmarkFetchOptions = await getLocalStorage('bookmarkFetchOptions') as any
        console.log('bookmarkFetchOptions', bookmarkFetchOptions)
        if (bookmarkFetchOptions) {
            // 重新构建 Headers 对象
            const headers = new Headers()
            if (bookmarkFetchOptions.headers) {
                Object.entries(bookmarkFetchOptions.headers).forEach(([key, value]) => {
                    headers.append(key, value as string)
                })
            }

            const options = {
                ...bookmarkFetchOptions,
                headers
            }

            const response = await fetch(this.bookmarksUrl, options)
            return response.json()
        }
        return null
    }

    // eslint-disable-next-line class-methods-use-this
    async getChapInfos(): Promise<ChapInfoJson | null> {
        // 查找保存的 chapInfos 请求 Options 并发起请求
        const chapterInfosFetchOptions = await getLocalStorage('chapterInfosFetchOptions') as any
            || await getLocalStorage('bookmarkFetchOptions') as any
        if (chapterInfosFetchOptions) {
            if (this.bookId) {
                chapterInfosFetchOptions.body = `{"bookIds":["${this.bookId}"]}`
            }
            chapterInfosFetchOptions.headers['content-type'] = 'application/json;charset=UTF-8'
            const response = await fetch(this.mainChapInfosUrl, chapterInfosFetchOptions)
            return response.json()
        }
        return null
    }

    async getBookInfo(): Promise<BookInfo | null> {
        const bookInfoFetchOptions = await getLocalStorage('bookInfoFetchOptions') as any
            || await getLocalStorage('bookmarkFetchOptions') as any
        if (bookInfoFetchOptions) {
            const response = await fetch(this.bookInfosUrl, bookInfoFetchOptions)
            return response.json()
        }
        return null
    }

    async getBestBookmarks(): Promise<BestMarksJsonResponse | null> {
        const bestBookmarksFetchOptions = await getLocalStorage('bestBookmarksFetchOptions') as any
            || await getLocalStorage('bookmarkFetchOptions') as any
        if (bestBookmarksFetchOptions) {
            const response = await fetch(this.bestBookmarksUrl, bestBookmarksFetchOptions)
            return response.json()
        }
        return null
    }

    async getThoughts(): Promise<ThoughtJson | null> {
        // 查找保存的 review 请求 Options 并发起请求
        const reviewFetchOptions = await getLocalStorage('reviewFetchOptions') as any
            || await getLocalStorage('bookmarkFetchOptions') as any
        if (reviewFetchOptions) {
            const response = await fetch(this.thoughtsUrl, reviewFetchOptions)
            return response.json()
        }
        return null
    }

    async getComments(): Promise<CommentsJson | null> {
        const reviewFetchOptions = await getLocalStorage('reviewFetchOptions') as any
            || await getLocalStorage('bookmarkFetchOptions') as any
        if (reviewFetchOptions) {
            const response = await fetch(this.commentsUrl, reviewFetchOptions)
            return response.json()
        }
        return null
    }

    async getShelfData(): Promise<ShelfDataTypeJson> {
        const options = await getLocalStorage('bookmarkFetchOptions') as any
        const response = await fetch(this.shelfDataUrl, options)
        const data = response.json()
        // const data = Promise.resolve({ errMsg: '123', shelfDataUrl: this.shelfDataUrl })
        console.log(data)
        return data
    }

    async removeBookmarkById(bookmarkId: string) {
        const resp = await fetch(this.removeBookmarkUrl, {
            method: 'POST',
            body: JSON.stringify({ bookmarkId: bookmarkId }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            cache: 'no-cache'
        })
        return resp.json()
    }

    async removeBookmarks(chapterUid?: number) {
        const data = await this.getBookmarks()
        if (data === null) return { succ: 0, fail: 0 }
        let bookmarks; let succ = 0; let
            fail = 0
        if (chapterUid === undefined) {
            bookmarks = data.updated
        } else {
            bookmarks = data.updated.filter((mark) => { return mark.chapterUid === chapterUid })
        }
        for (let i = 0; i < bookmarks.length; i++) {
            const mark = bookmarks[i]
            let respJson = { succ: -1 }
            try {
                // eslint-disable-next-line no-await-in-loop
                respJson = await this.removeBookmarkById(mark.bookmarkId)
            } catch (error) {
                fail++
                // eslint-disable-next-line no-continue
                continue
            }
            if (!respJson.succ) fail++
            else succ++
        }
        return { succ: succ, fail: fail }
    }

    /**
     * 本年月数据及去年年总结：https://i.weread.qq.com/readdetail
     * 指定月及该月之前指定数量的月数据：https://i.weread.qq.com/readdetail?baseTimestamp=1612108800&count=3&type=1
     * type=1：获取月数据
     * type=0：获取周数据
     */
    async getReadDetail(monthTimestamp?: number, type = 1, count = 3) {
        let url = this.readDetailUrl
        if (monthTimestamp) url = `${url}&baseTimestamp=${monthTimestamp}`
        if (count) url = `${url}&count=${count}`
        if ([0, 1].indexOf(type) > -1) url = `${url}&type=${type}`
        const chapterInfosFetchOptions = await getLocalStorage('chapterInfosFetchOptions') as any
        if (chapterInfosFetchOptions) {
            const response = await fetch(url, chapterInfosFetchOptions)
            return response.json()
        }
        return null
    }

    async shelfRemoveBook(bookIds: string[]) {
        const payload = { bookIds: bookIds, private: 1 }
        return fetch(this.shelfRemoveBookUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    async shelfMakeBookPrivate(bookIds: string[]) {
        const payload = { bookIds: bookIds, private: 1 }
        return fetch(this.shelfBookSecret, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    static async shelfMakeBookPublic(bookIds: string[]) {
        const payload = { bookIds: bookIds, private: 0 }
        return fetch(`${Wereader.indexUrl}/book/secret`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}
