import { ShelfDataTypeJson } from '../../types/shelfTypes'
import { BestMarksJson } from './BestMarksJson'
import { BookInfo } from './BookInfo'
import { ChapInfoJson } from './ChapInfoJson'
import { CommentsJson } from './CommentsJson'
import { MarksJson } from './MarksJson'
import { ThoughtJson } from './ThoughtJson'
import {
    getJson,
    getText
} from '../worker-utils'

export class Wereader {
    static readonly indexUrl = 'https://i.weread.qq.com'

    static readonly maiUrl: string = 'https://weread.qq.com'

    private chapInfosUrl: string

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
        this.bookInfosUrl = `${Wereader.indexUrl}/book/info?bookId=${bookId}`
        this.bookmarksUrl = `${Wereader.indexUrl}/book/bookmarklist?bookId=${bookId}`
        this.bestBookmarksUrl = `${Wereader.indexUrl}/book/bestbookmarks?bookId=${bookId}`
        this.thoughtsUrl = `${Wereader.indexUrl}/review/list?bookId=${bookId}&listType=11&mine=1&synckey=0&listMode=0`
        this.commentsUrl = `${Wereader.indexUrl}/review/list?listType=6&userVid=${userVid}&rangeType=2&mine=1&listMode=1`
        this.shelfDataUrl = `${Wereader.maiUrl}/web/shelf/sync`
        this.removeBookmarkUrl = `${Wereader.maiUrl}/web/book/removeBookmark`
        this.readDetailUrl = `${Wereader.indexUrl}/readdetail?`
        this.shelfRemoveBookUrl = `${Wereader.indexUrl}/shelf/delete`
        this.shelfBookSecret = `${Wereader.indexUrl}/book/secret`
    }

    async getBookmarks(): Promise<MarksJson> {
        const data = await getJson(this.bookmarksUrl)
        console.log(data)
        return data
    }

    async getChapInfos(): Promise<ChapInfoJson> {
        const data = await getJson(this.chapInfosUrl)
        console.log(data)
        return data
    }

    async getBookInfo(): Promise<BookInfo> {
        const data = await getJson(this.bookInfosUrl)
        console.log(data)
        return data
    }

    async getBestBookmarks(): Promise<BestMarksJson> {
        const data = await getJson(this.bestBookmarksUrl)
        console.log(data)
        return data
    }

    async getThoughts(): Promise<ThoughtJson> {
        const data = await getJson(this.thoughtsUrl)
        console.log(data)
        return data
    }

    async getComments(): Promise<CommentsJson> {
        const data = await getJson(this.commentsUrl)
        console.log(data)
        return data
    }

    async getShelfData(): Promise<ShelfDataTypeJson> {
        const data = await getJson(this.shelfDataUrl)
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
        console.log('resp', resp)
        const json = await resp.json()
        return json
    }

    async removeBookmarks(chapterUid?: number) {
        const data = await this.getBookmarks()
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
        const respJson = await getJson(url)
        console.log(respJson)
        return respJson
    }

    // eslint-disable-next-line class-methods-use-this
    async isLogined() {
        const text = await getText(Wereader.maiUrl)
        if (text && text.indexOf('wr_avatar_img') > -1) return true
        return false
    }

    async shelfRemoveBook(bookIds: string[]) {
        const payload = { bookIds: bookIds, private: 1 }
        const resp = await fetch(this.shelfRemoveBookUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log('resp', resp)
        return resp
    }

    async shelfMakeBookPrivate(bookIds: string[]) {
        const payload = { bookIds: bookIds, private: 1 }
        const resp = await fetch(this.shelfBookSecret, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log('resp', resp)
        return resp
    }

    // eslint-disable-next-line class-methods-use-this
    async shelfMakeBookPublic(bookIds: string[]) {
        const payload = { bookIds: bookIds, private: 0 }
        const resp = await fetch(`${Wereader.indexUrl}/book/secret`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log('resp', resp)
        return resp
    }
}
