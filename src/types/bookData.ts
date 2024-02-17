import { MarksJson } from '../worker/types/MarksJson'
import { BookInfo } from '../worker/types/BookInfo'
import { ChapInfoJson } from '../worker/types/ChapInfoJson'
import { ThoughtJson } from '../worker/types/ThoughtJson'
import { BestMarksJson } from '../worker/types/BestMarksJson'

/**
 * 用于获取标注等的本地书本数据格式
 */
export interface BookData {
    bookmarks?: MarksJson,
    chapInfo?: ChapInfoJson,
    review?: ThoughtJson,
    bookInfo?: BookInfo,
    bestBookMarks?: BestMarksJson
}
